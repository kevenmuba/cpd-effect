'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { startOfDay, endOfDay, eachDayOfInterval, format, isBefore, isSameDay, subDays } from 'date-fns'
import { createClient } from '@/utils/supabase/client'

export interface SpecificGoal {
  id: string
  name: string
  sidebarName?: string
  target: string
  isActive: boolean
  year: number
}

export interface ActivityImpact {
  goalId: string
  goalName: string
  score: number
}

export interface Activity {
  id: string | number
  action: string
  impacts: ActivityImpact[]
  date: string // e.g., 'Oct 14'
  dateIso: string // Exact ISO string for logic
  ethWeek: string
  year: number
  isPenalty?: boolean
}

interface DashboardContextType {
  currentYear: number
  setCurrentYear: (year: number) => void
  generalPlan: string
  setGeneralPlan: (plan: string) => Promise<void>
  specificGoals: SpecificGoal[]
  addGoal: (goal: SpecificGoal) => Promise<void>
  editGoal: (id: string, updates: Partial<SpecificGoal>) => Promise<void>
  activities: Activity[]
  addActivity: (activity: Activity) => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

const INITIAL_GENERAL_PLAN = "To become physically healthier, financially independent, and spiritually grounded by the end of the Ethiopian year."
const INITIAL_GOALS: SpecificGoal[] = [
  { id: 'financial', name: 'Financial Freedom', target: '+100 impact score', isActive: true, year: 2018 },
  { id: 'health', name: 'Health & Fitness', target: '+50 impact score', isActive: true, year: 2018 },
  { id: 'religious', name: 'Spiritual Growth', target: '+200 impact score', isActive: true, year: 2018 },
]

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [currentYear, setCurrentYear] = useState<number>(2018)
  const [generalPlan, setGeneralPlanState] = useState(INITIAL_GENERAL_PLAN)
  const [specificGoals, setSpecificGoalsState] = useState<SpecificGoal[]>(INITIAL_GOALS)
  const [activities, setActivitiesState] = useState<Activity[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const savedYear = localStorage.getItem('cpd_current_year')
        const activeYear = savedYear ? Number(savedYear) : 2018
        setCurrentYear(activeYear)

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let loadedGoals: SpecificGoal[] = INITIAL_GOALS

        if (user) {
          // Load General Plan
          const { data: planData, error: planError } = await supabase
            .from('general_plans')
            .select('plan')
            .eq('user_id', user.id)
            .maybeSingle()
            
          if (planData && !planError) {
            setGeneralPlanState(planData.plan)
          }
          const { data, error } = await supabase
            .from('goals')
            .select('*')
            .order('created_at', { ascending: true })
            
          if (!error && data) {
            loadedGoals = data.map((g: any) => ({
              id: g.id,
              name: g.name,
              sidebarName: g.sidebar_name,
              target: g.target,
              isActive: g.is_active,
              year: g.year
            }))
          } else if (error) {
            console.error("Supabase select error:", error.message || error)
          }
        }
        setSpecificGoalsState(loadedGoals)

        let loadedActivities: Activity[] = []
        if (user) {
          const { data: actData, error: actError } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false })
            
          if (actData && !actError) {
            loadedActivities = actData.map((a: any) => ({
              id: a.id,
              action: a.action,
              impacts: a.impacts,
              date: a.date,
              dateIso: a.date_iso,
              ethWeek: a.eth_week,
              year: a.year,
              isPenalty: a.is_penalty
            }))
          }
        }
        
        // Run Penalty Engine
        const processedActivities = await enforcePenalties(loadedActivities, loadedGoals, activeYear)
        setActivitiesState(processedActivities)

      } catch (e) {
        console.error("Failed to load from local storage or supabase", e)
      } finally {
        setIsLoaded(true)
      }
    }
    
    loadData()
  }, [])

  const enforcePenalties = async (currentActivities: Activity[], currentGoals: SpecificGoal[], activeYear: number): Promise<Activity[]> => {
    if (currentActivities.length === 0) return currentActivities

    // Find the earliest activity date
    const sortedDates = currentActivities.map(a => new Date(a.dateIso)).sort((a, b) => a.getTime() - b.getTime())
    const earliestDate = startOfDay(sortedDates[0])
    const yesterday = startOfDay(subDays(new Date(), 1))

    if (isBefore(yesterday, earliestDate)) {
      return currentActivities // Nothing to penalize yet
    }

    const allDays = eachDayOfInterval({ start: earliestDate, end: yesterday })
    const newActivities = [...currentActivities]
    let addedPenalties = false

    const activeGoals = currentGoals.filter(g => g.isActive && g.year === activeYear)
    if (activeGoals.length === 0) return currentActivities // No goals to penalize

    allDays.forEach(day => {
      // Check if any activity exists for this day (ignoring penalties so we don't penalize twice)
      const hasActivity = currentActivities.some(a => isSameDay(new Date(a.dateIso), day) && !a.isPenalty)
      const hasPenaltyAlready = currentActivities.some(a => isSameDay(new Date(a.dateIso), day) && a.isPenalty)
      
      if (!hasActivity && !hasPenaltyAlready) {
        // Generate penalty
        const impacts = activeGoals.map(g => ({
          goalId: g.id,
          goalName: g.name,
          score: -1.0
        }))

        const penaltyActivity: Activity = {
          id: day.getTime().toString(), // We'll let DB generate UUID if we want, but local generation is easier here for state
          action: 'Missed Day Penalty (App Rule)',
          impacts,
          date: format(day, 'MMM d'),
          dateIso: day.toISOString(),
          ethWeek: `Week ${Math.ceil(day.getDate() / 7)}`,
          year: activeYear,
          isPenalty: true
        }

        newActivities.push(penaltyActivity)
        addedPenalties = true
      }
    })

    if (addedPenalties) {
      // Find which ones are new
      const newOnly = newActivities.filter(na => !currentActivities.some(ca => ca.id === na.id))
      if (newOnly.length > 0) {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const insertPayload = newOnly.map(act => ({
            user_id: user.id,
            action: act.action,
            impacts: act.impacts,
            date: act.date,
            date_iso: act.dateIso,
            eth_week: act.ethWeek,
            year: act.year,
            is_penalty: act.isPenalty
          }))
          const { data } = await supabase.from('activities').insert(insertPayload).select()
          
          if (data) {
             // Rebuild state with proper UUIDs
             const mappedData = data.map((a: any) => ({
                id: a.id,
                action: a.action,
                impacts: a.impacts,
                date: a.date,
                dateIso: a.date_iso,
                ethWeek: a.eth_week,
                year: a.year,
                isPenalty: a.is_penalty
             }))
             return [...mappedData, ...currentActivities].sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
          }
        }
      }

      return newActivities.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
    }

    return currentActivities
  }

  const setGeneralPlan = async (plan: string) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('general_plans')
      .upsert({ user_id: user.id, plan }, { onConflict: 'user_id' })

    if (error) {
      console.error("Error setting general plan:", error.message || error)
      return
    }

    setGeneralPlanState(plan)
  }

  const addGoal = async (goal: SpecificGoal) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('goals').insert({
      user_id: user.id,
      name: goal.name,
      sidebar_name: goal.sidebarName || goal.name,
      target: goal.target,
      is_active: goal.isActive,
      year: goal.year
    }).select().single()

    if (error) {
      console.error("Error inserting goal:", error.message || error.details || error)
      return
    }

    const newGoal: SpecificGoal = {
      id: data.id,
      name: data.name,
      sidebarName: data.sidebar_name,
      target: data.target,
      isActive: data.is_active,
      year: data.year
    }

    setSpecificGoalsState(prev => [...prev, newGoal])
  }

  const editGoal = async (id: string, updates: Partial<SpecificGoal>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dbUpdates: any = {}
    if (updates.name !== undefined) dbUpdates.name = updates.name
    if (updates.sidebarName !== undefined) dbUpdates.sidebar_name = updates.sidebarName
    if (updates.target !== undefined) dbUpdates.target = updates.target
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive
    if (updates.year !== undefined) dbUpdates.year = updates.year

    const { error } = await supabase
      .from('goals')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error("Error updating goal:", error.message || error.details || error)
      return
    }

    setSpecificGoalsState(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g))
  }

  const addActivity = async (activity: Activity) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('activities').insert({
      user_id: user.id,
      action: activity.action,
      impacts: activity.impacts,
      date: activity.date,
      date_iso: activity.dateIso,
      eth_week: activity.ethWeek,
      year: activity.year,
      is_penalty: activity.isPenalty || false
    }).select().single()

    if (error) {
      console.error("Error inserting activity:", error.message || error)
      return
    }

    const newActivity: Activity = {
      id: data.id,
      action: data.action,
      impacts: data.impacts,
      date: data.date,
      dateIso: data.date_iso,
      ethWeek: data.eth_week,
      year: data.year,
      isPenalty: data.is_penalty
    }

    setActivitiesState(prev => [newActivity, ...prev])
  }

  const handleSetYear = (year: number) => {
    setCurrentYear(year)
    localStorage.setItem('cpd_current_year', year.toString())
  }

  if (!isLoaded) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <DashboardContext.Provider
      value={{
        currentYear,
        setCurrentYear: handleSetYear,
        generalPlan,
        setGeneralPlan,
        specificGoals,
        addGoal,
        editGoal,
        activities,
        addActivity,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}
