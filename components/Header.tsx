'use client'

import { Bell, Search, User } from 'lucide-react'

interface HeaderProps {
  locale: string
}

export function Header({ locale }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Locale: {locale}</span>
          
          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400"></span>
          </button>
          
          <button className="flex items-center space-x-2 p-2 text-gray-400 hover:text-gray-600">
            <User className="h-5 w-5" />
            <span className="text-sm">Profile</span>
          </button>
        </div>
      </div>
    </header>
  )
}