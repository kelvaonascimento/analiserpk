'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, BarChart3, Heart, Clock, BookOpen } from 'lucide-react'
import type { Abordagem } from '@/lib/lp-content'
import { ABORDAGENS } from '@/lib/lp-content'

interface PathCardProps {
  abordagem: Abordagem
  onClick: () => void
  index: number
}

const icones = {
  racional: BarChart3,
  emocional: Heart,
  urgencia: Clock,
  ebook: BookOpen,
}

const cores = {
  racional: {
    bg: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/30 hover:border-amber-500/60',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-500',
    badge: 'bg-amber-500/20 text-amber-400',
  },
  emocional: {
    bg: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30 hover:border-purple-500/60',
    icon: 'bg-gradient-to-br from-purple-500 to-pink-500',
    badge: 'bg-purple-500/20 text-purple-400',
  },
  urgencia: {
    bg: 'from-red-500/20 to-orange-500/20',
    border: 'border-red-500/30 hover:border-red-500/60',
    icon: 'bg-gradient-to-br from-red-500 to-orange-500',
    badge: 'bg-red-500/20 text-red-400',
  },
  ebook: {
    bg: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30 hover:border-green-500/60',
    icon: 'bg-gradient-to-br from-green-500 to-emerald-500',
    badge: 'bg-green-500/20 text-green-400',
  },
}

export default function PathCard({ abordagem, onClick, index }: PathCardProps) {
  const content = ABORDAGENS[abordagem]
  const Icon = icones[abordagem]
  const cor = cores[abordagem]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card
        onClick={onClick}
        className={`
          cursor-pointer transition-all duration-300
          bg-gradient-to-br ${cor.bg} ${cor.border}
          hover:scale-[1.02] backdrop-blur-xl
        `}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-14 h-14 rounded-xl ${cor.icon} flex items-center justify-center`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
            <Badge className={`${cor.badge} text-xs`}>
              {content.badge}
            </Badge>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">
            {content.titulo}
          </h3>
          <p className="text-zinc-400 text-sm mb-4">
            {content.descricao}
          </p>

          <div className="flex items-center text-sm font-medium text-white group">
            <span>{abordagem === 'ebook' ? 'Baixar Grátis' : 'Escolher'}</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
