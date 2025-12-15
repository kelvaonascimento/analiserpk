'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Filter,
  ExternalLink,
  MessageCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Lead {
  id: string
  nome: string
  email: string
  whatsapp: string
  empresa: string
  cargo: string
  cidadeEmpreendimento: string
  status: string
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
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(statusFiltro !== 'todos' && { status: statusFiltro }),
        ...(busca && { busca })
      })

      const res = await fetch(`/api/admin/leads?${params}`)
      const data = await res.json()

      setLeads(data.leads || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Erro ao buscar leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [page, statusFiltro])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchLeads()
  }

  const formatWhatsApp = (numero: string) => {
    const limpo = numero.replace(/\D/g, '')
    return `https://wa.me/55${limpo}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-zinc-400">{total} leads cadastrados</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
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

            <div className="flex gap-2 flex-wrap">
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
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'border-zinc-700 text-zinc-400'
                  }
                >
                  {opt.label}
                </Button>
              ))}
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
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Cidade</th>
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
                        <p className="text-zinc-300">{lead.empresa}</p>
                        <p className="text-zinc-500 text-sm">{lead.cargo}</p>
                      </td>
                      <td className="px-4 py-4 text-zinc-300">
                        {lead.cidadeEmpreendimento}
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
