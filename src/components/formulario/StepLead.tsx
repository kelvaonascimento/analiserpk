'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Lead } from '@/types'

interface StepLeadProps {
  data: Lead
  onChange: (data: Lead) => void
}

export default function StepLead({ data, onChange }: StepLeadProps) {
  const handleChange = (field: keyof Lead, value: string) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm mb-6">
        Precisamos de algumas informações suas para personalizar a análise e entrar em contato.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="nome" className="text-zinc-300">Nome completo *</Label>
          <Input
            id="nome"
            value={data.nome}
            onChange={(e) => handleChange('nome', e.target.value)}
            placeholder="Seu nome"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-300">Email corporativo *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="seu@empresa.com"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="text-zinc-300">WhatsApp *</Label>
          <Input
            id="whatsapp"
            value={data.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            placeholder="(11) 99999-9999"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cargo" className="text-zinc-300">Cargo *</Label>
          <Input
            id="cargo"
            value={data.cargo}
            onChange={(e) => handleChange('cargo', e.target.value)}
            placeholder="Ex: Diretor de Marketing"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="empresa" className="text-zinc-300">Empresa / Incorporadora *</Label>
          <Input
            id="empresa"
            value={data.empresa}
            onChange={(e) => handleChange('empresa', e.target.value)}
            placeholder="Nome da empresa"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="funcionarios" className="text-zinc-300">Número de funcionários *</Label>
          <Select
            value={data.numeroFuncionarios}
            onValueChange={(value) => handleChange('numeroFuncionarios', value)}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              <SelectItem value="1-10">1-10 funcionários</SelectItem>
              <SelectItem value="11-50">11-50 funcionários</SelectItem>
              <SelectItem value="51-200">51-200 funcionários</SelectItem>
              <SelectItem value="201-500">201-500 funcionários</SelectItem>
              <SelectItem value="500+">500+ funcionários</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="cidade" className="text-zinc-300">Cidade do empreendimento *</Label>
          <Input
            id="cidade"
            value={data.cidadeEmpreendimento}
            onChange={(e) => handleChange('cidadeEmpreendimento', e.target.value)}
            placeholder="Ex: Ribeirão Pires - SP"
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
          />
        </div>
      </div>
    </div>
  )
}
