'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  date: string
  ethWeek: string
  year: number
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

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedPlan = localStorage.getItem('cpd_general_plan')
      if (savedPlan) setGeneralPlanState(savedPlan)

      const savedGoals = localStorage.getItem('cpd_specific_goals')
      if (savedGoals) setSpecificGoalsState(JSON.parse(savedGoals))

      const savedActivities = localStorage.getItem('cpd_activities')
      if (savedActivities) setActivitiesState(JSON.parse(savedActivities))
      
      const savedYear = localStorage.getItem('cpd_current_year')
      if (savedYear) setCurrentYear(Number(savedYear))
    } catch (e) {
      console.error("Failed to load from local storage", e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save to LocalStorage wrappers
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
