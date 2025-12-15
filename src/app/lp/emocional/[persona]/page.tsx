'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Quote,
  Sparkles,
  Crown,
  Megaphone,
  Handshake,
} from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import LpCaptureForm from '@/components/lp/LpCaptureForm'
import { LP_EMOCIONAL, PERSONAS, type Persona } from '@/lib/lp-content'

const validPersonas = ['ceo', 'marketing', 'comercial'] as const

const personaIcons = {
  ceo: Crown,
  marketing: Megaphone,
  comercial: Handshake,
}

// Conteúdo específico por persona para LP Emocional
const conteudoPersona = {
  ceo: {
    heroTitulo: 'O Peso de Decisões Que Custam Milhões',
    heroSubtitulo: 'Você não precisa mais perder noites de sono com incertezas sobre seus lançamentos',
    historia: 'Imagine acordar às 3h da manhã pensando: "E se esse lançamento não vender?". O peso de uma decisão errada que pode custar milhões, afetar dezenas de empregos, e comprometer anos de trabalho. Você conhece essa sensação.',
    transformacao: 'Agora imagine tomar cada decisão com a confiança de quem tem dados reais. Saber exatamente o potencial do mercado, os preços da concorrência, e o público que vai comprar. Essa paz de espírito tem um valor imensurável.',
    doresEspecificas: [
      'O medo de aprovar um projeto que não vai vender',
      'A pressão do board por resultados que você não pode garantir',
      'Noites em claro pensando em decisões de milhões',
      'A solidão de não ter dados confiáveis para se apoiar',
    ],
  },
  marketing: {
    heroTitulo: 'Cansado de Campanhas Que Não Convertem?',
    heroSubtitulo: 'Seus briefings nunca mais serão incompletos. Seus anúncios nunca mais errarão o público.',
    historia: 'Você recebe o briefing: "É um apartamento de 2 quartos no centro". E é só isso. Sem dados do público, sem comparativo com concorrentes, sem argumentos de venda. E ainda esperam que você faça milagre com a campanha.',
    transformacao: 'Imagine receber junto com o briefing: 3 personas detalhadas, 18 chamadas publicitárias testadas, comparativo completo de preços, e até o budget sugerido por fase. Suas campanhas nunca mais serão as mesmas.',
    doresEspecificas: [
      'Briefings vagos que te deixam no escuro',
      'Campanhas que não convertem por falta de informação',
      'Ter que adivinhar quem é o público-alvo',
      'Desperdiçar budget testando ao invés de converter',
    ],
  },
  comercial: {
    heroTitulo: 'Já Perdeu Uma Venda Por Não Ter Argumentos?',
    heroSubtitulo: 'Nunca mais fique sem resposta quando o cliente comparar com a concorrência',
    historia: 'O cliente está interessado, mas diz: "Vi um apartamento parecido mais barato ali na frente". Você não conhece o empreendimento, não tem argumentos, e perde a venda. Quantas vezes isso já aconteceu?',
    transformacao: 'Imagine conhecer TODOS os concorrentes em detalhes. Saber exatamente por que seu empreendimento vale mais. Ter argumentos prontos para cada objeção. Essa confiança transforma suas vendas.',
    doresEspecificas: [
      'Perder vendas por não conhecer a concorrência',
      'Não ter argumentos para objeções de preço',
      'O constrangimento de não saber responder',
      'Ver clientes irem embora sem você poder fazer nada',
    ],
  },
}

export default function EmocionalPersonaPage({ params }: { params: Promise<{ persona: string }> }) {
  const resolvedParams = use(params)
  const persona = resolvedParams.persona as Persona

  if (!validPersonas.includes(persona as typeof validPersonas[number])) {
    notFound()
  }

  const personaInfo = PERSONAS[persona]
  const conteudo = conteudoPersona[persona]
  const PersonaIcon = personaIcons[persona]

  return (
    <>
      <LpHeader abordagem="emocional" />

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
                <Badge className="bg-purple-500/20 text-purple-400">
                  Histórias Reais
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

              {/* Estatística impactante */}
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-3xl font-bold text-purple-400">40%</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">dos empreendimentos não atingem as metas</p>
                    <p className="text-zinc-400 text-sm">no primeiro ano de lançamento</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LpCaptureForm
                abordagem="emocional"
                persona={persona}
                ctaTexto="Quero Mudar Minha História"
                variant="full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* História / A Dor */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="bg-red-500/20 text-red-400 mb-4">Você Conhece Isso</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Uma história que você já viveu
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 mb-8"
          >
            <p className="text-zinc-300 text-lg leading-relaxed italic">
              "{conteudo.historia}"
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {conteudo.doresEspecificas.map((dor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-zinc-900/50 border border-red-500/20 rounded-xl p-4 flex items-start gap-3"
              >
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-zinc-400">{dor}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* A Transformação */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="bg-green-500/20 text-green-400 mb-4">A Transformação</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Agora imagine um cenário diferente
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-8 text-center"
          >
            <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-6" />
            <p className="text-xl text-zinc-200 leading-relaxed">
              {conteudo.transformacao}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-purple-500/20 text-purple-400 mb-4">Histórias de Sucesso</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              {personaInfo.titulo}s que transformaram seus resultados
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {LP_EMOCIONAL.depoimentos.map((depoimento, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6"
              >
                <Quote className="w-8 h-8 text-purple-500/50 mb-4" />
                <p className="text-zinc-300 mb-6 italic">"{depoimento.texto}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-400 font-bold">
                      {depoimento.nome.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{depoimento.nome}</p>
                    <p className="text-zinc-500 text-sm">{depoimento.cargo}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-green-400 text-sm font-medium">
                      {depoimento.resultado}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Garantias */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-green-500/20 text-green-400 mb-4">Sua Segurança</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Você não tem nada a perder
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {LP_EMOCIONAL.garantias.map((garantia, index) => (
              <div
                key={index}
                className="bg-zinc-900/50 border border-green-500/20 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-white font-semibold mb-2">{garantia.titulo}</h3>
                <p className="text-zinc-400 text-sm">{garantia.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para escrever uma nova história?
            </h2>
            <p className="text-zinc-400">
              Dê o primeiro passo para transformar seus resultados
            </p>
          </div>

          <LpCaptureForm
            abordagem="emocional"
            persona={persona}
            ctaTexto="Quero Começar Agora"
            variant="medium"
          />
        </div>
      </section>

      <LpFooter />
    </>
  )
}
