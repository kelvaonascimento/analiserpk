'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  CheckCircle2,
  Zap,
  Gift,
  TrendingUp,
  AlertTriangle,
  Timer,
  Rocket,
  Target,
  BarChart3,
  Crown,
  Megaphone,
  Handshake,
} from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import LpCaptureForm from '@/components/lp/LpCaptureForm'
import { LP_URGENCIA, PERSONAS, type Persona } from '@/lib/lp-content'

const validPersonas = ['ceo', 'marketing', 'comercial'] as const

const personaIcons = {
  ceo: Crown,
  marketing: Megaphone,
  comercial: Handshake,
}

// Conteúdo específico por persona para LP Urgência
const conteudoPersona = {
  ceo: {
    heroTitulo: '72 Horas Para Decisões Estratégicas',
    heroSubtitulo: 'Diagnóstico completo do mercado para você apresentar ao board na próxima reunião',
    timelineFoco: [
      'Relatório executivo pronto para apresentação',
      'ROI projetado com dados reais',
      'Análise de risco do investimento',
      'Comparativo com mercado local',
    ],
    custoEspecifico: 'Cada dia sem dados é um dia de decisões arriscadas. Quanto custa uma decisão errada de R$ 10 milhões?',
  },
  marketing: {
    heroTitulo: '72 Horas Para Campanhas Que Convertem',
    heroSubtitulo: 'Personas, chamadas publicitárias e budget sugerido prontos para você começar',
    timelineFoco: [
      '3 personas detalhadas do público',
      '18 chamadas publicitárias testadas',
      'Budget de marketing por fase',
      'Canais recomendados por persona',
    ],
    custoEspecifico: 'Cada dia sem dados é um dia de budget desperdiçado em campanhas que não convertem.',
  },
  comercial: {
    heroTitulo: '72 Horas Para Vender Mais',
    heroSubtitulo: 'Mapeamento completo de concorrentes e argumentário de vendas em suas mãos',
    timelineFoco: [
      'Mapeamento de todos os concorrentes',
      'Comparativo de preço/m²',
      'Argumentário para objeções',
      'Diferenciais destacados',
    ],
    custoEspecifico: 'Cada dia sem conhecer a concorrência é um dia perdendo vendas para quem conhece.',
  },
}

export default function UrgenciaPersonaPage({ params }: { params: Promise<{ persona: string }> }) {
  const resolvedParams = use(params)
  const persona = resolvedParams.persona as Persona

  if (!validPersonas.includes(persona as typeof validPersonas[number])) {
    notFound()
  }

  const personaInfo = PERSONAS[persona]
  const conteudo = conteudoPersona[persona]
  const PersonaIcon = personaIcons[persona]

  const iconesTimeline = [Rocket, BarChart3, Target, CheckCircle2]

  return (
    <>
      <LpHeader abordagem="urgencia" />

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
                <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-4 py-2">
                  <Clock className="w-4 h-4 text-red-500 animate-pulse" />
                  <span className="text-red-400 font-medium">72h para resultados</span>
                </div>
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

              {/* Timer Visual */}
              <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">72</div>
                    <div className="text-zinc-400 text-sm">horas</div>
                  </div>
                  <div className="text-3xl text-red-400">:</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">00</div>
                    <div className="text-zinc-400 text-sm">minutos</div>
                  </div>
                  <div className="text-3xl text-red-400">:</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">00</div>
                    <div className="text-zinc-400 text-sm">segundos</div>
                  </div>
                </div>
              </div>

              {/* O que você recebe */}
              <div className="space-y-2">
                {conteudo.timelineFoco.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-zinc-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LpCaptureForm
                abordagem="urgencia"
                persona={persona}
                ctaTexto="Começar Agora"
                variant="minimal"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline 72h */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-red-500/20 text-red-400 mb-4">Guia 72h</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              O que acontece nas próximas 72 horas
            </h2>
            <p className="text-zinc-400">
              Seu passo a passo personalizado para {personaInfo.titulo.toLowerCase()}s
            </p>
          </div>

          <div className="relative">
            {/* Linha vertical */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 to-green-500 hidden md:block" />

            <div className="space-y-8">
              {LP_URGENCIA.timeline.map((etapa, index) => {
                const Icon = iconesTimeline[index] || CheckCircle2
                const isLast = index === LP_URGENCIA.timeline.length - 1
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex gap-6"
                  >
                    {/* Ícone e hora */}
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isLast ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="mt-2 text-center">
                        <span className={`text-sm font-bold ${isLast ? 'text-green-400' : 'text-red-400'}`}>
                          {etapa.hora}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className={`flex-1 bg-zinc-900/50 border rounded-xl p-6 ${
                      isLast ? 'border-green-500/30' : 'border-zinc-800'
                    }`}>
                      <h3 className="text-xl font-bold text-white mb-2">{etapa.titulo}</h3>
                      <p className="text-zinc-400 mb-4">{etapa.descricao}</p>
                      <div className="flex flex-wrap gap-2">
                        {etapa.itens.map((item, i) => (
                          <span
                            key={i}
                            className={`text-xs px-3 py-1 rounded-full ${
                              isLast
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Custo da inação personalizado */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-2xl p-8 text-center"
          >
            <AlertTriangle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">
              O custo de não agir agora
            </h3>
            <p className="text-xl text-zinc-300">
              {conteudo.custoEspecifico}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Bônus */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-green-500/20 text-green-400 mb-4">Bônus Exclusivos</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Extras para {personaInfo.titulo.toLowerCase()}s
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {LP_URGENCIA.bonus.map((bonus, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">{bonus.titulo}</h3>
                <p className="text-zinc-400 text-sm mb-3">{bonus.descricao}</p>
                <Badge className="bg-green-500/20 text-green-400">
                  {bonus.valor}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-red-500/20 text-red-400 mb-4">Resultados Rápidos</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              {personaInfo.titulo}s que já receberam em 72h
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {LP_URGENCIA.depoimentos.map((depoimento, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Timer className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm font-medium">{depoimento.tempo}</span>
                </div>
                <p className="text-zinc-300 italic mb-4">"{depoimento.texto}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{depoimento.nome}</p>
                    <p className="text-zinc-500 text-sm">{depoimento.cargo}</p>
                  </div>
                  <div className="flex items-center gap-1 text-green-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{depoimento.resultado}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Capacidade */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-8 text-center"
          >
            <Badge className="bg-red-500/30 text-red-300 mb-4">Capacidade Limitada</Badge>
            <h3 className="text-2xl font-bold text-white mb-4">
              {LP_URGENCIA.capacidade.titulo}
            </h3>
            <p className="text-zinc-400 mb-6">
              {LP_URGENCIA.capacidade.descricao}
            </p>

            {/* Barra de progresso */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">Vagas utilizadas hoje</span>
                <span className="text-red-400 font-medium">{LP_URGENCIA.capacidade.usadas}/{LP_URGENCIA.capacidade.total}</span>
              </div>
              <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${(LP_URGENCIA.capacidade.usadas / LP_URGENCIA.capacidade.total) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-green-400 font-medium">
              {LP_URGENCIA.capacidade.total - LP_URGENCIA.capacidade.usadas} vagas restantes hoje
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Não perca mais tempo
            </h2>
            <p className="text-zinc-400">
              Em 72 horas você terá tudo o que precisa
            </p>
          </div>

          <LpCaptureForm
            abordagem="urgencia"
            persona={persona}
            ctaTexto="Garantir Minha Vaga"
            variant="minimal"
          />
        </div>
      </section>

      <LpFooter />
    </>
  )
}
