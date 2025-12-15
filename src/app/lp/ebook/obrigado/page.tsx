'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, ArrowRight, Loader2 } from 'lucide-react'
import LpHeader from '@/components/lp/LpHeader'
import LpFooter from '@/components/lp/LpFooter'
import Link from 'next/link'

// Componente separado para o botão de download que usa react-pdf
function DownloadButton() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [PDFComponents, setPDFComponents] = useState<{ PDFDownloadLink: any; EbookPDF: any } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [downloadStarted, setDownloadStarted] = useState(false)

  useEffect(() => {
    const loadPDFComponents = async () => {
      try {
        const [reactPDF, ebookModule] = await Promise.all([
          import('@react-pdf/renderer'),
          import('@/components/lp/EbookPDF'),
        ])
        setPDFComponents({
          PDFDownloadLink: reactPDF.PDFDownloadLink,
          EbookPDF: ebookModule.default,
        })
      } catch (error) {
        console.error('Erro ao carregar componentes PDF:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPDFComponents()
  }, [])

  if (isLoading || !PDFComponents) {
    return (
      <Button
        size="lg"
        disabled
        className="h-14 px-8 text-lg bg-green-500/50 text-white font-semibold"
      >
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        Preparando download...
      </Button>
    )
  }

  const { PDFDownloadLink, EbookPDF } = PDFComponents

  return (
    <>
      <PDFDownloadLink
        document={<EbookPDF />}
        fileName="RPK-Metodologia-Analise-Mercado-Imobiliario.pdf"
      >
        {({ loading }: { loading: boolean }) => (
          <Button
            size="lg"
            onClick={() => setDownloadStarted(true)}
            disabled={loading}
            className="h-14 px-8 text-lg bg-green-500 hover:bg-green-600 text-white font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando PDF...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Baixar Ebook Gratuito
              </>
            )}
          </Button>
        )}
      </PDFDownloadLink>

      {downloadStarted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mt-6"
        >
          <p className="text-green-400">
            Download iniciado! Verifique sua pasta de downloads.
          </p>
        </motion.div>
      )}
    </>
  )
}

export default function EbookObrigadoPage() {
  return (
    <>
      <LpHeader abordagem="ebook" />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 min-h-[80vh] flex items-center">
        <div className="container mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {/* Ícone de sucesso */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </motion.div>

            <Badge className="bg-green-500/20 text-green-400 mb-6">
              Cadastro Realizado
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Obrigado!
              <br />
              <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                Seu ebook está pronto
              </span>
            </h1>

            <p className="text-xl text-zinc-400 mb-10 max-w-xl mx-auto">
              Clique no botão abaixo para baixar a metodologia completa de análise de mercado imobiliário
            </p>

            {/* Botão de Download */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-12"
            >
              <DownloadButton />
            </motion.div>

            {/* Card: Próximo passo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-4">
                Quer automatizar tudo isso?
              </h2>
              <p className="text-zinc-400 mb-6">
                O ebook ensina a metodologia manual. Mas com o <strong className="text-white">RPK Análise</strong>,
                você tem todos esses dados automaticamente em minutos, não semanas.
              </p>

              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">5min</p>
                  <p className="text-zinc-500 text-sm">Para gerar</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">100%</p>
                  <p className="text-zinc-500 text-sm">Gratuito</p>
                </div>
                <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">IA</p>
                  <p className="text-zinc-500 text-sm">Powered</p>
                </div>
              </div>

              <Link href="/criar">
                <Button className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 font-semibold">
                  Criar Diagnóstico Gratuito
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <LpFooter />
    </>
  )
}
