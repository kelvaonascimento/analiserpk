'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Search,
  Building2,
  Factory,
  Globe,
  CheckCircle2,
  Sparkles
} from 'lucide-react'

interface LoadingStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  duration: number
}

const LOADING_STEPS: LoadingStep[] = [
  {
    id: 'localizacao',
    title: 'Identificando região',
    description: 'Mapeando bairro e arredores...',
    icon: MapPin,
    duration: 3000,
  },
  {
    id: 'portais',
    title: 'Consultando portais',
    description: 'VivaReal, ZAP, Imovelweb...',
    icon: Globe,
    duration: 5000,
  },
  {
    id: 'construtoras',
    title: 'Buscando construtoras',
    description: 'MBigucci, Patriani, Toth, Living...',
    icon: Factory,
    duration: 6000,
  },
  {
    id: 'empreendimentos',
    title: 'Coletando empreendimentos',
    description: 'Lançamentos, obras e prontos...',
    icon: Building2,
    duration: 5000,
  },
  {
    id: 'analise',
    title: 'Analisando resultados',
    description: 'Consolidando dados...',
    icon: Search,
    duration: 4000,
  },
]

interface LoadingConcorrentesProps {
  isActive: boolean
  cidade?: string
  bairro?: string
}

export default function LoadingConcorrentes({ isActive, cidade, bairro }: LoadingConcorrentesProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [elapsedTime, setElapsedTime] = useState(0)

  // Timer para tempo decorrido
  useEffect(() => {
    if (!isActive) {
      setElapsedTime(0)
      return
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive])

  // Progressão dos steps
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

  const progress = Math.min(((completedSteps.length) / LOADING_STEPS.length) * 100, 95)
  const currentStep = LOADING_STEPS[currentStepIndex]

  return (
    <div className="space-y-6 py-6">
      {/* Header com animação */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 mb-3"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-orange-500" />
          </motion.div>
          <h4 className="text-xl font-bold text-white">
            Investigação em Andamento
          </h4>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-5 h-5 text-orange-500" />
          </motion.div>
        </motion.div>

        <p className="text-zinc-400 text-sm flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          {bairro && <span>{bairro}, </span>}
          <span className="text-orange-400 font-medium">{cidade || 'Região'}</span>
        </p>
      </div>

      {/* Barra de progresso principal - GRANDE E VISÍVEL */}
      <div className="relative px-4">
        <div className="h-4 bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 relative"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Efeito de brilho na barra */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>

        {/* Info abaixo da barra */}
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-sm font-mono text-orange-400">{Math.round(progress)}%</span>
          <span className="text-sm text-zinc-500">
            {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')} decorrido
          </span>
          <span className="text-sm text-zinc-500">{completedSteps.length}/{LOADING_STEPS.length} etapas</span>
        </div>
      </div>

      {/* Step atual em destaque */}
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <motion.div
                className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <currentStep.icon className="w-6 h-6 text-orange-500" />
              </motion.div>
              <div className="flex-1">
                <p className="text-lg font-semibold text-orange-400">
                  {currentStep.title}
                </p>
                <p className="text-sm text-zinc-400">
                  {currentStep.description}
                </p>
              </div>
              <motion.div
                className="flex gap-1"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
                <span className="w-2 h-2 bg-orange-500 rounded-full" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de steps completados */}
      <div className="mx-4 space-y-2">
        {LOADING_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = index === currentStepIndex && !isCompleted
          const isPending = index > currentStepIndex

          if (isCurrent) return null // Já mostrado acima

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                flex items-center gap-3 p-2 rounded-lg
                ${isCompleted
                  ? 'bg-green-500/5 border border-green-500/20'
                  : 'bg-zinc-800/20 border border-zinc-800'
                }
              `}
            >
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                ${isCompleted ? 'bg-green-500/20' : 'bg-zinc-800'}
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <step.icon className="w-3 h-3 text-zinc-600" />
                )}
              </div>
              <span className={`text-sm ${
                isCompleted ? 'text-green-400' : 'text-zinc-600'
              }`}>
                {step.title}
              </span>
              {isCompleted && (
                <span className="ml-auto text-xs text-green-500/50">✓</span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Dica inferior */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-center text-xs text-zinc-600 px-4"
      >
        🔍 Buscando em portais imobiliários, sites de construtoras e imobiliárias da região...
      </motion.p>
    </div>
  )
}
