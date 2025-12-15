// Constantes compartilhadas - RPK Análise

export const CARGOS = [
  // Diretoria / C-Level
  { value: 'ceo', label: 'CEO / Diretor Geral', grupo: 'Diretoria' },
  { value: 'diretor-comercial', label: 'Diretor Comercial', grupo: 'Diretoria' },
  { value: 'diretor-marketing', label: 'Diretor de Marketing', grupo: 'Diretoria' },
  { value: 'diretor-incorporacao', label: 'Diretor de Incorporação', grupo: 'Diretoria' },
  { value: 'diretor-operacoes', label: 'Diretor de Operações', grupo: 'Diretoria' },
  // Gerência
  { value: 'gerente-comercial', label: 'Gerente Comercial', grupo: 'Gerência' },
  { value: 'gerente-marketing', label: 'Gerente de Marketing', grupo: 'Gerência' },
  { value: 'gerente-vendas', label: 'Gerente de Vendas', grupo: 'Gerência' },
  { value: 'gerente-projetos', label: 'Gerente de Projetos', grupo: 'Gerência' },
  { value: 'gerente-lancamentos', label: 'Gerente de Lançamentos', grupo: 'Gerência' },
  // Coordenação
  { value: 'coordenador-marketing', label: 'Coordenador de Marketing', grupo: 'Coordenação' },
  { value: 'coordenador-vendas', label: 'Coordenador de Vendas', grupo: 'Coordenação' },
  { value: 'coordenador-comercial', label: 'Coordenador Comercial', grupo: 'Coordenação' },
  // Analistas / Especialistas
  { value: 'analista-marketing', label: 'Analista de Marketing', grupo: 'Analistas' },
  { value: 'analista-inteligencia', label: 'Analista de Inteligência de Mercado', grupo: 'Analistas' },
  { value: 'especialista-midia', label: 'Especialista em Mídia', grupo: 'Analistas' },
  // Corretores / Imobiliárias
  { value: 'corretor', label: 'Corretor de Imóveis', grupo: 'Imobiliárias' },
  { value: 'dono-imobiliaria', label: 'Proprietário de Imobiliária', grupo: 'Imobiliárias' },
  { value: 'gerente-imobiliaria', label: 'Gerente de Imobiliária', grupo: 'Imobiliárias' },
  // Sócios / Proprietários
  { value: 'socio', label: 'Sócio / Proprietário', grupo: 'Outros' },
  { value: 'investidor', label: 'Investidor', grupo: 'Outros' },
  // Outros
  { value: 'consultor', label: 'Consultor Imobiliário', grupo: 'Outros' },
  { value: 'outro', label: 'Outro', grupo: 'Outros' },
]

export const FUNCIONARIOS = [
  { value: '1-10', label: '1-10 funcionários' },
  { value: '11-50', label: '11-50 funcionários' },
  { value: '51-200', label: '51-200 funcionários' },
  { value: '201-500', label: '201-500 funcionários' },
  { value: '500+', label: '500+ funcionários' },
]

// Origens de leads
export const ORIGENS = [
  { value: 'organico', label: 'Orgânico', cor: 'bg-zinc-500/20 text-zinc-400' },
  { value: 'diagnostico', label: 'Diagnóstico', cor: 'bg-orange-500/20 text-orange-400' },
  { value: 'lp-racional', label: 'LP Racional', cor: 'bg-amber-500/20 text-amber-400' },
  { value: 'lp-emocional', label: 'LP Emocional', cor: 'bg-purple-500/20 text-purple-400' },
  { value: 'lp-urgencia', label: 'LP Urgência', cor: 'bg-red-500/20 text-red-400' },
  { value: 'lp-ebook', label: 'Ebook', cor: 'bg-green-500/20 text-green-400' },
]

// Abordagens das LPs
export const ABORDAGENS = [
  { value: 'racional', label: 'Racional', cor: 'bg-amber-500/20 text-amber-400' },
  { value: 'emocional', label: 'Emocional', cor: 'bg-purple-500/20 text-purple-400' },
  { value: 'urgencia', label: 'Urgência', cor: 'bg-red-500/20 text-red-400' },
  { value: 'ebook', label: 'Ebook', cor: 'bg-green-500/20 text-green-400' },
]

// Personas
export const PERSONAS = [
  { value: 'ceo', label: 'CEO/Diretor', cor: 'bg-blue-500/20 text-blue-400' },
  { value: 'marketing', label: 'Marketing', cor: 'bg-pink-500/20 text-pink-400' },
  { value: 'comercial', label: 'Comercial', cor: 'bg-cyan-500/20 text-cyan-400' },
]

// Helpers
export function getCargoLabel(value: string): string {
  const cargo = CARGOS.find(c => c.value === value || c.label === value)
  return cargo?.label || value || '-'
}

export function getOrigemLabel(value: string): string {
  const origem = ORIGENS.find(o => o.value === value)
  return origem?.label || value || 'Orgânico'
}

export function getOrigemCor(value: string): string {
  const origem = ORIGENS.find(o => o.value === value)
  return origem?.cor || 'bg-zinc-500/20 text-zinc-400'
}

export function getAbordagemLabel(value: string): string {
  const abordagem = ABORDAGENS.find(a => a.value === value)
  return abordagem?.label || value || '-'
}

export function getAbordagemCor(value: string): string {
  const abordagem = ABORDAGENS.find(a => a.value === value)
  return abordagem?.cor || 'bg-zinc-500/20 text-zinc-400'
}

export function getPersonaLabel(value: string): string {
  const persona = PERSONAS.find(p => p.value === value)
  return persona?.label || value || '-'
}

export function getPersonaCor(value: string): string {
  const persona = PERSONAS.find(p => p.value === value)
  return persona?.cor || 'bg-zinc-500/20 text-zinc-400'
}

// Agrupar cargos por grupo
export function getCargosPorGrupo() {
  const grupos: Record<string, typeof CARGOS> = {}
  CARGOS.forEach(cargo => {
    if (!grupos[cargo.grupo]) {
      grupos[cargo.grupo] = []
    }
    grupos[cargo.grupo].push(cargo)
  })
  return grupos
}
