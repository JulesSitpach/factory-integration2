'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  BarChart3, 
  Settings, 
  Users, 
  FolderOpen, 
  FileText, 
  CreditCard 
} from 'lucide-react'

interface SidebarProps {
  locale: string
}

export function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname()
  
  const navigation = [
    { name: 'Dashboard', href: `/dashboard/${locale}`, icon: Home },
    { name: 'Analytics', href: `/dashboard/${locale}/analytics`, icon: BarChart3 },
    { name: 'Users', href: `/dashboard/${locale}/users`, icon: Users },
    { name: 'Projects', href: `/dashboard/${locale}/projects`, icon: FolderOpen },
    { name: 'Reports', href: `/dashboard/${locale}/reports`, icon: FileText },
    { name: 'Billing', href: `/dashboard/${locale}/billing`, icon: CreditCard },
    { name: 'Settings', href: `/dashboard/${locale}/settings`, icon: Settings },
  ]

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 bg-blue-600">
        <span className="text-white text-xl font-bold">Dashboard</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}