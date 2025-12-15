'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Cpu, TrendingUp, Building2, Award, BarChart3 } from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import PathCard from '@/components/lp/PathCard'
import PersonaModal from '@/components/lp/PersonaModal'
import { METRICAS, type Abordagem } from '@/lib/lp-content'

const iconesMetricas = [TrendingUp, BarChart3, Building2, Award]

export default function LpHubPage() {
  const router = useRouter()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAbordagem, setSelectedAbordagem] = useState<Abordagem>('racional')

  const handlePathClick = (abordagem: Abordagem) => {
    if (abordagem === 'ebook') {
      // Ebook vai direto para a página
      router.push('/lp/ebook')
    } else {
      // Outras abordagens abrem modal de persona
      setSelectedAbordagem(abordagem)
      setModalOpen(true)
    }
  }

  return (
    <>
      <LpHeader />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Badge de Pioneirismo */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/30 rounded-full px-6 py-3 mb-8">
              <Cpu className="w-5 h-5 text-orange-500" />
              <span className="text-orange-400 font-medium">Escolha seu caminho</span>
              <Badge className="bg-purple-500/30 text-purple-300 text-xs">4 opções</Badge>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Diagnóstico de Mercado
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-purple-500 bg-clip-text text-transparent">
                Imobiliário com IA
              </span>
            </h1>

            <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
              Análise estratégica completa do seu empreendimento.
              <br />
              <strong className="text-white">Escolha como você prefere começar:</strong>
            </p>
          </motion.div>

          {/* Path Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <PathCard abordagem="racional" onClick={() => handlePathClick('racional')} index={0} />
            <PathCard abordagem="emocional" onClick={() => handlePathClick('emocional')} index={1} />
            <PathCard abordagem="urgencia" onClick={() => handlePathClick('urgencia')} index={2} />
            <PathCard abordagem="ebook" onClick={() => handlePathClick('ebook')} index={3} />
          </div>

          {/* Métricas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {METRICAS.map((metrica, index) => {
              const Icon = iconesMetricas[index]
              return (
                <div
                  key={index}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-white">{metrica.valor}</p>
                  <p className="text-zinc-500 text-sm">{metrica.label}</p>
                </div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Seção de Explicação */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-orange-500/20 text-orange-400 mb-4">Como funciona</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              4 formas de começar sua transformação
            </h2>
            <p className="text-zinc-400">
              Escolha o formato que mais combina com você
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-500 font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Racional & Direto</h3>
                  <p className="text-zinc-400 text-sm">
                    Para quem decide com números. Dados, métricas, ROI comprovado e comparativos detalhados.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-500 font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Histórias & Transformação</h3>
                  <p className="text-zinc-400 text-sm">
                    Cases reais de sucesso. Veja como outras incorporadoras transformaram seus resultados.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">72h para Resultados</h3>
                  <p className="text-zinc-400 text-sm">
                    Precisa de velocidade? Diagnóstico completo em 72 horas com bônus exclusivos.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-500 font-bold">4</span>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Metodologia Gratuita</h3>
                  <p className="text-zinc-400 text-sm">
                    Baixe nosso ebook e aprenda a fazer análise de mercado por conta própria.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LpFooter />

      {/* Modal de Persona */}
      <PersonaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        abordagem={selectedAbordagem}
      />
    </>
  )
}
