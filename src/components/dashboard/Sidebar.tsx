'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, Target, CalendarDays, LineChart, FileText, ChevronDown, ChevronRight, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useDashboard } from '@/context/DashboardContext'
import BankWidgetClient from './BankWidgetClient'

export default function Sidebar() {
  const { specificGoals, currentYear } = useDashboard()
  const [isReportsOpen, setIsReportsOpen] = useState(true)
  const router = useRouter()
  
  // Only show active goals for the selected year
  const activeGoals = specificGoals.filter(goal => goal.isActive && goal.year === currentYear)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <aside className="w-64 border-r border-slate-200 bg-slate-50/50 hidden md:block flex-shrink-0">
      <div className="flex h-full flex-col px-4 py-6">
        <div className="mb-8 px-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <LineChart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">CPD Effect</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1">
          <div className="mb-4">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Main Menu
            </p>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 text-sm font-medium text-primary shadow-sm ring-1 ring-slate-200"
            >
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </Link>
            <Link
              href="/dashboard/activities"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 mt-1"
            >
              <CalendarDays className="h-4 w-4" />
              Daily Activities
            </Link>
          </div>

          <div className="mb-4 pt-4">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Goal Planning
            </p>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Target className="h-4 w-4" />
              Manage Goals
            </Link>
          </div>

          <div className="pt-4">
            <button
              onClick={() => setIsReportsOpen(!isReportsOpen)}
              className="flex w-full items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 hover:text-slate-700 transition-colors"
            >
              <span>{currentYear} Reports</span>
              {isReportsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            
            {isReportsOpen && (
              <div className="space-y-1 pl-2 border-l-2 border-slate-100 ml-2">
                <Link
                  href="/dashboard/reports"
                  className="flex items-center gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm ring-1 ring-emerald-200 mb-2"
                >
                  <FileText className="h-4 w-4" />
                  General Report
                </Link>
                {activeGoals.map((goal) => (
                  <Link
                    key={goal.id}
                    href={`/dashboard/reports/${goal.id}`}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <FileText className="h-4 w-4" />
                    {goal.sidebarName || goal.name}
                  </Link>
                ))}
                {activeGoals.length === 0 && (
                  <p className="px-3 py-2 text-xs text-slate-400">No active goals yet.</p>
                )}
              </div>
            )}
          </div>

          <BankWidgetClient />
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  )
}
