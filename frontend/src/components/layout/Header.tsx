import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Search, Bell, X, AlertCircle, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '../../store/appStore'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const [showDisclaimer, setShowDisclaimer] = useState(
    localStorage.getItem('disclaimer_dismissed') !== 'true'
  )
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const { toggleSidebar } = useAppStore()
  const navigate = useNavigate()

  const dismissDisclaimer = () => {
    localStorage.setItem('disclaimer_dismissed', 'true')
    setShowDisclaimer(false)
  }

  const userName = localStorage.getItem('user_name') || 'Health User'
  const userInitial = userName[0].toUpperCase()

  return (
    <header className="bg-white border-b border-slate-100 flex-shrink-0 z-10">
      {/* Safety disclaimer banner */}
      <AnimatePresence>
        {showDisclaimer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-amber-50 border-b border-amber-200 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 max-w-full">
              <div className="flex items-center gap-2 text-amber-800 min-w-0">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                <p className="text-xs font-medium truncate">
                  ⚕️ This AI assistant is not a substitute for professional medical advice. Always consult a qualified healthcare provider.
                </p>
              </div>
              <button
                onClick={dismissDisclaimer}
                className="ml-3 flex-shrink-0 p-0.5 rounded hover:bg-amber-200 transition-colors text-amber-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main header bar */}
      <div className="flex items-center gap-3 px-4 h-14">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 hover:text-teal-600 flex-shrink-0"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-base font-bold text-slate-800 hidden sm:block">{title}</h2>

        {/* Search bar */}
        <div className="flex-1 max-w-md mx-auto hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search health topics..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Notification Bell */}
          <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors text-slate-600 hover:text-teal-600">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-teal-500 rounded-full border-2 border-white" />
          </button>

          {/* User avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm">
                {userInitial}
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-20"
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-700">{userName}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {localStorage.getItem('user_email') || 'health@assistant.ai'}
                      </p>
                    </div>
                    <button
                      onClick={() => { navigate('/profile'); setShowUserMenu(false) }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => { navigate('/settings'); setShowUserMenu(false) }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}
