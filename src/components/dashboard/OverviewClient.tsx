'use client'

import { useMemo } from 'react'
import { TrendingUp, Activity, Target } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'

export default function OverviewClient() {
  const { currentYear, setCurrentYear, activities, specificGoals } = useDashboard()

  const availableYears = Array.from({length: 13}, (_, i) => 2018 + i)

  const { totalActions, overallScore, activeGoalsCount, recentActivities } = useMemo(() => {
    // 1. Filter goals
    const activeGoals = specificGoals.filter(g => g.isActive && g.year === currentYear)
    const activeGoalsCount = activeGoals.length
    const activeGoalIds = new Set(activeGoals.map(g => g.id))

    // 2. Filter and process activities
    const yearActivities = activities.filter(a => a.year === currentYear)
    const totalActions = yearActivities.length

    let overallScore = 0
    const processedActivities = []

    for (const activity of yearActivities) {
      // Sum the scores of impacts that hit ACTIVE goals for this year
      for (const impact of activity.impacts) {
        if (activeGoalIds.has(impact.goalId)) {
          overallScore += impact.score
        }
      }
      
      // For the recent activities table, we just list the impacts nicely
      const relevantImpacts = activity.impacts.filter(i => activeGoalIds.has(i.goalId))
      if (relevantImpacts.length > 0 || activity.isPenalty) {
         processedActivities.push({
           ...activity,
           displayImpacts: relevantImpacts.length > 0 ? relevantImpacts : activity.impacts
         })
      }
    }

    // Sort descending by dateIso
    processedActivities.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
    
    // Take top 10 for recent
    const recentActivities = processedActivities.slice(0, 10)

    return { totalActions, overallScore, activeGoalsCount, recentActivities }
  }, [activities, specificGoals, currentYear])

  const OVERVIEW_METRICS = [
    { title: 'Total Actions Logged', value: totalActions.toString(), icon: Activity, trend: 'For ' + currentYear },
    { title: 'Overall CPD Score', value: (overallScore > 0 ? '+' : '') + overallScore.toFixed(1), icon: TrendingUp, trend: 'Active goals total' },
    { title: 'Active Goals', value: activeGoalsCount.toString(), icon: Target, trend: 'Tracked this year' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview ({currentYear})</h1>
          <p className="text-slate-500">Welcome back, your compound effect is building up nicely.</p>
        </div>
        
        {/* Year Filter */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <label htmlFor="overviewYearFilter" className="text-sm font-medium text-slate-600 whitespace-nowrap">
            Ethiopian Year:
          </label>
          <select 
            id="overviewYearFilter"
            value={currentYear}
            onChange={(e) => setCurrentYear(Number(e.target.value))}
            className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {OVERVIEW_METRICS.map((metric) => (
          <div key={metric.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500">{metric.title}</h3>
              <metric.icon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-semibold ${
                metric.title === 'Overall CPD Score' 
                  ? (overallScore > 0 ? 'text-emerald-600' : overallScore < 0 ? 'text-red-600' : 'text-slate-900')
                  : 'text-slate-900'
              }`}>{metric.value}</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{metric.trend}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-900">Recent Activities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Goals Impacted</th>
                <th className="px-6 py-3 font-semibold">Score</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentActivities.map((activity) => (
                <tr key={activity.id} className={`hover:bg-slate-50/50 ${activity.isPenalty ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    <span className={activity.isPenalty ? 'text-red-700' : ''}>{activity.action}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {activity.displayImpacts.map((i: any, idx: number) => (
                        <span key={idx} className="text-xs text-slate-500">{i.goalName}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      {activity.displayImpacts.map((i: any, idx: number) => (
                        <span key={idx} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          i.score > 0 ? 'bg-emerald-100 text-emerald-700' : i.score < 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {i.score > 0 ? `+${i.score}` : i.score}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{activity.date}</td>
                </tr>
              ))}
              {recentActivities.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No activities logged for {currentYear} yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
