import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Heart, Pill, Apple, Dumbbell, Brain, ThermometerSun,
  Baby, Wind, Stethoscope, Microscope
} from 'lucide-react'

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
  language: 'en' | 'hi'
}

const suggestedEn = [
  { icon: Heart, label: 'Heart Health', color: 'red', question: 'What are the early warning signs of heart disease?' },
  { icon: Pill, label: 'Medications', color: 'purple', question: 'What are common side effects of blood pressure medications?' },
  { icon: Apple, label: 'Nutrition', color: 'green', question: 'What foods are best for a healthy immune system?' },
  { icon: Dumbbell, label: 'Fitness', color: 'orange', question: 'How much exercise do I need per week for good health?' },
  { icon: Brain, label: 'Mental Health', color: 'indigo', question: 'What are effective ways to manage stress and anxiety?' },
  { icon: ThermometerSun, label: 'Symptoms', color: 'yellow', question: 'When should I be concerned about a persistent fever?' },
  { icon: Baby, label: 'Children\'s Health', color: 'pink', question: 'What are the recommended vaccines for children?' },
  { icon: Wind, label: 'Respiratory', color: 'sky', question: 'How can I improve my lung capacity and breathing?' },
]

const suggestedHi = [
  { icon: Heart, label: 'हृदय स्वास्थ्य', color: 'red', question: 'हृदय रोग के शुरुआती लक्षण क्या हैं?' },
  { icon: Pill, label: 'दवाइयाँ', color: 'purple', question: 'रक्तचाप की दवाओं के सामान्य दुष्प्रभाव क्या हैं?' },
  { icon: Apple, label: 'पोषण', color: 'green', question: 'प्रतिरक्षा प्रणाली के लिए कौन से खाद्य पदार्थ सर्वोत्तम हैं?' },
  { icon: Dumbbell, label: 'फिटनेस', color: 'orange', question: 'अच्छे स्वास्थ्य के लिए प्रति सप्ताह कितना व्यायाम करना चाहिए?' },
  { icon: Brain, label: 'मानसिक स्वास्थ्य', color: 'indigo', question: 'तनाव और चिंता को प्रबंधित करने के प्रभावी तरीके क्या हैं?' },
  { icon: ThermometerSun, label: 'लक्षण', color: 'yellow', question: 'लगातार बुखार के बारे में कब चिंतित होना चाहिए?' },
  { icon: Baby, label: 'बच्चों का स्वास्थ्य', color: 'pink', question: 'बच्चों के लिए अनुशंसित टीके कौन से हैं?' },
  { icon: Wind, label: 'श्वसन', color: 'sky', question: 'फेफड़ों की क्षमता और सांस लेने में कैसे सुधार करें?' },
]

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  red: { bg: 'hover:bg-red-50', text: 'text-red-600', border: 'hover:border-red-200', iconBg: 'bg-red-100' },
  purple: { bg: 'hover:bg-purple-50', text: 'text-purple-600', border: 'hover:border-purple-200', iconBg: 'bg-purple-100' },
  green: { bg: 'hover:bg-green-50', text: 'text-green-600', border: 'hover:border-green-200', iconBg: 'bg-green-100' },
  orange: { bg: 'hover:bg-orange-50', text: 'text-orange-600', border: 'hover:border-orange-200', iconBg: 'bg-orange-100' },
  indigo: { bg: 'hover:bg-indigo-50', text: 'text-indigo-600', border: 'hover:border-indigo-200', iconBg: 'bg-indigo-100' },
  yellow: { bg: 'hover:bg-yellow-50', text: 'text-yellow-600', border: 'hover:border-yellow-200', iconBg: 'bg-yellow-100' },
  pink: { bg: 'hover:bg-pink-50', text: 'text-pink-600', border: 'hover:border-pink-200', iconBg: 'bg-pink-100' },
  sky: { bg: 'hover:bg-sky-50', text: 'text-sky-600', border: 'hover:border-sky-200', iconBg: 'bg-sky-100' },
}

export default function SuggestedQuestions({ onSelect, language }: SuggestedQuestionsProps) {
  const questions = language === 'hi' ? suggestedHi : suggestedEn

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {questions.map((item, index) => {
        const colors = colorMap[item.color]
        return (
          <motion.button
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(item.question)}
            className={`flex flex-col items-start gap-2 p-4 bg-white border border-slate-200 rounded-2xl text-left transition-all duration-200 ${colors.bg} ${colors.border} hover:shadow-md group cursor-pointer`}
          >
            <div className={`w-9 h-9 rounded-xl ${colors.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <item.icon className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${colors.text}`}>
                {item.label}
              </p>
              <p className="text-xs text-slate-600 leading-snug">{item.question}</p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
