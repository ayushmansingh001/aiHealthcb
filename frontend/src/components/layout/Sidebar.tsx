import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  MessageCircle,
  BookOpen,
  Clock,
  Heart,
  User,
  Settings,
  ChevronRight,
  Globe,
  Activity,
} from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard', exact: true },
  { to: '/chat', icon: MessageCircle, label: 'AI Chat' },
  { to: '/library', icon: BookOpen, label: 'PDF Library' },
  { to: '/history', icon: Clock, label: 'Chat History' },
  { to: '/health-info', icon: Heart, label: 'Health Info' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { language, setLanguage, sessions, documents } = useAppStore()
  const navigate = useNavigate()

  const userInitial = (localStorage.getItem('user_name') || 'User')[0].toUpperCase()
  const userName = localStorage.getItem('user_name') || 'Health User'

  return (
    <aside className="w-[260px] h-full bg-white border-r border-slate-100 flex flex-col shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group w-full"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-sky-400 flex items-center justify-center shadow-teal text-lg flex-shrink-0">
            🏥
          </div>
          <div className="text-left">
            <h1 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-teal-600 transition-colors">
              AI Health
            </h1>
            <p className="text-xs text-teal-600 font-semibold tracking-wide">ASSISTANT</p>
          </div>
        </button>
      </div>

      {/* Quick stats */}
      <div className="mx-4 my-3 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-sky-50 border border-teal-100">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Activity className="w-3.5 h-3.5 text-teal-600" />
            <span className="font-medium">{sessions.length} sessions</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-slate-600">
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span className="font-medium">{documents.length} docs</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-teal-600 text-white shadow-teal'
                  : 'text-slate-600 hover:bg-teal-50 hover:text-teal-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-4.5 h-4.5 flex-shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-600'
                  }`}
                  size={18}
                />
                <span className="flex-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 rounded-full bg-white/80"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Language Toggle */}
      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Language</span>
        </div>
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              language === 'en'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🇺🇸 EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              language === 'hi'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            🇮🇳 HI
          </button>
        </div>
      </div>

      {/* User Avatar */}
      <div className="px-4 py-4 border-t border-slate-100">
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {userInitial}
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-slate-700 truncate">{userName}</p>
            <p className="text-xs text-teal-600">View profile</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
        </button>
      </div>
    </aside>
  )
}
