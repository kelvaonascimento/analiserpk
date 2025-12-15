'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, ArrowRight, Shield, CheckCircle2 } from 'lucide-react'
import { CARGOS, FUNCIONARIOS, getCargosPorGrupo } from '@/lib/constants'
import type { Abordagem, Persona } from '@/lib/lp-content'

interface LpCaptureFormProps {
  abordagem: Abordagem
  persona?: Persona
  ctaTexto?: string
  variant?: 'full' | 'minimal' | 'medium'
  redirectTo?: string
}

// Componente interno que usa useSearchParams
function LpCaptureFormInner({
  abordagem,
  persona,
  ctaTexto = 'Criar Diagnóstico Gratuito',
  variant = 'full',
  redirectTo,
}: LpCaptureFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const cargosPorGrupo = getCargosPorGrupo()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    whatsapp: '',
    empresa: '',
    cargo: '',
    numeroFuncionarios: '',
    cidadeEmpreendimento: '',
    aceitaComunicacao: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Capturar UTMs
      const utmSource = searchParams.get('utm_source') || undefined
      const utmMedium = searchParams.get('utm_medium') || undefined
      const utmCampaign = searchParams.get('utm_campaign') || undefined

      const response = await fetch('/api/lp/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          abordagem,
          persona,
          landingPage: window.location.pathname,
          utmSource,
          utmMedium,
          utmCampaign,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro da API:', errorData)
        throw new Error(errorData.details || 'Erro ao enviar')
      }

      setIsSuccess(true)

      // Redirect após sucesso
      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo)
        } else if (abordagem === 'ebook') {
          router.push('/lp/ebook/obrigado')
        } else {
          router.push('/criar')
        }
      }, 1500)
    } catch (error) {
      console.error('Erro:', error)
      const message = error instanceof Error ? error.message : 'Erro ao enviar'
      alert(`Erro: ${message}. Tente novamente.`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Perfeito!</h3>
        <p className="text-zinc-400">Redirecionando...</p>
      </motion.div>
    )
  }

  // Campos básicos (minimal): nome, email, whatsapp
  // Campos medium: + empresa
  // Campos full: + cargo, funcionários, cidade

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome - sempre visível */}
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-zinc-300">Nome completo *</Label>
            <Input
              id="nome"
              required
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Seu nome"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Email - sempre visível */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email corporativo *</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="seu@empresa.com"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* WhatsApp - sempre visível */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-zinc-300">WhatsApp *</Label>
            <Input
              id="whatsapp"
              required
              value={formData.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              placeholder="(11) 99999-9999"
              className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Empresa - visível em medium e full */}
          {(variant === 'medium' || variant === 'full') && (
            <div className="space-y-2">
              <Label htmlFor="empresa" className="text-zinc-300">Empresa / Incorporadora *</Label>
              <Input
                id="empresa"
                required
                value={formData.empresa}
                onChange={(e) => handleChange('empresa', e.target.value)}
                placeholder="Nome da empresa"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          )}

          {/* Cargo - visível apenas em full */}
          {variant === 'full' && (
            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-zinc-300">Cargo *</Label>
              <Select
                value={formData.cargo}
                onValueChange={(value) => handleChange('cargo', value)}
                required
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700 max-h-[300px]">
                  {Object.entries(cargosPorGrupo).map(([grupo, cargos]) => (
                    <div key={grupo}>
                      <div className="px-2 py-1 text-xs text-zinc-500 font-semibold mt-2 first:mt-0">
                        {grupo}
                      </div>
                      {cargos.map((cargo) => (
                        <SelectItem key={cargo.value} value={cargo.label} className="text-white">
                          {cargo.label}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Número de funcionários - visível apenas em full */}
          {variant === 'full' && (
            <div className="space-y-2">
              <Label htmlFor="funcionarios" className="text-zinc-300">Número de funcionários *</Label>
              <Select
                value={formData.numeroFuncionarios}
                onValueChange={(value) => handleChange('numeroFuncionarios', value)}
                required
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {FUNCIONARIOS.map((func) => (
                    <SelectItem key={func.value} value={func.value} className="text-white">
                      {func.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Cidade do empreendimento - visível apenas em full */}
          {variant === 'full' && (
            <div className="space-y-2">
              <Label htmlFor="cidade" className="text-zinc-300">Cidade do empreendimento</Label>
              <Input
                id="cidade"
                value={formData.cidadeEmpreendimento}
                onChange={(e) => handleChange('cidadeEmpreendimento', e.target.value)}
                placeholder="Ex: São Paulo - SP"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
            </div>
          )}

          {/* Checkbox de comunicação - visível em medium e full */}
          {(variant === 'medium' || variant === 'full') && (
            <div className="flex items-start space-x-3 py-2">
              <Checkbox
                id="comunicacao"
                checked={formData.aceitaComunicacao}
                onCheckedChange={(checked) => handleChange('aceitaComunicacao', checked as boolean)}
                className="mt-0.5"
              />
              <Label htmlFor="comunicacao" className="text-zinc-400 text-sm cursor-pointer">
                Aceito receber comunicações sobre o mercado imobiliário e novidades da RPK
              </Label>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className={`w-full h-12 text-lg font-semibold ${
              abordagem === 'urgencia'
                ? 'bg-red-500 hover:bg-red-600'
                : abordagem === 'ebook'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                {ctaTexto}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 pt-2 text-zinc-500 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Dados seguros</span>
            </div>
            <span>•</span>
            <span>Sem spam</span>
            <span>•</span>
            <span>100% gratuito</span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Fallback de loading para o Suspense
function FormLoading() {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardContent className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      </CardContent>
    </Card>
  )
}

// Componente exportado que envolve o inner com Suspense
export default function LpCaptureForm(props: LpCaptureFormProps) {
  return (
    <Suspense fallback={<FormLoading />}>
      <LpCaptureFormInner {...props} />
    </Suspense>
  )
}
