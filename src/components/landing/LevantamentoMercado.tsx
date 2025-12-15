'use client'

import { motion } from 'framer-motion'
import {
  Users, Building2, TrendingUp, TrendingDown, DollarSign, Briefcase,
  Home, Factory, PiggyBank, Car, CreditCard, AlertTriangle, CheckCircle2,
  ChevronRight, Download, BarChart3, PieChartIcon, Activity
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, Area, AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PanoramaCompleto } from '@/types'

interface LevantamentoMercadoProps {
  panorama: PanoramaCompleto
}

const COLORS = ['#ff6b35', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

export default function LevantamentoMercado({ panorama }: LevantamentoMercadoProps) {
  const { perfilEconomico, emprego, empresas, mei, pix, panoramaImobiliario, bancario, vulnerabilidade, frota, rendimentos } = panorama

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value)
  }

  // Dados para gráficos
  const classesSociaisData = perfilEconomico.distribuicaoRenda.classes.map((c, i) => ({
    name: `Classe ${c.classe}`,
    value: c.percentual,
    color: COLORS[i] || COLORS[COLORS.length - 1],
    descricao: c.descricao
  }))

  const pibComposicaoData = perfilEconomico.pib.composicao.map((c, i) => ({
    name: c.setor,
    value: c.percentual,
    color: COLORS[i] || COLORS[COLORS.length - 1]
  }))

  const domiciliosTipoData = [
    { name: 'Casas', value: panoramaImobiliario.domicilios.residenciasPorTipo.casas.quantidade, color: '#ff6b35' },
    { name: 'Apartamentos', value: panoramaImobiliario.domicilios.residenciasPorTipo.apartamentos.quantidade, color: '#3b82f6' },
    { name: 'Condomínios', value: panoramaImobiliario.domicilios.residenciasPorTipo.condominios.quantidade, color: '#10b981' },
  ]

  return (
    <section id="levantamento" className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-orange-500/20 text-orange-400 mb-4">
            Dados Automatizados em Tempo Real
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Levantamento de Mercado
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Dados oficiais de {panorama.cidade}, {panorama.estado} atualizados automaticamente via IBGE, CAGED, Banco Central e outras fontes oficiais.
          </p>
        </motion.div>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-zinc-800 mb-8">
            <TabsTrigger value="perfil" className="data-[state=active]:bg-orange-500">
              Perfil Economico
            </TabsTrigger>
            <TabsTrigger value="panorama" className="data-[state=active]:bg-orange-500">
              Panorama Atual
            </TabsTrigger>
            <TabsTrigger value="imobiliario" className="data-[state=active]:bg-orange-500">
              Mercado Imobiliario
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PERFIL ECONOMICO */}
          <TabsContent value="perfil" className="space-y-6">
            {/* Cards principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(perfilEconomico.populacao.total)}
                  </p>
                  <p className="text-sm text-zinc-400">Populacao</p>
                  <Badge className={`mt-2 ${perfilEconomico.populacao.variacao5Anos >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {perfilEconomico.populacao.variacao5Anos >= 0 ? '+' : ''}{perfilEconomico.populacao.variacao5Anos}% (5 anos)
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    R$ {perfilEconomico.pib.total}bi
                  </p>
                  <p className="text-sm text-zinc-400">PIB Total</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400">
                    +{perfilEconomico.pib.crescimento5Anos}% (5 anos)
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(perfilEconomico.pib.perCapita)}
                  </p>
                  <p className="text-sm text-zinc-400">PIB Per Capita</p>
                  <p className="text-xs text-zinc-500 mt-2">#{perfilEconomico.pib.ranking} no estado</p>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <Briefcase className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(perfilEconomico.salario.medio)}
                  </p>
                  <p className="text-sm text-zinc-400">Salario Medio</p>
                  <Badge className="mt-2 bg-green-500/20 text-green-400">
                    +{perfilEconomico.salario.variacao12Meses}% (12m)
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Graficos */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Distribuicao de Renda */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-orange-500" />
                    Distribuicao por Classe Social
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    Indice de Gini: {perfilEconomico.distribuicaoRenda.gini}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={classesSociaisData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {classesSociaisData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        formatter={(value: number) => [`${value}%`, 'Participacao']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {classesSociaisData.map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-zinc-400">{item.name}: {item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Composicao PIB */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-orange-500" />
                    Composicao do PIB
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Por setor economico</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={pibComposicaoData} layout="vertical">
                      <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={80} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        formatter={(value: number) => [`${value}%`, 'Participacao']}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {pibComposicaoData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-400">
                      <strong className="text-white">{formatNumber(perfilEconomico.empregosFormais)}</strong> empregos formais na cidade
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes Classes Sociais */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Detalhamento por Classe Social</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  {perfilEconomico.distribuicaoRenda.classes.map((classe, i) => (
                    <div key={i} className="p-4 bg-zinc-800/50 rounded-lg text-center">
                      <div
                        className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: COLORS[i] || COLORS[0] }}
                      >
                        {classe.classe}
                      </div>
                      <p className="text-2xl font-bold text-white">{classe.percentual}%</p>
                      <p className="text-xs text-zinc-400 mt-1">{classe.descricao}</p>
                      <p className="text-xs text-zinc-500 mt-1">{classe.faixaSalariosMinimos}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: PANORAMA ATUAL */}
          <TabsContent value="panorama" className="space-y-6">
            {/* Cards de destaque */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className={`border ${emprego.saldo >= 0 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <CardContent className="p-4 text-center">
                  <Briefcase className={`w-6 h-6 mx-auto mb-2 ${emprego.saldo >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <p className={`text-3xl font-bold ${emprego.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {emprego.saldo >= 0 ? '+' : ''}{formatNumber(emprego.saldo)}
                  </p>
                  <p className="text-sm text-zinc-400">Saldo Empregos</p>
                  <p className="text-xs text-zinc-500 mt-1">{emprego.periodo}</p>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <Building2 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-400">
                    +{formatNumber(empresas.crescimentoAno)}
                  </p>
                  <p className="text-sm text-zinc-400">Novas Empresas</p>
                  <p className="text-xs text-zinc-500 mt-1">No ano</p>
                </CardContent>
              </Card>

              <Card className="bg-purple-500/10 border-purple-500/30">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-purple-400">
                    {formatNumber(mei.totalMEIs)}
                  </p>
                  <p className="text-sm text-zinc-400">MEIs Ativos</p>
                  <p className="text-xs text-zinc-500 mt-1">{mei.taxaPorMilHabitantes}/mil hab</p>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="p-4 text-center">
                  <CreditCard className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-orange-400">
                    R$ {pix.volumeMensal}M
                  </p>
                  <p className="text-sm text-zinc-400">PIX/mes</p>
                  <Badge className="mt-1 bg-green-500/20 text-green-400 text-xs">
                    +{pix.crescimentoAno}% ano
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Detalhes Emprego e Empresas */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Setores de Emprego */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-orange-500" />
                    Setores de Destaque - Emprego
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-green-400 font-medium mb-2">Top Geradores</p>
                    {emprego.setoresPositivos.slice(0, 4).map((setor, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-green-500/10 rounded-lg">
                        <span className="text-sm text-zinc-300">{setor.setor}</span>
                        <Badge className="bg-green-500/20 text-green-400">+{setor.saldo}</Badge>
                      </div>
                    ))}
                    <p className="text-sm text-red-400 font-medium mt-4 mb-2">Maiores Perdas</p>
                    {emprego.setoresNegativos.slice(0, 3).map((setor, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-red-500/10 rounded-lg">
                        <span className="text-sm text-zinc-300">{setor.setor}</span>
                        <Badge className="bg-red-500/20 text-red-400">{setor.saldo}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Indicadores Financeiros */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PiggyBank className="w-5 h-5 text-orange-500" />
                    Indicadores Financeiros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Variacao Poupanca (ano)</span>
                      <span className={bancario.variacaoPoupanca >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {bancario.variacaoPoupanca >= 0 ? '+' : ''}{bancario.variacaoPoupanca}%
                      </span>
                    </div>
                    <Progress value={Math.min(Math.abs(bancario.variacaoPoupanca), 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Variacao Credito (ano)</span>
                      <span className={bancario.variacaoCredito >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {bancario.variacaoCredito >= 0 ? '+' : ''}{bancario.variacaoCredito}%
                      </span>
                    </div>
                    <Progress value={Math.min(Math.abs(bancario.variacaoCredito), 100)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-zinc-400">Financiamento Imobiliario</span>
                      <span className={bancario.variacaoFinanciamentoImob >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {bancario.variacaoFinanciamentoImob >= 0 ? '+' : ''}{bancario.variacaoFinanciamentoImob}%
                      </span>
                    </div>
                    <Progress value={Math.min(Math.abs(bancario.variacaoFinanciamentoImob) * 10, 100)} className="h-2" />
                  </div>
                  <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg">
                    <p className="text-xs text-zinc-400">{bancario.analise}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Indicadores Sociais */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Vulnerabilidade</p>
                      <p className="text-xs text-zinc-400">CadUnico</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Familias cadastradas</span>
                      <span className="text-white">{formatNumber(vulnerabilidade.familiasCadUnico)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Em pobreza</span>
                      <span className="text-yellow-400">{vulnerabilidade.percentualPobreza}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Extrema pobreza</span>
                      <span className="text-red-400">{vulnerabilidade.percentualExtremPobreza}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Car className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Frota de Veiculos</p>
                      <p className="text-xs text-zinc-400">DENATRAN</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Total</span>
                      <span className="text-white">{formatNumber(frota.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Carros</span>
                      <span className="text-white">{frota.percentualCarros}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Veiculos/habitante</span>
                      <span className="text-white">{frota.taxaPerCapita}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Imposto de Renda</p>
                      <p className="text-xs text-zinc-400">Receita Federal</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Declarantes</span>
                      <span className="text-white">{formatNumber(rendimentos.declarantesIR)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">% da populacao</span>
                      <span className="text-white">{rendimentos.percentualPopulacao}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-400">Rend. tributaveis</span>
                      <span className="text-white">R$ {rendimentos.rendimentosTributaveis}M</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 3: MERCADO IMOBILIARIO */}
          <TabsContent value="imobiliario" className="space-y-6">
            {/* Cards principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-4 text-center">
                  <Home className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-white">
                    {formatNumber(panoramaImobiliario.domicilios.total)}
                  </p>
                  <p className="text-sm text-zinc-400">Domicilios</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {panoramaImobiliario.domicilios.mediaHabitantesPorDomicilio} hab/dom
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-orange-400">
                    {formatCurrency(panoramaImobiliario.precoM2Medio)}
                  </p>
                  <p className="text-sm text-zinc-400">Preco/m2 Medio</p>
                  <Badge className={`mt-1 ${panoramaImobiliario.variacao12Meses >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {panoramaImobiliario.variacao12Meses >= 0 ? '+' : ''}{panoramaImobiliario.variacao12Meses}% (12m)
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/10 border-blue-500/30">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-400">
                    {formatCurrency(panoramaImobiliario.precoM2Lancamentos)}
                  </p>
                  <p className="text-sm text-zinc-400">Lancamentos/m2</p>
                  <p className="text-xs text-zinc-500 mt-1">Imoveis novos</p>
                </CardContent>
              </Card>

              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="p-4 text-center">
                  <Factory className="w-6 h-6 text-green-500 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-400">
                    {formatNumber(panoramaImobiliario.construcao.edificacoesEmConstrucao)}
                  </p>
                  <p className="text-sm text-zinc-400">Em Construcao</p>
                  <Badge className="mt-1 bg-green-500/20 text-green-400">
                    +{panoramaImobiliario.construcao.crescimentoAno}% ano
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Graficos */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tipos de Domicilio */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Home className="w-5 h-5 text-orange-500" />
                    Tipos de Domicilio
                  </CardTitle>
                  <CardDescription className="text-zinc-400">Distribuicao por tipo de moradia</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={domiciliosTipoData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {domiciliosTipoData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        formatter={(value: number) => [formatNumber(value), 'Unidades']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                      <p className="text-lg font-bold text-orange-400">
                        {formatNumber(panoramaImobiliario.domicilios.residenciasPorTipo.casas.moradores)}
                      </p>
                      <p className="text-xs text-zinc-400">Moradores em Casas</p>
                    </div>
                    <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                      <p className="text-lg font-bold text-blue-400">
                        {formatNumber(panoramaImobiliario.domicilios.residenciasPorTipo.apartamentos.moradores)}
                      </p>
                      <p className="text-xs text-zinc-400">Em Apartamentos</p>
                    </div>
                    <div className="text-center p-2 bg-zinc-800/50 rounded-lg">
                      <p className="text-lg font-bold text-green-400">
                        {formatNumber(panoramaImobiliario.domicilios.residenciasPorTipo.condominios.moradores)}
                      </p>
                      <p className="text-xs text-zinc-400">Em Condominios</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Comercio Imobiliario */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-500" />
                    Comercio Imobiliario
                  </CardTitle>
                  <CardDescription className="text-zinc-400">
                    {panoramaImobiliario.comercio.taxaPorMilHabitantes} transacoes/mil hab
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">
                        {formatNumber(panoramaImobiliario.comercio.transacoesMes)}
                      </p>
                      <p className="text-xs text-zinc-400">Transacoes/mes</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(panoramaImobiliario.comercio.valorMedioTransacao)}
                      </p>
                      <p className="text-xs text-zinc-400">Valor medio</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 mb-2">Tipo de Transacao</p>
                    {panoramaImobiliario.comercio.tipoTransacoes.map((tipo, i) => (
                      <div key={i} className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-300">{tipo.tipo}</span>
                          <span className="text-white">{tipo.percentual}%</span>
                        </div>
                        <Progress value={tipo.percentual} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Urbanizacao */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Urbanizacao</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{panoramaImobiliario.urbanizacao.areaUrbana} km2</p>
                    <p className="text-xs text-zinc-400">Area Urbana</p>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{panoramaImobiliario.urbanizacao.areaDensamenteUrbanizada}%</p>
                    <p className="text-xs text-zinc-400">Densamente Urbanizada</p>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-white">{panoramaImobiliario.urbanizacao.percentualUrbanizado}%</p>
                    <p className="text-xs text-zinc-400">Taxa Urbanizacao</p>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-400">+{panoramaImobiliario.urbanizacao.crescimentoAreaUrbana5Anos}%</p>
                    <p className="text-xs text-zinc-400">Crescimento (5 anos)</p>
                  </div>
                </div>
                {panoramaImobiliario.urbanizacao.zoneamento && panoramaImobiliario.urbanizacao.zoneamento.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-zinc-400 mb-2">Zoneamento</p>
                    <div className="grid grid-cols-3 gap-2">
                      {panoramaImobiliario.urbanizacao.zoneamento.map((zona, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/30 rounded">
                          <span className="text-sm text-zinc-300">{zona.zona}</span>
                          <span className="text-sm text-white">{zona.percentual}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Fontes */}
        <Card className="bg-zinc-900/30 border-zinc-800 mt-8">
          <CardContent className="p-4">
            <p className="text-xs text-zinc-500">
              <strong className="text-zinc-400">Fontes:</strong> {panorama.fontes.slice(0, 8).join(' | ')}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Dados gerados automaticamente em {panorama.dataGeracao}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
