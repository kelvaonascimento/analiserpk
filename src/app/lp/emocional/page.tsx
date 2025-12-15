'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Star,
  Quote,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import LpCaptureForm from '@/components/lp/LpCaptureForm'
import { LP_EMOCIONAL } from '@/lib/lp-content'

export default function EmocionalPage() {
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
              <Badge className="bg-purple-500/20 text-purple-400 mb-6">
                {LP_EMOCIONAL.hero.badge}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {LP_EMOCIONAL.hero.titulo}
              </h1>

              <p className="text-xl text-zinc-400 mb-8">
                {LP_EMOCIONAL.hero.subtitulo}
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

              <p className="text-zinc-400 italic">
                "A diferença entre sucesso e fracasso? Conhecer profundamente seu mercado antes de lançar."
              </p>
            </motion.div>

            {/* Formulário */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <LpCaptureForm
                abordagem="emocional"
                ctaTexto="Quero Mudar Minha História"
                variant="full"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* A Dor */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-red-500/20 text-red-400 mb-4">O Pesadelo</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              {LP_EMOCIONAL.aDor.titulo}
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-red-500/20 rounded-2xl p-8"
          >
            <p className="text-zinc-300 text-lg leading-relaxed mb-8">
              {LP_EMOCIONAL.aDor.historia}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {LP_EMOCIONAL.aDor.consequencias.map((consequencia, index) => (
                <div key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-zinc-400">{consequencia}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Jornada do Herói */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-purple-500/20 text-purple-400 mb-4">A Transformação</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              De perdido a líder de mercado
            </h2>
          </div>

          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500 via-purple-500 to-green-500 transform -translate-x-1/2 hidden md:block" />

            {/* Etapas */}
            <div className="space-y-12">
              {LP_EMOCIONAL.jornada.map((etapa, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 ${
                      index === 0 ? 'border-red-500/30' :
                      index === LP_EMOCIONAL.jornada.length - 1 ? 'border-green-500/30' :
                      'border-purple-500/30'
                    }`}>
                      <Badge className={`mb-3 ${
                        index === 0 ? 'bg-red-500/20 text-red-400' :
                        index === LP_EMOCIONAL.jornada.length - 1 ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {etapa.fase}
                      </Badge>
                      <h3 className="text-xl font-bold text-white mb-2">{etapa.titulo}</h3>
                      <p className="text-zinc-400">{etapa.descricao}</p>
                    </div>
                  </div>

                  {/* Node */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-red-500' :
                    index === LP_EMOCIONAL.jornada.length - 1 ? 'bg-green-500' :
                    'bg-purple-500'
                  }`}>
                    {index === 0 ? (
                      <XCircle className="w-6 h-6 text-white" />
                    ) : index === LP_EMOCIONAL.jornada.length - 1 ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-white" />
                    )}
                  </div>

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-purple-500/20 text-purple-400 mb-4">Histórias Reais</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Quem já transformou seus resultados
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

      {/* A Revelação */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-8 md:p-12 text-center"
          >
            <Badge className="bg-purple-500/30 text-purple-300 mb-6">A Verdade</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {LP_EMOCIONAL.revelacao.titulo}
            </h2>
            <p className="text-xl text-zinc-300 mb-8">
              {LP_EMOCIONAL.revelacao.texto}
            </p>
            <div className="grid grid-cols-3 gap-4">
              {LP_EMOCIONAL.revelacao.estatisticas.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-white">{stat.valor}</p>
                  <p className="text-zinc-400 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Garantias */}
      <section className="py-16 px-4 bg-zinc-900/30">
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
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para mudar sua história?
            </h2>
            <p className="text-zinc-400">
              Junte-se às incorporadoras que transformaram seus resultados
            </p>
          </div>

          <LpCaptureForm
            abordagem="emocional"
            ctaTexto="Quero Transformar Meus Resultados"
            variant="full"
          />
        </div>
      </section>

      <LpFooter />
    </>
  )
}
