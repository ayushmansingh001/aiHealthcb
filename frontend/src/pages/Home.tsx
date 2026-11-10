import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  MessageCircle, BookOpen, Clock, TrendingUp,
  ChevronRight, AlertTriangle, Lightbulb, Plus,
  Activity, Heart
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useChat } from '../hooks/useChat'

const healthTips = [
  { tip: 'Drink at least 8 glasses of water daily to stay hydrated and support kidney function.', icon: '💧' },
  { tip: 'Aim for 7-9 hours of sleep each night. Quality sleep is essential for immune function.', icon: '😴' },
  { tip: 'Regular physical activity (150 min/week) reduces risk of chronic diseases by up to 50%.', icon: '🏃' },
  { tip: 'Eating a rainbow of vegetables provides diverse antioxidants and nutrients.', icon: '🥗' },
  { tip: 'Practice mindfulness for 10 minutes daily to reduce stress hormones.', icon: '🧘' },
  { tip: 'Wash hands regularly — one of the most effective ways to prevent infection.', icon: '🤲' },
  { tip: 'Limit processed foods and added sugars to support metabolic health.', icon: '🥦' },
  { tip: 'Schedule regular health check-ups even when you feel well.', icon: '🩺' },
]

const formatSafeDate = (dateVal?: string | null, formatStr: string = 'MMM d') => {
  if (!dateVal) return 'Recently'
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return 'Recently'
    return format(d, formatStr)
  } catch {
    return 'Recently'
  }
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function StatCard({ value, label, icon: Icon, color }: {
  value: number | string
  label: string
  icon: React.ElementType
  color: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl p-5 border border-slate-100 shadow-card card-hover`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-green-400" />
      </div>
      <p className="text-2xl font-bold text-slate-800 mb-0.5">{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
    </motion.div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const { sessions, documents, totalQuestionsAsked } = useAppStore()
  const { createNewSession, loadSessions } = useChat()
  const userName = localStorage.getItem('user_name') || 'there'

  useEffect(() => {
    loadSessions()
  }, [])

  const todayTip = healthTips[new Date().getDate() % healthTips.length]
  const recentSessions = sessions.slice(0, 3)

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 page-enter">
      {/* Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-500 to-sky-500 rounded-3xl p-6 text-white shadow-teal"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <div className="w-full h-full rounded-full border-[40px] border-white -translate-x-1/3 -translate-y-1/3" />
        </div>
        <div className="absolute bottom-0 left-1/2 w-40 h-40 opacity-5">
          <div className="w-full h-full rounded-full border-[30px] border-white" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <p className="text-teal-100 text-sm font-medium mb-1">
              {getGreeting()}, {userName} 👋
            </p>
            <h1 className="text-2xl font-bold mb-3">
              Your AI Health Assistant
            </h1>
            <p className="text-teal-100 text-sm max-w-md leading-relaxed">
              Ask health questions, analyze your medical documents, and get AI-powered insights. 
              Remember to always consult a healthcare professional for medical decisions.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={createNewSession}
                className="flex items-center gap-2 bg-white text-teal-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-50 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Start Chat
              </button>
              <button
                onClick={() => navigate('/library')}
                className="flex items-center gap-2 bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30"
              >
                <BookOpen className="w-4 h-4" />
                Upload PDF
              </button>
            </div>
          </div>
          <div className="text-6xl hidden sm:block opacity-80 select-none">🏥</div>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          value={documents.length}
          label="Documents Uploaded"
          icon={BookOpen}
          color="bg-teal-500"
        />
        <StatCard
          value={sessions.length}
          label="Chat Sessions"
          icon={MessageCircle}
          color="bg-sky-500"
        />
        <StatCard
          value={totalQuestionsAsked}
          label="Questions Asked"
          icon={Activity}
          color="bg-violet-500"
        />
        <StatCard
          value={sessions.filter(s => {
            const d = new Date(s.updated_at)
            const today = new Date()
            return d.toDateString() === today.toDateString()
          }).length}
          label="Active Today"
          icon={Heart}
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800">Recent Conversations</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {recentSessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-card">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-slate-600 mb-1">No conversations yet</p>
              <p className="text-xs text-slate-400 mb-4">Start your first health conversation</p>
              <button
                onClick={createNewSession}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session, index) => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/chat/${session.id}`)}
                  className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left hover:border-teal-300 hover:shadow-md transition-all duration-200 card-hover group shadow-card"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                      <MessageCircle className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-700 truncate">{session.title}</p>
                        <p className="text-xs text-slate-400 flex-shrink-0">
                          {formatSafeDate(session.updated_at || session.created_at, 'MMM d')}
                        </p>
                      </div>
                      {session.last_message && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{session.last_message}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                          {session.message_count} messages
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          session.language === 'hi'
                            ? 'bg-orange-50 text-orange-600'
                            : 'bg-sky-50 text-sky-600'
                        }`}>
                          {session.language === 'hi' ? '🇮🇳 हिं' : '🇺🇸 EN'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Tip + Safety */}
        <div className="space-y-4">
          {/* Health Tip */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-card">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">Health Tip of the Day</p>
            </div>
            <div className="text-3xl mb-3">{todayTip.icon}</div>
            <p className="text-sm text-slate-600 leading-relaxed">{todayTip.tip}</p>
          </div>

          {/* Safety Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-800 mb-1">Medical Disclaimer</p>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This AI assistant provides general health information only. It is NOT a substitute for 
                  professional medical advice, diagnosis, or treatment. Always consult a qualified 
                  healthcare provider for medical decisions.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'New Chat', icon: MessageCircle, to: '/chat', color: 'text-teal-600', bg: 'bg-teal-50' },
                { label: 'Upload PDF', icon: BookOpen, to: '/library', color: 'text-sky-600', bg: 'bg-sky-50' },
                { label: 'View History', icon: Clock, to: '/history', color: 'text-violet-600', bg: 'bg-violet-50' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => action.label === 'New Chat' ? createNewSession() : navigate(action.to)}
                  className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.bg} flex items-center justify-center`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800">{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-auto group-hover:text-teal-500 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
