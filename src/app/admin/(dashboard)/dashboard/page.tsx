'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  FileText,
  TrendingUp,
  Calendar,
  Building2,
  ExternalLink,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Metricas {
  totalLeads: number
  leadsEstaSemana: number
  totalProjetos: number
  projetosCompletos: number
  taxaConversao: number
  leadsPorStatus: { status: string; count: number }[]
  leadsPorDia: { data: string; count: number }[]
  cidadesMaisAtivas: { cidade: string; count: number }[]
  ultimosLeads: any[]
  ultimosProjetos: any[]
}

const STATUS_COLORS: Record<string, string> = {
  novo: '#f59e0b',
  contatado: '#3b82f6',
  qualificado: '#8b5cf6',
  convertido: '#22c55e',
  perdido: '#ef4444'
}

const STATUS_LABELS: Record<string, string> = {
  novo: 'Novo',
  contatado: 'Contatado',
  qualificado: 'Qualificado',
  convertido: 'Convertido',
  perdido: 'Perdido'
}

export default function DashboardPage() {
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/metricas')
      .then(res => res.json())
      .then(data => {
        setMetricas(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!metricas) {
    return <div className="text-zinc-400">Erro ao carregar métricas</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">Visão geral do seu CRM</p>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Total de Leads</p>
                <p className="text-3xl font-bold text-white mt-1">{metricas.totalLeads}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Leads esta Semana</p>
                <p className="text-3xl font-bold text-white mt-1">{metricas.leadsEstaSemana}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Diagnósticos Gerados</p>
                <p className="text-3xl font-bold text-white mt-1">{metricas.projetosCompletos}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-white mt-1">{metricas.taxaConversao}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads por Status */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Leads por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metricas.leadsPorStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(props: any) => `${STATUS_LABELS[props.name] || props.name}: ${props.value}`}
                  >
                    {metricas.leadsPorStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cidades mais ativas */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Cidades mais Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricas.cidadesMaisAtivas.slice(0, 5)}>
                  <XAxis
                    dataKey="cidade"
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    axisLine={{ stroke: '#3f3f46' }}
                  />
                  <YAxis
                    tick={{ fill: '#71717a' }}
                    axisLine={{ stroke: '#3f3f46' }}
                  />
                  <Tooltip
                    contentStyle={{ background: '#18181b', border: '1px solid #3f3f46' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Listas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Últimos Leads */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Últimos Leads</CardTitle>
            <Link href="/admin/leads" className="text-orange-400 text-sm hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricas.ultimosLeads.map((lead: any) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{lead.nome}</p>
                    <p className="text-zinc-400 text-sm">{lead.empresa}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={`${
                        lead.status === 'novo' ? 'bg-yellow-500/20 text-yellow-400' :
                        lead.status === 'convertido' ? 'bg-green-500/20 text-green-400' :
                        'bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {STATUS_LABELS[lead.status] || lead.status}
                    </Badge>
                    <p className="text-zinc-500 text-xs mt-1">
                      {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              {metricas.ultimosLeads.length === 0 && (
                <p className="text-zinc-500 text-center py-4">Nenhum lead ainda</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Últimos Diagnósticos */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Últimos Diagnósticos</CardTitle>
            <Link href="/admin/projetos" className="text-orange-400 text-sm hover:underline">
              Ver todos
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metricas.ultimosProjetos.map((projeto: any) => {
                const emp = projeto.empreendimento as any
                return (
                  <div
                    key={projeto.id}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{emp?.nome || 'Sem nome'}</p>
                        <p className="text-zinc-400 text-sm">{projeto.lead?.nome}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          projeto.status === 'pronto'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }
                      >
                        {projeto.status === 'pronto' ? 'Pronto' : 'Processando'}
                      </Badge>
                      {projeto.status === 'pronto' && (
                        <Link
                          href={`/analise/${projeto.slug}`}
                          target="_blank"
                          className="text-zinc-400 hover:text-white"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
              {metricas.ultimosProjetos.length === 0 && (
                <p className="text-zinc-500 text-center py-4">Nenhum diagnóstico ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
