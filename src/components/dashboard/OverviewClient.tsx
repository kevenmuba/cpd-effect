'use client'

import { useMemo, useState } from 'react'
import { TrendingUp, Activity, Target } from 'lucide-react'
import { isSameDay, isSameWeek, isSameMonth } from 'date-fns'
import { useDashboard } from '@/context/DashboardContext'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function OverviewClient() {
  const { currentYear, setCurrentYear, activities, specificGoals, bankLogs } = useDashboard()

  const availableYears = Array.from({length: 13}, (_, i) => 2018 + i)
  const [timeFilter, setTimeFilter] = useState<'day' | 'week' | 'month' | 'year'>('year')

  const { totalActions, overallScore, totalPositive, totalNegative, activeGoalsCount, recentActivities, cpdChartData } = useMemo(() => {
    // 1. Filter goals
    const activeGoals = specificGoals.filter(g => g.isActive && g.year === currentYear)
    const activeGoalsCount = activeGoals.length
    const activeGoalIds = new Set(activeGoals.map(g => g.id))

    // 2. Filter and process activities
    let filteredActivities = activities.filter(a => a.year === currentYear)
    
    const today = new Date()
    if (timeFilter === 'day') {
      filteredActivities = filteredActivities.filter(a => isSameDay(new Date(a.dateIso), today))
    } else if (timeFilter === 'week') {
      filteredActivities = filteredActivities.filter(a => isSameWeek(new Date(a.dateIso), today))
    } else if (timeFilter === 'month') {
      filteredActivities = filteredActivities.filter(a => isSameMonth(new Date(a.dateIso), today))
    }

    const totalActions = filteredActivities.length

    let overallScore = 0
    let totalPositive = 0
    let totalNegative = 0
    const processedActivities = []
    const cpdChartData = []

    // Sort ascending first to build the cumulative chart
    const ascendingActivities = [...filteredActivities].sort((a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime())

    for (const activity of ascendingActivities) {
      let activityScore = 0
      const relevantImpacts = []
      
      // Sum the scores of impacts that hit ACTIVE goals for this year
      for (const impact of activity.impacts) {
        if (activeGoalIds.has(impact.goalId) || impact.goalId === 'global_penalty') {
          overallScore += impact.score
          activityScore += impact.score
          if (impact.score > 0) totalPositive += impact.score
          if (impact.score < 0) totalNegative += Math.abs(impact.score)
          relevantImpacts.push(impact)
        }
      }
      
      // Only add to chart if it actually impacted the score (or if you want every day, leave it outside)
      if (relevantImpacts.length > 0 || activity.isPenalty) {
        cpdChartData.push({
          date: new Date(activity.dateIso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          score: overallScore
        })
        
        processedActivities.push({
          ...activity,
          displayImpacts: relevantImpacts.length > 0 ? relevantImpacts : activity.impacts
        })
      }
    }

    // Sort descending by dateIso for the recent activities table
    processedActivities.sort((a, b) => new Date(b.dateIso).getTime() - new Date(a.dateIso).getTime())
    
    // Take top 10 for recent
    const recentActivities = processedActivities.slice(0, 10)

    return { totalActions, overallScore, totalPositive, totalNegative, activeGoalsCount, recentActivities, cpdChartData }
  }, [activities, specificGoals, currentYear, timeFilter])

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
        
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {/* Time Filter */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            {(['day', 'week', 'month', 'year'] as const).map(f => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md capitalize transition-colors ${timeFilter === f ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
              >
                {f}
              </button>
            ))}
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
            {metric.title === 'Overall CPD Score' && (
              <div className="mt-2 mb-1 flex items-center gap-3 text-xs font-semibold">
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{totalPositive.toFixed(1)} Pos</span>
                <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">-{totalNegative.toFixed(1)} Neg</span>
              </div>
            )}
            <p className="mt-1 text-xs text-slate-500">{metric.trend}</p>
          </div>
        ))}
      </div>

      {/* CPD Effect Trend Overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-slate-900 mb-6">Total CPD Effect Growth ({currentYear})</h3>
        <div className="h-[250px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cpdChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCpdScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`${Number(value) > 0 ? '+' : ''}${Number(value).toLocaleString()} Score`, 'CPD Effect']}
                labelStyle={{ color: '#64748b', fontWeight: 600, marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCpdScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
          {cpdChartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-xl">
              <p className="text-sm text-slate-500 font-medium">No activity data yet</p>
            </div>
          )}
        </div>
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
