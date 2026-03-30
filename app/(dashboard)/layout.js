'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function DashboardLayout({ children }) {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const user = session?.user
  const plan = user?.plan || 'free'
  const email = user?.email || ''

  const getPlanBadgeColor = (plan) => {
    switch (plan) {
      case 'pro':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      case 'teams':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Sticky Navbar with Frosted Glass */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Main Nav */}
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">
                  Verity<span className="text-indigo-400">Flow</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Beta
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-6 text-sm">
                <Link 
                  href="/dashboard/usage" 
                  className={`transition-colors ${
                    pathname === '/dashboard/usage' 
                      ? 'text-white font-medium' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Usage
                </Link>
                
                {plan === 'free' ? (
                  <Link 
                    href="/dashboard/billing"
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                  >
                    <span>↑</span>
                    <span>Upgrade</span>
                  </Link>
                ) : (
                  <Link 
                    href="/dashboard/billing"
                    className={`transition-colors ${
                      pathname === '/dashboard/billing' 
                        ? 'text-white font-medium' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Billing
                  </Link>
                )}
              </div>
            </div>

            {/* Right: User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* Email - Hidden on mobile */}
              <div className="hidden md:block text-sm text-gray-400">
                {email}
              </div>

              {/* Plan Badge */}
              <div 
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlanBadgeColor(plan)}`}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </div>

              {/* Sign Out */}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
