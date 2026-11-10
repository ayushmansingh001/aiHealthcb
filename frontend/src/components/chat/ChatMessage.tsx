import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { format } from 'date-fns'
import type { ChatMessage } from '../../services/api'
import SourceReferencePanel from './SourceReference'

interface ChatMessageProps {
  message: ChatMessage
  index: number
}

export default function ChatMessageBubble({ message, index }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const time = format(new Date(message.timestamp), 'h:mm a')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        {isUser ? (
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-base">
            👤
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-sky-400 flex items-center justify-center text-base shadow-teal">
            🏥
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        {isUser ? (
          <div className="bg-teal-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-sm">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-card px-4 py-3">
            <div className="prose-health text-sm leading-relaxed text-slate-700 max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-base font-bold text-teal-800 mt-3 mb-1">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-sm font-bold text-teal-700 mt-3 mb-1">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-teal-700 mt-2 mb-1">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0 text-slate-700 leading-relaxed">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-700">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-700">{children}</ol>
                  ),
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-800">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-slate-600">{children}</em>
                  ),
                  code: ({ children }) => (
                    <code className="bg-teal-50 text-teal-700 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-teal-400 bg-teal-50 pl-3 py-1 my-2 rounded-r-lg text-teal-800 italic text-sm">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            {message.sources && message.sources.length > 0 && (
              <SourceReferencePanel sources={message.sources} />
            )}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-slate-400 px-1">{time}</span>
      </div>
    </motion.div>
  )
}

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-sky-400 flex items-center justify-center text-base flex-shrink-0 shadow-teal">
        🏥
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm shadow-card px-4 py-3">
        <div className="typing-indicator">
          <span />
          <span />
          <span />
        </div>
      </div>
    </motion.div>
  )
}
