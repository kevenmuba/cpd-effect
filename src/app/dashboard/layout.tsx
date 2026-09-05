import Sidebar from '@/components/dashboard/Sidebar'
import { DashboardProvider } from '@/context/DashboardContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </DashboardProvider>
  )
}
