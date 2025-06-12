import { DashboardStats } from '@/components/DashboardStats'
import { RecentActivity } from '@/components/RecentActivity'
import { QuickActions } from '@/components/QuickActions'

export default function DashboardPage({
  params,
}: {
  params: { tenant: string; locale: string }
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Tenant: {params.tenant} | Locale: {params.locale}
        </div>
      </div>
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  )
}