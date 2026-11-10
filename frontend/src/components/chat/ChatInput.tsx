import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Paperclip, Globe } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useVoice } from '../../hooks/useVoice'

interface ChatInputProps {
  onSendMessage: (text: string) => void
  disabled?: boolean
  onAttachClick?: () => void
}

export default function ChatInput({ onSendMessage, disabled, onAttachClick }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isLoading, language } = useAppStore()
  const { isRecording, isSupported, transcript, startRecording, stopRecording, clearTranscript } = useVoice()

  // Sync voice transcript to input
  useEffect(() => {
    if (transcript) {
      setValue(transcript)
    }
  }, [transcript])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [value])

  const handleSend = () => {
    const text = value.trim()
    if (!text || isLoading || disabled) return
    setValue('')
    clearTranscript()
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onSendMessage(text)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      clearTranscript()
      setValue('')
      startRecording()
    }
  }

  const isDisabled = isLoading || disabled
  const canSend = value.trim().length > 0 && !isDisabled

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-3">
      {/* Recording Indicator */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 mb-2 px-3"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 recording-pulse" />
            <span className="text-xs font-medium text-red-600 animate-pulse">
              Recording... speak now
            </span>
            <span className="text-xs text-slate-400">(auto-stops in 30s)</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-2">
        {/* Text Area */}
        <div className="flex-1 relative">
          <div className={`flex items-end gap-2 border rounded-2xl px-3 py-2.5 transition-all duration-200 bg-slate-50 ${
            isRecording
              ? 'border-red-300 ring-2 ring-red-100'
              : 'border-slate-200 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-100'
          }`}>
            {/* Language badge */}
            <div className="flex-shrink-0 mb-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded-full px-2 py-0.5">
                <Globe className="w-2.5 h-2.5" />
                {language === 'hi' ? 'HI' : 'EN'}
              </span>
            </div>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled}
              rows={1}
              placeholder={
                language === 'hi'
                  ? 'स्वास्थ्य संबंधी प्रश्न पूछें...'
                  : 'Ask a health question... (Shift+Enter for new line)'
              }
              className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-700 placeholder:text-slate-400 max-h-[120px] py-0.5 disabled:opacity-60"
            />

            {/* Attach Button */}
            <button
              type="button"
              onClick={onAttachClick}
              disabled={isDisabled}
              className="flex-shrink-0 p-1.5 rounded-xl text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-40 mb-0.5"
              title="Select documents"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice Button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isDisabled}
            className={`p-3 rounded-2xl transition-all duration-200 disabled:opacity-40 flex-shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white shadow-lg hover:bg-red-600 recording-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-teal-50 hover:text-teal-600'
            }`}
            title={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        )}

        {/* Send Button */}
        <motion.button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          whileTap={{ scale: 0.93 }}
          className={`p-3 rounded-2xl transition-all duration-200 flex-shrink-0 ${
            canSend
              ? 'bg-teal-600 text-white shadow-teal hover:bg-teal-700'
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          }`}
          title="Send message (Enter)"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </div>

      <p className="text-[10px] text-slate-400 mt-2 text-center">
        AI can make mistakes. Always verify with a healthcare professional.
      </p>
    </div>
  )
}
