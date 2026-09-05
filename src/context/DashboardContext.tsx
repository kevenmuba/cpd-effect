'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { startOfDay, endOfDay, eachDayOfInterval, format, isBefore, isSameDay, subDays } from 'date-fns'

export interface SpecificGoal {
  id: string
  name: string
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
  id: number
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
  setGeneralPlan: (plan: string) => void
  specificGoals: SpecificGoal[]
  addGoal: (goal: SpecificGoal) => void
  editGoal: (id: string, updates: Partial<SpecificGoal>) => void
  activities: Activity[]
  addActivity: (activity: Activity) => void
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
    try {
      const savedPlan = localStorage.getItem('cpd_general_plan')
      if (savedPlan) setGeneralPlanState(savedPlan)

      let loadedGoals = INITIAL_GOALS
      const savedGoals = localStorage.getItem('cpd_specific_goals')
      if (savedGoals) {
        loadedGoals = JSON.parse(savedGoals)
        setSpecificGoalsState(loadedGoals)
      }

      let loadedActivities: Activity[] = []
      const savedActivities = localStorage.getItem('cpd_activities')
      if (savedActivities) {
        loadedActivities = JSON.parse(savedActivities)
      }
      
      const savedYear = localStorage.getItem('cpd_current_year')
      const activeYear = savedYear ? Number(savedYear) : 2018
      setCurrentYear(activeYear)

      // Run Penalty Engine
      const processedActivities = enforcePenalties(loadedActivities, loadedGoals, activeYear)
      setActivitiesState(processedActivities)
      
      // Save possibly new penalties back
      if (processedActivities.length !== loadedActivities.length) {
        localStorage.setItem('cpd_activities', JSON.stringify(processedActivities))
      }

    } catch (e) {
      console.error("Failed to load from local storage", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  const enforcePenalties = (currentActivities: Activity[], currentGoals: SpecificGoal[], activeYear: number): Activity[] => {
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
          id: day.getTime(),
          action: 'Missed Day Penalty (App Rule)',
          impacts,
          date: format(day, 'MMM d'),
          dateIso: day.toISOString(),
          ethWeek: `Week ${Math.ceil(day.getDate() / 7)}`, // Mock week approximation
          year: activeYear,
          isPenalty: true
        }

        newActivities.push(penaltyActivity)
        addedPenalties = true
      }
    })

    if (addedPenalties) {
      // Sort descending again
      return newActivities.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
    }

    return currentActivities
  }

  const setGeneralPlan = (plan: string) => {
    setGeneralPlanState(plan)
    localStorage.setItem('cpd_general_plan', plan)
  }

  const addGoal = (goal: SpecificGoal) => {
    const updated = [...specificGoals, goal]
    setSpecificGoalsState(updated)
    localStorage.setItem('cpd_specific_goals', JSON.stringify(updated))
  }

  const editGoal = (id: string, updates: Partial<SpecificGoal>) => {
    const updated = specificGoals.map(g => g.id === id ? { ...g, ...updates } : g)
    setSpecificGoalsState(updated)
    localStorage.setItem('cpd_specific_goals', JSON.stringify(updated))
  }

  const addActivity = (activity: Activity) => {
    const updated = [activity, ...activities]
    setActivitiesState(updated)
    localStorage.setItem('cpd_activities', JSON.stringify(updated))
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
