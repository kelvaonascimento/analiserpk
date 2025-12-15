'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2, MapPin, Calendar, Users, Target, TrendingUp, Shield,
  AlertTriangle, Lightbulb, CheckCircle2, ChevronRight, ChevronLeft,
  Download, ExternalLink, Sparkles, Award, Cpu, Home, DollarSign,
  AlertCircle, Zap, Clock, BarChart3, Mountain, Briefcase
} from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Empreendimento, Analise, Persona, DadosMercado, Concorrente, PanoramaCompleto } from '@/types'
import LevantamentoMercado from './LevantamentoMercado'

interface LandingPageProps {
  projeto: {
    id: string
    slug: string
    empreendimento: Empreendimento
    mercado?: DadosMercado
    panorama?: PanoramaCompleto
    concorrentes?: Concorrente[]
    analise: Analise
    lead: { nome: string; empresa: string }
  }
}

const COLORS = ['#ff6b35', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#9ca3af', '#d1d5db']

export default function LandingPage({ projeto }: LandingPageProps) {
  const { empreendimento, mercado, panorama, concorrentes = [], analise } = projeto
  const [checklistWeek, setChecklistWeek] = useState(0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Dados para radar chart competitivo
  const radarData = analise.radarCompetitivo?.map(item => ({
    subject: item.dimensao,
    [empreendimento.nome]: item.empreendimento,
    ...(item.concorrente1 !== undefined && item.nomeConcorrente1 ? { [item.nomeConcorrente1]: item.concorrente1 } : {}),
    ...(item.concorrente2 !== undefined && item.nomeConcorrente2 ? { [item.nomeConcorrente2]: item.concorrente2 } : {}),
  })) || []

  // Dados para preço/m² (barchart)
  const priceM2Data = analise.comparativoPrecoM2?.map(item => ({
    location: item.local,
    price: item.precoM2,
    fill: item.destaque ? '#ff6b35' : '#9ca3af',
  })) || []

  // Dados de distribuição de renda (do mercado ou estimado)
  const incomeData = mercado?.distribuicaoRenda?.map((item, i) => ({
    name: item.classe,
    value: item.percentual,
    color: COLORS[i] || COLORS[COLORS.length - 1],
    desc: item.descricao,
  })) || [
    { name: 'Classe E', value: 31.9, color: '#6b7280', desc: 'até 2 SM' },
    { name: 'Classe D', value: 20.8, color: '#9ca3af', desc: '2-4 SM' },
    { name: 'Classe C', value: 33.1, color: '#d1d5db', desc: '4-10 SM' },
    { name: 'Classe B', value: 7.7, color: '#f59e0b', desc: '10-20 SM' },
    { name: 'Classe A', value: 6.5, color: '#ff6b35', desc: '+20 SM' },
  ]

  // Nomes dos concorrentes para o radar
  const concorrenteNomes = analise.radarCompetitivo?.length > 0
    ? [analise.radarCompetitivo[0].nomeConcorrente1, analise.radarCompetitivo[0].nomeConcorrente2].filter(Boolean)
    : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">RPK</span>
              <span className="text-xl font-bold text-orange-500">Analise</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              {['Visao Geral', 'Levantamento', 'Mercado', 'Publico', 'Concorrentes', 'SWOT', 'Personas', 'Estrategia', 'Checklist'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Badge className="bg-orange-500/20 text-orange-400 mb-4">
              Analise Estrategica Completa
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {empreendimento.nome}
            </h1>
            <p className="text-xl text-zinc-400 flex items-center justify-center gap-2 mb-6">
              <MapPin className="w-5 h-5" />
              {empreendimento.endereco.cidade}, {empreendimento.endereco.estado}
            </p>
            <p className="text-lg text-zinc-500 max-w-3xl mx-auto">
              Documento executivo com levantamento de dados demograficos, mapeamento de {concorrentes.length}+ concorrentes,
              analise competitiva profunda, identificacao de publicos-alvo qualificados e estrategias de campanha segmentadas.
            </p>
          </motion.div>

          {/* BENTO GRID - Hero Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Preco */}
            <Card className="md:col-span-2 bg-zinc-900 border-zinc-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-500">PRECO A PARTIR DE</span>
                  <DollarSign className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-4xl md:text-5xl font-black text-white mb-2">
                  {formatCurrency(empreendimento.unidades[0]?.precoMin || 0)}
                </p>
                {empreendimento.percentualVendido > 0 && (
                  <div className="flex items-center gap-2 mt-4">
                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full"
                        style={{ width: `${empreendimento.percentualVendido}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-orange-400">{empreendimento.percentualVendido}% vendido</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preco/m2 */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">PRECO/M2</span>
                  <BarChart3 className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-green-500">
                  {formatCurrency(empreendimento.unidades[0]?.precoM2 || 0)}
                </p>
              </CardContent>
            </Card>

            {/* Lazer */}
            <Card className="bg-orange-600 border-orange-500">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/80">LAZER</span>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {empreendimento.itensLazer?.length || 0}+ itens
                </p>
                <p className="text-sm text-white/80">Conceito Resort</p>
              </CardContent>
            </Card>

            {/* Publico Local - ALERTA */}
            <Card className="bg-red-500/10 border-red-500/30">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-red-400">PUBLICO LOCAL</span>
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-red-400">
                  {analise.publicoQualificado.familiasMin}-{analise.publicoQualificado.familiasMax}
                </p>
                <p className="text-sm text-red-400/80">familias qualificadas</p>
              </CardContent>
            </Card>

            {/* Metragem */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-white">
                  {empreendimento.unidades[0]?.metragem || 0}m2
                </p>
                <p className="text-sm text-zinc-400">Metragem</p>
              </CardContent>
            </Card>

            {/* Entrega */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">ENTREGA</span>
                  <Clock className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {empreendimento.entrega.mes}/{empreendimento.entrega.ano}
                </p>
              </CardContent>
            </Card>

            {/* Concorrentes */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">CONCORRENTES</span>
                  <Target className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-3xl font-bold text-white">{concorrentes.length}+</p>
                <p className="text-sm text-zinc-400">Mapeados</p>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <Card className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Resumo Executivo
              </h3>
              <p className="text-zinc-300">{analise.resumoExecutivo}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Visao Geral */}
      <section id="visao-geral" className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-orange-500" />
            Visao Geral
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Especificacoes */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Especificacoes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-zinc-500 text-sm">Construtora</p>
                    <p className="text-white font-medium">{empreendimento.construtora}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm">Incorporacao</p>
                    <p className="text-white font-medium">{empreendimento.incorporacao?.join(', ') || '-'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm">Torres</p>
                    <p className="text-white font-medium">{empreendimento.especificacoes.torres} torre(s)</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm">Andares</p>
                    <p className="text-white font-medium">{empreendimento.especificacoes.andares} andares</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm">Unidades</p>
                    <p className="text-white font-medium">{empreendimento.especificacoes.unidadesTotal} unidades</p>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm">Elevadores</p>
                    <p className="text-white font-medium">{empreendimento.especificacoes.elevadores}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart Competitivo */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Analise Competitiva</CardTitle>
                <CardDescription className="text-zinc-400">
                  {empreendimento.nome} vs Concorrentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={empreendimento.nome}
                      dataKey={empreendimento.nome}
                      stroke="#ff6b35"
                      fill="#ff6b35"
                      fillOpacity={0.3}
                    />
                    {concorrenteNomes[0] && (
                      <Radar
                        name={concorrenteNomes[0]}
                        dataKey={concorrenteNomes[0]}
                        stroke="#f59e0b"
                        fill="#f59e0b"
                        fillOpacity={0.2}
                      />
                    )}
                    {concorrenteNomes[1] && (
                      <Radar
                        name={concorrenteNomes[1]}
                        dataKey={concorrenteNomes[1]}
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                      />
                    )}
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Vantagens Competitivas */}
          {analise.vantagensCompetitivas && analise.vantagensCompetitivas.length > 0 && (
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              {analise.vantagensCompetitivas.map((vantagem, index) => (
                <Card key={index} className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                      {vantagem.icone === 'pioneirismo' && <Award className="w-6 h-6 text-orange-500" />}
                      {vantagem.icone === 'preco' && <DollarSign className="w-6 h-6 text-orange-500" />}
                      {vantagem.icone === 'lazer' && <Sparkles className="w-6 h-6 text-orange-500" />}
                      {vantagem.icone === 'localizacao' && <MapPin className="w-6 h-6 text-orange-500" />}
                      {vantagem.icone === 'tecnologia' && <Cpu className="w-6 h-6 text-orange-500" />}
                      {vantagem.icone === 'sustentabilidade' && <Lightbulb className="w-6 h-6 text-orange-500" />}
                    </div>
                    <h4 className="font-bold text-white mb-1">{vantagem.titulo}</h4>
                    <p className="text-sm text-zinc-400">{vantagem.descricao}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Itens de Lazer */}
          <Card className="bg-zinc-900/50 border-zinc-800 mt-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Itens de Lazer ({empreendimento.itensLazer?.length || 0} itens)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {empreendimento.itensLazer?.map((item, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="border-orange-500/30 text-orange-400"
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Levantamento de Mercado (Panorama Completo) */}
      {panorama && (
        <LevantamentoMercado panorama={panorama} />
      )}

      {/* Mercado */}
      <section id="mercado" className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-500" />
            Analise de Mercado
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Distribuicao de Renda */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Distribuicao de Renda</CardTitle>
                <CardDescription className="text-zinc-400">Populacao por classe social</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={incomeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {incomeData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      formatter={(value: any) => [`${value}%`, 'Participacao']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {incomeData.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-zinc-400">{item.name} {item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comparativo Preco/m2 */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Comparativo Preco/m2</CardTitle>
                <CardDescription className="text-zinc-400">vs Concorrentes e Regiao</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={priceM2Data} layout="vertical">
                    <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `R$ ${(v/1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="location" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                      formatter={(value: number) => [formatCurrency(value), 'Preco/m2']}
                    />
                    <Bar dataKey="price" radius={[0, 4, 4, 0]}>
                      {priceM2Data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alertas e Oportunidades */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Alertas */}
            <Card className="bg-red-500/5 border-red-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <CardTitle className="text-red-400">Alertas de Mercado</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analise.alertasMercado?.map((alerta, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alerta.tipo === 'critico' ? 'bg-red-500' :
                        alerta.tipo === 'atencao' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <span className="text-sm text-zinc-300">{alerta.texto}</span>
                        {alerta.valor && (
                          <span className="ml-2 text-sm font-bold text-red-400">{alerta.valor}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Oportunidades */}
            <Card className="bg-green-500/5 border-green-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <CardTitle className="text-green-400">Oportunidades</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analise.oportunidadesMercado?.map((opp, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${opp.destaque ? 'bg-green-500' : 'bg-green-700'}`} />
                      <span className={`text-sm ${opp.destaque ? 'text-white font-medium' : 'text-zinc-400'}`}>
                        {opp.texto}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Publico-Alvo */}
      <section id="publico" className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            Publico-Alvo
          </h2>

          {/* Alerta Critico */}
          <Card className="bg-red-500/10 border-red-500/30 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-red-400 mb-3">
                    Mercado Local Insuficiente
                  </h3>
                  <p className="text-lg text-zinc-300 mb-4">
                    Renda necessaria: <strong className="text-white">{formatCurrency(analise.publicoQualificado.rendaNecessariaMin)}-{formatCurrency(analise.publicoQualificado.rendaNecessariaMax)}/mes</strong>.
                    Apenas <strong className="text-red-400">{analise.publicoQualificado.familiasMin}-{analise.publicoQualificado.familiasMax} familias</strong> locais qualificam.
                    Entrada <strong className="text-white">{formatCurrency(analise.publicoQualificado.entradaMinima)}</strong> (20%) + parcela ~<strong className="text-white">{formatCurrency(analise.publicoQualificado.parcelaMensal)}/mes</strong>.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-red-400">{analise.publicoQualificado.familiasMin}-{analise.publicoQualificado.familiasMax}</p>
                      <p className="text-xs text-zinc-400 mt-1">Familias locais</p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-white">{formatCurrency(analise.publicoQualificado.entradaMinima)}</p>
                      <p className="text-xs text-zinc-400 mt-1">Entrada</p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-orange-400">~{formatCurrency(analise.publicoQualificado.parcelaMensal)}</p>
                      <p className="text-xs text-zinc-400 mt-1">Parcela/mes</p>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-zinc-300">{analise.publicoQualificado.percentualPopulacao}%</p>
                      <p className="text-xs text-zinc-400 mt-1">da Populacao</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solucao */}
          <Card className="bg-orange-500/10 border-orange-500/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-orange-400 mb-3">
                    Expansao Geografica Obrigatoria
                  </h3>
                  <p className="text-lg text-zinc-300 mb-6">
                    <strong className="text-white">Regiao Metropolitana = solucao.</strong> Foco em familias de classe A/B que buscam qualidade de vida com preco acessivel.
                  </p>

                  {/* Personas Mini Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                      <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                        <Briefcase className="w-5 h-5 text-orange-500" />
                      </div>
                      <h4 className="font-bold text-white mb-2">Executivo Regional</h4>
                      <ul className="space-y-1">
                        <li className="text-xs text-zinc-400">Trabalha na regiao</li>
                        <li className="text-xs text-zinc-400">R$18k-35k/mes</li>
                        <li className="text-xs text-zinc-400">Busca upgrade</li>
                      </ul>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                      <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                        <Mountain className="w-5 h-5 text-green-500" />
                      </div>
                      <h4 className="font-bold text-white mb-2">Lifestyle Migrator</h4>
                      <ul className="space-y-1">
                        <li className="text-xs text-zinc-400">Mora na capital</li>
                        <li className="text-xs text-zinc-400">Remote work</li>
                        <li className="text-xs text-zinc-400">Busca qualidade</li>
                      </ul>
                    </div>
                    <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                      </div>
                      <h4 className="font-bold text-white mb-2">Investidor</h4>
                      <ul className="space-y-1">
                        <li className="text-xs text-zinc-400">Valorizacao</li>
                        <li className="text-xs text-zinc-400">Pioneirismo</li>
                        <li className="text-xs text-zinc-400">Diversificacao</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Concorrentes */}
      {concorrentes && concorrentes.length > 0 && (
        <section id="concorrentes" className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <Target className="w-8 h-8 text-orange-500" />
              Concorrentes ({concorrentes.length})
            </h2>

            {/* Tabela de Concorrentes */}
            <Card className="bg-zinc-900/50 border-zinc-800 mb-8 overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-800/50">
                        <th className="text-left py-4 px-4 text-sm font-bold text-zinc-400">Empreendimento</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-zinc-400">Construtora</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-zinc-400">Cidade</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-zinc-400">Area</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-zinc-400">Preco</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-zinc-400">Preco/m2</th>
                        <th className="text-left py-4 px-4 text-sm font-bold text-zinc-400">Entrega</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Empreendimento Principal */}
                      <tr className="border-b border-orange-500/30 bg-orange-500/10">
                        <td className="py-4 px-4 font-bold text-orange-400">{empreendimento.nome}</td>
                        <td className="py-4 px-4 text-orange-400">{empreendimento.construtora}</td>
                        <td className="py-4 px-4 text-white">{empreendimento.endereco.cidade}</td>
                        <td className="py-4 px-4 font-bold text-white">{empreendimento.unidades[0]?.metragem}m2</td>
                        <td className="py-4 px-4 font-bold text-white">{formatCurrency(empreendimento.unidades[0]?.precoMin || 0)}</td>
                        <td className="py-4 px-4 font-bold text-orange-400">{formatCurrency(empreendimento.unidades[0]?.precoM2 || 0)}</td>
                        <td className="py-4 px-4 text-white">{empreendimento.entrega.mes}/{empreendimento.entrega.ano}</td>
                      </tr>
                      {/* Concorrentes */}
                      {concorrentes.map((c, i) => (
                        <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                          <td className="py-4 px-4">
                            {c.link ? (
                              <a href={c.link} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-orange-400 flex items-center gap-1">
                                {c.nome}
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-zinc-300">{c.nome}</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-zinc-400 text-sm">{c.construtora}</td>
                          <td className="py-4 px-4 text-zinc-400 text-sm">{c.cidade}</td>
                          <td className="py-4 px-4 text-zinc-300">
                            {c.metragemMin ? `${c.metragemMin}${c.metragemMax ? `-${c.metragemMax}` : ''}m2` : '-'}
                          </td>
                          <td className="py-4 px-4 text-zinc-300">
                            {c.precoMin ? formatCurrency(c.precoMin) : '-'}
                          </td>
                          <td className="py-4 px-4 text-zinc-300">
                            {c.precoM2 ? formatCurrency(c.precoM2) : '-'}
                          </td>
                          <td className="py-4 px-4 text-zinc-400">{c.entrega?.ano || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-zinc-800/30 border-t border-zinc-800">
                  <p className="text-sm text-zinc-400">
                    <strong className="text-orange-400">{concorrentes.length} empreendimentos</strong> mapeados na regiao
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* SWOT */}
      <section id="swot" className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Shield className="w-8 h-8 text-orange-500" />
            Analise SWOT
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Forcas */}
            <Card className="bg-green-500/5 border-green-500/30">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Forcas ({analise.swot.forcas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analise.swot.forcas.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <CheckCircle2 className={`w-4 h-4 mt-1 flex-shrink-0 ${item.critico ? 'text-green-400' : 'text-green-600'}`} />
                    <span className={`text-sm ${item.critico ? 'text-white font-medium' : 'text-zinc-400'}`}>
                      {item.texto}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Fraquezas */}
            <Card className="bg-red-500/5 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Fraquezas ({analise.swot.fraquezas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analise.swot.fraquezas.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-1 flex-shrink-0 ${item.critico ? 'text-red-400' : 'text-red-600'}`} />
                    <span className={`text-sm ${item.critico ? 'text-white font-medium' : 'text-zinc-400'}`}>
                      {item.texto}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Oportunidades */}
            <Card className="bg-blue-500/5 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Oportunidades ({analise.swot.oportunidades.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analise.swot.oportunidades.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Lightbulb className={`w-4 h-4 mt-1 flex-shrink-0 ${item.chave ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm ${item.chave ? 'text-white font-medium' : 'text-zinc-400'}`}>
                      {item.texto}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Ameacas */}
            <Card className="bg-yellow-500/5 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Ameacas ({analise.swot.ameacas.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analise.swot.ameacas.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className={`w-4 h-4 mt-1 flex-shrink-0 ${item.grave ? 'text-yellow-400' : 'text-yellow-600'}`} />
                    <span className={`text-sm ${item.grave ? 'text-white font-medium' : 'text-zinc-400'}`}>
                      {item.texto}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Acoes Estrategicas */}
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            {analise.swot.acoesEstrategicas.map((grupo, index) => (
              <Card key={index} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base">
                    {grupo.categoria === 'explorar_forcas_oportunidades'
                      ? 'Explorar Forcas + Oportunidades'
                      : 'Mitigar Fraquezas + Ameacas'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {grupo.acoes.map((acao, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 mt-1 text-orange-500 flex-shrink-0" />
                      <span className="text-sm text-zinc-300">{acao}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Personas */}
      <section id="personas" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Users className="w-8 h-8 text-orange-500" />
            Personas Detalhadas
          </h2>

          <Tabs defaultValue="0" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-800">
              {analise.personas.map((persona, index) => (
                <TabsTrigger key={index} value={index.toString()} className="data-[state=active]:bg-orange-500">
                  {persona.nome.split(' ')[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {analise.personas.map((persona, index) => (
              <TabsContent key={index} value={index.toString()} className="mt-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Users className="w-8 h-8 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{persona.nome}, {persona.idade} anos</CardTitle>
                        <CardDescription className="text-orange-400">{persona.titulo}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Demografia */}
                    <div>
                      <h4 className="text-white font-medium mb-3">Demografia</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-500 text-xs">Renda</p>
                          <p className="text-zinc-300">
                            {formatCurrency(persona.demografia.rendaMin)}-{formatCurrency(persona.demografia.rendaMax)}/mes
                          </p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-500 text-xs">Familia</p>
                          <p className="text-zinc-300">{persona.demografia.familia}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-500 text-xs">Trabalho</p>
                          <p className="text-zinc-300">{persona.demografia.trabalho}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-500 text-xs">Moradia atual</p>
                          <p className="text-zinc-300">{persona.demografia.localizacaoAtual}</p>
                        </div>
                      </div>
                    </div>

                    {/* Dores e Desejos */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-red-400 font-medium mb-3">Dores e Frustracoes</h4>
                        <ul className="space-y-2">
                          {persona.dores.map((dor, i) => (
                            <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                              <span className="text-red-400 mt-1">-</span> {dor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-green-400 font-medium mb-3">Desejos e Objetivos</h4>
                        <ul className="space-y-2">
                          {persona.desejos.map((desejo, i) => (
                            <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                              <span className="text-green-400 mt-1">+</span> {desejo}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Comportamento de Compra */}
                    <div>
                      <h4 className="text-blue-400 font-medium mb-3">Comportamento de Compra</h4>
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-500 text-xs mb-1">Canais de Pesquisa</p>
                          <p className="text-zinc-300">{persona.comportamentoCompra.canaisPesquisa.slice(0, 3).join(', ')}</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-500 text-xs mb-1">Tempo de Decisao</p>
                          <p className="text-zinc-300">{persona.comportamentoCompra.tempoDecisaoMesesMin}-{persona.comportamentoCompra.tempoDecisaoMesesMax} meses</p>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-3">
                          <p className="text-zinc-500 text-xs mb-1">Influenciadores</p>
                          <p className="text-zinc-300">{persona.comportamentoCompra.influenciadores.slice(0, 2).join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chamadas Publicitarias */}
                    <div>
                      <h4 className="text-orange-400 font-medium mb-3">Chamadas Publicitarias</h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {persona.chamadasPublicitarias.map((chamada, i) => (
                          <div key={i} className="bg-zinc-800/50 rounded-lg p-3">
                            <p className="text-white text-sm font-medium mb-1">"{chamada.headline}"</p>
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                              {chamada.formato}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Estrategia */}
      <section id="estrategia" className="py-16 px-4 bg-zinc-900/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Target className="w-8 h-8 text-orange-500" />
            Estrategia de Marketing
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* KPIs */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">KPIs Recomendados</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                {analise.estrategia.kpis.map((kpi, index) => (
                  <div key={index} className="text-center p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-orange-400 font-bold">{kpi.alvo}</p>
                    <p className="text-zinc-400 text-sm">{kpi.metrica}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Budget */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Budget Sugerido</CardTitle>
                <CardDescription>
                  Total: {formatCurrency(analise.estrategia.budgetSugerido.totalMensal)}/mes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analise.estrategia.budgetSugerido.alocacao.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">{item.tipo}</span>
                      <span className="text-white">{formatCurrency(item.valor)} ({item.percentual}%)</span>
                    </div>
                    <Progress value={item.percentual} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Fases */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">Fases de Implementacao</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {analise.estrategia.fases.map((fase, index) => (
                <Card key={index} className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-orange-500/20 text-orange-400 mb-2">
                      Semanas {fase.semanas}
                    </Badge>
                    <CardTitle className="text-white text-base">{fase.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {fase.tarefas.map((tarefa, i) => (
                        <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                          <ChevronRight className="w-3 h-3 mt-1 text-orange-500" />
                          {tarefa}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Checklist */}
      <section id="checklist" className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-orange-500" />
            Checklist de Implementacao ({analise.checklist.timelineTotalSemanas} semanas)
          </h2>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChecklistWeek(Math.max(0, checklistWeek - 1))}
              disabled={checklistWeek === 0}
              className="border-zinc-700"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <div className="flex gap-2">
              {analise.checklist.sprints.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setChecklistWeek(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    checklistWeek === index ? 'bg-orange-500' : 'bg-zinc-700'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setChecklistWeek(Math.min(analise.checklist.sprints.length - 1, checklistWeek + 1))}
              disabled={checklistWeek === analise.checklist.sprints.length - 1}
              className="border-zinc-700"
            >
              Proximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Sprint atual */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <Badge className="w-fit bg-orange-500/20 text-orange-400 mb-2">
                Semanas {analise.checklist.sprints[checklistWeek].semanas}
              </Badge>
              <CardTitle className="text-white">
                {analise.checklist.sprints[checklistWeek].titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {analise.checklist.sprints[checklistWeek].tarefas.map((tarefa, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-zinc-600" />
                    <div className="flex-1">
                      <p className="text-zinc-300 text-sm">{tarefa.item}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        tarefa.tipo === 'audit' ? 'border-blue-500/30 text-blue-400' :
                        tarefa.tipo === 'strategy' ? 'border-purple-500/30 text-purple-400' :
                        tarefa.tipo === 'creative' ? 'border-pink-500/30 text-pink-400' :
                        tarefa.tipo === 'execution' ? 'border-orange-500/30 text-orange-400' :
                        tarefa.tipo === 'analysis' ? 'border-green-500/30 text-green-400' :
                        tarefa.tipo === 'optimization' ? 'border-yellow-500/30 text-yellow-400' :
                        'border-zinc-500/30 text-zinc-400'
                      }`}
                    >
                      {tarefa.tipo}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-zinc-800">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="mb-6">
            <span className="text-2xl font-bold text-white">RPK</span>
            <span className="text-2xl font-bold text-orange-500"> Analise</span>
          </div>
          <p className="text-zinc-500 text-sm mb-4">
            Analise gerada por RPK Agency - Dados de mercado: IBGE, CAGED, BCB
          </p>
          <p className="text-zinc-600 text-xs">
            {new Date().getFullYear()} RPK Agency. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
