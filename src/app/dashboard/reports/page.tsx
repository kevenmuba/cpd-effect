import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MasterReportClient from '@/components/dashboard/MasterReportClient'

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return <MasterReportClient />
}
