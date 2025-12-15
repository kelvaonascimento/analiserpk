'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  CheckCircle2,
  MapPin,
  Search,
  BarChart3,
  Users,
  Target,
  FileText,
  Sparkles,
  Building2,
  TrendingUp
} from 'lucide-react'

interface LoadingStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  duration: number // milliseconds
}

const LOADING_STEPS: LoadingStep[] = [
  {
    id: 'lead',
    title: 'Salvando seus dados',
    description: 'Registrando informações de contato...',
    icon: Users,
    duration: 1500,
  },
  {
    id: 'projeto',
    title: 'Criando projeto',
    description: 'Configurando análise do empreendimento...',
    icon: Building2,
    duration: 1500,
  },
  {
    id: 'panorama',
    title: 'Buscando dados de mercado',
    description: 'Coletando informações econômicas da região...',
    icon: BarChart3,
    duration: 4000,
  },
  {
    id: 'populacao',
    title: 'Analisando população',
    description: 'PIB, renda, classes sociais e emprego...',
    icon: TrendingUp,
    duration: 3000,
  },
  {
    id: 'imobiliario',
    title: 'Levantando mercado imobiliário',
    description: 'Preço/m², lançamentos e tendências...',
    icon: MapPin,
    duration: 3000,
  },
  {
    id: 'concorrentes',
    title: 'Mapeando concorrentes',
    description: 'Identificando empreendimentos na região...',
    icon: Search,
    duration: 3000,
  },
  {
    id: 'swot',
    title: 'Gerando análise SWOT',
    description: 'Forças, fraquezas, oportunidades e ameaças...',
    icon: Target,
    duration: 4000,
  },
  {
    id: 'personas',
    title: 'Criando personas',
    description: 'Perfis de compradores ideais...',
    icon: Users,
    duration: 3000,
  },
  {
    id: 'estrategia',
    title: 'Montando estratégia',
    description: 'Plano de marketing e KPIs...',
    icon: FileText,
    duration: 2000,
  },
  {
    id: 'finalizando',
    title: 'Finalizando análise',
    description: 'Compilando relatório completo...',
    icon: Sparkles,
    duration: 2000,
  },
]

interface LoadingStepsProps {
  isActive: boolean
  cidade?: string
}

export default function LoadingSteps({ isActive, cidade }: LoadingStepsProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    if (!isActive) {
      setCurrentStepIndex(0)
      setCompletedSteps([])
      return
    }

    const currentStep = LOADING_STEPS[currentStepIndex]
    if (!currentStep) return

    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep.id])
      if (currentStepIndex < LOADING_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1)
      }
    }, currentStep.duration)

    return () => clearTimeout(timer)
  }, [isActive, currentStepIndex])

  if (!isActive) return null

  const progress = ((completedSteps.length) / LOADING_STEPS.length) * 100

  return (
    <div className="space-y-6">
      {/* Header com cidade */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">
          Gerando Análise Estratégica
        </h3>
        {cidade && (
          <p className="text-zinc-400 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4 text-orange-500" />
            Analisando mercado de <span className="text-orange-400 font-medium">{cidade}</span>
          </p>
        )}
      </div>

      {/* Barra de progresso geral */}
      <div className="relative">
        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-zinc-500">{Math.round(progress)}% concluído</span>
          <span className="text-xs text-zinc-500">{completedSteps.length}/{LOADING_STEPS.length} etapas</span>
        </div>
      </div>

      {/* Lista de steps */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {LOADING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = index === currentStepIndex && !isCompleted
          const isPending = index > currentStepIndex
          const Icon = step.icon

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-4 p-4 rounded-lg transition-all
                ${isCompleted
                  ? 'bg-green-500/10 border border-green-500/30'
                  : isCurrent
                    ? 'bg-orange-500/10 border border-orange-500/30'
                    : 'bg-zinc-800/50 border border-zinc-700/50'
                }
              `}
            >
              {/* Ícone com animação */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                ${isCompleted
                  ? 'bg-green-500/20'
                  : isCurrent
                    ? 'bg-orange-500/20'
                    : 'bg-zinc-700/50'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
                ) : (
                  <Icon className={`w-5 h-5 ${isPending ? 'text-zinc-500' : 'text-zinc-400'}`} />
                )}
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium truncate ${
                  isCompleted
                    ? 'text-green-400'
                    : isCurrent
                      ? 'text-orange-400'
                      : 'text-zinc-400'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm truncate ${
                  isCompleted || isCurrent ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  {isCurrent ? step.description : isCompleted ? 'Concluído' : 'Aguardando...'}
                </p>
              </div>

              {/* Indicador de tempo */}
              {isCurrent && (
                <div className="flex-shrink-0">
                  <motion.div
                    className="w-2 h-2 rounded-full bg-orange-500"
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Mensagem de dica */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-center text-sm text-zinc-500"
      >
        <p>Este processo leva aproximadamente 30 segundos.</p>
        <p className="text-zinc-600 mt-1">Não feche esta página.</p>
      </motion.div>
    </div>
  )
}
