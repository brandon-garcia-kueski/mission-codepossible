'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import AuthButton from './AuthButton'

export default function Navigation() {
  const { data: session } = useSession()

  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex flex-row items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
              <img src="https://cdn.prod.website-files.com/642533e2943fc871d1dc670d/642d4d9f4b2a5abd56c16739_Logo.svg" alt="" />
              <span>Meeting Scheduler</span>
            </Link>

            {session && (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/schedule"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Programar Reunión
                </Link>
                <Link
                  href="/preferences"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Preferencias
                </Link>
                <Link
                  href="/test-blocked-slots"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium text-xs bg-blue-100 dark:bg-blue-900"
                >
                  Test
                </Link>
              </div>
            )}
          </div>

          <AuthButton />
        </div>
      </div>
    </nav>
  )
}
