import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import GoalReportClient from '@/components/dashboard/GoalReportClient'

export default async function GoalReportPage({
  params,
}: {
  params: Promise<{ goalId: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  const { goalId } = await params

  return <GoalReportClient goalId={goalId} />
}
