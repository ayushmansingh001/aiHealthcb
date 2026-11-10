import FileUpload from '../components/documents/FileUpload'
import PDFLibrary from '../components/documents/PDFLibrary'
import { BookOpen, Info } from 'lucide-react'

export default function PDFLibraryPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 page-enter">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">PDF Library</h1>
          </div>
          <p className="text-sm text-slate-500">Upload medical documents to enhance AI responses with your personal health data.</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3">
        <Info className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-sky-700 leading-relaxed">
          Upload your medical reports, health guidelines, or research papers. The AI will use these documents
          to provide more accurate and personalized responses. Supported format: <strong>PDF only</strong>, max 50MB.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-card">
        <h2 className="text-sm font-bold text-slate-700 mb-4">Upload New Document</h2>
        <FileUpload />
      </div>

      {/* Document Library */}
      <div>
        <h2 className="text-sm font-bold text-slate-700 mb-4">Your Documents</h2>
        <PDFLibrary />
      </div>
    </div>
  )
}
