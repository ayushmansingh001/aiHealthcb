import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Phone, ArrowRight } from 'lucide-react'

const healthTopics = [
  {
    id: 'heart',
    icon: '❤️',
    title: 'Heart Health',
    description: 'Cardiovascular disease, blood pressure, cholesterol management',
    color: 'from-red-50 to-rose-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
    questions: [
      'What are the warning signs of a heart attack?',
      'How can I lower my blood pressure naturally?',
      'What is a healthy cholesterol level?',
    ],
  },
  {
    id: 'nutrition',
    icon: '🥗',
    title: 'Nutrition & Diet',
    description: 'Healthy eating, vitamins, minerals, dietary guidelines',
    color: 'from-green-50 to-emerald-50',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
    questions: [
      'What foods boost immunity?',
      'How much protein do I need daily?',
      'What is the Mediterranean diet?',
    ],
  },
  {
    id: 'mental',
    icon: '🧠',
    title: 'Mental Health',
    description: 'Stress, anxiety, depression, sleep disorders, mindfulness',
    color: 'from-indigo-50 to-violet-50',
    border: 'border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    questions: [
      'How do I manage anxiety symptoms?',
      'What causes depression and how is it treated?',
      'How can I improve my sleep quality?',
    ],
  },
  {
    id: 'fitness',
    icon: '🏃',
    title: 'Exercise & Fitness',
    description: 'Workout routines, physical activity, weight management',
    color: 'from-orange-50 to-amber-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    questions: [
      'What is the best exercise for weight loss?',
      'How do I start a workout routine as a beginner?',
      'Is walking enough exercise?',
    ],
  },
  {
    id: 'diabetes',
    icon: '🩸',
    title: 'Diabetes',
    description: 'Blood sugar management, Type 1 & 2, insulin, prevention',
    color: 'from-blue-50 to-sky-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    questions: [
      'What are the symptoms of diabetes?',
      'What foods should diabetics avoid?',
      'How is blood sugar monitored?',
    ],
  },
  {
    id: 'medications',
    icon: '💊',
    title: 'Medications',
    description: 'Drug interactions, dosage, side effects, generic vs branded',
    color: 'from-purple-50 to-fuchsia-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-700',
    questions: [
      'What common medications interact with blood thinners?',
      'What is the difference between generic and brand name drugs?',
      'When should I take antibiotics?',
    ],
  },
  {
    id: 'respiratory',
    icon: '🫁',
    title: 'Respiratory Health',
    description: 'Asthma, COPD, breathing exercises, lung health',
    color: 'from-teal-50 to-cyan-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    questions: [
      'How do I manage asthma attacks?',
      'What are the best breathing exercises?',
      'How does air quality affect my lungs?',
    ],
  },
  {
    id: 'preventive',
    icon: '🛡️',
    title: 'Preventive Care',
    description: 'Screenings, vaccinations, annual check-ups, healthy habits',
    color: 'from-slate-50 to-gray-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    questions: [
      'What health screenings do I need at my age?',
      'Which vaccines are recommended for adults?',
      'How often should I get a physical exam?',
    ],
  },
]

const emergencySymptoms = [
  'Chest pain or pressure that radiates to arm, jaw, or back',
  'Sudden severe headache ("thunderclap headache")',
  'Difficulty breathing or shortness of breath at rest',
  'Sudden numbness or weakness on one side of the body (stroke)',
  'Coughing or vomiting blood',
  'Severe allergic reaction (throat swelling, difficulty breathing)',
  'Loss of consciousness or unresponsiveness',
  'Severe abdominal pain that comes on suddenly',
]

interface TopicCardProps {
  topic: typeof healthTopics[0]
  index: number
  onQuestionSelect: (q: string) => void
}

function TopicCard({ topic, index, onQuestionSelect }: TopicCardProps) {
  const navigate = useNavigate()

  const handleAsk = (question: string) => {
    navigate('/chat', { state: { question } })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-gradient-to-br ${topic.color} border ${topic.border} rounded-2xl p-5 card-hover`}
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{topic.icon}</span>
        <div>
          <h3 className="text-sm font-bold text-slate-800">{topic.title}</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{topic.description}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {topic.questions.map((q, qi) => (
          <button
            key={qi}
            onClick={() => handleAsk(q)}
            className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-xl bg-white/70 hover:bg-white text-xs text-slate-700 hover:text-teal-700 transition-all group"
          >
            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-teal-500 flex-shrink-0" />
            <span className="truncate">{q}</span>
          </button>
        ))}
      </div>
    </motion.div>
  )
}

export default function HealthInfo() {
  const navigate = useNavigate()

  const handleQuestionSelect = (question: string) => {
    navigate('/chat', { state: { question } })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 page-enter">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">❤️‍🩹</span>
          <h1 className="text-xl font-bold text-slate-800">Health Information</h1>
        </div>
        <p className="text-sm text-slate-500">
          Explore health topics and click any question to start an AI-assisted conversation.
        </p>
      </div>

      {/* Topic Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-700 mb-4">Health Topics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {healthTopics.map((topic, index) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              index={index}
              onQuestionSelect={handleQuestionSelect}
            />
          ))}
        </div>
      </div>

      {/* Emergency Section */}
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-red-700">⚠️ Emergency Symptoms</h2>
            <p className="text-xs text-red-600 mt-0.5">
              If you experience any of these symptoms, call emergency services immediately.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {emergencySymptoms.map((symptom, index) => (
            <div
              key={index}
              className="flex items-start gap-2 bg-white/70 border border-red-200 rounded-xl px-3 py-2.5"
            >
              <span className="text-red-500 font-bold text-sm flex-shrink-0">!</span>
              <p className="text-xs text-red-800 leading-relaxed">{symptom}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:112"
            className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call 112 (India)
          </a>
          <a
            href="tel:911"
            className="flex items-center gap-2 bg-white border border-red-300 text-red-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Call 911 (US)
          </a>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-xs text-slate-400 pb-4">
        <p>
          This information is for educational purposes only and does not constitute medical advice.
          Always consult a qualified healthcare professional for diagnosis and treatment.
        </p>
      </div>
    </div>
  )
}
