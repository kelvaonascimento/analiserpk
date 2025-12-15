'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ESTADOS_BRASIL, getCidadesPorEstado, filtrarCidades } from '@/lib/cidades-brasil'
import { MapPin, Search, Check, Loader2 } from 'lucide-react'

interface EmpreendimentoBasico {
  nome: string
  construtora: string
  incorporacao: string
  endereco: {
    cep?: string
    rua: string
    numero: string
    bairro?: string
    cidade: string
    estado: string
  }
  torres: number
  andares: number
  unidadesTotal: number
  elevadores: number
  entregaMes: number
  entregaAno: number
  percentualVendido: number
  vgv?: number  // Valor Geral de Vendas estimado
}

// Interface para resposta da ViaCEP
interface ViaCEPResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

interface StepEmpreendimentoProps {
  data: EmpreendimentoBasico
  onChange: (data: EmpreendimentoBasico) => void
}

const MESES = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

export default function StepEmpreendimento({ data, onChange }: StepEmpreendimentoProps) {
  const [cidadeSearch, setCidadeSearch] = useState(data.endereco.cidade)
  const [showCidadeSuggestions, setShowCidadeSuggestions] = useState(false)
  const [cidadeSuggestions, setCidadeSuggestions] = useState<string[]>([])
  const cidadeInputRef = useRef<HTMLDivElement>(null)
  const [isLoadingCEP, setIsLoadingCEP] = useState(false)
  const [cepError, setCepError] = useState<string | null>(null)

  // Formatar CEP para display (99999-999)
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 5) return numbers
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`
  }

  // Buscar endereço via ViaCEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) {
      setCepError('CEP deve ter 8 dígitos')
      return
    }

    setIsLoadingCEP(true)
    setCepError(null)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data_cep: ViaCEPResponse = await response.json()

      if (data_cep.erro) {
        setCepError('CEP não encontrado')
        return
      }

      // Atualizar todos os campos de endereço
      onChange({
        ...data,
        endereco: {
          ...data.endereco,
          cep: formatCEP(cepLimpo),
          rua: data_cep.logradouro || '',
          bairro: data_cep.bairro || '',
          cidade: data_cep.localidade || '',
          estado: data_cep.uf || '',
        },
      })
      setCidadeSearch(data_cep.localidade || '')
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
      setCepError('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setIsLoadingCEP(false)
    }
  }

  // Handler para mudança no campo CEP
  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value)
    handleChange('endereco.cep', formatted)

    // Se completou 8 dígitos, buscar automaticamente
    const numbers = value.replace(/\D/g, '')
    if (numbers.length === 8) {
      buscarEnderecoPorCEP(numbers)
    } else {
      setCepError(null)
    }
  }

  // Atualizar sugestões quando o estado ou termo de busca mudar
  useEffect(() => {
    if (data.endereco.estado) {
      const filtradas = filtrarCidades(data.endereco.estado, cidadeSearch)
      setCidadeSuggestions(filtradas.slice(0, 10))
    } else {
      setCidadeSuggestions([])
    }
  }, [data.endereco.estado, cidadeSearch])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cidadeInputRef.current && !cidadeInputRef.current.contains(event.target as Node)) {
        setShowCidadeSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleChange = (field: string, value: string | number) => {
    if (field.startsWith('endereco.')) {
      const enderecoField = field.split('.')[1]
      onChange({
        ...data,
        endereco: { ...data.endereco, [enderecoField]: value },
      })
    } else {
      onChange({ ...data, [field]: value })
    }
  }

  const handleEstadoChange = (value: string) => {
    // Ao mudar o estado, limpar a cidade
    onChange({
      ...data,
      endereco: { ...data.endereco, estado: value, cidade: '' },
    })
    setCidadeSearch('')
  }

  const handleCidadeSelect = (cidade: string) => {
    setCidadeSearch(cidade)
    handleChange('endereco.cidade', cidade)
    setShowCidadeSuggestions(false)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i)

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm mb-6">
        Informe os dados básicos do empreendimento que será analisado.
      </p>

      {/* Identificação */}
      <div className="space-y-4">
        <h3 className="text-white font-medium border-b border-zinc-800 pb-2">Identificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Nome do empreendimento *</Label>
            <Input
              value={data.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: AYA Home Resort"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Construtora *</Label>
            <Input
              value={data.construtora}
              onChange={(e) => handleChange('construtora', e.target.value)}
              placeholder="Ex: WIND Incorporadora"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label className="text-zinc-300">Incorporação (separar por vírgula)</Label>
            <Input
              value={data.incorporacao}
              onChange={(e) => handleChange('incorporacao', e.target.value)}
              placeholder="Ex: MBrasil, Wind, RAP"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-white font-medium border-b border-zinc-800 pb-2">Localização</h3>

        {/* CEP com busca automática */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">CEP</Label>
            <div className="relative">
              <Input
                value={data.endereco.cep || ''}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className={`bg-zinc-800 border-zinc-700 text-white pr-10 ${
                  cepError ? 'border-red-500' : ''
                }`}
              />
              {isLoadingCEP && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500 animate-spin" />
              )}
              {!isLoadingCEP && data.endereco.cep && data.endereco.cidade && !cepError && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
              )}
            </div>
            {cepError && (
              <p className="text-red-400 text-xs">{cepError}</p>
            )}
            <p className="text-zinc-500 text-xs">
              Digite o CEP para preencher automaticamente
            </p>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label className="text-zinc-300">Rua *</Label>
            <Input
              value={data.endereco.rua}
              onChange={(e) => handleChange('endereco.rua', e.target.value)}
              placeholder="Ex: R. Miguel Prisco"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Número</Label>
            <Input
              value={data.endereco.numero}
              onChange={(e) => handleChange('endereco.numero', e.target.value)}
              placeholder="Ex: 2001"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Bairro - preenchido pelo CEP ou manual */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Bairro</Label>
            <Input
              value={data.endereco.bairro || ''}
              onChange={(e) => handleChange('endereco.bairro', e.target.value)}
              placeholder="Ex: Centro"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-300">Estado *</Label>
            <Select
              value={data.endereco.estado}
              onValueChange={handleEstadoChange}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[300px]">
                {ESTADOS_BRASIL.map((estado) => (
                  <SelectItem key={estado.sigla} value={estado.sigla}>
                    {estado.sigla} - {estado.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cidade com Autocomplete */}
          <div className="space-y-2 md:col-span-2" ref={cidadeInputRef}>
            <Label className="text-zinc-300">Cidade *</Label>
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  value={cidadeSearch}
                  onChange={(e) => {
                    setCidadeSearch(e.target.value)
                    setShowCidadeSuggestions(true)
                  }}
                  onFocus={() => data.endereco.estado && setShowCidadeSuggestions(true)}
                  placeholder={data.endereco.estado ? "Digite para buscar..." : "Selecione o estado primeiro"}
                  disabled={!data.endereco.estado}
                  className="bg-zinc-800 border-zinc-700 text-white pl-10"
                />
                {data.endereco.cidade && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                )}
              </div>

              {/* Dropdown de sugestões */}
              {showCidadeSuggestions && cidadeSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-[200px] overflow-y-auto">
                  {cidadeSuggestions.map((cidade, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleCidadeSelect(cidade)}
                      className={`
                        w-full px-4 py-2 text-left text-sm flex items-center gap-2 transition-colors
                        ${data.endereco.cidade === cidade
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'text-zinc-300 hover:bg-zinc-700'
                        }
                      `}
                    >
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span>{cidade}</span>
                      {data.endereco.cidade === cidade && (
                        <Check className="w-4 h-4 ml-auto text-green-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Mensagem quando não encontrar */}
              {showCidadeSuggestions && cidadeSearch && cidadeSuggestions.length === 0 && data.endereco.estado && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-4">
                  <p className="text-zinc-400 text-sm text-center">
                    Cidade não encontrada na lista.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('endereco.cidade', cidadeSearch)
                      setShowCidadeSuggestions(false)
                    }}
                    className="w-full mt-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm hover:bg-orange-500/30 transition-colors"
                  >
                    Usar "{cidadeSearch}" mesmo assim
                  </button>
                </div>
              )}
            </div>
            {data.endereco.estado && (
              <p className="text-zinc-500 text-xs mt-1">
                {getCidadesPorEstado(data.endereco.estado).length} cidades disponíveis para {data.endereco.estado}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Especificações */}
      <div className="space-y-4">
        <h3 className="text-white font-medium border-b border-zinc-800 pb-2">Especificações</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Torres</Label>
            <Input
              type="number"
              min={1}
              value={data.torres}
              onChange={(e) => handleChange('torres', parseInt(e.target.value) || 1)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Andares</Label>
            <Input
              type="number"
              min={1}
              value={data.andares}
              onChange={(e) => handleChange('andares', parseInt(e.target.value) || 1)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Total de unidades</Label>
            <Input
              type="number"
              min={1}
              value={data.unidadesTotal}
              onChange={(e) => handleChange('unidadesTotal', parseInt(e.target.value) || 1)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Elevadores</Label>
            <Input
              type="number"
              min={0}
              value={data.elevadores}
              onChange={(e) => handleChange('elevadores', parseInt(e.target.value) || 0)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Entrega e Status */}
      <div className="space-y-4">
        <h3 className="text-white font-medium border-b border-zinc-800 pb-2">Entrega e Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">Mês de entrega</Label>
            <Select
              value={data.entregaMes.toString()}
              onValueChange={(value) => handleChange('entregaMes', parseInt(value))}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {MESES.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">Ano de entrega</Label>
            <Select
              value={data.entregaAno.toString()}
              onValueChange={(value) => handleChange('entregaAno', parseInt(value))}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-300">% Vendido</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={data.percentualVendido}
              onChange={(e) => handleChange('percentualVendido', parseInt(e.target.value) || 0)}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>
        </div>
      </div>

      {/* Projeção Financeira */}
      <div className="space-y-4">
        <h3 className="text-white font-medium border-b border-zinc-800 pb-2">Projeção Financeira</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-300">VGV Estimado (R$) *</Label>
            <Input
              type="number"
              min={0}
              step={100000}
              value={data.vgv || ''}
              onChange={(e) => handleChange('vgv', parseFloat(e.target.value) || 0)}
              placeholder="Ex: 50000000 (50 milhões)"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-zinc-500 text-xs">
              Valor Geral de Vendas projetado para o empreendimento
            </p>
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs">VGV Formatado</Label>
            <div className="h-10 bg-zinc-900 border border-zinc-700 rounded-md flex items-center px-3">
              <span className="text-orange-500 font-medium">
                {data.vgv && data.vgv > 0
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(data.vgv)
                  : '—'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
