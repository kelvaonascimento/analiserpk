'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Search,
  ExternalLink,
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  TrendingUp,
  Target
} from 'lucide-react'
import {
  getOrigemLabel,
  getOrigemCor,
  getAbordagemLabel,
  getAbordagemCor,
  getPersonaLabel,
  getPersonaCor,
  ORIGENS,
  ABORDAGENS
} from '@/lib/constants'

interface Lead {
  id: string
  nome: string
  email: string
  whatsapp: string
  empresa: string
  cargo: string
  cidadeEmpreendimento: string
  numeroFuncionarios: string
  status: string
  origem: string
  abordagem: string | null
  persona: string | null
  landingPage: string | null
  ebookBaixado: boolean
  criadoEm: string
  projetos: { id: string; slug: string; status: string }[]
}

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'convertido', label: 'Convertido' },
  { value: 'perdido', label: 'Perdido' },
]

const STATUS_COLORS: Record<string, string> = {
  novo: 'bg-yellow-500/20 text-yellow-400',
  contatado: 'bg-blue-500/20 text-blue-400',
  qualificado: 'bg-purple-500/20 text-purple-400',
  convertido: 'bg-green-500/20 text-green-400',
  perdido: 'bg-red-500/20 text-red-400',
}

export default function LeadsPage() {
  const router = useRouter()
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [origemFiltro, setOrigemFiltro] = useState('todos')
  const [abordagemFiltro, setAbordagemFiltro] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [contagemPorOrigem, setContagemPorOrigem] = useState<Record<string, number>>({})

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(statusFiltro !== 'todos' && { status: statusFiltro }),
        ...(origemFiltro !== 'todos' && { origem: origemFiltro }),
        ...(abordagemFiltro !== 'todos' && { abordagem: abordagemFiltro }),
        ...(busca && { busca })
      })

      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()

      setLeads(data.leads || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
      setContagemPorOrigem(data.contagemPorOrigem || {})
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [page, statusFiltro, origemFiltro, abordagemFiltro])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLeads()
  }

  const formatWhatsApp = (numero: string) => {
    const limpo = numero.replace(/\D/g, '')
    return `https://wa.me/55${limpo}`
  }

  // Calcular métricas
  const totalDiagnostico = contagemPorOrigem['diagnostico'] || 0
  const totalLPs = (contagemPorOrigem['lp-racional'] || 0) +
                   (contagemPorOrigem['lp-emocional'] || 0) +
                   (contagemPorOrigem['lp-urgencia'] || 0)
  const totalEbook = contagemPorOrigem['lp-ebook'] || 0
  const totalOrganico = contagemPorOrigem['organico'] || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-zinc-400">{total} leads cadastrados</p>
        </div>
      </div>

      {/* Cards de Métricas por Origem */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Target className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalDiagnostico}</p>
                <p className="text-xs text-zinc-500">Diagnóstico</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalLPs}</p>
                <p className="text-xs text-zinc-500">Landing Pages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <BookOpen className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalEbook}</p>
                <p className="text-xs text-zinc-500">Ebook</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-700">
                <Users className="w-5 h-5 text-zinc-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalOrganico}</p>
                <p className="text-xs text-zinc-500">Orgânico</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Busca */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                placeholder="Buscar por nome, email, empresa..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button type="submit" variant="secondary">
                <Search className="w-4 h-4" />
              </Button>
            </form>

            {/* Filtros em linha */}
            <div className="flex flex-wrap gap-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-sm">Status:</span>
                <div className="flex gap-1 flex-wrap">
                  {STATUS_OPTIONS.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={statusFiltro === opt.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setStatusFiltro(opt.value)
                        setPage(1)
                      }}
                      className={
                        statusFiltro === opt.value
                          ? 'bg-orange-500 hover:bg-orange-600 h-7 text-xs'
                          : 'border-zinc-700 text-zinc-400 h-7 text-xs'
                      }
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Origem */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-sm">Origem:</span>
                <Select value={origemFiltro} onValueChange={(v) => { setOrigemFiltro(v); setPage(1) }}>
                  <SelectTrigger className="w-[160px] h-8 bg-zinc-800 border-zinc-700 text-white text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="todos" className="text-white">Todas</SelectItem>
                    {ORIGENS.map(o => (
                      <SelectItem key={o.value} value={o.value} className="text-white">
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Abordagem */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-500 text-sm">Abordagem:</span>
                <Select value={abordagemFiltro} onValueChange={(v) => { setAbordagemFiltro(v); setPage(1) }}>
                  <SelectTrigger className="w-[140px] h-8 bg-zinc-800 border-zinc-700 text-white text-sm">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="todos" className="text-white">Todas</SelectItem>
                    {ABORDAGENS.map(a => (
                      <SelectItem key={a.value} value={a.value} className="text-white">
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Nenhum lead encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Nome</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Empresa</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Origem</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Abordagem</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Status</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Data</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-zinc-800/30 cursor-pointer"
                      onClick={() => router.push(`/admin/leads/${lead.id}`)}
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-white font-medium">{lead.nome}</p>
                          <p className="text-zinc-500 text-sm">{lead.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-zinc-300">{lead.empresa || '-'}</p>
                        <p className="text-zinc-500 text-sm">{lead.cargo || '-'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={getOrigemCor(lead.origem)}>
                          {getOrigemLabel(lead.origem)}
                        </Badge>
                        {lead.persona && (
                          <Badge className={`${getPersonaCor(lead.persona)} ml-1`}>
                            {getPersonaLabel(lead.persona)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {lead.abordagem ? (
                          <Badge className={getAbordagemCor(lead.abordagem)}>
                            {getAbordagemLabel(lead.abordagem)}
                          </Badge>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                        {lead.ebookBaixado && (
                          <Badge className="bg-green-500/20 text-green-400 ml-1">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Ebook
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={STATUS_COLORS[lead.status] || 'bg-zinc-700'}>
                          {lead.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-zinc-400 text-sm">
                        {new Date(lead.criadoEm).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={formatWhatsApp(lead.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                            title="WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                          {lead.projetos.length > 0 && lead.projetos[0].status === 'pronto' && (
                            <a
                              href={`/analise/${lead.projetos[0].slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg"
                              title="Ver diagnóstico"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
              <p className="text-zinc-500 text-sm">
                Página {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="border-zinc-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="border-zinc-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
