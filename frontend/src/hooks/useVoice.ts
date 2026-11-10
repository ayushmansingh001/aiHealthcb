import { useState, useCallback, useRef } from 'react'

interface UseVoiceReturn {
  isRecording: boolean
  isSupported: boolean
  transcript: string
  startRecording: () => void
  stopRecording: () => void
  clearTranscript: () => void
}

export const useVoice = (): UseVoiceReturn => {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<any>(null)
  const autoStopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const SpeechRecognitionAPI =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  const isSupported = !!SpeechRecognitionAPI

  const startRecording = useCallback(() => {
    if (!isSupported || isRecording) return

    try {
      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsRecording(true)
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript
          } else {
            interimTranscript += result[0].transcript
          }
        }

        setTranscript((prev) => prev + finalTranscript || interimTranscript)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }

      recognition.onend = () => {
        setIsRecording(false)
        if (autoStopTimerRef.current) {
          clearTimeout(autoStopTimerRef.current)
        }
      }

      recognitionRef.current = recognition
      recognition.start()

      // Auto-stop after 30 seconds
      autoStopTimerRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }
      }, 30000)
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      setIsRecording(false)
    }
  }, [isSupported, isRecording, SpeechRecognitionAPI])

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (autoStopTimerRef.current) {
      clearTimeout(autoStopTimerRef.current)
    }
    setIsRecording(false)
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
  }, [])

  return {
    isRecording,
    isSupported,
    transcript,
    startRecording,
    stopRecording,
    clearTranscript,
  }
}
