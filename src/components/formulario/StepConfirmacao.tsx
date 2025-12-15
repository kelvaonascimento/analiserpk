'use client'

import { CheckCircle2, ExternalLink, Building2, MapPin, Calendar, Users, Sparkles, Award, AlertCircle, Zap, BarChart3, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FormData } from '@/types'
import LoadingSteps from './LoadingSteps'

interface StepConfirmacaoProps {
  formData: FormData
  isGenerating: boolean
  generatedUrl: string | null
  error: string | null
  onGenerate: () => void
}

export default function StepConfirmacao({
  formData,
  isGenerating,
  generatedUrl,
  error,
  onGenerate,
}: StepConfirmacaoProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value)
  }

  // Mostra loading visual quando está gerando
  if (isGenerating) {
    return (
      <LoadingSteps
        isActive={isGenerating}
        cidade={formData.empreendimentoBasico.endereco.cidade}
      />
    )
  }

  if (generatedUrl) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">
          Análise Gerada com Sucesso!
        </h3>
        <p className="text-zinc-400 mb-6">
          Sua análise estratégica completa está pronta.
        </p>
        <Button
          asChild
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <a href={generatedUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Ver Análise Completa
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 text-sm mb-6">
        Revise os dados antes de gerar a análise estratégica completa.
      </p>

      {/* Lead info */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Seus Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          <div className="grid grid-cols-2 gap-2">
            <span><strong className="text-zinc-300">Nome:</strong> {formData.lead.nome}</span>
            <span><strong className="text-zinc-300">Email:</strong> {formData.lead.email}</span>
            <span><strong className="text-zinc-300">WhatsApp:</strong> {formData.lead.whatsapp}</span>
            <span><strong className="text-zinc-300">Empresa:</strong> {formData.lead.empresa}</span>
          </div>
        </CardContent>
      </Card>

      {/* Empreendimento */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" />
            {formData.empreendimentoBasico.nome || 'Empreendimento'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          <div className="grid grid-cols-2 gap-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {formData.empreendimentoBasico.endereco.cidade}, {formData.empreendimentoBasico.endereco.estado}
            </span>
            <span><strong className="text-zinc-300">Construtora:</strong> {formData.empreendimentoBasico.construtora}</span>
            <span><strong className="text-zinc-300">Torres:</strong> {formData.empreendimentoBasico.torres}</span>
            <span><strong className="text-zinc-300">Andares:</strong> {formData.empreendimentoBasico.andares}</span>
            <span><strong className="text-zinc-300">Unidades:</strong> {formData.empreendimentoBasico.unidadesTotal}</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Entrega: {formData.empreendimentoBasico.entregaMes}/{formData.empreendimentoBasico.entregaAno}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Unidades */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Award className="w-4 h-4 text-orange-500" />
            Unidades
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
              {formData.unidades.length} tipo{formData.unidades.length > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          <div className="space-y-2">
            {formData.unidades.map((unidade, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-zinc-900/50 rounded">
                <span>{unidade.metragem}m² - {unidade.dormitorios} dorms</span>
                <span className="text-orange-400">{formatCurrency(unidade.precoMin)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lazer e diferenciais */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            Lazer e Diferenciais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
              {formData.itensLazer.length} itens de lazer
            </Badge>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              {formData.diferenciais.length} diferenciais
            </Badge>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {formData.tecnologia.length} tecnologias
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Concorrentes */}
      <Card className="bg-zinc-800/50 border-zinc-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            Concorrentes
            <Badge variant="secondary" className="bg-zinc-700 text-zinc-300">
              {formData.concorrentes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          {formData.concorrentes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.concorrentes.slice(0, 5).map((c, i) => (
                <Badge key={i} variant="outline" className="border-zinc-700 text-zinc-400">
                  {c.nome}
                </Badge>
              ))}
              {formData.concorrentes.length > 5 && (
                <Badge variant="outline" className="border-zinc-700 text-zinc-500">
                  +{formData.concorrentes.length - 5} mais
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-zinc-500">Nenhum concorrente adicionado</span>
          )}
        </CardContent>
      </Card>

      {/* Dados automáticos */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-400" />
            Levantamento de Mercado Automático
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              IA
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-300/80">
          <div className="flex items-start gap-3">
            <BarChart3 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="mb-2">
                Ao gerar a análise, buscaremos automaticamente dados de mercado para{' '}
                <strong className="text-blue-300">
                  {formData.empreendimentoBasico.endereco.cidade || 'sua cidade'}
                </strong>:
              </p>
              <ul className="grid grid-cols-2 gap-1 text-xs">
                <li>• População e PIB</li>
                <li>• Renda e classes sociais</li>
                <li>• Emprego e empresas</li>
                <li>• Preço/m² da região</li>
                <li>• Mercado imobiliário</li>
                <li>• Tendências locais</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-400 font-medium mb-1">Erro ao gerar análise</h4>
              <p className="text-red-300/80 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Generate button */}
      <div className="pt-4">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-6 text-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Gerando análise estratégica...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {error ? 'Tentar Novamente' : 'Gerar Análise Completa'}
            </>
          )}
        </Button>
        <p className="text-zinc-500 text-xs text-center mt-3">
          A análise inclui: levantamento de mercado automático, SWOT completo, 3 personas detalhadas,
          comparativo de concorrentes, estratégia de marketing e checklist de implementação.
        </p>
      </div>
    </div>
  )
}
