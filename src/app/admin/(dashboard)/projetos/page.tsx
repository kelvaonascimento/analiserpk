'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Eye,
  Trash2
} from 'lucide-react'
import Link from 'next/link'

interface Projeto {
  id: string
  slug: string
  status: string
  criadoEm: string
  visualizacoes: number
  ultimaVisualizacao: string | null
  empreendimento: any
  lead: {
    id: string
    nome: string
    empresa: string
  }
}

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pronto', label: 'Pronto' },
  { value: 'processando', label: 'Processando' },
  { value: 'erro', label: 'Erro' },
]

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [statusFiltro, setStatusFiltro] = useState('todos')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchProjetos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        ...(statusFiltro !== 'todos' && { status: statusFiltro }),
        ...(busca && { busca })
      })

      const res = await fetch(`/api/admin/projetos?${params}`)
      const data = await res.json()

      setProjetos(data.projetos || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjetos()
  }, [page, statusFiltro])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProjetos()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este diagnóstico?')) return

    try {
      await fetch(`/api/admin/projetos/${id}`, { method: 'DELETE' })
      fetchProjetos()
    } catch (error) {
      console.error('Erro ao excluir:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Diagnósticos</h1>
          <p className="text-zinc-400">{total} diagnósticos gerados</p>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Buscar por empreendimento, lead..."
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
          ) : projetos.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              Nenhum diagnóstico encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-800/50">
                  <tr>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Empreendimento</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Lead</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Status</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Visualizações</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Data</th>
                    <th className="text-left text-zinc-400 text-sm font-medium px-4 py-3">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {projetos.map((projeto) => {
                    const emp = projeto.empreendimento as any
                    return (
                      <tr
                        key={projeto.id}
                        className="hover:bg-zinc-800/30"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <p className="text-white font-medium">
                                {emp?.nome || 'Sem nome'}
                              </p>
                              <p className="text-zinc-500 text-sm">
                                {emp?.cidade || '-'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/leads/${projeto.lead?.id}`}
                            className="text-zinc-300 hover:text-orange-400"
                          >
                            {projeto.lead?.nome || '-'}
                          </Link>
                          <p className="text-zinc-500 text-sm">
                            {projeto.lead?.empresa || '-'}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Badge
                            className={
                              projeto.status === 'pronto'
                                ? 'bg-green-500/20 text-green-400'
                                : projeto.status === 'erro'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }
                          >
                            {projeto.status === 'pronto' ? 'Pronto' :
                             projeto.status === 'erro' ? 'Erro' : 'Processando'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Eye className="w-4 h-4" />
                            <span>{projeto.visualizacoes}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-zinc-400 text-sm">
                          {new Date(projeto.criadoEm).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            {projeto.status === 'pronto' && (
                              <a
                                href={`/analise/${projeto.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg"
                                title="Ver diagnóstico"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              onClick={() => handleDelete(projeto.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
