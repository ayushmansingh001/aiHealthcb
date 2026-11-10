import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, FileText, ExternalLink } from 'lucide-react'
import type { SourceReference } from '../../services/api'

interface SourceReferenceProps {
  sources: SourceReference[]
}

export default function SourceReferencePanel({ sources }: SourceReferenceProps) {
  const [expanded, setExpanded] = useState(false)

  if (!sources || sources.length === 0) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors group"
      >
        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-full group-hover:bg-teal-100 transition-colors">
          <FileText className="w-3 h-3" />
          <span>{sources.length} Source{sources.length > 1 ? 's' : ''}</span>
          {expanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {sources.map((source, index) => (
                <div
                  key={index}
                  className="bg-slate-50 border-l-4 border-teal-400 rounded-r-xl p-3"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-teal-700">{index + 1}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {source.document_name}
                        </p>
                        <p className="text-xs text-teal-600">
                          Page {source.page_number}
                          {source.relevance_score !== undefined && (
                            <span className="ml-2 text-slate-400">
                              · {Math.round(source.relevance_score * 100)}% relevant
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button className="flex-shrink-0 p-1 rounded-lg hover:bg-teal-100 transition-colors text-teal-600 hover:text-teal-700">
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  {source.excerpt && (
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 italic pl-7">
                      "{source.excerpt}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
