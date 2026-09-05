import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ActivityLoggerClient from '@/components/dashboard/ActivityClient'

export default async function ActivitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return <ActivityLoggerClient />
}
