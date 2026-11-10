import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAppStore } from '../store/appStore'
import {
  uploadDocument as uploadDocumentAPI,
  getDocuments as getDocumentsAPI,
  deleteDocument as deleteDocumentAPI,
  type DocumentResponse,
} from '../services/api'

interface UseDocumentsReturn {
  uploading: boolean
  uploadProgress: number
  selectedDocIds: string[]
  documents: DocumentResponse[]
  uploadDocument: (file: File) => Promise<void>
  loadDocuments: () => Promise<void>
  removeDocument: (id: string) => Promise<void>
  toggleDocSelection: (id: string) => void
}

export const useDocuments = (): UseDocumentsReturn => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const {
    documents,
    selectedDocIds,
    addDocument,
    setDocuments,
    removeDocument: removeDocFromStore,
    toggleDocSelection,
  } = useAppStore()

  const uploadDocument = useCallback(
    async (file: File) => {
      if (file.type !== 'application/pdf') {
        toast.error('Only PDF files are supported')
        return
      }

      const maxSize = 50 * 1024 * 1024 // 50MB
      if (file.size > maxSize) {
        toast.error('File size must be less than 50MB')
        return
      }

      setUploading(true)
      setUploadProgress(0)

      try {
        const doc = await uploadDocumentAPI(file, (progress) => {
          setUploadProgress(progress)
        })
        addDocument(doc)
        toast.success(`"${file.name}" uploaded successfully!`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed'
        toast.error(message)
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [addDocument]
  )

  const loadDocuments = useCallback(async () => {
    try {
      const docs = await getDocumentsAPI()
      setDocuments(docs)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load documents'
      toast.error(message)
    }
  }, [setDocuments])

  const removeDocument = useCallback(
    async (id: string) => {
      try {
        await deleteDocumentAPI(id)
        removeDocFromStore(id)
        toast.success('Document deleted')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to delete document'
        toast.error(message)
      }
    },
    [removeDocFromStore]
  )

  return {
    uploading,
    uploadProgress,
    selectedDocIds,
    documents,
    uploadDocument,
    loadDocuments,
    removeDocument,
    toggleDocSelection,
  }
}
