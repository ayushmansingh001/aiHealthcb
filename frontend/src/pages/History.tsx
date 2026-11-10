import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  MessageCircle, Trash2, Search, Clock, ChevronRight,
  Calendar, Hash, Globe
} from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useChat } from '../hooks/useChat'

const formatSafeDate = (dateVal?: string | null, formatStr: string = 'MMM d, yyyy · h:mm a') => {
  if (!dateVal) return 'Recently'
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return 'Recently'
    return format(d, formatStr)
  } catch {
    return 'Recently'
  }
}

export default function History() {
  const navigate = useNavigate()
  const { sessions } = useAppStore()
  const { loadSessions, deleteSession } = useChat()
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const filtered = sessions.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.last_message || '').toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteSession(id)
    setDeletingId(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
          <Clock className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Chat History</h1>
          <p className="text-sm text-slate-500">{sessions.length} conversation{sessions.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations..."
          className="w-full pl-9 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all shadow-sm"
        />
      </div>

      {/* Sessions List */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="text-5xl mb-4">💬</div>
          <p className="text-lg font-bold text-slate-600 mb-1">
            {sessions.length === 0 ? 'No conversations yet' : 'No results found'}
          </p>
          <p className="text-sm text-slate-400 mb-5">
            {sessions.length === 0
              ? 'Start chatting with the AI health assistant'
              : `No conversations match "${search}"`}
          </p>
          {sessions.length === 0 && (
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Start First Chat
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.03 }}
                className="group bg-white border border-slate-100 rounded-2xl p-4 hover:border-teal-300 hover:shadow-md transition-all duration-200 card-hover shadow-card"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-sky-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-teal-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-slate-800 truncate">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(session.id)}
                          disabled={deletingId === session.id}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                          title="Delete session"
                        >
                          {deletingId === session.id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/chat/${session.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-all"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {session.last_message && (
                      <p className="text-xs text-slate-500 truncate mt-0.5 leading-relaxed">
                        {session.last_message}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {formatSafeDate(session.updated_at || session.created_at, 'MMM d, yyyy · h:mm a')}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Hash className="w-3 h-3" />
                        {session.message_count} messages
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        session.language === 'hi'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-sky-50 text-sky-600'
                      }`}>
                        <Globe className="w-2.5 h-2.5" />
                        {session.language === 'hi' ? 'हिंदी' : 'English'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
