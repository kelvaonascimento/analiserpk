'use client'

import { useState } from 'react'
import { Plus, Trash2, Search, Edit2, Check, ExternalLink, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Concorrente } from '@/types'
import LoadingConcorrentes from './LoadingConcorrentes'

interface StepConcorrentesProps {
  data: Concorrente[]
  cidade: string
  estado?: string
  bairro?: string
  metragemReferencia?: number
  precoReferencia?: number
  precoM2Referencia?: number
  itensLazer?: number
  onChange: (data: Concorrente[]) => void
}

const emptyConcorrente: Concorrente = {
  nome: '',
  construtora: '',
  cidade: '',
  metragemMin: undefined,
  precoMin: undefined,
  entrega: { ano: new Date().getFullYear() + 2 },
  status: 'Lançamento',
  fonte: 'Manual',
}

export default function StepConcorrentes({
  data,
  cidade,
  estado = 'SP',
  bairro,
  metragemReferencia,
  precoReferencia,
  precoM2Referencia,
  itensLazer,
  onChange
}: StepConcorrentesProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [searchMessage, setSearchMessage] = useState<string | null>(null)
  const [searchError, setSearchError] = useState<string | null>(null)

  const searchConcorrentes = async () => {
    if (!cidade) return

    setIsSearching(true)
    setSearchMessage(null)
    setSearchError(null)

    try {
      const res = await fetch('/api/pesquisar-concorrentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cidade,
          estado,
          bairro,
          metragemReferencia,
          // Enviar dados do empreendimento para melhor classificação
          empreendimento: {
            metragem: metragemReferencia,
            precoMin: precoReferencia,
            precoM2: precoM2Referencia,
            itensLazer: itensLazer
          }
        }),
      })

      if (!res.ok) {
        throw new Error(`Erro ${res.status} na busca`)
      }

      const result = await res.json()

      if (result.error) {
        setSearchError(result.error)
        return
      }

      if (result.concorrentes && result.concorrentes.length > 0) {
        // Remove duplicatas baseado no nome
        const existingNames = new Set(data.map(c => c.nome.toLowerCase()))
        const newConcorrentes = result.concorrentes.filter(
          (c: Concorrente) => !existingNames.has(c.nome.toLowerCase())
        )

        if (newConcorrentes.length > 0) {
          onChange([...data, ...newConcorrentes])
          // Mensagem simplificada sem mostrar URLs
          const totalFontes = result.fontes?.length || 0
          const msgFontes = totalFontes > 0 ? ` (${totalFontes} fontes consultadas)` : ''
          setSearchMessage(`${newConcorrentes.length} concorrente(s) encontrado(s)${msgFontes}`)
        } else {
          setSearchMessage('Os concorrentes encontrados já estão na lista')
        }
      } else {
        setSearchMessage(result.mensagem || 'Nenhum concorrente encontrado automaticamente. Adicione manualmente.')
      }
    } catch (error) {
      console.error('Erro ao buscar concorrentes:', error)
      setSearchError(error instanceof Error ? error.message : 'Erro ao buscar concorrentes')
    } finally {
      setIsSearching(false)
    }
  }

  const addConcorrente = () => {
    onChange([...data, { ...emptyConcorrente, cidade }])
    setEditingIndex(data.length)
  }

  const removeConcorrente = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  const updateConcorrente = (index: number, field: keyof Concorrente, value: any) => {
    const newData = [...data]
    if (field === 'entrega') {
      newData[index] = { ...newData[index], entrega: { ...newData[index].entrega, ...value } }
    } else {
      newData[index] = { ...newData[index], [field]: value }
    }

    // Auto-calculate precoM2
    const metragem = newData[index].metragemMin
    const preco = newData[index].precoMin
    if ((field === 'metragemMin' || field === 'precoMin') && metragem && metragem > 0 && preco && preco > 0) {
      newData[index].precoM2 = Math.round(preco / metragem)
    }

    onChange(newData)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Mostra loading animado enquanto busca
  if (isSearching) {
    return (
      <div className="space-y-6">
        <LoadingConcorrentes
          isActive={isSearching}
          cidade={cidade}
          bairro={bairro}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm mb-6">
        Adicione os empreendimentos concorrentes na região. Você pode buscar automaticamente ou adicionar manualmente.
      </p>

      {/* Search button */}
      <div className="flex flex-wrap gap-4">
        <Button
          variant="outline"
          onClick={searchConcorrentes}
          disabled={isSearching || !cidade}
          className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
        >
          <Search className="w-4 h-4 mr-2" />
          Buscar concorrentes em {cidade || 'sua cidade'}
        </Button>
        <Button
          variant="outline"
          onClick={addConcorrente}
          className="border-zinc-700 text-zinc-400 hover:text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar manualmente
        </Button>
      </div>

      {/* Search feedback */}
      {searchMessage && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {searchMessage}
        </div>
      )}

      {searchError && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {searchError}
        </div>
      )}

      {/* Concorrentes list */}
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800/30 rounded-lg border border-dashed border-zinc-700">
            <p className="text-zinc-500 mb-2">Nenhum concorrente adicionado</p>
            <p className="text-zinc-600 text-sm">
              Clique em buscar ou adicione manualmente
            </p>
          </div>
        ) : (
          data.map((concorrente, index) => (
            <Card key={index} className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-base flex items-center gap-2 flex-wrap">
                      {concorrente.nome || 'Novo concorrente'}
                      {concorrente.precoM2 && (
                        <span className="text-orange-400 text-sm font-normal">
                          ({formatCurrency(concorrente.precoM2)}/m²)
                        </span>
                      )}
                      {concorrente.fonte && (
                        <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-400">
                          {concorrente.fonte}
                        </Badge>
                      )}
                    </CardTitle>
                    {concorrente.link && (
                      <a
                        href={concorrente.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Ver no portal
                      </a>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-blue-400"
                      onClick={() => setEditingIndex(editingIndex === index ? null : index)}
                    >
                      {editingIndex === index ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Edit2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-red-400"
                      onClick={() => removeConcorrente(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {editingIndex === index ? (
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-zinc-400 text-xs">Nome</Label>
                      <Input
                        value={concorrente.nome}
                        onChange={(e) => updateConcorrente(index, 'nome', e.target.value)}
                        placeholder="Ex: Residencial VISTTA"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Construtora</Label>
                      <Input
                        value={concorrente.construtora}
                        onChange={(e) => updateConcorrente(index, 'construtora', e.target.value)}
                        placeholder="Ex: Toth"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Cidade</Label>
                      <Input
                        value={concorrente.cidade}
                        onChange={(e) => updateConcorrente(index, 'cidade', e.target.value)}
                        placeholder="Ex: Ribeirão Pires"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Metragem (m²)</Label>
                      <Input
                        type="number"
                        value={concorrente.metragemMin || ''}
                        onChange={(e) => updateConcorrente(index, 'metragemMin', parseInt(e.target.value) || 0)}
                        placeholder="70"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Preço (R$)</Label>
                      <Input
                        type="number"
                        value={concorrente.precoMin || ''}
                        onChange={(e) => updateConcorrente(index, 'precoMin', parseInt(e.target.value) || 0)}
                        placeholder="500000"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Ano entrega</Label>
                      <Input
                        type="number"
                        value={concorrente.entrega.ano || ''}
                        onChange={(e) => updateConcorrente(index, 'entrega', { ano: parseInt(e.target.value) })}
                        placeholder="2026"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400 text-xs">Status</Label>
                      <Input
                        value={concorrente.status}
                        onChange={(e) => updateConcorrente(index, 'status', e.target.value)}
                        placeholder="Ex: Lançamento"
                        className="bg-zinc-900 border-zinc-700 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              ) : (
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                    {concorrente.construtora && (
                      <span><strong className="text-zinc-300">Construtora:</strong> {concorrente.construtora}</span>
                    )}
                    {concorrente.cidade && (
                      <span><strong className="text-zinc-300">Cidade:</strong> {concorrente.cidade}</span>
                    )}
                    {concorrente.metragemMin && concorrente.metragemMin > 0 && (
                      <span><strong className="text-zinc-300">Metragem:</strong> {concorrente.metragemMin}m²</span>
                    )}
                    {concorrente.precoMin && concorrente.precoMin > 0 && (
                      <span><strong className="text-zinc-300">Preço:</strong> {formatCurrency(concorrente.precoMin)}</span>
                    )}
                    {concorrente.entrega?.ano && (
                      <span><strong className="text-zinc-300">Entrega:</strong> {concorrente.entrega.ano}</span>
                    )}
                    {concorrente.status && (
                      <span><strong className="text-zinc-300">Status:</strong> {concorrente.status}</span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>

      {data.length > 0 && (
        <p className="text-zinc-500 text-sm text-center">
          {data.length} concorrente{data.length > 1 ? 's' : ''} adicionado{data.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
