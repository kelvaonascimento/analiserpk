'use client'

import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Target, Users, Sparkles, CheckCircle2, Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Análise SWOT Completa',
    description: '10+ forças, 9+ fraquezas, 10+ oportunidades e 10+ ameaças identificadas automaticamente',
  },
  {
    icon: Users,
    title: '3 Personas Detalhadas',
    description: 'Buyer personas com demografia, dores, desejos e 6 chamadas publicitárias cada',
  },
  {
    icon: Target,
    title: 'Análise de Concorrentes',
    description: 'Mapeamento automático de concorrentes na região com comparativo de preços',
  },
  {
    icon: Sparkles,
    title: 'Estratégia de Marketing',
    description: 'Plano completo com fases, KPIs, budget sugerido e checklist de 12 semanas',
  },
]

const INCLUDED = [
  'Análise SWOT com 40+ pontos estratégicos',
  '3 personas detalhadas com comportamento de compra',
  '18 chamadas publicitárias prontas para usar',
  'Comparativo de preço/m² com concorrentes',
  'Radar chart de análise competitiva',
  'Estratégia de marketing com fases e KPIs',
  'Checklist de implementação de 12 semanas',
  'Landing page profissional pronta para compartilhar',
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">RPK</span>
              <span className="text-xl font-bold text-orange-500">Análise</span>
            </div>
            <Link href="/criar">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Criar Análise
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-orange-400 text-sm">Análise estratégica automatizada</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Análise de Mercado Imobiliário
              <br />
              <span className="text-orange-500">em Minutos, Não Semanas</span>
            </h1>

            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto">
              Gere análises estratégicas completas para empreendimentos imobiliários.
              SWOT, personas, concorrentes, estratégia de marketing e muito mais.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/criar">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                  Criar Análise Gratuita
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <p className="text-zinc-500 text-sm">
                Sem cartão de crédito • Resultado em minutos
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">
              Uma análise estratégica completa que normalmente levaria semanas para ser produzida,
              gerada automaticamente em minutos.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="bg-zinc-900/50 border-zinc-800 h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-orange-500" />
                      </div>
                      <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                      <p className="text-zinc-400 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* What's included */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              O que está incluído
            </h2>
            <p className="text-zinc-400">
              Cada análise gerada inclui todos estes itens
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {INCLUDED.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800"
              >
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-zinc-300">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Como funciona
            </h2>
            <p className="text-zinc-400">
              Em apenas 4 passos simples
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Seus dados', desc: 'Preencha suas informações de contato' },
              { step: 2, title: 'Empreendimento', desc: 'Adicione os dados do empreendimento' },
              { step: 3, title: 'Concorrentes', desc: 'Revise os concorrentes encontrados' },
              { step: 4, title: 'Análise pronta', desc: 'Receba sua landing page completa' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/30 rounded-2xl p-12">
            <Building2 className="w-16 h-16 text-orange-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Pronto para criar sua análise?
            </h2>
            <p className="text-zinc-400 mb-8">
              Comece agora e tenha sua análise estratégica completa em minutos.
            </p>
            <Link href="/criar">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                Criar Análise Gratuita
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">RPK</span>
              <span className="text-xl font-bold text-orange-500">Análise</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} RPK Agency. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
