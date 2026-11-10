import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAppStore } from '../../store/appStore'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/chat': 'AI Chat',
  '/library': 'PDF Library',
  '/history': 'Chat History',
  '/health-info': 'Health Information',
  '/profile': 'My Profile',
  '/settings': 'Settings',
}

export default function Layout() {
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen } = useAppStore()

  const pageTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/chat/') ? 'AI Chat' : 'AI Health Assistant')

  // Close sidebar on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false)
    }
  }, [location.pathname, setSidebarOpen])

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -280,
          width: sidebarOpen ? 260 : 0,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed md:relative z-30 h-full flex-shrink-0 overflow-hidden"
      >
        <Sidebar />
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={pageTitle} />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
