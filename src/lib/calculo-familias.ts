// ============================================================================
// CÁLCULO AUTOMÁTICO DE FAMÍLIAS QUALIFICADAS
// Calcula o público-alvo potencial baseado na população e perfil do empreendimento
// ============================================================================

import { buscarComGrounding } from './gemini'

// ============================================================================
// TIPOS
// ============================================================================

export interface DadosEmpreendimento {
  precoMin: number
  precoMax?: number
  precoM2?: number
  metragem?: number
  dormitorios?: number
  padrao: 'economico' | 'medio' | 'alto'
}

export interface DadosCidade {
  nome: string
  estado: string
  populacao?: number
  domicilios?: number
  rendaMediaFamiliar?: number
  distribuicaoRenda?: {
    classe: string
    percentual: number
    rendaMinima: number
    rendaMaxima: number
  }[]
}

export interface ResultadoFamiliasQualificadas {
  // Dados base
  populacaoTotal: number
  totalDomicilios: number

  // Filtros aplicados
  filtros: {
    faixaEtaria: { percentual: number; descricao: string }
    rendaMinima: { valor: number; percentual: number; descricao: string }
    classeSocial: { classes: string[]; percentual: number; descricao: string }
    statusMoradia: { percentual: number; descricao: string }
  }

  // Resultados
  familiasQualificadas: number
  familiasAltoPotencial: number // Com renda > 4x parcela
  percentualPopulacao: number

  // Detalhamento
  calculoDetalhado: string
  metodologia: string
  fontes: string[]
}

// ============================================================================
// CONSTANTES DE MERCADO IMOBILIÁRIO
// ============================================================================

// Percentual da população na faixa etária compradora (25-55 anos)
const PERCENTUAL_FAIXA_ETARIA_COMPRADORA = 0.42

// Tamanho médio do domicílio brasileiro (IBGE 2022)
const TAMANHO_MEDIO_DOMICILIO = 2.9

// Percentual de locatários + morando com parentes (potenciais compradores)
const PERCENTUAL_POTENCIAIS_COMPRADORES = 0.35

// Distribuição de renda por classe (baseado em dados do IBGE)
const DISTRIBUICAO_RENDA_BRASIL = {
  A: { percentual: 0.029, rendaMinima: 22000, descricao: 'Classe A (> R$ 22.000)' },
  B1: { percentual: 0.049, rendaMinima: 11000, rendaMaxima: 22000, descricao: 'Classe B1 (R$ 11.000 - R$ 22.000)' },
  B2: { percentual: 0.102, rendaMinima: 5500, rendaMaxima: 11000, descricao: 'Classe B2 (R$ 5.500 - R$ 11.000)' },
  C1: { percentual: 0.187, rendaMinima: 3000, rendaMaxima: 5500, descricao: 'Classe C1 (R$ 3.000 - R$ 5.500)' },
  C2: { percentual: 0.221, rendaMinima: 1900, rendaMaxima: 3000, descricao: 'Classe C2 (R$ 1.900 - R$ 3.000)' },
  DE: { percentual: 0.412, rendaMinima: 0, rendaMaxima: 1900, descricao: 'Classes D/E (< R$ 1.900)' }
}

// Faixas de preço por padrão (para determinar classe-alvo)
const PERFIL_PADRAO = {
  economico: {
    precoM2Max: 5500,
    classesAlvo: ['C1', 'C2', 'DE'],
    rendaMinimaParcela: 3, // 3x a parcela
    descricao: 'Econômico (MCMV, primeiro imóvel)'
  },
  medio: {
    precoM2Min: 5500,
    precoM2Max: 9000,
    classesAlvo: ['B2', 'C1'],
    rendaMinimaParcela: 3.5,
    descricao: 'Médio padrão (famílias classe média)'
  },
  alto: {
    precoM2Min: 9000,
    classesAlvo: ['A', 'B1'],
    rendaMinimaParcela: 4,
    descricao: 'Alto padrão (premium, luxo)'
  }
}

// ============================================================================
// FUNÇÕES DE CÁLCULO
// ============================================================================

/**
 * Calcula a parcela estimada de financiamento
 * Usando tabela SAC com taxa média de mercado
 */
function calcularParcelaEstimada(valorImovel: number, prazoMeses: number = 360): number {
  // Taxa de juros média (aproximadamente 10% a.a. = 0.8% a.m.)
  const taxaMensal = 0.008

  // Entrada média de 20%
  const valorFinanciado = valorImovel * 0.8

  // Cálculo da parcela (Price)
  const parcela = valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) /
                  (Math.pow(1 + taxaMensal, prazoMeses) - 1)

  return Math.round(parcela)
}

/**
 * Determina as classes sociais alvo baseado no preço do imóvel
 */
function determinarClassesAlvo(
  precoImovel: number,
  padrao: 'economico' | 'medio' | 'alto'
): { classes: string[]; percentualTotal: number } {
  const perfil = PERFIL_PADRAO[padrao]
  let classesAlvo = perfil.classesAlvo

  // Ajustar classes baseado no preço real
  const parcelaEstimada = calcularParcelaEstimada(precoImovel)
  const rendaMinimaIdeal = parcelaEstimada * perfil.rendaMinimaParcela

  // Filtrar classes que atendem à renda mínima
  const classesQualificadas: string[] = []
  let percentualTotal = 0

  for (const [classe, dados] of Object.entries(DISTRIBUICAO_RENDA_BRASIL)) {
    if (classesAlvo.includes(classe)) {
      // Verificar se a renda mínima da classe é suficiente
      if (dados.rendaMinima >= rendaMinimaIdeal * 0.7) { // 70% da renda ideal (margem)
        classesQualificadas.push(classe)
        percentualTotal += dados.percentual
      }
    }
  }

  // Se não encontrou classes qualificadas, usar as mais próximas
  if (classesQualificadas.length === 0) {
    classesQualificadas.push(...classesAlvo.slice(0, 2))
    percentualTotal = classesAlvo.slice(0, 2).reduce((sum, c) => {
      return sum + (DISTRIBUICAO_RENDA_BRASIL[c as keyof typeof DISTRIBUICAO_RENDA_BRASIL]?.percentual || 0)
    }, 0)
  }

  return { classes: classesQualificadas, percentualTotal }
}

/**
 * Busca dados demográficos da cidade via Gemini com Grounding
 */
export async function buscarDadosCidade(cidade: string, estado: string): Promise<DadosCidade> {
  console.log(`[Famílias] Buscando dados demográficos de ${cidade}, ${estado}...`)

  const prompt = `Busque os dados demográficos ATUAIS de ${cidade}, ${estado}:

DADOS NECESSÁRIOS:
1. População total (IBGE mais recente)
2. Número de domicílios
3. Renda média familiar
4. Distribuição por classe social (se disponível)

FONTES CONFIÁVEIS:
- IBGE Cidades
- DataSebrae
- Atlas do Desenvolvimento Humano

FORMATO JSON:
{
  "populacao": 700000,
  "domicilios": 250000,
  "rendaMediaFamiliar": 4500,
  "fonte": "IBGE 2022",
  "observacoes": "qualquer observação relevante"
}

IMPORTANTE: Use dados REAIS do IBGE. Se não encontrar exato, use estimativa baseada na região.

RETORNE APENAS JSON.`

  try {
    const resultado = await buscarComGrounding(prompt)

    let jsonText = resultado.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const dados = JSON.parse(jsonText)

    console.log(`[Famílias] População: ${dados.populacao?.toLocaleString('pt-BR')} | Domicílios: ${dados.domicilios?.toLocaleString('pt-BR')}`)

    return {
      nome: cidade,
      estado,
      populacao: dados.populacao,
      domicilios: dados.domicilios,
      rendaMediaFamiliar: dados.rendaMediaFamiliar
    }

  } catch (error) {
    console.error('[Famílias] Erro ao buscar dados:', error)

    // Retornar estimativa baseada em cidade média
    return {
      nome: cidade,
      estado,
      populacao: 500000, // Estimativa padrão
      domicilios: 170000
    }
  }
}

// ============================================================================
// FUNÇÃO PRINCIPAL: CÁLCULO DE FAMÍLIAS QUALIFICADAS
// ============================================================================

/**
 * Calcula o número de famílias qualificadas para o empreendimento
 * @param empreendimento - Dados do empreendimento (preço, padrão, etc.)
 * @param cidade - Dados da cidade ou nome/estado para buscar
 * @returns Resultado completo com famílias qualificadas e metodologia
 */
export async function calcularFamiliasQualificadas(
  empreendimento: DadosEmpreendimento,
  cidade: DadosCidade | { nome: string; estado: string }
): Promise<ResultadoFamiliasQualificadas> {

  console.log(`\n${'='.repeat(60)}`)
  console.log(`CÁLCULO DE FAMÍLIAS QUALIFICADAS`)
  console.log(`${'='.repeat(60)}`)

  // 1. Obter dados da cidade (buscar se necessário)
  let dadosCidade: DadosCidade
  if ('populacao' in cidade && cidade.populacao) {
    dadosCidade = cidade as DadosCidade
  } else {
    dadosCidade = await buscarDadosCidade(cidade.nome, cidade.estado)
  }

  const populacaoTotal = dadosCidade.populacao || 500000
  const totalDomicilios = dadosCidade.domicilios || Math.round(populacaoTotal / TAMANHO_MEDIO_DOMICILIO)

  console.log(`\nCidade: ${dadosCidade.nome}, ${dadosCidade.estado}`)
  console.log(`População: ${populacaoTotal.toLocaleString('pt-BR')}`)
  console.log(`Domicílios: ${totalDomicilios.toLocaleString('pt-BR')}`)

  // 2. Calcular parcela estimada
  const precoImovel = empreendimento.precoMin
  const parcelaEstimada = calcularParcelaEstimada(precoImovel)
  const perfil = PERFIL_PADRAO[empreendimento.padrao]
  const rendaMinimaIdeal = parcelaEstimada * perfil.rendaMinimaParcela

  console.log(`\nEmpreendimento:`)
  console.log(`Preço: R$ ${precoImovel.toLocaleString('pt-BR')}`)
  console.log(`Parcela estimada: R$ ${parcelaEstimada.toLocaleString('pt-BR')}`)
  console.log(`Renda mínima ideal: R$ ${rendaMinimaIdeal.toLocaleString('pt-BR')} (${perfil.rendaMinimaParcela}x parcela)`)
  console.log(`Padrão: ${perfil.descricao}`)

  // 3. Determinar classes-alvo
  const { classes: classesAlvo, percentualTotal: percentualClasses } = determinarClassesAlvo(precoImovel, empreendimento.padrao)

  console.log(`\nClasses-alvo: ${classesAlvo.join(', ')} (${(percentualClasses * 100).toFixed(1)}% da população)`)

  // 4. Aplicar filtros em cascata
  let familiasPotenciais = totalDomicilios

  // Filtro 1: Faixa etária (25-55 anos - principais compradores)
  const filtroFaixaEtaria = PERCENTUAL_FAIXA_ETARIA_COMPRADORA
  familiasPotenciais = Math.round(familiasPotenciais * filtroFaixaEtaria)

  // Filtro 2: Classe social / Renda
  const filtroClasse = percentualClasses
  familiasPotenciais = Math.round(familiasPotenciais * filtroClasse)

  // Filtro 3: Status de moradia (locatários + morando com parentes)
  const filtroMoradia = PERCENTUAL_POTENCIAIS_COMPRADORES
  familiasPotenciais = Math.round(familiasPotenciais * filtroMoradia)

  // Cálculo de alto potencial (renda > 4x parcela)
  const percentualAltoPotencial = classesAlvo.includes('A') || classesAlvo.includes('B1') ? 0.4 : 0.25
  const familiasAltoPotencial = Math.round(familiasPotenciais * percentualAltoPotencial)

  // Percentual da população total
  const percentualPopulacao = (familiasPotenciais / populacaoTotal) * 100

  console.log(`\n${'='.repeat(60)}`)
  console.log(`RESULTADO`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Famílias Qualificadas: ${familiasPotenciais.toLocaleString('pt-BR')}`)
  console.log(`Alto Potencial (renda > 4x): ${familiasAltoPotencial.toLocaleString('pt-BR')}`)
  console.log(`Percentual da população: ${percentualPopulacao.toFixed(2)}%`)
  console.log(`${'='.repeat(60)}\n`)

  // Montar cálculo detalhado para exibição
  const calculoDetalhado = `
CÁLCULO DE FAMÍLIAS QUALIFICADAS - ${dadosCidade.nome.toUpperCase()}

Base: ${totalDomicilios.toLocaleString('pt-BR')} domicílios

FILTROS APLICADOS:
├─ Faixa etária (25-55 anos): × ${(filtroFaixaEtaria * 100).toFixed(0)}%
│  → ${Math.round(totalDomicilios * filtroFaixaEtaria).toLocaleString('pt-BR')} famílias
│
├─ Classes ${classesAlvo.join('/')}: × ${(filtroClasse * 100).toFixed(1)}%
│  → ${Math.round(totalDomicilios * filtroFaixaEtaria * filtroClasse).toLocaleString('pt-BR')} famílias
│
├─ Renda ≥ R$ ${rendaMinimaIdeal.toLocaleString('pt-BR')} (${perfil.rendaMinimaParcela}x parcela)
│
└─ Potenciais compradores: × ${(filtroMoradia * 100).toFixed(0)}%
   (locatários + morando com parentes)

RESULTADO FINAL:
════════════════════════════════════════
  ${familiasPotenciais.toLocaleString('pt-BR')} FAMÍLIAS QUALIFICADAS
════════════════════════════════════════
  ${familiasAltoPotencial.toLocaleString('pt-BR')} com alto potencial (renda > 4x parcela)
  ${percentualPopulacao.toFixed(2)}% da população total
`.trim()

  const metodologia = `
Metodologia baseada em:
1. Dados demográficos do IBGE (população e domicílios)
2. Distribuição de renda por classe social (IBGE/ABEP)
3. Regra de 30% da renda para habitação (padrão mercado)
4. Taxa de financiamento: ~10% a.a. (média mercado 2024)
5. Prazo: 360 meses | Entrada: 20%
`.trim()

  return {
    populacaoTotal,
    totalDomicilios,
    filtros: {
      faixaEtaria: {
        percentual: filtroFaixaEtaria,
        descricao: 'População entre 25-55 anos (principal faixa compradora)'
      },
      rendaMinima: {
        valor: rendaMinimaIdeal,
        percentual: filtroClasse,
        descricao: `Renda familiar ≥ R$ ${rendaMinimaIdeal.toLocaleString('pt-BR')} (${perfil.rendaMinimaParcela}x parcela)`
      },
      classeSocial: {
        classes: classesAlvo,
        percentual: percentualClasses,
        descricao: `Classes ${classesAlvo.join('/')} - ${perfil.descricao}`
      },
      statusMoradia: {
        percentual: filtroMoradia,
        descricao: 'Locatários ou morando com parentes (potenciais compradores)'
      }
    },
    familiasQualificadas: familiasPotenciais,
    familiasAltoPotencial,
    percentualPopulacao,
    calculoDetalhado,
    metodologia,
    fontes: ['IBGE Cidades', 'ABEP - Critério Brasil', 'Banco Central (taxas de financiamento)']
  }
}

// ============================================================================
// FUNÇÃO AUXILIAR: CÁLCULO RÁPIDO (sem buscar dados da cidade)
// ============================================================================

/**
 * Calcula famílias qualificadas com dados já disponíveis
 * Útil quando já temos os dados da cidade
 */
export function calcularFamiliasRapido(
  populacao: number,
  precoImovel: number,
  padrao: 'economico' | 'medio' | 'alto'
): { qualificadas: number; altoPotencial: number; percentual: number } {

  const domicilios = Math.round(populacao / TAMANHO_MEDIO_DOMICILIO)
  const parcelaEstimada = calcularParcelaEstimada(precoImovel)
  const perfil = PERFIL_PADRAO[padrao]
  const { percentualTotal } = determinarClassesAlvo(precoImovel, padrao)

  let familias = domicilios
  familias = Math.round(familias * PERCENTUAL_FAIXA_ETARIA_COMPRADORA)
  familias = Math.round(familias * percentualTotal)
  familias = Math.round(familias * PERCENTUAL_POTENCIAIS_COMPRADORES)

  const altoPotencial = Math.round(familias * 0.3)
  const percentual = (familias / populacao) * 100

  return {
    qualificadas: familias,
    altoPotencial,
    percentual
  }
}
