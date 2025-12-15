'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  Database,
  FileSearch,
  PieChart,
  Users,
  ArrowRight,
} from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import LpCaptureForm from '@/components/lp/LpCaptureForm'
import { LP_RACIONAL, METRICAS } from '@/lib/lp-content'

const iconesMetricas = [Clock, DollarSign, Target]

export default function RacionalPage() {
  return (
    <>
      <LpHeader abordagem="racional" />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="bg-amber-500/20 text-amber-400 mb-6">
                {LP_RACIONAL.hero.badge}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {LP_RACIONAL.hero.titulo}
              </h1>

              <p className="text-xl text-zinc-400 mb-8">
                {LP_RACIONAL.hero.subtitulo}
              </p>

              {/* Métricas Principais */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {LP_RACIONAL.metricas.map((metrica, index) => {
                  const Icon = iconesMetricas[index]
                  return (
                    <div
                      key={index}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
                    >
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-xl font-bold text-white">{metrica.valor}</p>
                      <p className="text-zinc-500 text-xs">{metrica.label}</p>
                    </div>
                  )
                })}
              </div>

              {/* CTA rápido */}
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Sem cartão de crédito</span>
                <span>•</span>
                <span>Resultado imediato</span>
              </div>
            </motion.div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LpCaptureForm
                abordagem="racional"
                ctaTexto="Gerar Diagnóstico Agora"
                variant="full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Metodologia */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/20 text-amber-400 mb-4">Metodologia</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              4 pilares de análise comprovada
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Nossa metodologia é baseada em dados de fontes oficiais e validada em mais de 50 empreendimentos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {LP_RACIONAL.pilares.map((pilar, index) => {
              const icones = [Database, FileSearch, PieChart, Users]
              const Icon = icones[index]
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{pilar.titulo}</h3>
                  <p className="text-zinc-400 text-sm">{pilar.descricao}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Fontes de Dados */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/20 text-amber-400 mb-4">Dados Confiáveis</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Fontes oficiais que utilizamos
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LP_RACIONAL.fontes.map((fonte, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center"
              >
                <p className="text-white font-medium text-sm">{fonte}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparativo */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/20 text-amber-400 mb-4">Comparativo</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Consultoria Tradicional vs RPK Análise
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Tradicional */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-zinc-400 mb-6 text-center">
                Consultoria Tradicional
              </h3>
              <ul className="space-y-4">
                {LP_RACIONAL.comparativo.tradicional.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    </span>
                    <span className="text-zinc-400">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RPK Análise */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-400 mb-6 text-center">
                RPK Análise
              </h3>
              <ul className="space-y-4">
                {LP_RACIONAL.comparativo.rpk.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* O que você recebe */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/20 text-amber-400 mb-4">Entregáveis</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              O que você recebe no diagnóstico
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LP_RACIONAL.entregaveis.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">{item.titulo}</h3>
                  <p className="text-zinc-500 text-sm">{item.descricao}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <Badge className="bg-amber-500/20 text-amber-400 mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-4">
            {LP_RACIONAL.faq.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <h3 className="text-white font-semibold mb-2">{item.pergunta}</h3>
                <p className="text-zinc-400">{item.resposta}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para dados reais?
            </h2>
            <p className="text-zinc-400">
              Crie seu diagnóstico gratuito e tome decisões baseadas em dados
            </p>
          </div>

          <LpCaptureForm
            abordagem="racional"
            ctaTexto="Criar Diagnóstico Gratuito"
            variant="medium"
          />
        </div>
      </section>

      <LpFooter />
    </>
  )
}
