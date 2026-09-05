'use client'

import { useState } from 'react'
import { CalendarDays, Plus, Activity, Info } from 'lucide-react'

// Mock Data
const SAMPLE_GOALS = [
  { id: 'financial', name: 'Financial Freedom' },
  { id: 'health', name: 'Health & Fitness' },
  { id: 'religious', name: 'Spiritual Growth' },
]

const MOCK_ACTIVITIES = [
  { 
    id: 1, 
    action: 'Read 20 pages of atomic habits', 
    impacts: [{ goalName: 'Personal Growth', score: 0.8 }], 
    date: 'Oct 14', 
    ethWeek: 'Week 6' 
  },
  { 
    id: 2, 
    action: 'Skipped gym and ate junk food', 
    impacts: [{ goalName: 'Health & Fitness', score: -0.9 }, { goalName: 'Financial Freedom', score: -0.2 }], 
    date: 'Oct 14', 
    ethWeek: 'Week 6' 
  },
]

export default function ActivityLoggerClient() {
  const [action, setAction] = useState('')
  
  // Track selected goals and their specific scores
  const [selectedImpacts, setSelectedImpacts] = useState<Record<string, number>>({})
  
  const [activities, setActivities] = useState(MOCK_ACTIVITIES)

  const handleGoalToggle = (goalId: string) => {
    const newImpacts = { ...selectedImpacts }
    if (newImpacts[goalId] !== undefined) {
      delete newImpacts[goalId]
    } else {
      newImpacts[goalId] = 0 // default neutral score
    }
    setSelectedImpacts(newImpacts)
  }

  const handleScoreChange = (goalId: string, score: number) => {
    setSelectedImpacts({ ...selectedImpacts, [goalId]: score })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!action.trim() || Object.keys(selectedImpacts).length === 0) return

    const impactsList = Object.entries(selectedImpacts).map(([goalId, score]) => {
      const goalName = SAMPLE_GOALS.find(g => g.id === goalId)?.name || 'Custom Goal'
      return { goalName, score }
    })

    const newActivity = {
      id: Date.now(),
      action,
      impacts: impactsList,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ethWeek: 'Week 6' // We will implement the real Ethiopian Calendar conversion here
    }

    setActivities([newActivity, ...activities])
    setAction('')
    setSelectedImpacts({})
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Daily Activities</h1>
        <p className="text-slate-500">Log your actions and assign fine-grained scores (-1.0 to 1.0) to multiple goals.</p>
      </div>

      {/* Logger Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Log New Action</h2>
            <p className="text-sm text-slate-500">One small action can compound across multiple goals.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="action" className="mb-2 block text-sm font-medium text-slate-700">Action Description</label>
              <input
                id="action"
                type="text"
                value={action}
                onChange={(e) => setAction(e.target.value)}
                placeholder="e.g. Read 10 pages of a book..."
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium text-slate-700">
                Which goals did this action impact? (Select multiple)
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                {SAMPLE_GOALS.map((g) => {
                  const isSelected = selectedImpacts[g.id] !== undefined
                  return (
                    <div 
                      key={g.id} 
                      className={`rounded-xl border p-4 transition-colors ${
                        isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                          checked={isSelected}
                          onChange={() => handleGoalToggle(g.id)}
                        />
                        <span className={`font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>
                          {g.name}
                        </span>
                      </label>
                      
                      {isSelected && (
                        <div className="mt-4 pl-7">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-slate-500">Impact Score:</span>
                            <span className={`text-xs font-bold ${
                              selectedImpacts[g.id] > 0 ? 'text-emerald-600' : selectedImpacts[g.id] < 0 ? 'text-red-600' : 'text-slate-500'
                            }`}>
                              {selectedImpacts[g.id] > 0 ? `+${selectedImpacts[g.id]}` : selectedImpacts[g.id]}
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="-1" 
                            max="1" 
                            step="0.1"
                            value={selectedImpacts[g.id]}
                            onChange={(e) => handleScoreChange(g.id, parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between text-[10px] font-medium text-slate-400 mt-1">
                            <span>-1.0 (Bad)</span>
                            <span>0 (Neutral)</span>
                            <span>+1.0 (Good)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!action.trim() || Object.keys(selectedImpacts).length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-5 w-5" />
            Save Activity
          </button>
        </form>
      </div>

      {/* Ethiopian Calendar Grouping - Timeline */}
      <div className="mt-8">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
          <CalendarDays className="h-6 w-6 text-primary" />
          Activity History (Ethiopian Calendar)
        </h3>
        
        <div className="space-y-8">
          <div className="relative pl-6 before:absolute before:bottom-0 before:left-[11px] before:top-2 before:w-[2px] before:bg-slate-200">
            <div className="absolute left-0 top-2 h-6 w-6 rounded-full border-4 border-white bg-primary"></div>
            <h4 className="mb-4 text-lg font-semibold text-slate-800">Week 6</h4>
            
            <div className="space-y-4">
              {activities.filter(a => a.ethWeek === 'Week 6').map(activity => (
                <div key={activity.id} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
                  <div className="mb-3 border-b border-slate-100 pb-3">
                    <span className="font-medium text-slate-900">{activity.action}</span>
                    <span className="ml-2 text-xs font-medium text-slate-400">{activity.date}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {activity.impacts.map((impact, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                        <span className="text-xs font-medium text-slate-600">{impact.goalName}</span>
                        <div className={`flex h-6 px-2 items-center justify-center rounded-full text-xs font-bold ${
                          impact.score > 0 ? 'bg-emerald-100 text-emerald-700' : 
                          impact.score < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {impact.score > 0 ? `+${impact.score}` : impact.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
