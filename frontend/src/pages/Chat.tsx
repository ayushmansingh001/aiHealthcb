import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, ChevronLeft, BookOpen, FileText, CheckSquare, Square, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ChatInterface from '../components/chat/ChatInterface'
import ChatInput from '../components/chat/ChatInput'
import { useChat } from '../hooks/useChat'
import { useAppStore } from '../store/appStore'
import { useDocuments } from '../hooks/useDocuments'

export default function Chat() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { sendMessage, createNewSession, loadSession } = useChat()
  const { currentSessionId, sessions, isLoading } = useAppStore()
  const { documents, loadDocuments, selectedDocIds, toggleDocSelection } = useDocuments()
  const [showDocPanel, setShowDocPanel] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    if (sessionId && sessionId !== currentSessionId) {
      loadSession(sessionId)
    }
  }, [sessionId])

  const currentSession = sessions.find((s) => s.id === currentSessionId)

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-sky-400 flex items-center justify-center text-sm flex-shrink-0">
              🏥
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {currentSession?.title || 'New Conversation'}
              </p>
              {selectedDocIds.length > 0 && (
                <p className="text-xs text-teal-600 font-medium">
                  Using {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Doc Panel toggle */}
            <button
              onClick={() => setShowDocPanel(!showDocPanel)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                showDocPanel
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Docs</span>
              {selectedDocIds.length > 0 && (
                <span className="bg-white/30 text-inherit rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
                  {selectedDocIds.length}
                </span>
              )}
            </button>

            {/* New Chat */}
            <button
              onClick={createNewSession}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface
            onSendMessage={sendMessage}
            sessionTitle={undefined}
          />
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isLoading}
          onAttachClick={() => setShowDocPanel(true)}
        />
      </div>

      {/* Document Selector Panel */}
      <AnimatePresence>
        {showDocPanel && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="flex-shrink-0 border-l border-slate-100 bg-white overflow-hidden"
          >
            <div className="w-[280px] h-full flex flex-col p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Document Context</h3>
                  <p className="text-xs text-slate-500">Select docs to include</p>
                </div>
                <button
                  onClick={() => setShowDocPanel(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">No documents</p>
                    <p className="text-xs text-slate-400">Upload PDFs in the library</p>
                  </div>
                  <button
                    onClick={() => navigate('/library')}
                    className="text-xs text-teal-600 font-semibold hover:text-teal-700"
                  >
                    Go to Library →
                  </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-2">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => toggleDocSelection(doc.id)}
                      className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${
                        selectedDocIds.includes(doc.id)
                          ? 'bg-teal-50 border border-teal-300'
                          : 'bg-slate-50 border border-slate-200 hover:border-teal-200 hover:bg-teal-50/50'
                      }`}
                    >
                      {selectedDocIds.includes(doc.id) ? (
                        <CheckSquare className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">{doc.filename}</p>
                        <p className="text-[10px] text-slate-400">{doc.page_count} pages</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedDocIds.length > 0 && (
                <div className="pt-3 border-t border-slate-100 mt-3">
                  <p className="text-xs text-teal-700 font-semibold text-center">
                    ✓ {selectedDocIds.length} doc{selectedDocIds.length > 1 ? 's' : ''} in context
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
