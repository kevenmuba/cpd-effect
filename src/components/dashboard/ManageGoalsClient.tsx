'use client'

import { useState } from 'react'
import { Target, Plus, Check, BookOpen, Edit2, X, Power, PowerOff } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'

export default function ManageGoalsClient() {
  const { currentYear, setCurrentYear, generalPlan, setGeneralPlan, specificGoals, addGoal, editGoal } = useDashboard()
  
  const [isEditingPlan, setIsEditingPlan] = useState(false)
  const [tempPlan, setTempPlan] = useState(generalPlan)
  
  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalSidebarName, setNewGoalSidebarName] = useState('')
  const [newGoalTarget, setNewGoalTarget] = useState('')

  // State for editing a specific goal inline
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null)
  const [editGoalName, setEditGoalName] = useState('')
  const [editGoalSidebarName, setEditGoalSidebarName] = useState('')
  const [editGoalTarget, setEditGoalTarget] = useState('')

  // Generate years from 2017 up to 2030 (Ethiopian)
  const availableYears = Array.from({length: 14}, (_, i) => 2017 + i)

  const handleSavePlan = () => {
    setGeneralPlan(tempPlan)
    setIsEditingPlan(false)
  }

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGoalName.trim()) return

    const newGoal = {
      id: newGoalName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now(), // Ignored by DB but satisfies type
      name: newGoalName,
      sidebarName: newGoalSidebarName || newGoalName,
      target: newGoalTarget || 'No specific target set',
      isActive: true,
      year: currentYear
    }

    addGoal(newGoal)
    setNewGoalName('')
    setNewGoalSidebarName('')
    setNewGoalTarget('')
  }

  const startEditingGoal = (goal: any) => {
    setEditingGoalId(goal.id)
    setEditGoalName(goal.name)
    setEditGoalSidebarName(goal.sidebarName || goal.name)
    setEditGoalTarget(goal.target)
  }

  const saveEditedGoal = (id: string) => {
    editGoal(id, { name: editGoalName, sidebarName: editGoalSidebarName, target: editGoalTarget })
    setEditingGoalId(null)
  }

  const toggleGoalStatus = (id: string, currentStatus: boolean) => {
    editGoal(id, { isActive: !currentStatus })
  }

  // Filter goals to show only the ones for the currently selected year
  const filteredGoals = specificGoals.filter(g => g.year === currentYear)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Goals</h1>
          <p className="text-slate-500">Define your general life plan and break it down into specific trackable goals.</p>
        </div>
        
        {/* Year Filter */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <label htmlFor="yearFilter" className="text-sm font-medium text-slate-600 whitespace-nowrap">
            Ethiopian Year:
          </label>
          <select 
            id="yearFilter"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="bg-transparent text-slate-900 font-bold focus:outline-none"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
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
              onClick={() => {
                setTempPlan(generalPlan)
                setIsEditingPlan(true)
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Edit Plan
            </button>
          )}
        </div>

        {isEditingPlan ? (
          <div className="space-y-4">
            <textarea
              value={tempPlan}
              onChange={(e) => setTempPlan(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 bg-white p-4 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="What is your overarching vision for this year?"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSavePlan}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
              >
                <Check className="h-4 w-4" />
                Save Plan
              </button>
              <button
                onClick={() => setIsEditingPlan(false)}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
            </div>
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
            <h2 className="text-xl font-semibold text-slate-900">Specific Goals for {currentYear}</h2>
            <p className="text-sm text-slate-500">Goals that are active will appear in your sidebar and logger.</p>
          </div>
        </div>

        {/* Existing Goals List */}
        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          {filteredGoals.map((goal) => (
            <div key={goal.id} className={`rounded-xl border p-4 transition-colors ${goal.isActive ? 'border-slate-200 bg-slate-50' : 'border-slate-200 bg-slate-100 opacity-60'}`}>
              {editingGoalId === goal.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editGoalName}
                    onChange={(e) => setEditGoalName(e.target.value)}
                    placeholder="Full Goal Description"
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editGoalSidebarName}
                    onChange={(e) => setEditGoalSidebarName(e.target.value)}
                    placeholder="Short Sidebar Name"
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={editGoalTarget}
                    onChange={(e) => setEditGoalTarget(e.target.value)}
                    placeholder="Target Score"
                    className="w-full rounded border border-slate-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none"
                  />
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => saveEditedGoal(goal.id)} className="rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white">Save</button>
                    <button onClick={() => setEditingGoalId(null)} className="rounded bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className={`font-semibold ${goal.isActive ? 'text-slate-900' : 'text-slate-500 line-through'}`}>{goal.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">Target: {goal.target}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => startEditingGoal(goal)}
                      title="Edit Goal"
                      className="text-slate-400 hover:text-primary transition-colors p-1"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => toggleGoalStatus(goal.id, goal.isActive)}
                      title={goal.isActive ? "Disable Goal" : "Enable Goal"}
                      className={`${goal.isActive ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-400 hover:text-slate-500'} transition-colors p-1`}
                    >
                      {goal.isActive ? <Power className="h-4 w-4" /> : <PowerOff className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filteredGoals.length === 0 && (
            <div className="col-span-full py-6 text-center text-slate-500">
              No specific goals set for {currentYear} yet.
            </div>
          )}
        </div>

        {/* Add New Goal Form */}
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Create New Specific Goal</h3>
          <form onSubmit={handleAddGoal} className="grid gap-4 md:grid-cols-12 items-end">
            <div className="md:col-span-4">
              <label htmlFor="goalName" className="mb-2 block text-sm font-medium text-slate-700">Full Description</label>
              <input
                id="goalName"
                type="text"
                value={newGoalName}
                onChange={(e) => setNewGoalName(e.target.value)}
                placeholder="e.g. Read 20 pages everyday"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div className="md:col-span-3">
              <label htmlFor="goalSidebarName" className="mb-2 block text-sm font-medium text-slate-700">Sidebar Name</label>
              <input
                id="goalSidebarName"
                type="text"
                value={newGoalSidebarName}
                onChange={(e) => setNewGoalSidebarName(e.target.value)}
                placeholder="e.g. Reading Habit"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="md:col-span-3">
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
