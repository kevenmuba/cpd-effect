import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, Activity, Target } from 'lucide-react'

// Mock Data
const OVERVIEW_METRICS = [
  { title: 'Total Actions Logged', value: '1,248', icon: Activity, trend: '+12% this month' },
  { title: 'Overall CPD Score', value: '+45.2', icon: TrendingUp, trend: 'Consistent growth' },
  { title: 'Active Goals', value: '3', icon: Target, trend: 'All on track' },
]

const RECENT_ACTIVITIES = [
  { id: 1, action: 'Read 20 pages of atomic habits', score: '+1', goal: 'Personal Growth', date: 'Oct 14, Week 6' },
  { id: 2, action: 'Skipped gym session', score: '-1', goal: 'Health & Fitness', date: 'Oct 14, Week 6' },
  { id: 3, action: 'Saved $50 to investment account', score: '+1', goal: 'Financial Freedom', date: 'Oct 13, Week 6' },
  { id: 4, action: 'Ate junk food for dinner', score: '-1', goal: 'Health & Fitness', date: 'Oct 12, Week 6' },
]

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, your compound effect is building up nicely.</p>
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
              <span className="text-3xl font-semibold text-slate-900">{metric.value}</span>
            </div>
            <p className="mt-1 text-xs text-emerald-600">{metric.trend}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50 px-6 py-4">
          <h3 className="text-lg font-medium text-slate-900">Recent Activities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Goal Impacted</th>
                <th className="px-6 py-3 font-semibold">Score</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {RECENT_ACTIVITIES.map((activity) => (
                <tr key={activity.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{activity.action}</td>
                  <td className="px-6 py-4">{activity.goal}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      activity.score.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {activity.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{activity.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
