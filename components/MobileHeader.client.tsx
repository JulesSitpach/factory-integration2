'use client'

import { useState } from 'react'
import { Menu, X, Bell, User } from 'lucide-react'

interface MobileHeaderProps {
  locale: string
}

export default function MobileHeader({ locale }: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="lg:hidden bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600">
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      {isMenuOpen && (
        <div className="border-t border-gray-200 bg-white">
          <div className="px-4 py-2">
            <p className="text-sm text-gray-500">Locale: {locale}</p>
          </div>
        </div>
      )}
    </header>
  )
}