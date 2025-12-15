'use client'

import { useState } from 'react'
import { Plus, X, Sparkles, Cpu, Award } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ITENS_LAZER_PADRAO } from '@/types'

interface StepLazerProps {
  itensLazer: string[]
  diferenciais: string[]
  tecnologia: string[]
  onChange: (itens: string[], difs: string[], tech: string[]) => void
}

const DIFERENCIAIS_SUGERIDOS = [
  'Pé-direito alto',
  'Varanda gourmet',
  'Vista panorâmica',
  'Acabamento premium',
  'Porcelanato importado',
  'Armários planejados',
  'Ar-condicionado incluso',
]

const TECNOLOGIA_SUGERIDA = [
  'Smart Home',
  'Alexa/Google Home',
  'Fechadura digital',
  'Tomadas USB',
  'Infraestrutura fibra ótica',
  'Automação de iluminação',
]

export default function StepLazer({
  itensLazer,
  diferenciais,
  tecnologia,
  onChange,
}: StepLazerProps) {
  const [novoItem, setNovoItem] = useState('')
  const [novoDiferencial, setNovoDiferencial] = useState('')
  const [novaTech, setNovaTech] = useState('')

  const toggleItem = (item: string) => {
    const newItems = itensLazer.includes(item)
      ? itensLazer.filter((i) => i !== item)
      : [...itensLazer, item]
    onChange(newItems, diferenciais, tecnologia)
  }

  const toggleDiferencial = (item: string) => {
    const newItems = diferenciais.includes(item)
      ? diferenciais.filter((i) => i !== item)
      : [...diferenciais, item]
    onChange(itensLazer, newItems, tecnologia)
  }

  const toggleTech = (item: string) => {
    const newItems = tecnologia.includes(item)
      ? tecnologia.filter((i) => i !== item)
      : [...tecnologia, item]
    onChange(itensLazer, diferenciais, newItems)
  }

  const addCustomItem = () => {
    if (novoItem.trim() && !itensLazer.includes(novoItem.trim())) {
      onChange([...itensLazer, novoItem.trim()], diferenciais, tecnologia)
      setNovoItem('')
    }
  }

  const addCustomDiferencial = () => {
    if (novoDiferencial.trim() && !diferenciais.includes(novoDiferencial.trim())) {
      onChange(itensLazer, [...diferenciais, novoDiferencial.trim()], tecnologia)
      setNovoDiferencial('')
    }
  }

  const addCustomTech = () => {
    if (novaTech.trim() && !tecnologia.includes(novaTech.trim())) {
      onChange(itensLazer, diferenciais, [...tecnologia, novaTech.trim()])
      setNovaTech('')
    }
  }

  return (
    <div className="space-y-8">
      {/* Itens de Lazer */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500" />
          <h3 className="text-white font-medium">Itens de Lazer</h3>
          <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
            {itensLazer.length} selecionados
          </Badge>
        </div>
        <p className="text-zinc-500 text-sm">
          Selecione todos os itens de lazer disponíveis no empreendimento.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {ITENS_LAZER_PADRAO.map((item) => (
            <div
              key={item}
              className={`
                flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors
                ${itensLazer.includes(item)
                  ? 'bg-orange-500/20 border border-orange-500/50'
                  : 'bg-zinc-800/50 border border-zinc-700 hover:border-zinc-600'
                }
              `}
              onClick={() => toggleItem(item)}
            >
              <Checkbox
                checked={itensLazer.includes(item)}
                onCheckedChange={() => toggleItem(item)}
                className="border-zinc-600"
              />
              <Label className="text-zinc-300 text-sm cursor-pointer">{item}</Label>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            placeholder="Adicionar item personalizado"
            className="bg-zinc-800 border-zinc-700 text-white"
            onKeyDown={(e) => e.key === 'Enter' && addCustomItem()}
          />
          <Button
            variant="outline"
            onClick={addCustomItem}
            className="border-zinc-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Diferenciais */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-green-500" />
          <h3 className="text-white font-medium">Diferenciais do Produto</h3>
          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
            {diferenciais.length} selecionados
          </Badge>
        </div>
        <p className="text-zinc-500 text-sm">
          Diferenciais que destacam o empreendimento.
        </p>

        <div className="flex flex-wrap gap-2">
          {DIFERENCIAIS_SUGERIDOS.map((item) => (
            <Badge
              key={item}
              variant={diferenciais.includes(item) ? 'default' : 'outline'}
              className={`cursor-pointer ${
                diferenciais.includes(item)
                  ? 'bg-green-500/20 text-green-400 border-green-500/50'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
              onClick={() => toggleDiferencial(item)}
            >
              {item}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={novoDiferencial}
            onChange={(e) => setNovoDiferencial(e.target.value)}
            placeholder="Adicionar diferencial"
            className="bg-zinc-800 border-zinc-700 text-white"
            onKeyDown={(e) => e.key === 'Enter' && addCustomDiferencial()}
          />
          <Button
            variant="outline"
            onClick={addCustomDiferencial}
            className="border-zinc-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tecnologia */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-500" />
          <h3 className="text-white font-medium">Tecnologia</h3>
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
            {tecnologia.length} selecionados
          </Badge>
        </div>
        <p className="text-zinc-500 text-sm">
          Recursos tecnológicos inclusos.
        </p>

        <div className="flex flex-wrap gap-2">
          {TECNOLOGIA_SUGERIDA.map((item) => (
            <Badge
              key={item}
              variant={tecnologia.includes(item) ? 'default' : 'outline'}
              className={`cursor-pointer ${
                tecnologia.includes(item)
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                  : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
              onClick={() => toggleTech(item)}
            >
              {item}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={novaTech}
            onChange={(e) => setNovaTech(e.target.value)}
            placeholder="Adicionar tecnologia"
            className="bg-zinc-800 border-zinc-700 text-white"
            onKeyDown={(e) => e.key === 'Enter' && addCustomTech()}
          />
          <Button
            variant="outline"
            onClick={addCustomTech}
            className="border-zinc-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
