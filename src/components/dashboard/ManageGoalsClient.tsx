'use client'

import { useState } from 'react'
import { Target, Plus, Check, BookOpen } from 'lucide-react'

// Mock initial data
const INITIAL_GENERAL_PLAN = "To become physically healthier, financially independent, and spiritually grounded by the end of the Ethiopian year."
const INITIAL_SPECIFIC_GOALS = [
  { id: 'financial', name: 'Financial Freedom', target: '+100 impact score' },
  { id: 'health', name: 'Health & Fitness', target: '+50 impact score' },
  { id: 'religious', name: 'Spiritual Growth', target: '+200 impact score' },
]

export default function ManageGoalsClient() {
  const [generalPlan, setGeneralPlan] = useState(INITIAL_GENERAL_PLAN)
  const [isEditingPlan, setIsEditingPlan] = useState(false)
  
  const [specificGoals, setSpecificGoals] = useState(INITIAL_SPECIFIC_GOALS)
  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalTarget, setNewGoalTarget] = useState('')

  const handleSavePlan = () => {
    // In a real app, save to Supabase here
    setIsEditingPlan(false)
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalName.trim()) return

    const newGoal = {
      id: newGoalName.toLowerCase().replace(/\s+/g, '-'),
      name: newGoalName,
      target: newGoalTarget || 'No specific target set'
    }

    setSpecificGoals([...specificGoals, newGoal])
    setNewGoalName('')
    setNewGoalTarget('')
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Goals</h1>
        <p className="text-slate-500">Define your general life plan and break it down into specific trackable goals.</p>
      </div>

      {/* General Plan Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-slate-900">General Plan of the Year</h2>
            <p className="text-sm text-slate-500">Your overarching vision for this year.</p>
          </div>
          {!isEditingPlan && (
            <button 
              onClick={() => setIsEditingPlan(true)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit Plan
            </button>
          )}
        </div>

        {isEditingPlan ? (
          <div className="space-y-4">
            <textarea
              value={generalPlan}
              onChange={(e) => setGeneralPlan(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white p-4 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="What is your overarching vision for this year?"
            />
            <button
              onClick={handleSavePlan}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            >
              <Check className="h-4 w-4" />
              Save Plan
            </button>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-6 border border-slate-100">
            <p className="text-slate-700 italic leading-relaxed text-lg">"{generalPlan}"</p>
          </div>
        )}
      </div>

      {/* Specific Goals Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
            <Target className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Specific Goals</h2>
            <p className="text-sm text-slate-500">Add specific goals to track your daily actions against.</p>
          </div>
        </div>

        {/* Existing Goals List */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          {specificGoals.map((goal) => (
            <div key={goal.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="font-semibold text-slate-900">{goal.name}</h3>
              <p className="text-sm text-slate-500 mt-1">Target: {goal.target}</p>
            </div>
          ))}
        </div>

        {/* Add New Goal Form */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Create New Specific Goal</h3>
          <form onSubmit={handleAddGoal} className="grid gap-4 md:grid-cols-12 items-end">
            <div className="md:col-span-5">
              <label htmlFor="goalName" className="mb-2 block text-sm font-medium text-slate-700">Goal Name</label>
              <input
                id="goalName"
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g. Learn React"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="md:col-span-5">
              <label htmlFor="goalTarget" className="mb-2 block text-sm font-medium text-slate-700">Target (Optional)</label>
              <input
                id="goalTarget"
                type="text"
                value={newGoalTarget}
                onChange={(e) => setNewGoalTarget(e.target.value)}
                placeholder="e.g. +50 points"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="h-5 w-5" />
                Add
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
