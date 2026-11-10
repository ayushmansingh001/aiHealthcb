import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ChatMessage, SessionResponse, DocumentResponse } from '../services/api'

export interface AppStore {
  // ── Chat state ─────────────────────────────────────────────
  currentSessionId: string | null
  messages: ChatMessage[]
  sessions: SessionResponse[]
  isLoading: boolean
  language: 'en' | 'hi'
  selectedDocIds: string[]

  // ── Document state ─────────────────────────────────────────
  documents: DocumentResponse[]

  // ── UI state ───────────────────────────────────────────────
  sidebarOpen: boolean
  totalQuestionsAsked: number

  // ── Actions ────────────────────────────────────────────────
  setLanguage: (lang: 'en' | 'hi') => void
  setCurrentSession: (id: string | null) => void
  addMessage: (msg: ChatMessage) => void
  setMessages: (msgs: ChatMessage[]) => void
  setLoading: (loading: boolean) => void
  setSessions: (sessions: SessionResponse[]) => void
  addSession: (session: SessionResponse) => void
  removeSession: (id: string) => void
  updateSession: (id: string, updates: Partial<SessionResponse>) => void
  setDocuments: (docs: DocumentResponse[]) => void
  addDocument: (doc: DocumentResponse) => void
  removeDocument: (id: string) => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setSelectedDocs: (ids: string[]) => void
  toggleDocSelection: (id: string) => void
  clearMessages: () => void
  incrementQuestionsAsked: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ─────────────────────────────────────
      currentSessionId: null,
      messages: [],
      sessions: [],
      isLoading: false,
      language: 'en',
      selectedDocIds: [],
      documents: [],
      sidebarOpen: true,
      totalQuestionsAsked: 0,

      // ── Actions ───────────────────────────────────────────
      setLanguage: (lang) => set({ language: lang }),

      setCurrentSession: (id) => set({ currentSessionId: id }),

      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),

      setMessages: (msgs) => set({ messages: msgs }),

      setLoading: (loading) => set({ isLoading: loading }),

      setSessions: (sessions) => set({ sessions }),

      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),

      removeSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
          currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
          messages: state.currentSessionId === id ? [] : state.messages,
        })),

      updateSession: (id, updates) =>
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),

      setDocuments: (docs) => set({ documents: docs }),

      addDocument: (doc) =>
        set((state) => ({ documents: [doc, ...state.documents] })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          selectedDocIds: state.selectedDocIds.filter((did) => did !== id),
        })),

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      setSelectedDocs: (ids) => set({ selectedDocIds: ids }),

      toggleDocSelection: (id) =>
        set((state) => ({
          selectedDocIds: state.selectedDocIds.includes(id)
            ? state.selectedDocIds.filter((did) => did !== id)
            : [...state.selectedDocIds, id],
        })),

      clearMessages: () => set({ messages: [], currentSessionId: null }),

      incrementQuestionsAsked: () =>
        set((state) => ({ totalQuestionsAsked: state.totalQuestionsAsked + 1 })),
    }),
    {
      name: 'ai-health-store',
      partialize: (state) => ({
        language: state.language,
        sessions: state.sessions,
        documents: state.documents,
        totalQuestionsAsked: state.totalQuestionsAsked,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
