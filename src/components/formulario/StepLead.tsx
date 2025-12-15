'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Lead } from '@/types'

interface StepLeadProps {
  data: Lead
  onChange: (data: Lead) => void
}

const CARGOS = [
  // Diretoria / C-Level
  { value: 'ceo', label: 'CEO / Diretor Geral' },
  { value: 'diretor-comercial', label: 'Diretor Comercial' },
  { value: 'diretor-marketing', label: 'Diretor de Marketing' },
  { value: 'diretor-incorporacao', label: 'Diretor de Incorporação' },
  { value: 'diretor-operacoes', label: 'Diretor de Operações' },
  // Gerência
  { value: 'gerente-comercial', label: 'Gerente Comercial' },
  { value: 'gerente-marketing', label: 'Gerente de Marketing' },
  { value: 'gerente-vendas', label: 'Gerente de Vendas' },
  { value: 'gerente-projetos', label: 'Gerente de Projetos' },
  { value: 'gerente-lancamentos', label: 'Gerente de Lançamentos' },
  // Coordenação
  { value: 'coordenador-marketing', label: 'Coordenador de Marketing' },
  { value: 'coordenador-vendas', label: 'Coordenador de Vendas' },
  { value: 'coordenador-comercial', label: 'Coordenador Comercial' },
  // Analistas / Especialistas
  { value: 'analista-marketing', label: 'Analista de Marketing' },
  { value: 'analista-inteligencia', label: 'Analista de Inteligência de Mercado' },
  { value: 'especialista-midia', label: 'Especialista em Mídia' },
  // Corretores / Imobiliárias
  { value: 'corretor', label: 'Corretor de Imóveis' },
  { value: 'dono-imobiliaria', label: 'Proprietário de Imobiliária' },
  { value: 'gerente-imobiliaria', label: 'Gerente de Imobiliária' },
  // Sócios / Proprietários
  { value: 'socio', label: 'Sócio / Proprietário' },
  { value: 'investidor', label: 'Investidor' },
  // Outros
  { value: 'consultor', label: 'Consultor Imobiliário' },
  { value: 'outro', label: 'Outro' },
]

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
          <Select
            value={data.cargo}
            onValueChange={(value) => handleChange('cargo', value)}
          >
            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
              <SelectValue placeholder="Selecione seu cargo" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[300px]">
              <SelectItem value="" disabled className="text-zinc-500">Selecione seu cargo</SelectItem>
              <div className="px-2 py-1 text-xs text-zinc-500 font-semibold">Diretoria</div>
              {CARGOS.slice(0, 5).map((cargo) => (
                <SelectItem key={cargo.value} value={cargo.label} className="text-white">
                  {cargo.label}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-zinc-500 font-semibold mt-2">Gerência</div>
              {CARGOS.slice(5, 10).map((cargo) => (
                <SelectItem key={cargo.value} value={cargo.label} className="text-white">
                  {cargo.label}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-zinc-500 font-semibold mt-2">Coordenação</div>
              {CARGOS.slice(10, 13).map((cargo) => (
                <SelectItem key={cargo.value} value={cargo.label} className="text-white">
                  {cargo.label}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-zinc-500 font-semibold mt-2">Analistas</div>
              {CARGOS.slice(13, 16).map((cargo) => (
                <SelectItem key={cargo.value} value={cargo.label} className="text-white">
                  {cargo.label}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-zinc-500 font-semibold mt-2">Imobiliárias</div>
              {CARGOS.slice(16, 19).map((cargo) => (
                <SelectItem key={cargo.value} value={cargo.label} className="text-white">
                  {cargo.label}
                </SelectItem>
              ))}
              <div className="px-2 py-1 text-xs text-zinc-500 font-semibold mt-2">Outros</div>
              {CARGOS.slice(19).map((cargo) => (
                <SelectItem key={cargo.value} value={cargo.label} className="text-white">
                  {cargo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
