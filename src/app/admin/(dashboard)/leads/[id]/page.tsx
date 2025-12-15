'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  MessageCircle,
  Mail,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Loader2,
  Save,
  Users
} from 'lucide-react'

interface Lead {
  id: string
  nome: string
  email: string
  whatsapp: string
  empresa: string
  cargo: string
  numeroFuncionarios: string
  cidadeEmpreendimento: string
  status: string
  origem: string
  notas: string | null
  criadoEm: string
  atualizadoEm: string
  ultimoContato: string | null
  projetos: {
    id: string
    slug: string
    status: string
    criadoEm: string
    empreendimento: any
  }[]
}

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'contatado', label: 'Contatado', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'qualificado', label: 'Qualificado', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'convertido', label: 'Convertido', color: 'bg-green-500/20 text-green-400' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-500/20 text-red-400' },
]

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notas, setNotas] = useState('')
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (params.id) {
      fetch(`/api/admin/leads/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setLead(data)
          setNotas(data.notas || '')
          setStatus(data.status)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [params.id])

  const formatWhatsApp = (numero: string) => {
    const limpo = numero.replace(/\D/g, '')
    return `https://wa.me/55${limpo}`
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await fetch(`/api/admin/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notas })
      })
      if (lead) {
        setLead({ ...lead, status, notas })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Lead no encontrado
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{lead.nome}</h1>
          <p className="text-zinc-400">{lead.empresa} - {lead.cargo}</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Lead */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <Mail className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-zinc-500 text-sm">Email</p>
                    <a href={`mailto:${lead.email}`} className="text-white hover:text-orange-400">
                      {lead.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-zinc-500 text-sm">WhatsApp</p>
                    <a
                      href={formatWhatsApp(lead.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-green-400"
                    >
                      {lead.whatsapp}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <Building2 className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-zinc-500 text-sm">Empresa</p>
                    <p className="text-white">{lead.empresa}</p>
                    <p className="text-zinc-400 text-sm">{lead.cargo}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <Users className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-zinc-500 text-sm">Funcionarios</p>
                    <p className="text-white">{lead.numeroFuncionarios}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-zinc-500 text-sm">Cidade do Empreendimento</p>
                    <p className="text-white">{lead.cidadeEmpreendimento}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-zinc-500 text-sm">Cadastrado em</p>
                    <p className="text-white">
                      {new Date(lead.criadoEm).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Projetos/Diagnósticos */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Diagnósticos</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.projetos.length === 0 ? (
                <p className="text-zinc-500 text-center py-4">Nenhum diagnóstico gerado</p>
              ) : (
                <div className="space-y-3">
                  {lead.projetos.map((projeto) => {
                    const emp = projeto.empreendimento as any
                    return (
                      <div
                        key={projeto.id}
                        className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg"
                      >
                        <div>
                          <p className="text-white font-medium">
                            {emp?.nome || 'Empreendimento sem nome'}
                          </p>
                          <p className="text-zinc-400 text-sm">
                            {new Date(projeto.criadoEm).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
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
                            <a
                              href={`/analise/${projeto.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Status e Notas */}
        <div className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={status === opt.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatus(opt.value)}
                    className={
                      status === opt.value
                        ? 'bg-orange-500 hover:bg-orange-600'
                        : 'border-zinc-700 text-zinc-400'
                    }
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Adicione notas sobre este lead..."
                className="bg-zinc-800 border-zinc-700 text-white min-h-[200px]"
              />
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href={formatWhatsApp(lead.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full p-3 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                Abrir WhatsApp
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 w-full p-3 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Enviar Email
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
