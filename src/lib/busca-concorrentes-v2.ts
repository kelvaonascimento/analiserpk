// ============================================================================
// BUSCA DE CONCORRENTES V2 - Otimizada para velocidade e mais resultados
//
// Arquitetura:
// 1. Google Custom Search em paralelo (3-5 queries simultâneas)
// 2. Um único parsing com Gemini
// 3. Aceita empreendimentos sem link (usuário pode completar)
// 4. Fallback para sistema antigo se necessário
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Concorrente } from '@/types'
import { buscarConcorrentesCompleto } from './busca-concorrentes'

const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY || ''
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || ''
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)

// ============================================================================
// INTERFACES
// ============================================================================

export interface ResultadoBuscaV2 {
  concorrentes: ConcorrenteV2[]
  metodo: 'google_custom_search' | 'gemini_grounding' | 'fallback'
  queries: string[]
  totalResultadosGoogle: number
  tempoExecucao: number
  cidadesAnalisadas: string[]
  bairrosAnalisados: Record<string, string[]>
  fontes: string[]
}

export interface ConcorrenteV2 extends Concorrente {
  linkPendente?: boolean
  confianca?: 'alta' | 'media' | 'baixa'
  dormitorios?: string
}

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
}

// ============================================================================
// QUERIES OTIMIZADAS
// ============================================================================

function gerarQueriesOtimizadas(params: {
  cidade: string
  estado: string
  bairro?: string
  padrao?: 'economico' | 'medio' | 'alto'
}): string[] {
  const { cidade, estado, bairro, padrao } = params
  const local = bairro ? `${bairro} ${cidade}` : cidade

  const queries: string[] = [
    // Query 1: Busca ampla de lançamentos
    `apartamento lançamento ${local} ${estado} 2024 2025`,

    // Query 2: Portal VivaReal (maior portal)
    `site:vivareal.com.br lançamento ${cidade} ${bairro || ''}`,

    // Query 3: Portal ZAP Imóveis
    `site:zapimoveis.com.br apartamento novo ${cidade}`,

    // Query 4: Lopes (imobiliária com muitos dados)
    `site:lopes.com.br lançamento ${cidade}`,

    // Query 5: Empreendimentos residenciais
    `residencial empreendimento ${local} lançamento 2024`,
  ]

  // Adicionar query específica por padrão
  if (padrao === 'economico') {
    queries.push(`apartamento minha casa minha vida ${cidade} ${estado} 2024`)
  } else if (padrao === 'alto') {
    queries.push(`apartamento alto padrão luxo ${local} condomínio clube`)
  }

  return queries
}

// ============================================================================
// BUSCA NO GOOGLE CUSTOM SEARCH
// ============================================================================

async function buscarNoGoogleCustomSearch(query: string): Promise<GoogleSearchResult[]> {
  if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    console.warn('[Google Search] API Key ou Search Engine ID não configurados')
    return []
  }

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', GOOGLE_API_KEY)
    url.searchParams.set('cx', SEARCH_ENGINE_ID)
    url.searchParams.set('q', query)
    url.searchParams.set('gl', 'br')
    url.searchParams.set('lr', 'lang_pt')
    url.searchParams.set('num', '10')

    const response = await fetch(url.toString())

    if (!response.ok) {
      if (response.status === 403) {
        console.warn('[Google Search] API não habilitada ou cota excedida')
      }
      return []
    }

    const data = await response.json()
    return (data.items || []).map((item: GoogleSearchResult) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || '',
      displayLink: item.displayLink
    }))

  } catch (error) {
    console.error('[Google Search] Erro:', error)
    return []
  }
}

// ============================================================================
// BUSCA PARALELA
// ============================================================================

async function buscarEmParalelo(queries: string[]): Promise<{
  resultados: GoogleSearchResult[]
  fontes: string[]
}> {
  console.log(`[Busca V2] Executando ${queries.length} queries em paralelo...`)

  // Executar todas as queries simultaneamente
  const promessas = queries.map(query => buscarNoGoogleCustomSearch(query))
  const resultadosArray = await Promise.all(promessas)

  // Consolidar resultados únicos
  const urlsVistas = new Set<string>()
  const resultados: GoogleSearchResult[] = []
  const fontes = new Set<string>()

  for (const lista of resultadosArray) {
    for (const item of lista) {
      if (!urlsVistas.has(item.link)) {
        urlsVistas.add(item.link)
        resultados.push(item)
        fontes.add(item.displayLink)
      }
    }
  }

  console.log(`[Busca V2] ${resultados.length} resultados únicos de ${fontes.size} fontes`)
  return { resultados, fontes: Array.from(fontes) }
}

// ============================================================================
// PARSING COM GEMINI (ÚNICO)
// ============================================================================

async function parsearResultados(
  resultados: GoogleSearchResult[],
  cidade: string,
  bairro?: string
): Promise<ConcorrenteV2[]> {
  if (resultados.length === 0) return []

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    }
  })

  // Preparar texto dos resultados
  const textosResultados = resultados.map((r, i) =>
    `[${i + 1}] ${r.title}\nURL: ${r.link}\nDescrição: ${r.snippet}`
  ).join('\n---\n')

  const prompt = `Você é um especialista em mercado imobiliário brasileiro. Analise estes ${resultados.length} resultados de busca do Google sobre empreendimentos em ${cidade}${bairro ? `, bairro ${bairro}` : ''}.

RESULTADOS DA BUSCA:
${textosResultados}

TAREFA: Extraia TODOS os empreendimentos imobiliários (apartamentos, residenciais) encontrados. Para cada um:

- nome: Nome REAL do empreendimento (ex: "Residencial Douro", "AYA Home Resort") - NÃO use títulos genéricos
- construtora: Nome da construtora/incorporadora (se encontrar no texto ou URL)
- cidade: Cidade do empreendimento
- bairro: Bairro (se identificável)
- metragemMin: Menor metragem em m² (número ou null)
- metragemMax: Maior metragem em m² (número ou null)
- precoMin: Menor preço em reais (número sem pontos, ou null)
- precoMax: Maior preço em reais (número sem pontos, ou null)
- dormitorios: Quartos disponíveis (ex: "2 e 3", "3", ou null)
- entrega: Ano de entrega (número ou null)
- status: "Lançamento", "Em obras", "Pronto" ou null
- link: URL do resultado (sempre incluir mesmo se for portal)
- fonte: Nome do site (VivaReal, ZAP, Lopes, nome da construtora, etc)
- confianca: "alta" se dados claros, "media" se parciais, "baixa" se incertos

REGRAS IMPORTANTES:
1. INCLUA todos os empreendimentos encontrados, mesmo com dados parciais
2. Se não encontrar um dado, use null - NÃO invente
3. Um mesmo empreendimento pode aparecer em múltiplas fontes - escolha a com mais dados
4. Extraia o nome do empreendimento mesmo que esteja misturado no título
5. Aceite links de portais (VivaReal, ZAP) - são válidos
6. Identifique construtora pelo domínio se possível (ex: mrv.com.br = MRV)

FORMATO JSON:
{
  "empreendimentos": [
    {
      "nome": "Nome Real",
      "construtora": "Construtora X",
      "cidade": "${cidade}",
      "bairro": "Bairro Y",
      "metragemMin": 50,
      "metragemMax": 80,
      "precoMin": 350000,
      "precoMax": 500000,
      "dormitorios": "2 e 3",
      "entrega": 2025,
      "status": "Em obras",
      "link": "https://url.com",
      "fonte": "VivaReal",
      "confianca": "alta"
    }
  ]
}

Retorne APENAS o JSON, sem explicações.`

  try {
    console.log(`[Parser V2] Extraindo dados com Gemini...`)
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Limpar JSON
    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const data = JSON.parse(jsonText)
    const empreendimentos = data.empreendimentos || []

    console.log(`[Parser V2] ${empreendimentos.length} empreendimentos extraídos`)

    // Converter para formato ConcorrenteV2
    return empreendimentos.map((e: {
      nome: string
      construtora?: string
      cidade?: string
      bairro?: string
      metragemMin?: number
      metragemMax?: number
      precoMin?: number
      precoMax?: number
      dormitorios?: string
      entrega?: number
      status?: string
      link?: string
      fonte?: string
      confianca?: 'alta' | 'media' | 'baixa'
    }) => ({
      nome: e.nome,
      construtora: e.construtora || 'Não identificada',
      cidade: e.cidade || cidade,
      metragemMin: e.metragemMin,
      metragemMax: e.metragemMax,
      precoMin: e.precoMin,
      precoMax: e.precoMax,
      precoM2: e.precoMin && e.metragemMin ? Math.round(e.precoMin / e.metragemMin) : undefined,
      dormitorios: e.dormitorios,
      entrega: { ano: e.entrega || 2025 },
      status: e.status || 'Em análise',
      link: e.link,
      linkPendente: !e.link,
      fonte: e.fonte || 'Google Search',
      confianca: e.confianca || 'media'
    }))

  } catch (error) {
    console.error('[Parser V2] Erro ao parsear:', error)
    return []
  }
}

// ============================================================================
// REMOVER DUPLICATAS
// ============================================================================

function removerDuplicatas(concorrentes: ConcorrenteV2[]): ConcorrenteV2[] {
  const vistos = new Map<string, ConcorrenteV2>()

  for (const c of concorrentes) {
    // Normalizar nome para comparação
    const chave = c.nome.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '')
      .substring(0, 25)

    const existente = vistos.get(chave)
    if (!existente) {
      vistos.set(chave, c)
    } else {
      // Calcular score de completude
      const scoreExistente = calcularScore(existente)
      const scoreNovo = calcularScore(c)

      if (scoreNovo > scoreExistente) {
        vistos.set(chave, c)
      }
    }
  }

  return Array.from(vistos.values())
}

function calcularScore(c: ConcorrenteV2): number {
  let score = 0
  if (c.precoMin) score += 3
  if (c.precoM2) score += 3
  if (c.metragemMin) score += 2
  if (c.construtora && c.construtora !== 'Não identificada') score += 2
  if (c.link && !c.linkPendente) score += 2
  if (c.dormitorios) score += 1
  if (c.entrega?.ano) score += 1
  if (c.confianca === 'alta') score += 2
  return score
}

// ============================================================================
// FUNÇÃO PRINCIPAL
// ============================================================================

export async function buscarConcorrentesRapido(params: {
  cidade: string
  estado: string
  bairro?: string
  metragemReferencia?: number
  precoM2Referencia?: number
  padrao?: 'economico' | 'medio' | 'alto'
  dormitorios?: number
}): Promise<ResultadoBuscaV2> {
  const inicio = Date.now()
  const { cidade, estado, bairro, padrao } = params

  console.log(`\n========== BUSCA DE CONCORRENTES V2 (Rápida) ==========`)
  console.log(`Cidade: ${cidade}, Bairro: ${bairro || 'todos'}, Estado: ${estado}`)
  console.log(`Padrão: ${padrao || 'médio'}`)
  console.log(`========================================================\n`)

  try {
    // 1. Gerar queries otimizadas
    const queries = gerarQueriesOtimizadas({ cidade, estado, bairro, padrao })
    console.log(`[Busca V2] ${queries.length} queries geradas`)

    // 2. Buscar em paralelo no Google Custom Search
    const { resultados, fontes } = await buscarEmParalelo(queries)

    if (resultados.length === 0) {
      console.warn('[Busca V2] Nenhum resultado do Google, usando fallback Gemini Grounding')
      return await usarFallback(params, inicio)
    }

    // 3. Parsear com Gemini (única chamada)
    const concorrentes = await parsearResultados(resultados, cidade, bairro)

    // 4. Remover duplicatas
    const concorrentesUnicos = removerDuplicatas(concorrentes)

    // 5. Ordenar por confiança e completude
    concorrentesUnicos.sort((a, b) => {
      const scoreA = calcularScore(a)
      const scoreB = calcularScore(b)
      return scoreB - scoreA
    })

    const tempoTotal = Date.now() - inicio

    console.log(`\n========== RESULTADO BUSCA V2 ==========`)
    console.log(`Total: ${concorrentesUnicos.length} concorrentes`)
    console.log(`Tempo: ${tempoTotal}ms (${(tempoTotal / 1000).toFixed(1)}s)`)
    concorrentesUnicos.forEach((c, i) => {
      const pendente = c.linkPendente ? ' [LINK PENDENTE]' : ''
      console.log(`${i + 1}. ${c.nome} | ${c.construtora} | ${c.confianca}${pendente}`)
    })
    console.log(`=========================================\n`)

    return {
      concorrentes: concorrentesUnicos,
      metodo: 'google_custom_search',
      queries,
      totalResultadosGoogle: resultados.length,
      tempoExecucao: tempoTotal,
      cidadesAnalisadas: [cidade],
      bairrosAnalisados: { [cidade]: bairro ? [bairro] : [] },
      fontes
    }

  } catch (error) {
    console.error('[Busca V2] Erro na busca rápida:', error)
    return await usarFallback(params, inicio)
  }
}

// ============================================================================
// FALLBACK PARA SISTEMA ANTIGO
// ============================================================================

async function usarFallback(params: {
  cidade: string
  estado: string
  bairro?: string
  metragemReferencia?: number
  precoM2Referencia?: number
  padrao?: 'economico' | 'medio' | 'alto'
  dormitorios?: number
}, inicio: number): Promise<ResultadoBuscaV2> {
  console.log('[Busca V2] Usando fallback (sistema antigo com Gemini Grounding)...')

  try {
    const resultado = await buscarConcorrentesCompleto({
      cidade: params.cidade,
      estado: params.estado,
      bairro: params.bairro,
      metragemReferencia: params.metragemReferencia,
      precoM2Referencia: params.precoM2Referencia,
      padrao: params.padrao || 'medio',
      dormitorios: params.dormitorios
    })

    const tempoTotal = Date.now() - inicio

    return {
      concorrentes: resultado.concorrentes.map(c => ({
        ...c,
        linkPendente: !c.link,
        confianca: c.link ? 'alta' : 'media'
      })),
      metodo: 'fallback',
      queries: [],
      totalResultadosGoogle: 0,
      tempoExecucao: tempoTotal,
      cidadesAnalisadas: resultado.cidadesAnalisadas,
      bairrosAnalisados: resultado.bairrosAnalisados,
      fontes: resultado.fontes
    }

  } catch (error) {
    console.error('[Fallback] Erro:', error)
    return {
      concorrentes: [],
      metodo: 'fallback',
      queries: [],
      totalResultadosGoogle: 0,
      tempoExecucao: Date.now() - inicio,
      cidadesAnalisadas: [params.cidade],
      bairrosAnalisados: { [params.cidade]: params.bairro ? [params.bairro] : [] },
      fontes: []
    }
  }
}
