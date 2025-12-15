'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Crown, Megaphone, Handshake, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Persona, Abordagem } from '@/lib/lp-content'
import { PERSONAS, ABORDAGENS } from '@/lib/lp-content'
import { useRouter } from 'next/navigation'

interface PersonaModalProps {
  isOpen: boolean
  onClose: () => void
  abordagem: Abordagem
}

const icones = {
  ceo: Crown,
  marketing: Megaphone,
  comercial: Handshake,
}

const cores = {
  ceo: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 hover:border-amber-500/60',
  marketing: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-500/60',
  comercial: 'from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-500/60',
}

const iconBg = {
  ceo: 'bg-gradient-to-br from-amber-500 to-yellow-500',
  marketing: 'bg-gradient-to-br from-purple-500 to-pink-500',
  comercial: 'bg-gradient-to-br from-green-500 to-emerald-500',
}

export default function PersonaModal({ isOpen, onClose, abordagem }: PersonaModalProps) {
  const router = useRouter()
  const abordagemContent = ABORDAGENS[abordagem]

  const handlePersonaClick = (persona: Persona) => {
    router.push(`/lp/${abordagem}/${persona}`)
    onClose()
  }

  const handleGenericClick = () => {
    router.push(`/lp/${abordagem}`)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-8 relative">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {abordagemContent.titulo}
                </h2>
                <p className="text-zinc-400">
                  Selecione seu perfil para uma experiência personalizada
                </p>
              </div>

              {/* Persona Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {(Object.keys(PERSONAS) as Persona[]).map((persona, index) => {
                  const content = PERSONAS[persona]
                  const Icon = icones[persona]
                  return (
                    <motion.div
                      key={persona}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        onClick={() => handlePersonaClick(persona)}
                        className={`
                          cursor-pointer transition-all duration-300
                          bg-gradient-to-br ${cores[persona]}
                          hover:scale-[1.02]
                        `}
                      >
                        <CardContent className="p-5 text-center">
                          <div className={`w-12 h-12 rounded-xl ${iconBg[persona]} flex items-center justify-center mx-auto mb-3`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-white font-semibold mb-1">
                            {content.titulo}
                          </h3>
                          <p className="text-zinc-400 text-xs">
                            {content.subtitulo}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Generic option */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleGenericClick}
                  className="text-zinc-400 hover:text-white"
                >
                  Prefiro a versão geral
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
