import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Key, Eye, EyeOff, Globe, Bell, Info,
  Shield, Moon, Save, ChevronRight
} from 'lucide-react'
import { useAppStore } from '../store/appStore'

interface ToggleProps {
  checked: boolean
  onChange: (val: boolean) => void
}

function Toggle({ checked, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-teal-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

interface SectionProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
}

function Section({ title, icon: Icon, children }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <Icon className="w-4 h-4 text-teal-600" />
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  )
}

export default function Settings() {
  const { language, setLanguage } = useAppStore()

  // API Key
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '')
  const [showKey, setShowKey] = useState(false)

  // Notifications
  const [notifySuccess, setNotifySuccess] = useState(
    localStorage.getItem('notify_success') !== 'false'
  )
  const [notifyError, setNotifyError] = useState(
    localStorage.getItem('notify_error') !== 'false'
  )
  const [notifyTips, setNotifyTips] = useState(
    localStorage.getItem('notify_tips') === 'true'
  )

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey)
    toast.success('API key saved securely!')
  }

  const handleNotifyChange = (key: string, val: boolean) => {
    localStorage.setItem(key, String(val))
    if (key === 'notify_success') setNotifySuccess(val)
    else if (key === 'notify_error') setNotifyError(val)
    else if (key === 'notify_tips') setNotifyTips(val)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5 page-enter">
      <h1 className="text-xl font-bold text-slate-800">Settings</h1>

      {/* API Configuration */}
      <Section title="API Configuration" icon={Key}>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all font-mono"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Get your free API key at{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <button
            onClick={saveApiKey}
            disabled={!apiKey.trim()}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save API Key
          </button>
        </div>
      </Section>

      {/* Language Settings */}
      <Section title="Language Settings" icon={Globe}>
        <div>
          <p className="text-xs text-slate-500 mb-3">
            Choose your preferred language for AI responses.
          </p>
          <div className="flex gap-3">
            {(['en', 'hi'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => { setLanguage(lang); toast.success(`Language set to ${lang === 'hi' ? 'Hindi' : 'English'}`) }}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border-2 transition-all ${
                  language === lang
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-slate-200 text-slate-500 hover:border-teal-300'
                }`}
              >
                {lang === 'en' ? '🇺🇸 English' : '🇮🇳 हिंदी'}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Notification Preferences */}
      <Section title="Notification Preferences" icon={Bell}>
        <div className="space-y-4">
          {[
            { label: 'Success Notifications', desc: 'Show toast when actions complete', key: 'notify_success', val: notifySuccess, setter: (v: boolean) => handleNotifyChange('notify_success', v) },
            { label: 'Error Notifications', desc: 'Show toast on errors or failures', key: 'notify_error', val: notifyError, setter: (v: boolean) => handleNotifyChange('notify_error', v) },
            { label: 'Health Tips', desc: 'Show daily health tip notifications', key: 'notify_tips', val: notifyTips, setter: (v: boolean) => handleNotifyChange('notify_tips', v) },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <Toggle checked={item.val} onChange={item.setter} />
            </div>
          ))}
        </div>
      </Section>

      {/* Theme */}
      <Section title="Appearance" icon={Moon}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700">Theme</p>
            <p className="text-xs text-slate-500">Currently light mode only</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
            <span className="text-sm">☀️</span>
            <span className="text-xs font-semibold text-slate-600">Light</span>
          </div>
        </div>
      </Section>

      {/* Privacy & Security */}
      <Section title="Privacy & Security" icon={Shield}>
        <div className="space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            Your conversations and documents are processed locally and through your configured API.
            No data is stored on our servers.
          </p>
          <div className="space-y-2">
            {[
              'API keys stored locally in browser',
              'Conversations stay on your device',
              'Documents processed via your API key',
              'No data sent to third parties',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-[10px]">✓</span>
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title="About" icon={Info}>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Version</span>
            <span className="font-semibold text-slate-700">1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Built with</span>
            <span className="font-semibold text-slate-700">React + Gemini AI</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Model</span>
            <span className="font-semibold text-slate-700">Gemini Pro RAG</span>
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="text-xs text-slate-400 leading-relaxed">
              ⚕️ <strong>Medical Disclaimer:</strong> This AI assistant provides general health information 
              for educational purposes only. It is not a substitute for professional medical advice, 
              diagnosis, or treatment. Always seek advice from a qualified healthcare professional.
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}
