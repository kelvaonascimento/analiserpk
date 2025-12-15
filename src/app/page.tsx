'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight, BarChart3, Target, Users, Sparkles, CheckCircle2, Building2,
  TrendingUp, Brain, Cpu, Shield, Zap, Award, Globe, LineChart, Rocket,
  ChevronRight, Star, Play
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Métricas da RPK
const METRICS = [
  { value: 'R$ 700M+', label: 'em VGV Lançados', icon: TrendingUp },
  { value: '50+', label: 'Construtoras Atendidas', icon: Building2 },
  { value: '200+', label: 'Lançamentos Analisados', icon: BarChart3 },
  { value: '8 anos', label: 'de Mercado Imobiliário', icon: Award },
]

const FEATURES = [
  {
    icon: Brain,
    title: 'Inteligência Artificial Gemini',
    description: 'Análises geradas pela IA mais avançada do Google, processando dados de mercado em tempo real',
    highlight: true
  },
  {
    icon: BarChart3,
    title: 'Análise SWOT Completa',
    description: '40+ pontos estratégicos identificados automaticamente com base em dados reais do mercado',
  },
  {
    icon: Users,
    title: '3 Personas Detalhadas',
    description: 'Buyer personas com demografia, dores, desejos e 18 chamadas publicitárias prontas',
  },
  {
    icon: Target,
    title: 'Mapeamento de Concorrentes',
    description: 'Identificação automática de todos os concorrentes na região com comparativo de preços',
  },
  {
    icon: LineChart,
    title: 'Dados Demográficos IBGE',
    description: 'Análise de renda, população e potencial de mercado com dados oficiais atualizados',
  },
  {
    icon: Rocket,
    title: 'Estratégia de Marketing',
    description: 'Plano completo com fases, KPIs, budget sugerido e checklist de implementação',
  },
]

const INCLUDED = [
  'Análise SWOT com 40+ pontos estratégicos',
  '3 personas detalhadas com comportamento de compra',
  '18 chamadas publicitárias prontas para usar',
  'Comparativo de preço/m² com concorrentes',
  'Radar chart de análise competitiva',
  'Dados demográficos IBGE da região',
  'Cálculo de famílias qualificadas',
  'Estratégia de marketing com fases e KPIs',
  'Checklist de implementação de 12 semanas',
  'Landing page profissional para compartilhar',
]

const TESTIMONIALS = [
  {
    name: 'Diretor Comercial',
    company: 'Incorporadora ABC',
    text: 'O diagnóstico nos ajudou a identificar o público certo e otimizar nossa estratégia de lançamento.',
  },
  {
    name: 'Gerente de Marketing',
    company: 'Construtora XYZ',
    text: 'Dados precisos e insights acionáveis. Economizamos semanas de pesquisa.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">RPK</span>
              <span className="text-xl font-bold text-orange-500">Análise</span>
              <Badge className="ml-2 bg-orange-500/20 text-orange-400 text-xs">
                Powered by AI
              </Badge>
            </div>
            <Link href="/criar">
              <Button className="bg-orange-500 hover:bg-orange-600">
                Criar Diagnóstico
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
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
              <span className="text-orange-400 font-medium">Pioneiros em IA para o Mercado Imobiliário</span>
              <Badge className="bg-purple-500/30 text-purple-300 text-xs">Google Gemini</Badge>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Diagnóstico de Mercado
              <br />
              <span className="bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">
                em Minutos, Não Semanas
              </span>
            </h1>

            <p className="text-xl text-zinc-400 mb-8 max-w-3xl mx-auto leading-relaxed">
              A <strong className="text-white">RPK</strong> desenvolveu sua própria ferramenta de análise de mercado imobiliário
              utilizando <strong className="text-orange-400">Inteligência Artificial Gemini</strong>.
              Geramos análises estratégicas completas que antes levavam semanas para serem produzidas.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/criar">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 h-14 text-lg">
                  Criar Diagnóstico Gratuito
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-zinc-500">
                <Shield className="w-5 h-5" />
                <span>Sem cartão de crédito</span>
              </div>
            </div>
          </motion.div>

          {/* Métricas da RPK */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {METRICS.map((metric, index) => {
              const Icon = metric.icon
              return (
                <Card key={index} className="bg-zinc-900/50 border-zinc-800 hover:border-orange-500/30 transition-colors">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-orange-500" />
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                    <p className="text-zinc-500 text-sm">{metric.label}</p>
                  </CardContent>
                </Card>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Seção IA */}
      <section className="py-20 px-4 bg-gradient-to-b from-zinc-900/50 to-transparent">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="bg-purple-500/20 text-purple-400 mb-4">
                Tecnologia Proprietária
              </Badge>
              <h2 className="text-4xl font-bold text-white mb-6">
                Desenvolvemos nossa própria
                <span className="text-orange-500"> Inteligência Artificial</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-6 leading-relaxed">
                A RPK é <strong className="text-white">pioneira no uso de IA generativa</strong> para o mercado imobiliário brasileiro.
                Criamos ferramentas próprias que utilizam o <strong className="text-orange-400">Google Gemini</strong> para processar
                dados de mercado, identificar concorrentes, analisar públicos e gerar estratégias personalizadas.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Análise em Tempo Real</p>
                    <p className="text-zinc-500 text-sm">Processamento instantâneo de dados de mercado</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Dados Oficiais IBGE</p>
                    <p className="text-zinc-500 text-sm">Integração com bases de dados governamentais</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Mapeamento Automático</p>
                    <p className="text-zinc-500 text-sm">Identificação de concorrentes via web scraping inteligente</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-500/20 to-purple-500/20 rounded-3xl p-8 border border-orange-500/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">Google Gemini</p>
                    <p className="text-zinc-400 text-sm">IA Generativa de última geração</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-zinc-900/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-zinc-300 text-sm font-medium">Processamento</span>
                    </div>
                    <p className="text-white text-2xl font-bold">~2 minutos</p>
                    <p className="text-zinc-500 text-xs">para análise completa</p>
                  </div>
                  <div className="bg-zinc-900/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="w-4 h-4 text-blue-500" />
                      <span className="text-zinc-300 text-sm font-medium">Fontes de Dados</span>
                    </div>
                    <p className="text-white text-2xl font-bold">15+</p>
                    <p className="text-zinc-500 text-xs">bases integradas</p>
                  </div>
                  <div className="bg-zinc-900/80 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4 text-green-500" />
                      <span className="text-zinc-300 text-sm font-medium">Precisão</span>
                    </div>
                    <p className="text-white text-2xl font-bold">95%+</p>
                    <p className="text-zinc-500 text-xs">em identificação de concorrentes</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-orange-500/20 text-orange-400 mb-4">Recursos</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Tudo que você precisa para vender mais
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Um diagnóstico estratégico completo que normalmente levaria semanas para ser produzido,
              gerado automaticamente em minutos com a precisão da IA.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className={`h-full transition-all duration-300 ${
                    feature.highlight
                      ? 'bg-gradient-to-br from-orange-500/10 to-purple-500/10 border-orange-500/30 hover:border-orange-500/50'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}>
                    <CardContent className="p-6">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                        feature.highlight ? 'bg-gradient-to-br from-orange-500 to-purple-500' : 'bg-orange-500/10'
                      }`}>
                        <Icon className={`w-7 h-7 ${feature.highlight ? 'text-white' : 'text-orange-500'}`} />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-zinc-400">{feature.description}</p>
                      {feature.highlight && (
                        <Badge className="mt-4 bg-purple-500/20 text-purple-300">
                          Exclusivo RPK
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* O que está incluído */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="bg-green-500/20 text-green-400 mb-4">Completo</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              O que está incluído no diagnóstico
            </h2>
            <p className="text-zinc-400 text-lg">
              Cada análise gerada inclui todos estes itens
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {INCLUDED.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 hover:border-green-500/30 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-zinc-300">{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Badge className="bg-blue-500/20 text-blue-400 mb-4">Simples</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Como funciona
            </h2>
            <p className="text-zinc-400 text-lg">
              Em apenas 4 passos simples você tem seu diagnóstico
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, title: 'Seus dados', desc: 'Preencha suas informações de contato', icon: Users },
              { step: 2, title: 'Empreendimento', desc: 'Adicione os dados do seu projeto', icon: Building2 },
              { step: 3, title: 'IA processa', desc: 'Gemini analisa o mercado em tempo real', icon: Brain },
              { step: 4, title: 'Diagnóstico pronto', desc: 'Receba sua análise completa', icon: Sparkles },
            ].map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center relative"
                >
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-orange-500/50 to-transparent" />
                  )}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 relative z-10">
                    <Icon className="w-7 h-7" />
                  </div>
                  <p className="text-orange-400 text-sm font-medium mb-1">Passo {item.step}</p>
                  <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-zinc-500 text-sm">{item.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Por que a RPK */}
      <section className="py-20 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="bg-orange-500/20 text-orange-400 mb-4">Experiência</Badge>
            <h2 className="text-4xl font-bold text-white mb-4">
              Por que escolher a RPK?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">8 Anos de Mercado</h3>
                <p className="text-zinc-400">
                  Experiência consolidada atendendo as maiores incorporadoras do Brasil
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">Pioneiros em IA</h3>
                <p className="text-zinc-400">
                  Primeira agência do setor a desenvolver ferramentas próprias com IA generativa
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-white font-bold text-xl mb-3">R$ 700M+ em VGV</h3>
                <p className="text-zinc-400">
                  Valor geral de vendas dos lançamentos que ajudamos a posicionar
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-purple-500/20 border border-orange-500/30 rounded-3xl p-12"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center mx-auto mb-6">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Pronto para criar seu diagnóstico?
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
              Tenha em minutos uma análise estratégica completa do seu empreendimento,
              gerada pela mesma IA que utilizamos para os maiores lançamentos do Brasil.
            </p>
            <Link href="/criar">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 h-14 text-lg">
                Criar Diagnóstico Gratuito
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <p className="text-zinc-500 text-sm mt-4">
              Gratuito • Sem cartão de crédito • Resultado em minutos
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-zinc-800">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-white">RPK</span>
              <span className="text-2xl font-bold text-orange-500">Análise</span>
              <Badge className="bg-zinc-800 text-zinc-400 text-xs">
                Powered by Gemini AI
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-zinc-500 text-sm">
              <span>Pioneiros em IA para o Mercado Imobiliário</span>
            </div>
            <p className="text-zinc-600 text-sm">
              © {new Date().getFullYear()} RPK Agency. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
