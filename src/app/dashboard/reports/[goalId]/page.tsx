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

  // In a real app, you would fetch the goal name and current total score from the database
  // Here we use mock logic to simulate dynamic data based on the route parameter
  const mockGoals: Record<string, { name: string, score: number }> = {
    'financial': { name: 'Financial Freedom', score: 4 },
    'health': { name: 'Health & Fitness', score: -2 },
    'religious': { name: 'Spiritual Growth', score: 7 },
  }

  const goalData = mockGoals[goalId] || { name: 'Custom Goal', score: 1 }

  return (
    <GoalReportClient 
      goalId={goalId} 
      goalName={goalData.name} 
      currentScore={goalData.score} 
    />
  )
}
