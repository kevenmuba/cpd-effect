import Link from 'next/link'
import { LayoutDashboard, Target, CalendarDays, LineChart, FileText } from 'lucide-react'

// Sample data for dynamic specific goals
const SAMPLE_GOALS = [
  { id: 'financial', name: 'Financial Freedom' },
  { id: 'health', name: 'Health & Fitness' },
  { id: 'religious', name: 'Spiritual Growth' },
]

export default function Sidebar() {
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
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Specific Reports
            </p>
            {SAMPLE_GOALS.map((goal) => (
              <Link
                key={goal.id}
                href={`/dashboard/reports/${goal.id}`}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 mt-1"
              >
                <FileText className="h-4 w-4" />
                {goal.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="mt-auto border-t border-slate-200 pt-4">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full text-left rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
