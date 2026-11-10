import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { User, Mail, Globe, BarChart2, Trash2, Save, Edit2 } from 'lucide-react'
import { useAppStore } from '../store/appStore'
import { useChat } from '../hooks/useChat'

export default function Profile() {
  const { sessions, documents, totalQuestionsAsked, language, setLanguage, clearMessages, setSessions, setDocuments } = useAppStore()
  const [name, setName] = useState(localStorage.getItem('user_name') || '')
  const [email, setEmail] = useState(localStorage.getItem('user_email') || '')
  const [editing, setEditing] = useState(false)

  const userInitial = (name || 'U')[0].toUpperCase()

  const handleSave = () => {
    localStorage.setItem('user_name', name)
    localStorage.setItem('user_email', email)
    setEditing(false)
    toast.success('Profile saved!')
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      clearMessages()
      setSessions([])
      toast.success('Chat history cleared')
    }
  }

  const handleClearDocuments = () => {
    if (confirm('Are you sure you want to remove all documents from your library?')) {
      setDocuments([])
      toast.success('Document library cleared')
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6 page-enter">
      <h1 className="text-xl font-bold text-slate-800">My Profile</h1>

      {/* Avatar Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-slate-100 shadow-card p-6"
      >
        <div className="flex items-center gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-sky-400 flex items-center justify-center text-3xl font-bold text-white shadow-teal">
            {userInitial}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{name || 'Health User'}</h2>
            <p className="text-sm text-slate-500">{email || 'No email set'}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-1 mt-1">
              🏥 AI Health User
            </span>
          </div>
        </div>

        {/* Edit Form */}
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </motion.div>

      {/* Language Preference */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-700">Language Preference</h3>
        </div>
        <div className="flex gap-3">
          {(['en', 'hi'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => { setLanguage(lang); toast.success(`Language set to ${lang === 'hi' ? 'Hindi' : 'English'}`) }}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                language === lang
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-slate-200 text-slate-500 hover:border-teal-300'
              }`}
            >
              {lang === 'en' ? '🇺🇸 English' : '🇮🇳 हिंदी'}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-teal-600" />
          <h3 className="text-sm font-bold text-slate-700">My Statistics</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Chat Sessions', value: sessions.length, color: 'text-teal-600', bg: 'bg-teal-50' },
            { label: 'Questions Asked', value: totalQuestionsAsked, color: 'text-sky-600', bg: 'bg-sky-50' },
            { label: 'Documents', value: documents.length, color: 'text-violet-600', bg: 'bg-violet-50' },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="w-4 h-4 text-red-500" />
          <h3 className="text-sm font-bold text-slate-700">Data Management</h3>
        </div>
        <div className="space-y-2">
          <button
            onClick={handleClearHistory}
            className="flex items-center justify-between w-full p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Clear Chat History</span>
            </div>
            <span className="text-xs text-red-400">{sessions.length} sessions</span>
          </button>
          <button
            onClick={handleClearDocuments}
            className="flex items-center justify-between w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Clear Document Library</span>
            </div>
            <span className="text-xs text-slate-400">{documents.length} documents</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
