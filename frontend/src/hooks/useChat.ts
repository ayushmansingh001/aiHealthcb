import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/appStore'
import {
  sendMessage as sendMessageAPI,
  createSession as createSessionAPI,
  getSession as getSessionAPI,
  getSessions as getSessionsAPI,
  deleteSession as deleteSessionAPI,
  type ChatMessage,
} from '../services/api'

// Simple UUID fallback since crypto.randomUUID might not be available
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface UseChatReturn {
  sendMessage: (text: string) => Promise<void>
  createNewSession: () => Promise<void>
  loadSession: (id: string) => Promise<void>
  loadSessions: () => Promise<void>
  deleteSession: (id: string) => Promise<void>
  setLanguage: (lang: 'en' | 'hi') => void
}

export const useChat = (): UseChatReturn => {
  const navigate = useNavigate()
  const {
    currentSessionId,
    language,
    selectedDocIds,
    messages,
    addMessage,
    setMessages,
    setLoading,
    setSessions,
    addSession,
    removeSession,
    updateSession,
    setCurrentSession,
    incrementQuestionsAsked,
    setLanguage: setLangInStore,
  } = useAppStore()

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      // Add user message optimistically
      const userMessage: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        language,
      }
      addMessage(userMessage)
      setLoading(true)
      incrementQuestionsAsked()

      try {
        let sessionId = currentSessionId

        // Create session if none exists
        if (!sessionId) {
          const session = await createSessionAPI({
            title: text.slice(0, 50),
            language,
          })
          sessionId = session.id
          setCurrentSession(session.id)
          addSession(session)
          navigate(`/chat/${session.id}`, { replace: true })
        }

        const response = await sendMessageAPI({
          session_id: sessionId,
          message: text,
          language,
          doc_ids: selectedDocIds.length > 0 ? selectedDocIds : undefined,
        })

        const assistantMessage: ChatMessage = {
          id: response.message_id,
          role: 'assistant',
          content: response.content,
          timestamp: response.timestamp,
          sources: response.sources,
          language: response.language,
        }
        addMessage(assistantMessage)

        // Update session last message in store
        updateSession(sessionId, {
          last_message: response.content.slice(0, 100),
          message_count: (messages.length + 2),
          updated_at: new Date().toISOString(),
        })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send message'
        toast.error(message)

        // Add error message as assistant response
        const errorMsg: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an error: ${message}. Please try again.`,
          timestamp: new Date().toISOString(),
          language,
        }
        addMessage(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [currentSessionId, language, selectedDocIds, messages, addMessage, setLoading, incrementQuestionsAsked, setCurrentSession, addSession, navigate, updateSession]
  )

  const createNewSession = useCallback(async () => {
    setCurrentSession(null)
    setMessages([])
    navigate('/chat')
  }, [setCurrentSession, setMessages, navigate])

  const loadSession = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        const session = await getSessionAPI(id)
        setMessages(session.messages)
        setCurrentSession(session.id)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load session'
        toast.error(message)
        navigate('/chat')
      } finally {
        setLoading(false)
      }
    },
    [setMessages, setCurrentSession, setLoading, navigate]
  )

  const loadSessions = useCallback(async () => {
    try {
      const sessions = await getSessionsAPI()
      setSessions(sessions)
    } catch (error) {
      // Silently fail for sessions load
      console.error('Failed to load sessions:', error)
    }
  }, [setSessions])

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        await deleteSessionAPI(id)
        removeSession(id)
        toast.success('Chat session deleted')
        if (currentSessionId === id) {
          navigate('/chat')
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete session'
        toast.error(message)
      }
    },
    [currentSessionId, removeSession, navigate]
  )

  const setLanguage = useCallback(
    (lang: 'en' | 'hi') => {
      setLangInStore(lang)
    },
    [setLangInStore]
  )

  return { sendMessage, createNewSession, loadSession, loadSessions, deleteSession, setLanguage }
}
