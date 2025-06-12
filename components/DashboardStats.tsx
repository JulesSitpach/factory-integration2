import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'

const stats = [
  {
    name: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active Users',
    value: '2,350',
    change: '+180.1%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Conversion Rate',
    value: '12.5%',
    change: '+19%',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    name: 'Active Now',
    value: '573',
    change: '+201',
    changeType: 'positive',
    icon: Activity,
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-blue-500 rounded-md p-3">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                {stat.change}
              </p>
            </dd>
          </div>
        )
      })}
    </div>
  )
}