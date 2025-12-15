'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Target,
  Database,
  FileSearch,
  PieChart,
  Users,
  Crown,
  Megaphone,
  Handshake,
} from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import LpCaptureForm from '@/components/lp/LpCaptureForm'
import { LP_RACIONAL, PERSONAS, type Persona } from '@/lib/lp-content'

const validPersonas = ['ceo', 'marketing', 'comercial'] as const

const personaIcons = {
  ceo: Crown,
  marketing: Megaphone,
  comercial: Handshake,
}

const personaColors = {
  ceo: 'amber',
  marketing: 'purple',
  comercial: 'green',
}

// Conteúdo específico por persona para LP Racional
const conteudoPersona = {
  ceo: {
    heroTitulo: 'Decisões Estratégicas Baseadas em Dados',
    heroSubtitulo: 'Reduza riscos e maximize retornos com análise de mercado completa para seu próximo empreendimento',
    beneficios: [
      'Visão 360° do mercado antes de investir',
      'ROI projetado com base em dados reais',
      'Redução de 40% no risco de lançamento',
      'Relatórios executivos para board e investidores',
    ],
    dores: [
      'Tomar decisões de milhões baseadas em achismos',
      'Depender de consultorias caras e lentas',
      'Não ter dados comparáveis entre projetos',
      'Descobrir problemas só depois do lançamento',
    ],
  },
  marketing: {
    heroTitulo: 'Campanhas que Convertem com Dados Reais',
    heroSubtitulo: '3 personas prontas, 18 chamadas publicitárias e budget sugerido para seu empreendimento',
    beneficios: [
      '3 personas detalhadas do público-alvo',
      '18 chamadas publicitárias prontas para usar',
      'Budget de marketing sugerido por fase',
      'Argumentos de venda validados por dados',
    ],
    dores: [
      'Briefings incompletos da incorporadora',
      'Campanhas que não convertem',
      'Não saber quem é o público real',
      'Desperdiçar budget em canais errados',
    ],
  },
  comercial: {
    heroTitulo: 'Venda Mais com Argumentos Baseados em Dados',
    heroSubtitulo: 'Mapeamento completo de concorrentes, comparativo de preços e argumentário de vendas',
    beneficios: [
      'Mapeamento de todos os concorrentes',
      'Comparativo de preço/m² detalhado',
      'Argumentário para objeções de preço',
      'Diferenciais competitivos destacados',
    ],
    dores: [
      'Perder vendas por não conhecer concorrência',
      'Não ter argumentos para objeções de preço',
      'Cliente comparar com empreendimento errado',
      'Não saber explicar os diferenciais',
    ],
  },
}

export default function RacionalPersonaPage({ params }: { params: Promise<{ persona: string }> }) {
  const resolvedParams = use(params)
  const persona = resolvedParams.persona as Persona

  if (!validPersonas.includes(persona as typeof validPersonas[number])) {
    notFound()
  }

  const personaInfo = PERSONAS[persona]
  const conteudo = conteudoPersona[persona]
  const PersonaIcon = personaIcons[persona]
  const color = personaColors[persona]

  const iconesMetricas = [Clock, DollarSign, Target]

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
              {/* Badge de Persona */}
              <div className="flex items-center gap-3 mb-6">
                <Badge className={`bg-${color}-500/20 text-${color}-400`}>
                  {LP_RACIONAL.hero.badge}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  <PersonaIcon className="w-3 h-3 mr-1" />
                  Para {personaInfo.titulo}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {conteudo.heroTitulo}
              </h1>

              <p className="text-xl text-zinc-400 mb-8">
                {conteudo.heroSubtitulo}
              </p>

              {/* Benefícios rápidos */}
              <div className="space-y-3 mb-8">
                {conteudo.beneficios.map((beneficio, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-zinc-300">{beneficio}</span>
                  </div>
                ))}
              </div>

              {/* Métricas Principais */}
              <div className="grid grid-cols-3 gap-4">
                {LP_RACIONAL.metricas.map((metrica, index) => {
                  const Icon = iconesMetricas[index]
                  return (
                    <div
                      key={index}
                      className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-center"
                    >
                      <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center mx-auto mb-1`}>
                        <Icon className={`w-4 h-4 text-${color}-500`} />
                      </div>
                      <p className="text-lg font-bold text-white">{metrica.valor}</p>
                      <p className="text-zinc-500 text-xs">{metrica.label}</p>
                    </div>
                  )
                })}
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
                persona={persona}
                ctaTexto="Gerar Diagnóstico Agora"
                variant="full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dores específicas da persona */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className={`bg-${color}-500/20 text-${color}-400 mb-4`}>
              {personaInfo.titulo}
            </Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Você conhece essas dores?
            </h2>
            <p className="text-zinc-400">
              Problemas comuns que {personaInfo.titulo.toLowerCase()}s enfrentam no mercado imobiliário
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {conteudo.dores.map((dor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-red-500 text-lg">×</span>
                </div>
                <p className="text-zinc-300">{dor}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como resolvemos */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className={`bg-${color}-500/20 text-${color}-400 mb-4`}>Solução</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Como o RPK Análise resolve isso
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {conteudo.beneficios.map((beneficio, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`bg-gradient-to-br from-${color}-500/10 to-${color}-500/5 border border-${color}-500/20 rounded-xl p-6`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <CheckCircle2 className={`w-5 h-5 text-${color}-500`} />
                  </div>
                  <div>
                    <p className="text-white font-medium">{beneficio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Entregáveis */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className={`bg-${color}-500/20 text-${color}-400 mb-4`}>Entregáveis</Badge>
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
                <div className={`w-8 h-8 rounded-lg bg-${color}-500/10 flex items-center justify-center flex-shrink-0`}>
                  <CheckCircle2 className={`w-4 h-4 text-${color}-500`} />
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

      {/* CTA Final */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para transformar seus resultados?
            </h2>
            <p className="text-zinc-400">
              Crie seu diagnóstico gratuito agora e tenha dados reais em minutos
            </p>
          </div>

          <LpCaptureForm
            abordagem="racional"
            persona={persona}
            ctaTexto="Criar Diagnóstico Gratuito"
            variant="medium"
          />
        </div>
      </section>

      <LpFooter />
    </>
  )
}
