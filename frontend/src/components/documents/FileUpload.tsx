import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useDocuments } from '../../hooks/useDocuments'

export default function FileUpload() {
  const { uploadDocument, uploading, uploadProgress } = useDocuments()
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return
      setSelectedFile(file)
      setUploadStatus('idle')

      try {
        await uploadDocument(file)
        setUploadStatus('success')
        setTimeout(() => {
          setSelectedFile(null)
          setUploadStatus('idle')
        }, 3000)
      } catch {
        setUploadStatus('error')
      }
    },
    [uploadDocument]
  )

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
    disabled: uploading,
  })

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragAccept
            ? 'border-teal-500 bg-teal-50 scale-[1.01]'
            : isDragReject
            ? 'border-red-400 bg-red-50'
            : dragActive
            ? 'border-teal-400 bg-teal-50/50'
            : 'border-slate-200 bg-slate-50 hover:border-teal-400 hover:bg-teal-50/30'
        } ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ scale: isDragAccept ? 1.15 : 1 }}
            transition={{ duration: 0.2 }}
            className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isDragAccept ? 'bg-teal-500' : 'bg-teal-100'
            }`}
          >
            <Upload className={`w-8 h-8 ${isDragAccept ? 'text-white' : 'text-teal-600'}`} />
          </motion.div>

          <div>
            <p className="text-base font-semibold text-slate-700 mb-1">
              {isDragAccept
                ? 'Drop to upload!'
                : isDragReject
                ? 'Only PDF files accepted'
                : 'Drag & drop your PDF here'}
            </p>
            <p className="text-sm text-slate-500">
              or{' '}
              <span className="text-teal-600 font-semibold hover:text-teal-700">
                click to browse
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              PDF only
            </span>
            <span>•</span>
            <span>Max 50 MB</span>
          </div>
        </div>
      </div>

      {/* Selected File / Upload Progress */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                uploadStatus === 'success' ? 'bg-green-100' :
                uploadStatus === 'error' ? 'bg-red-100' : 'bg-teal-100'
              }`}>
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : uploadStatus === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <FileText className="w-5 h-5 text-teal-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">{formatSize(selectedFile.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setUploadStatus('idle') }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {uploading && (
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Uploading...</span>
                  <span className="font-semibold text-teal-600">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-sky-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {uploadStatus === 'success' && (
              <p className="text-xs text-green-600 font-medium">✓ Upload complete! Document is being processed.</p>
            )}
            {uploadStatus === 'error' && (
              <p className="text-xs text-red-500 font-medium">✗ Upload failed. Please try again.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
