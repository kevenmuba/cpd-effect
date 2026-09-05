import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ManageGoalsClient from '@/components/dashboard/ManageGoalsClient'

export default async function ManageGoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  return <ManageGoalsClient />
}
