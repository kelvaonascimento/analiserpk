'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, Building2, FileText, Palmtree, Users, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import StepLead from '@/components/formulario/StepLead'
import StepEmpreendimento from '@/components/formulario/StepEmpreendimento'
import StepUnidades from '@/components/formulario/StepUnidades'
import StepLazer from '@/components/formulario/StepLazer'
import StepConcorrentes from '@/components/formulario/StepConcorrentes'
import StepConfirmacao from '@/components/formulario/StepConfirmacao'
import type { FormData, Lead, Unidade, Concorrente } from '@/types'

const STEPS = [
  { id: 1, title: 'Seus Dados', icon: Users, description: 'Informações de contato' },
  { id: 2, title: 'Empreendimento', icon: Building2, description: 'Dados básicos' },
  { id: 3, title: 'Unidades', icon: FileText, description: 'Tipos e preços' },
  { id: 4, title: 'Lazer', icon: Palmtree, description: 'Amenidades' },
  { id: 5, title: 'Concorrentes', icon: Users, description: 'Análise competitiva' },
  { id: 6, title: 'Confirmar', icon: Sparkles, description: 'Gerar análise' },
]

const initialFormData: FormData = {
  lead: {
    nome: '',
    email: '',
    whatsapp: '',
    cargo: '',
    empresa: '',
    numeroFuncionarios: '1-10',
    cidadeEmpreendimento: '',
  },
  empreendimentoBasico: {
    nome: '',
    construtora: '',
    incorporacao: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
    torres: 1,
    andares: 1,
    unidadesTotal: 1,
    elevadores: 1,
    entregaMes: 1,
    entregaAno: new Date().getFullYear() + 2,
    percentualVendido: 0,
  },
  unidades: [
    {
      metragem: 0,
      dormitorios: 2,
      suites: 1,
      banheiros: 2,
      vagasGaragem: 1,
      precoMin: 0,
      precoMax: 0,
      precoM2: 0,
      quantidadeDisponivel: 0,
    },
  ],
  itensLazer: [],
  diferenciais: [],
  tecnologia: [],
  concorrentes: [],
}

export default function CriarPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null)

  const progress = (currentStep / STEPS.length) * 100

  const updateFormData = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    try {
      // 1. Salvar lead
      const leadRes = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData.lead),
      })

      if (!leadRes.ok) {
        const errorText = await leadRes.text()
        throw new Error(`Erro ao salvar lead: ${leadRes.status} - ${errorText}`)
      }
      const lead = await leadRes.json()

      // 2. Criar projeto
      const projetoRes = await fetch('/api/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          empreendimento: {
            nome: formData.empreendimentoBasico.nome,
            construtora: formData.empreendimentoBasico.construtora,
            incorporacao: formData.empreendimentoBasico.incorporacao.split(',').map(s => s.trim()),
            endereco: formData.empreendimentoBasico.endereco,
            especificacoes: {
              torres: formData.empreendimentoBasico.torres,
              andares: formData.empreendimentoBasico.andares,
              unidadesTotal: formData.empreendimentoBasico.unidadesTotal,
              elevadores: formData.empreendimentoBasico.elevadores,
            },
            unidades: formData.unidades,
            entrega: {
              mes: formData.empreendimentoBasico.entregaMes,
              ano: formData.empreendimentoBasico.entregaAno,
            },
            percentualVendido: formData.empreendimentoBasico.percentualVendido,
            itensLazer: formData.itensLazer,
            diferenciais: formData.diferenciais,
            tecnologia: formData.tecnologia,
          },
          concorrentes: formData.concorrentes,
        }),
      })

      if (!projetoRes.ok) {
        const errorText = await projetoRes.text()
        throw new Error(`Erro ao criar projeto: ${projetoRes.status} - ${errorText}`)
      }
      const projeto = await projetoRes.json()

      // 3. Gerar análise
      const analiseRes = await fetch('/api/gerar-analise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projetoId: projeto.id }),
      })

      if (!analiseRes.ok) {
        const errorText = await analiseRes.text()
        throw new Error(`Erro ao gerar análise: ${analiseRes.status} - ${errorText}`)
      }
      const analise = await analiseRes.json()

      setGeneratedUrl(`/analise/${projeto.slug}`)
    } catch (error) {
      console.error('Erro ao gerar análise:', error)
      setError(error instanceof Error ? error.message : 'Erro desconhecido ao gerar análise')
    } finally {
      setIsGenerating(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepLead
            data={formData.lead}
            onChange={(data) => updateFormData('lead', data)}
          />
        )
      case 2:
        return (
          <StepEmpreendimento
            data={formData.empreendimentoBasico}
            onChange={(data) => updateFormData('empreendimentoBasico', data)}
          />
        )
      case 3:
        return (
          <StepUnidades
            data={formData.unidades}
            onChange={(data) => updateFormData('unidades', data)}
          />
        )
      case 4:
        return (
          <StepLazer
            itensLazer={formData.itensLazer}
            diferenciais={formData.diferenciais}
            tecnologia={formData.tecnologia}
            onChange={(itens, difs, tech) => {
              updateFormData('itensLazer', itens)
              updateFormData('diferenciais', difs)
              updateFormData('tecnologia', tech)
            }}
          />
        )
      case 5:
        // Calcular metragem média para referência na busca
        const metragemMedia = formData.unidades.length > 0
          ? Math.round(formData.unidades.reduce((sum, u) => sum + u.metragem, 0) / formData.unidades.length)
          : undefined

        // Calcular preço médio e preço/m² médio das unidades
        const precoMedio = formData.unidades.length > 0
          ? Math.round(formData.unidades.reduce((sum, u) => sum + u.precoMin, 0) / formData.unidades.length)
          : undefined

        const precoM2Medio = formData.unidades.length > 0
          ? Math.round(formData.unidades.reduce((sum, u) => sum + u.precoM2, 0) / formData.unidades.length)
          : undefined

        return (
          <StepConcorrentes
            data={formData.concorrentes}
            cidade={formData.empreendimentoBasico.endereco.cidade}
            estado={formData.empreendimentoBasico.endereco.estado}
            bairro={formData.empreendimentoBasico.endereco.bairro}
            metragemReferencia={metragemMedia}
            precoReferencia={precoMedio}
            precoM2Referencia={precoM2Medio}
            itensLazer={formData.itensLazer.length}
            onChange={(data) => updateFormData('concorrentes', data)}
          />
        )
      case 6:
        return (
          <StepConfirmacao
            formData={formData}
            isGenerating={isGenerating}
            generatedUrl={generatedUrl}
            error={error}
            onGenerate={handleGenerate}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            RPK <span className="text-orange-500">Análise</span>
          </h1>
          <p className="text-zinc-400">
            Crie uma análise estratégica completa para seu empreendimento
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-zinc-400">
              Passo {currentStep} de {STEPS.length}
            </span>
            <span className="text-sm text-zinc-400">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps indicator */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2">
          {STEPS.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center min-w-[80px] ${
                  isActive ? 'text-orange-500' : isCompleted ? 'text-green-500' : 'text-zinc-600'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? 'bg-orange-500/20 border-2 border-orange-500'
                      : isCompleted
                      ? 'bg-green-500/20 border-2 border-green-500'
                      : 'bg-zinc-800 border-2 border-zinc-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className="text-xs font-medium hidden sm:block">{step.title}</span>
              </div>
            )
          })}
        </div>

        {/* Form content */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {(() => {
                const Icon = STEPS[currentStep - 1].icon
                return <Icon className="w-5 h-5 text-orange-500" />
              })()}
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Navigation */}
        {currentStep < 6 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={handleNext}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
