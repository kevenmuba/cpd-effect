import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import OverviewClient from '@/components/dashboard/OverviewClient'

export default async function DashboardOverview() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return <OverviewClient />
}
