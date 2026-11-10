import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
})

// ─── Request interceptor: attach API key ────────────────────────
api.interceptors.request.use((config) => {
  const apiKey = localStorage.getItem('gemini_api_key')
  if (apiKey) config.headers['X-API-Key'] = apiKey
  return config
})

// ─── Response interceptor ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An error occurred'
    return Promise.reject(new Error(message))
  }
)

// ─── TypeScript Interfaces ───────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  sources?: SourceReference[]
  language?: 'en' | 'hi'
}

export interface SourceReference {
  document_name: string
  page_number: number
  excerpt: string
  relevance_score?: number
}

export interface ChatRequest {
  session_id: string | null
  message: string
  language: 'en' | 'hi'
  doc_ids?: string[]
}

export interface ChatResponse {
  session_id: string
  message_id: string
  content: string
  sources: SourceReference[]
  language: 'en' | 'hi'
  timestamp: string
}

export interface SessionCreate {
  title?: string
  language?: 'en' | 'hi'
}

export interface SessionResponse {
  id: string
  title: string
  language: 'en' | 'hi'
  created_at: string
  updated_at: string
  message_count: number
  last_message?: string
}

export interface SessionDetail extends SessionResponse {
  messages: ChatMessage[]
}

export interface DocumentUploadResponse {
  id: string
  filename: string
  page_count: number
  status: 'processing' | 'ready' | 'error'
  created_at: string
  size_bytes: number
}

export interface DocumentResponse {
  id: string
  filename: string
  page_count: number
  status: 'processing' | 'ready' | 'error'
  created_at: string
  size_bytes: number
  description?: string
}

export interface HealthTopic {
  id: string
  title: string
  description: string
  icon: string
  category: string
  questions: string[]
}

// ─── Chat APIs ───────────────────────────────────────────────────

export const sendMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  const { data } = await api.post<ChatResponse>('/chat/message', request)
  return data
}

export const createSession = async (data: SessionCreate): Promise<SessionResponse> => {
  const { data: res } = await api.post<SessionResponse>('/chat/sessions', data)
  return res
}

export const getSessions = async (): Promise<SessionResponse[]> => {
  const { data } = await api.get<SessionResponse[]>('/chat/sessions')
  return data
}

export const getSession = async (sessionId: string): Promise<SessionDetail> => {
  const { data } = await api.get<SessionDetail>(`/chat/sessions/${sessionId}`)
  return data
}

export const deleteSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/chat/sessions/${sessionId}`)
}

// ─── Document APIs ───────────────────────────────────────────────

export const uploadDocument = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<DocumentUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await api.post<DocumentUploadResponse>('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (event.total && onProgress) {
        onProgress(Math.round((event.loaded * 100) / event.total))
      }
    },
  })
  return data
}

export const getDocuments = async (): Promise<DocumentResponse[]> => {
  const { data } = await api.get<DocumentResponse[]>('/documents')
  return data
}

export const deleteDocument = async (docId: string): Promise<void> => {
  await api.delete(`/documents/${docId}`)
}

// ─── Health Info APIs ────────────────────────────────────────────

export const getSuggestedQuestions = async (lang: string): Promise<string[]> => {
  const { data } = await api.get<string[]>(`/health/suggested-questions?lang=${lang}`)
  return data
}

export const getHealthTopics = async (): Promise<HealthTopic[]> => {
  const { data } = await api.get<HealthTopic[]>('/health/topics')
  return data
}

export const getEmergencySymptoms = async (): Promise<string[]> => {
  const { data } = await api.get<string[]>('/health/emergency-symptoms')
  return data
}

export default api
