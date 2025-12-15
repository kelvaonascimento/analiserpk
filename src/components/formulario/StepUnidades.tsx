'use client'

import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Unidade } from '@/types'

interface StepUnidadesProps {
  data: Unidade[]
  onChange: (data: Unidade[]) => void
}

const emptyUnidade: Unidade = {
  metragem: 0,
  dormitorios: 2,
  suites: 1,
  banheiros: 2,
  vagasGaragem: 1,
  precoMin: 0,
  precoMax: 0,
  precoM2: 0,
  quantidadeDisponivel: 0,
}

export default function StepUnidades({ data, onChange }: StepUnidadesProps) {
  const addUnidade = () => {
    onChange([...data, { ...emptyUnidade }])
  }

  const removeUnidade = (index: number) => {
    if (data.length > 1) {
      onChange(data.filter((_, i) => i !== index))
    }
  }

  const updateUnidade = (index: number, field: keyof Unidade, value: number) => {
    const newData = [...data]
    newData[index] = { ...newData[index], [field]: value }

    // Auto-calculate precoM2 if metragem and precoMin are set
    if ((field === 'metragem' || field === 'precoMin') && newData[index].metragem > 0) {
      newData[index].precoM2 = Math.round(newData[index].precoMin / newData[index].metragem)
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

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm mb-6">
        Adicione os tipos de unidades disponíveis no empreendimento com suas características e preços.
      </p>

      <div className="space-y-4">
        {data.map((unidade, index) => (
          <Card key={index} className="bg-zinc-800/50 border-zinc-700">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white text-base">
                  Tipo {index + 1}: {unidade.metragem > 0 ? `${unidade.metragem}m²` : 'Nova unidade'}
                </CardTitle>
                {data.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-zinc-400 hover:text-red-400"
                    onClick={() => removeUnidade(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Metragem (m²)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.metragem || ''}
                    onChange={(e) => updateUnidade(index, 'metragem', parseInt(e.target.value) || 0)}
                    placeholder="114"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Dormitórios</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.dormitorios || ''}
                    onChange={(e) => updateUnidade(index, 'dormitorios', parseInt(e.target.value) || 0)}
                    placeholder="3"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Suítes</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.suites || ''}
                    onChange={(e) => updateUnidade(index, 'suites', parseInt(e.target.value) || 0)}
                    placeholder="1"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Banheiros</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.banheiros || ''}
                    onChange={(e) => updateUnidade(index, 'banheiros', parseInt(e.target.value) || 0)}
                    placeholder="2"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Vagas garagem</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.vagasGaragem || ''}
                    onChange={(e) => updateUnidade(index, 'vagasGaragem', parseInt(e.target.value) || 0)}
                    placeholder="2"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Qtd. disponível</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.quantidadeDisponivel || ''}
                    onChange={(e) => updateUnidade(index, 'quantidadeDisponivel', parseInt(e.target.value) || 0)}
                    placeholder="32"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Preço mínimo (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.precoMin || ''}
                    onChange={(e) => updateUnidade(index, 'precoMin', parseInt(e.target.value) || 0)}
                    placeholder="959500"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs">Preço máximo (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={unidade.precoMax || ''}
                    onChange={(e) => updateUnidade(index, 'precoMax', parseInt(e.target.value) || 0)}
                    placeholder="962500"
                    className="bg-zinc-900 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-zinc-400 text-xs">Preço/m² (calculado)</Label>
                  <div className="h-10 bg-zinc-900 border border-zinc-700 rounded-md flex items-center px-3">
                    <span className="text-orange-500 font-medium">
                      {unidade.precoM2 > 0 ? formatCurrency(unidade.precoM2) : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addUnidade}
        className="w-full border-dashed border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar outro tipo de unidade
      </Button>
    </div>
  )
}
