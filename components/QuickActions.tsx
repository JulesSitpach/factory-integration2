'use client'

import { Plus, Upload, Download, Settings } from 'lucide-react'

const actions = [
  {
    name: 'Create Project',
    description: 'Start a new project',
    icon: Plus,
    color: 'bg-blue-500',
  },
  {
    name: 'Upload Files',
    description: 'Upload documents',
    icon: Upload,
    color: 'bg-green-500',
  },
  {
    name: 'Export Data',
    description: 'Download reports',
    icon: Download,
    color: 'bg-purple-500',
  },
  {
    name: 'Settings',
    description: 'Configure system',
    icon: Settings,
    color: 'bg-gray-500',
  },
]

export function QuickActions() {
  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.name}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className={`rounded-lg inline-flex p-3 ${action.color} text-white`}>
                    <Icon className="h-6 w-6" />
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {action.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}