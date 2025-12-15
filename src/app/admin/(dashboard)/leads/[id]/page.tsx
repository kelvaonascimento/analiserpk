'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Breadcrumbs from '@/components/admin/Breadcrumbs'
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
  Users,
  Edit3,
  X,
  Check,
  Phone,
  Briefcase,
  Clock
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
  { value: 'novo', label: 'Novo', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  { value: 'contatado', label: 'Contatado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'qualificado', label: 'Qualificado', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'convertido', label: 'Convertido', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'perdido', label: 'Perdido', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
]

const ORIGEM_OPTIONS = [
  { value: 'organico', label: 'Orgânico' },
  { value: 'ads', label: 'Anúncios' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'evento', label: 'Evento' },
  { value: 'parceiro', label: 'Parceiro' },
]

export default function LeadDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    empresa: '',
    cargo: '',
    numeroFuncionarios: '',
    cidadeEmpreendimento: '',
    status: '',
    origem: '',
    notas: ''
  })

  useEffect(() => {
    if (params.id) {
      fetch(`/api/admin/leads/${params.id}`)
        .then(res => res.json())
        .then(data => {
          setLead(data)
          setFormData({
            nome: data.nome || '',
            email: data.email || '',
            whatsapp: data.whatsapp || '',
            empresa: data.empresa || '',
            cargo: data.cargo || '',
            numeroFuncionarios: data.numeroFuncionarios || '',
            cidadeEmpreendimento: data.cidadeEmpreendimento || '',
            status: data.status || 'novo',
            origem: data.origem || 'organico',
            notas: data.notas || ''
          })
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
      const res = await fetch(`/api/admin/leads/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const updated = await res.json()
      setLead({ ...lead!, ...updated })
      setEditMode(false)
    } catch (error) {
      console.error('Erro ao salvar:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (lead) {
      setFormData({
        nome: lead.nome || '',
        email: lead.email || '',
        whatsapp: lead.whatsapp || '',
        empresa: lead.empresa || '',
        cargo: lead.cargo || '',
        numeroFuncionarios: lead.numeroFuncionarios || '',
        cidadeEmpreendimento: lead.cidadeEmpreendimento || '',
        status: lead.status || 'novo',
        origem: lead.origem || 'organico',
        notas: lead.notas || ''
      })
    }
    setEditMode(false)
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
        Lead não encontrado
      </div>
    )
  }

  const statusOption = STATUS_OPTIONS.find(s => s.value === formData.status)

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Leads', href: '/admin/leads' },
          { label: lead.nome }
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{lead.nome}</h1>
              <Badge className={statusOption?.color || 'bg-zinc-700'}>
                {statusOption?.label || lead.status}
              </Badge>
            </div>
            <p className="text-zinc-400">{lead.empresa} • {lead.cargo}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editMode ? (
            <>
              <Button
                variant="ghost"
                onClick={handleCancel}
                className="text-zinc-400"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Salvar
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Lead */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados de Contato */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white flex items-center gap-2">
                <Phone className="w-5 h-5 text-orange-500" />
                Dados de Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Nome completo</Label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">WhatsApp</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Cidade do Empreendimento</Label>
                    <Input
                      value={formData.cidadeEmpreendimento}
                      onChange={(e) => setFormData({ ...formData, cidadeEmpreendimento: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Email</p>
                      <a href={`mailto:${lead.email}`} className="text-white hover:text-orange-400 transition-colors">
                        {lead.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">WhatsApp</p>
                      <a
                        href={formatWhatsApp(lead.whatsapp)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-green-400 transition-colors"
                      >
                        {lead.whatsapp}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Cidade</p>
                      <p className="text-white">{lead.cidadeEmpreendimento}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Cadastrado em</p>
                      <p className="text-white">
                        {new Date(lead.criadoEm).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados Profissionais */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-orange-500" />
                Dados Profissionais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Empresa</Label>
                    <Input
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Cargo</Label>
                    <Input
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Funcionários</Label>
                    <Select
                      value={formData.numeroFuncionarios}
                      onValueChange={(value) => setFormData({ ...formData, numeroFuncionarios: value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-zinc-400">Origem</Label>
                    <Select
                      value={formData.origem}
                      onValueChange={(value) => setFormData({ ...formData, origem: value })}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {ORIGEM_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Empresa</p>
                      <p className="text-white">{lead.empresa}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Cargo</p>
                      <p className="text-white">{lead.cargo}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-zinc-700/50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs uppercase tracking-wider">Funcionários</p>
                      <p className="text-white">{lead.numeroFuncionarios}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projetos/Diagnósticos */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-orange-500" />
                Diagnósticos ({lead.projetos.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {lead.projetos.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Nenhum diagnóstico gerado</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lead.projetos.map((projeto) => {
                    const emp = projeto.empreendimento as any
                    return (
                      <div
                        key={projeto.id}
                        className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-orange-500" />
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {emp?.nome || 'Empreendimento sem nome'}
                            </p>
                            <p className="text-zinc-500 text-sm">
                              {new Date(projeto.criadoEm).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={
                              projeto.status === 'pronto'
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            }
                          >
                            {projeto.status === 'pronto' ? 'Pronto' : 'Processando'}
                          </Badge>
                          {projeto.status === 'pronto' && (
                            <a
                              href={`/analise/${projeto.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-5 h-5" />
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
          {/* Status Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" />
                Status do Lead
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {editMode ? (
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFormData({ ...formData, status: opt.value })}
                      className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                        formData.status === opt.value
                          ? opt.color + ' border-current'
                          : 'bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl text-center ${statusOption?.color || 'bg-zinc-800'}`}>
                    <p className="text-2xl font-bold">{statusOption?.label || lead.status}</p>
                  </div>
                  <div className="text-center text-zinc-500 text-sm">
                    Última atualização: {new Date(lead.atualizadoEm).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white">Notas</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {editMode ? (
                <Textarea
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Adicione notas sobre este lead..."
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[200px] resize-none"
                />
              ) : (
                <div className="min-h-[200px] p-4 bg-zinc-800/50 rounded-xl">
                  {lead.notas ? (
                    <p className="text-zinc-300 whitespace-pre-wrap">{lead.notas}</p>
                  ) : (
                    <p className="text-zinc-600 italic">Nenhuma nota adicionada</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="border-b border-zinc-800">
              <CardTitle className="text-white">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              <a
                href={formatWhatsApp(lead.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full p-4 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="font-medium">Abrir WhatsApp</span>
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-3 w-full p-4 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">Enviar Email</span>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
