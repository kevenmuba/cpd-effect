'use client'

import { motion } from 'framer-motion'
import { CarFront, Flag } from 'lucide-react'

interface GoalReportClientProps {
  goalId: string
  goalName: string
  currentScore: number
}

export default function GoalReportClient({ goalId, goalName, currentScore }: GoalReportClientProps) {
  // Assuming score goes from -10 to +10 for the visualization path
  // Calculate percentage along the path (0% to 100%)
  const maxScore = 10
  const normalizedScore = Math.max(-maxScore, Math.min(maxScore, currentScore))
  const percentage = ((normalizedScore + maxScore) / (maxScore * 2)) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{goalName} Report</h1>
        <p className="text-slate-500">Track your compound progress for this specific goal.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h3 className="mb-8 text-lg font-medium text-slate-900">Compound Effect Journey</h3>
        
        {/* The Path Visualization */}
        <div className="relative mx-auto mt-12 mb-8 h-2 w-full rounded-full bg-slate-200">
          {/* Start Line */}
          <div className="absolute -left-2 -top-4 text-xs font-bold text-red-500">Negative (-10)</div>
          
          {/* Middle Line */}
          <div className="absolute left-1/2 top-0 h-4 w-1 -translate-x-1/2 -translate-y-1 bg-slate-300"></div>
          <div className="absolute left-1/2 -top-6 -translate-x-1/2 text-xs font-medium text-slate-500">Neutral (0)</div>

          {/* Finish Line */}
          <div className="absolute -right-2 -top-4 flex flex-col items-center">
            <Flag className="h-5 w-5 text-emerald-500" />
            <span className="mt-1 text-xs font-bold text-emerald-600">Goal (+10)</span>
          </div>

          {/* The Car */}
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
              <div className="mt-2 rounded bg-slate-900 px-2 py-1 text-xs font-bold text-white shadow">
                Score: {currentScore > 0 ? `+${currentScore}` : currentScore}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 text-center text-sm text-slate-600">
          <p>
            When you log positive actions, your car moves towards the goal.
            <br />
            Negative actions pull you backwards. Keep driving forward!
          </p>
        </div>
      </div>
    </div>
  )
}
