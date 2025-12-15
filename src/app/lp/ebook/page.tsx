'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { BookOpen, CheckCircle2, Download, FileText, Users, Target, TrendingUp, BarChart3 } from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import LpCaptureForm from '@/components/lp/LpCaptureForm'
import { EBOOK_CONTENT } from '@/lib/lp-content'

const iconesCapitulos = [FileText, BarChart3, Users, Target, TrendingUp, BookOpen, Users, TrendingUp, CheckCircle2, Download]

export default function EbookPage() {
  return (
    <>
      <LpHeader abordagem="ebook" />

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
              <Badge className="bg-green-500/20 text-green-400 mb-6">
                100% GRATUITO
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                {EBOOK_CONTENT.titulo}
              </h1>

              <p className="text-xl text-zinc-400 mb-8">
                {EBOOK_CONTENT.subtitulo}
              </p>

              {/* Destaques */}
              <div className="space-y-3 mb-8">
                {EBOOK_CONTENT.destaques.map((destaque, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-zinc-300">{destaque}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">10</p>
                  <p className="text-xs text-zinc-500">Capítulos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">40+</p>
                  <p className="text-xs text-zinc-500">Páginas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">100%</p>
                  <p className="text-xs text-zinc-500">Prático</p>
                </div>
              </div>
            </motion.div>

            {/* Mockup do Ebook */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              {/* Ebook 3D Mockup */}
              <div className="relative mx-auto" style={{ perspective: '1000px' }}>
                <div
                  className="relative w-72 h-96 mx-auto transform"
                  style={{ transformStyle: 'preserve-3d', transform: 'rotateY(-15deg)' }}
                >
                  {/* Capa do livro */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-700 rounded-r-lg shadow-2xl">
                    <div className="p-6 h-full flex flex-col">
                      <Badge className="bg-white/20 text-white text-xs w-fit mb-4">
                        EBOOK GRATUITO
                      </Badge>
                      <h3 className="text-white font-bold text-lg mb-2">
                        Metodologia Completa de Análise de Mercado
                      </h3>
                      <p className="text-green-100 text-sm mb-auto">
                        Imobiliário
                      </p>
                      <div className="mt-auto">
                        <p className="text-green-200 text-xs">RPK Análise</p>
                        <p className="text-green-300 text-xs">2025</p>
                      </div>
                    </div>
                    {/* Lombada */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-green-800 to-green-700 rounded-l-sm"
                      style={{ transform: 'translateX(-100%) rotateY(-90deg)', transformOrigin: 'right' }}
                    />
                  </div>
                </div>

                {/* Reflexo/Sombra */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-64 h-8 bg-gradient-to-t from-green-500/20 to-transparent blur-xl" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* O que você vai aprender */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-green-500/20 text-green-400 mb-4">Conteúdo Completo</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              O que você vai aprender
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              10 capítulos práticos com metodologia aplicável imediatamente no seu próximo lançamento
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {EBOOK_CONTENT.capitulos.map((capitulo, index) => {
              const Icon = iconesCapitulos[index % iconesCapitulos.length]
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-green-500 font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{capitulo.titulo}</h3>
                    <p className="text-zinc-500 text-sm">{capitulo.descricao}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge className="bg-green-500/20 text-green-400 mb-4">Para Quem</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Este ebook é para você se...
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {EBOOK_CONTENT.paraQuem.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-zinc-300">{item}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário de Captura */}
      <section className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-xl">
          <div className="text-center mb-8">
            <Badge className="bg-green-500/20 text-green-400 mb-4">Download Gratuito</Badge>
            <h2 className="text-3xl font-bold text-white mb-4">
              Baixe agora mesmo
            </h2>
            <p className="text-zinc-400">
              Preencha seus dados e receba o ebook gratuitamente
            </p>
          </div>

          <LpCaptureForm
            abordagem="ebook"
            ctaTexto="Baixar Ebook Gratuito"
            variant="medium"
          />
        </div>
      </section>

      {/* Sobre a RPK */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <Badge className="bg-orange-500/20 text-orange-400 mb-4">Sobre</Badge>
                <h2 className="text-2xl font-bold text-white mb-4">
                  Quem criou este ebook
                </h2>
                <p className="text-zinc-400 mb-4">
                  A <strong className="text-white">Agência RPK</strong> atua há mais de 8 anos no mercado
                  imobiliário, ajudando incorporadoras a lançar empreendimentos de sucesso.
                </p>
                <p className="text-zinc-400">
                  Este ebook consolida anos de experiência em análise de mercado, com metodologia
                  testada e validada em mais de 50 empreendimentos.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">8+</p>
                  <p className="text-zinc-500 text-sm">Anos de mercado</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">50+</p>
                  <p className="text-zinc-500 text-sm">Empreendimentos</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">R$700M+</p>
                  <p className="text-zinc-500 text-sm">VGV lançado</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">100%</p>
                  <p className="text-zinc-500 text-sm">Gratuito</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LpFooter />
    </>
  )
}
