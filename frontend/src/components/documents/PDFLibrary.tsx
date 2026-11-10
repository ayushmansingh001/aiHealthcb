import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { FileText, Trash2, Search, CheckSquare, Square, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useDocuments } from '../../hooks/useDocuments'
import type { DocumentResponse } from '../../services/api'

const statusConfig = {
  ready: { label: 'Ready', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  processing: { label: 'Processing', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  error: { label: 'Error', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
}

function DocumentCard({
  doc,
  isSelected,
  onSelect,
  onDelete,
}: {
  doc: DocumentResponse
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const status = statusConfig[doc.status]
  const StatusIcon = status.icon

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className={`bg-white border rounded-2xl p-4 transition-all duration-200 card-hover ${
        isSelected ? 'border-teal-400 ring-2 ring-teal-100' : 'border-slate-200 hover:border-teal-300'
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <button
          onClick={() => onSelect(doc.id)}
          className="flex-shrink-0 mt-0.5 text-teal-600"
        >
          {isSelected ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5 text-slate-300" />}
        </button>
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <FileText className="w-5 h-5 text-teal-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-700 truncate" title={doc.filename}>
            {doc.filename}
          </p>
          <p className="text-xs text-slate-400">
            {doc.page_count} pages · {formatSize(doc.size_bytes)}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color} ${status.bg} ${status.border}`}>
          <StatusIcon className="w-3 h-3" />
          {status.label}
          {doc.status === 'processing' && (
            <RefreshCw className="w-3 h-3 animate-spin" />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {format(new Date(doc.created_at), 'MMM d, yyyy')}
        </p>

        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(doc.id)}
              className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg transition-colors"
            >
              Confirm
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default function PDFLibrary() {
  const { documents, loadDocuments, removeDocument, selectedDocIds, toggleDocSelection } = useDocuments()
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadDocuments()
  }, [])

  const filtered = documents.filter((d) =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all"
          />
        </div>
        <button
          onClick={loadDocuments}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-teal-600 hover:border-teal-300 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2.5 font-medium">
          {filtered.length} doc{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {selectedDocIds.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-xl px-4 py-2">
          <CheckSquare className="w-4 h-4" />
          <span className="font-medium">{selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected for chat context</span>
        </div>
      )}

      {/* Document Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-600 mb-1">
            {documents.length === 0 ? 'No documents yet' : 'No results found'}
          </p>
          <p className="text-sm text-slate-400">
            {documents.length === 0
              ? 'Upload PDF files above to get started'
              : `No documents match "${search}"`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                isSelected={selectedDocIds.includes(doc.id)}
                onSelect={toggleDocSelection}
                onDelete={removeDocument}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
