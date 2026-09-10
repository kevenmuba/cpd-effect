'use client'

import { useState, useMemo, useEffect } from 'react'
import { Filter, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'

type TimeFilter = 'day' | 'week' | 'month' | 'year'

export default function MasterReportClient() {
  const { currentYear, activities, specificGoals } = useDashboard()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('year')
  
  // State for togglist (accordions)
  const [expandedGoals, setExpandedGoals] = useState<Record<string, boolean>>({})

  const [realEthDate, setRealEthDate] = useState<{ year: number, month: number, date: number, week: number } | null>(null)

  useEffect(() => {
    try {
      const { EthDateTime } = require('ethiopian-calendar-date-converter');
      const localNow = new Date();
      const utcNow = new Date(Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate()));
      const ethDate = EthDateTime.fromEuropeanDate(utcNow);
      setRealEthDate({
        year: ethDate.year,
        month: ethDate.month,
        date: ethDate.date,
        week: Math.ceil(ethDate.date / 7)
      });
    } catch (e) {
      console.error(e)
    }
  }, [])

  const activeGoals = specificGoals.filter(g => g.isActive && g.year === currentYear)

  // Calculate metrics
  const reportData = useMemo(() => {
    const data: Record<string, { positive: number, negative: number, total: number, actionsCount: number }> = {}
    
    // Initialize
    activeGoals.forEach(g => {
      data[g.id] = { positive: 0, negative: 0, total: 0, actionsCount: 0 }
    })

    if (!realEthDate) return data

    activities.forEach(activity => {
      // Basic year filter (everything is bound by the selected Dashboard currentYear anyway)
      if (activity.year !== currentYear) return
      
      // Detailed Time Filter Logic
      let includeActivity = false;
      const d = new Date(activity.dateIso)
      
      try {
        const { EthDateTime } = require('ethiopian-calendar-date-converter');
        const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const actEthDate = EthDateTime.fromEuropeanDate(utcDate);
        const actWeek = Math.ceil(actEthDate.date / 7);

        if (timeFilter === 'year') {
          includeActivity = true;
        } else if (timeFilter === 'month') {
          includeActivity = (actEthDate.month === realEthDate.month && actEthDate.year === realEthDate.year);
        } else if (timeFilter === 'week') {
          includeActivity = (actEthDate.month === realEthDate.month && actEthDate.year === realEthDate.year && actWeek === realEthDate.week);
        } else if (timeFilter === 'day') {
          includeActivity = (actEthDate.date === realEthDate.date && actEthDate.month === realEthDate.month && actEthDate.year === realEthDate.year);
        }
      } catch (e) {
        // Fallback to true if converter fails
        includeActivity = true;
      }

      if (!includeActivity) return;

      // Calculate impacts
      activity.impacts.forEach(impact => {
        if (data[impact.goalId]) {
          data[impact.goalId].actionsCount += 1
          data[impact.goalId].total += impact.score
          
          if (impact.score > 0) {
            data[impact.goalId].positive += impact.score
          } else if (impact.score < 0) {
            data[impact.goalId].negative += Math.abs(impact.score) // store as positive absolute value for display
          }
        }
      })
    })

    return data
  }, [activities, activeGoals, currentYear, timeFilter, realEthDate])

  const toggleGoal = (goalId: string) => {
    setExpandedGoals(prev => ({ ...prev, [goalId]: !prev[goalId] }))
  }

  const expandAll = () => {
    const all = activeGoals.reduce((acc, goal) => ({ ...acc, [goal.id]: true }), {})
    setExpandedGoals(all)
  }

  const collapseAll = () => {
    setExpandedGoals({})
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Master Report Dashboard</h1>
        <p className="text-slate-500">Analyze the compound effect of your actions across all your goals.</p>
      </div>

      {/* Filter Controls */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-slate-400" />
          <span className="font-semibold text-slate-700">Time Filter:</span>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
          {(['day', 'week', 'month', 'year'] as TimeFilter[]).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeFilter(tf)}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-md transition-colors capitalize ${
                timeFilter === tf ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tf === 'day' ? 'Today' : `This ${tf}`}
            </button>
          ))}
        </div>
      </div>

      {/* Togglist Actions */}
      <div className="flex justify-end gap-3 text-sm">
        <button onClick={expandAll} className="text-primary font-medium hover:underline">Expand All</button>
        <span className="text-slate-300">|</span>
        <button onClick={collapseAll} className="text-slate-500 font-medium hover:underline">Collapse All</button>
      </div>

      {/* Togglist of Goals */}
      <div className="space-y-4">
        {activeGoals.map(goal => {
          const metrics = reportData[goal.id] || { positive: 0, negative: 0, total: 0, actionsCount: 0 }
          const isExpanded = expandedGoals[goal.id]

          return (
            <div key={goal.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all">
              <button
                onClick={() => toggleGoal(goal.id)}
                className="flex w-full items-center justify-between bg-slate-50 px-6 py-4 text-left transition-colors hover:bg-slate-100 border-b border-transparent data-[expanded=true]:border-slate-200"
                data-expanded={isExpanded}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    metrics.total > 0 ? 'bg-emerald-100 text-emerald-600' : 
                    metrics.total < 0 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{goal.name}</h3>
                    <p className="text-xs text-slate-500">Target: {goal.target}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Score</span>
                    <span className={`text-lg font-bold ${
                      metrics.total > 0 ? 'text-emerald-600' : metrics.total < 0 ? 'text-red-600' : 'text-slate-600'
                    }`}>
                      {metrics.total > 0 ? `+${metrics.total.toFixed(1)}` : metrics.total.toFixed(1)}
                    </span>
                  </div>
                  {isExpanded ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Positive Impact */}
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Total Positive</p>
                        <p className="text-3xl font-black text-emerald-600">+{metrics.positive.toFixed(1)}</p>
                      </div>
                      <TrendingUp className="h-10 w-10 text-emerald-200" />
                    </div>

                    {/* Negative Impact */}
                    <div className="rounded-xl bg-red-50 border border-red-100 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Total Negative</p>
                        <p className="text-3xl font-black text-red-600">-{metrics.negative.toFixed(1)}</p>
                      </div>
                      <TrendingDown className="h-10 w-10 text-red-200" />
                    </div>

                    {/* Actions Count */}
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Actions Logged</p>
                        <p className="text-3xl font-black text-slate-800">{metrics.actionsCount}</p>
                      </div>
                      <Activity className="h-10 w-10 text-slate-200" />
                    </div>

                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-slate-100">
                     <p className="text-sm text-slate-500 text-center">
                       Data filtered for: <strong>{timeFilter === 'day' ? 'Today' : `This ${timeFilter}`}</strong>
                     </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {activeGoals.length === 0 && (
          <div className="text-center py-12 rounded-xl border-2 border-dashed border-slate-200">
            <Target className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-700">No Active Goals</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Create and activate a specific goal in the "Manage Goals" page to see reports.</p>
          </div>
        )}
      </div>
    </div>
  )
}
