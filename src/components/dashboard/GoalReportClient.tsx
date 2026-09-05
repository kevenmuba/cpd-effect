'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CarFront, Flag, Filter, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useDashboard } from '@/context/DashboardContext'
import Link from 'next/link'

type TimeFilter = 'day' | 'week' | 'month' | 'year'

interface GoalReportClientProps {
  goalId: string
}

export default function GoalReportClient({ goalId }: GoalReportClientProps) {
  const { currentYear, activities, specificGoals } = useDashboard()
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('year')
  const [realEthDate, setRealEthDate] = useState<{ year: number, month: number, date: number, week: number } | null>(null)

  useEffect(() => {
    try {
      const { EthDateTime } = require('ethiopian-calendar-date-converter');
      const ethDate = EthDateTime.fromEuropeanDate(new Date());
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

  const goal = specificGoals.find(g => g.id === goalId)
  
  const { positive, negative, currentScore, actionsCount } = useMemo(() => {
    let p = 0
    let n = 0
    let total = 0
    let count = 0

    if (!realEthDate || !goal) return { positive: p, negative: n, currentScore: total, actionsCount: count }

    activities.forEach(activity => {
      if (activity.year !== currentYear) return
      
      let includeActivity = false;
      const d = new Date(activity.dateIso)
      
      try {
        const { EthDateTime } = require('ethiopian-calendar-date-converter');
        const actEthDate = EthDateTime.fromEuropeanDate(d);
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
        includeActivity = true;
      }

      if (!includeActivity) return;

      const impact = activity.impacts.find(i => i.goalId === goalId)
      if (impact) {
        count += 1
        total += impact.score
        if (impact.score > 0) p += impact.score
        else if (impact.score < 0) n += Math.abs(impact.score)
      }
    })

    return { positive: p, negative: n, currentScore: total, actionsCount: count }
  }, [activities, goalId, currentYear, timeFilter, realEthDate, goal])

  if (!goal) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-slate-700">Goal not found</h2>
        <Link href="/dashboard/goals" className="text-primary mt-4 inline-block hover:underline">Return to Manage Goals</Link>
      </div>
    )
  }

  // Visualization constraints
  const maxScore = 10
  const normalizedScore = Math.max(-maxScore, Math.min(maxScore, currentScore))
  const percentage = ((normalizedScore + maxScore) / (maxScore * 2)) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{goal.name} Report</h1>
        <p className="text-slate-500">Track your compound progress for this specific goal.</p>
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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-1">Total Positive</p>
            <p className="text-3xl font-black text-emerald-600">+{positive.toFixed(1)}</p>
          </div>
          <TrendingUp className="h-10 w-10 text-emerald-200" />
        </div>

        <div className="rounded-xl bg-red-50 border border-red-100 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-1">Total Negative</p>
            <p className="text-3xl font-black text-red-600">-{negative.toFixed(1)}</p>
          </div>
          <TrendingDown className="h-10 w-10 text-red-200" />
        </div>

        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Net Score</p>
            <p className={`text-3xl font-black ${currentScore > 0 ? 'text-emerald-600' : currentScore < 0 ? 'text-red-600' : 'text-slate-700'}`}>
              {currentScore > 0 ? `+${currentScore.toFixed(1)}` : currentScore.toFixed(1)}
            </p>
          </div>
          <Activity className="h-10 w-10 text-slate-200" />
        </div>
      </div>

      {/* The Car Path Visualization */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="mb-8 text-lg font-medium text-slate-900">Compound Effect Journey</h3>
        
        <div className="relative mx-auto mt-12 mb-8 h-2 w-full rounded-full bg-slate-200">
          <div className="absolute -left-2 -top-4 text-xs font-bold text-red-500">Negative (-10)</div>
          
          <div className="absolute left-1/2 top-0 h-4 w-1 -translate-x-1/2 -translate-y-1 bg-slate-300"></div>
          <div className="absolute left-1/2 -top-6 -translate-x-1/2 text-xs font-medium text-slate-500">Neutral (0)</div>

          <div className="absolute -right-2 -top-4 flex flex-col items-center">
            <Flag className="h-5 w-5 text-emerald-500" />
            <span className="mt-1 text-xs font-bold text-emerald-600">Goal (+10)</span>
          </div>

          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${percentage}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 20 }}
            className="absolute -top-4 -translate-x-1/2"
          >
            <div className="flex flex-col items-center">
              <div className="rounded-md bg-primary p-2 shadow-lg text-white">
                <CarFront className="h-6 w-6" />
              </div>
              <div className="mt-2 rounded bg-slate-900 px-2 py-1 text-xs font-bold text-white shadow whitespace-nowrap">
                Net: {currentScore > 0 ? `+${currentScore.toFixed(1)}` : currentScore.toFixed(1)}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center text-sm text-slate-600">
          <p>
            When you log positive actions, your car moves towards the goal.
            <br />
            Negative actions and missed days pull you backwards. Keep driving forward!
          </p>
          <p className="mt-2 font-medium text-slate-500">
            Based on {actionsCount} actions filtered for: <strong>{timeFilter === 'day' ? 'Today' : `This ${timeFilter}`}</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
