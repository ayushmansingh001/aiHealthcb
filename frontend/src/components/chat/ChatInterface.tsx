import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import ChatMessageBubble, { TypingIndicator } from './ChatMessage'
import SuggestedQuestions from './SuggestedQuestions'

interface ChatInterfaceProps {
  onSendMessage: (text: string) => void
  sessionTitle?: string
}

export default function ChatInterface({ onSendMessage, sessionTitle }: ChatInterfaceProps) {
  const { messages, isLoading, language } = useAppStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Session Title Bar */}
      {sessionTitle && (
        <div className="px-4 py-2 border-b border-slate-100 bg-white flex-shrink-0">
          <p className="text-sm font-semibold text-slate-600 truncate">{sessionTitle}</p>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {isEmpty ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-500 to-sky-400 flex items-center justify-center text-4xl mb-5 shadow-teal">
              🏥
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {language === 'hi' ? 'नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं' : 'Hello! I\'m your AI Health Assistant'}
            </h2>
            <p className="text-slate-500 text-sm mb-2 max-w-md">
              {language === 'hi'
                ? 'स्वास्थ्य संबंधी सवाल पूछें, अपने PDF दस्तावेज़ से जानकारी प्राप्त करें।'
                : 'Ask me health questions, get insights from your uploaded documents, or explore health topics below.'}
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 mb-8 max-w-sm">
              ⚕️ Not a substitute for professional medical advice
            </p>

            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                {language === 'hi' ? 'सुझाए गए प्रश्न' : 'Suggested Questions'}
              </p>
              <SuggestedQuestions onSelect={onSendMessage} language={language} />
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessageBubble key={message.id} message={message} index={index} />
            ))}
            <AnimatePresence>
              {isLoading && <TypingIndicator />}
            </AnimatePresence>
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
