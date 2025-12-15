// Google Custom Search API - Busca Real no Google
// Permite queries controladas exatamente como você faria manualmente

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Concorrente } from '@/types'

const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY || ''
const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || ''

// ============================================================================
// INTERFACES
// ============================================================================

interface GoogleSearchResult {
  title: string
  link: string
  snippet: string
  displayLink: string
}

interface GoogleSearchResponse {
  items?: GoogleSearchResult[]
  searchInformation?: {
    totalResults: string
    searchTime: number
  }
}

// ============================================================================
// GOOGLE CUSTOM SEARCH API
// ============================================================================

/**
 * Executa uma busca real no Google usando Custom Search API
 * @param query - Query exata como você digitaria no Google
 * @returns Lista de resultados com título, link e snippet
 */
export async function buscarNoGoogle(query: string): Promise<GoogleSearchResult[]> {
  if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
    console.error('[Google Search] API Key ou Search Engine ID não configurados')
    return []
  }

  console.log(`[Google Search] Buscando: "${query}"`)

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', GOOGLE_API_KEY)
    url.searchParams.set('cx', SEARCH_ENGINE_ID)
    url.searchParams.set('q', query)
    url.searchParams.set('gl', 'br') // Resultados do Brasil
    url.searchParams.set('lr', 'lang_pt') // Idioma português
    url.searchParams.set('num', '10') // 10 resultados por query

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      // Se for erro 403, a API não está habilitada
      if (response.status === 403) {
        console.warn(`[Google Search] API Custom Search não habilitada. Habilite em: https://console.cloud.google.com/apis/library/customsearch.googleapis.com`)
      } else {
        console.error(`[Google Search] Erro ${response.status}: ${errorText}`)
      }
      return []
    }

    const data: GoogleSearchResponse = await response.json()

    const results = data.items || []
    console.log(`[Google Search] ${results.length} resultados encontrados`)

    return results.map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet || '',
      displayLink: item.displayLink
    }))

  } catch (error) {
    console.error('[Google Search] Erro na busca:', error)
    return []
  }
}

// ============================================================================
// GERADOR DE QUERIES (ESTILO GOOGLE)
// ============================================================================

/**
 * Gera variações de queries como você faria manualmente no Google
 */
export function gerarQueriesBusca(params: {
  cidade: string
  estado?: string
  bairro?: string
  metragem?: number
  dormitorios?: number
  padrao?: 'economico' | 'medio' | 'alto'
}): string[] {
  const { cidade, estado = 'SP', bairro, metragem, dormitorios, padrao } = params

  const queries: string[] = []

  // Query 1: Busca básica por lançamento
  queries.push(`apartamento lançamento ${bairro ? bairro + ' ' : ''}${cidade} ${estado}`)

  // Query 2: Busca por empreendimento/residencial
  queries.push(`empreendimento residencial ${bairro ? bairro + ' ' : ''}${cidade} 2024 2025`)

  // Query 3: Busca em portal específico - VivaReal
  queries.push(`site:vivareal.com.br apartamento lançamento ${cidade}${bairro ? ' ' + bairro : ''}`)

  // Query 4: Busca em portal específico - ZAP
  queries.push(`site:zapimoveis.com.br apartamento novo ${cidade}${bairro ? ' ' + bairro : ''}`)

  // Query 5: Busca por metragem se informada
  if (metragem) {
    queries.push(`apartamento ${metragem}m2 ${cidade}${bairro ? ' ' + bairro : ''} lançamento`)
  }

  // Query 6: Busca por dormitórios se informado
  if (dormitorios) {
    queries.push(`apartamento ${dormitorios} quartos ${cidade}${bairro ? ' ' + bairro : ''} novo`)
  }

  // Query 7: Busca por padrão específico
  if (padrao === 'alto') {
    queries.push(`apartamento alto padrão ${cidade}${bairro ? ' ' + bairro : ''} condomínio clube`)
  } else if (padrao === 'economico') {
    queries.push(`apartamento minha casa minha vida ${cidade} 2024`)
  }

  // Query 8: Busca por construtoras locais
  queries.push(`construtora ${cidade} lançamento apartamento 2024`)

  return queries
}

// ============================================================================
// PARSER DE RESULTADOS COM GEMINI
// ============================================================================

/**
 * Usa Gemini para extrair dados estruturados dos resultados da busca
 */
export async function parsearResultadosComGemini(
  resultados: GoogleSearchResult[],
  cidade: string,
  bairro?: string
): Promise<Concorrente[]> {
  if (resultados.length === 0) return []

  const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 8192,
    }
  })

  // Preparar texto dos resultados para análise
  const textosResultados = resultados.map((r, i) =>
    `[${i + 1}] ${r.title}\nURL: ${r.link}\nDescrição: ${r.snippet}\n`
  ).join('\n---\n')

  const prompt = `Você é um especialista em mercado imobiliário. Analise estes resultados de busca do Google e extraia informações sobre empreendimentos imobiliários.

RESULTADOS DA BUSCA:
${textosResultados}

TAREFA: Para cada empreendimento imobiliário encontrado nos resultados, extraia:
- nome: Nome do empreendimento (não o nome do portal)
- construtora: Nome da construtora/incorporadora (se mencionado)
- cidade: Cidade do empreendimento
- bairro: Bairro (se mencionado)
- metragemMin: Menor metragem em m² (número)
- metragemMax: Maior metragem em m² (número)
- precoMin: Menor preço em reais (número, sem pontos)
- precoMax: Maior preço em reais (número, sem pontos)
- precoM2: Preço por m² (número, se mencionado ou calculável)
- entrega: Ano de entrega (número)
- status: "Lançamento", "Em obras", ou "Pronto para morar"
- link: URL exata do resultado
- fonte: Nome do site (ex: "VivaReal", "ZAP Imóveis", "Site Oficial")

REGRAS:
1. Ignore resultados que NÃO são empreendimentos (notícias, artigos genéricos)
2. Se um dado não estiver disponível, omita o campo (não invente)
3. Extraia o nome REAL do empreendimento, não títulos genéricos como "Apartamento à venda"
4. Priorize resultados de: VivaReal, ZAP Imóveis, sites de construtoras
5. Se o mesmo empreendimento aparecer em múltiplos resultados, use os dados mais completos

FORMATO DE RESPOSTA (JSON):
{
  "empreendimentos": [
    {
      "nome": "Nome Real",
      "construtora": "Construtora X",
      "cidade": "${cidade}",
      "bairro": "${bairro || ''}",
      "metragemMin": 50,
      "metragemMax": 80,
      "precoMin": 350000,
      "precoMax": 500000,
      "precoM2": 7000,
      "entrega": 2025,
      "status": "Em obras",
      "link": "https://url-real.com",
      "fonte": "VivaReal"
    }
  ]
}

Retorne APENAS o JSON, sem explicações.`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Limpar e parsear JSON
    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const data = JSON.parse(jsonText)

    // Converter para formato Concorrente
    const concorrentes: Concorrente[] = (data.empreendimentos || []).map((e: {
      nome: string
      construtora?: string
      cidade?: string
      bairro?: string
      metragemMin?: number
      metragemMax?: number
      precoMin?: number
      precoMax?: number
      precoM2?: number
      entrega?: number
      status?: string
      link?: string
      fonte?: string
    }) => ({
      nome: e.nome,
      construtora: e.construtora || 'Não identificada',
      cidade: e.cidade || cidade,
      metragemMin: e.metragemMin,
      metragemMax: e.metragemMax,
      precoMin: e.precoMin,
      precoMax: e.precoMax,
      precoM2: e.precoM2 || (e.precoMin && e.metragemMin ? Math.round(e.precoMin / e.metragemMin) : undefined),
      entrega: { ano: e.entrega || 2025 },
      status: e.status || 'Em análise',
      link: e.link,
      fonte: e.fonte || 'Google Search'
    }))

    return concorrentes

  } catch (error) {
    console.error('[Gemini Parser] Erro ao parsear resultados:', error)
    return []
  }
}

// ============================================================================
// BUSCA HÍBRIDA COMPLETA
// ============================================================================

export interface ResultadoBuscaHibrida {
  concorrentes: Concorrente[]
  queries: string[]
  totalResultados: number
  fontes: string[]
}

/**
 * Executa busca híbrida: Google Custom Search + Gemini Parser
 * Esta é a função principal que simula exatamente o que você faria manualmente
 */
export async function buscarConcorrentesHibrido(params: {
  cidade: string
  estado?: string
  bairro?: string
  metragem?: number
  dormitorios?: number
  precoM2?: number
  padrao?: 'economico' | 'medio' | 'alto'
}): Promise<ResultadoBuscaHibrida> {
  const { cidade, estado = 'SP', bairro, metragem, dormitorios, padrao } = params

  console.log(`\n========== BUSCA HÍBRIDA (Google + Gemini) ==========`)
  console.log(`Cidade: ${cidade}, Bairro: ${bairro || 'todos'}, Estado: ${estado}`)
  console.log(`=====================================================\n`)

  // 1. Gerar queries de busca
  const queries = gerarQueriesBusca({ cidade, estado, bairro, metragem, dormitorios, padrao })
  console.log(`[Busca] ${queries.length} queries geradas:`)
  queries.forEach((q, i) => console.log(`  ${i + 1}. ${q}`))

  // 2. Executar buscas no Google (limitando a 3 queries para não estourar cota)
  const todosResultados: GoogleSearchResult[] = []
  const fontesEncontradas = new Set<string>()

  for (const query of queries.slice(0, 3)) {
    const resultados = await buscarNoGoogle(query)

    for (const r of resultados) {
      // Evitar duplicatas por URL
      if (!todosResultados.some(existing => existing.link === r.link)) {
        todosResultados.push(r)
        fontesEncontradas.add(r.displayLink)
      }
    }

    // Pequeno delay para não sobrecarregar API
    await new Promise(resolve => setTimeout(resolve, 200))
  }

  console.log(`\n[Busca] Total de ${todosResultados.length} resultados únicos de ${fontesEncontradas.size} fontes`)

  // 3. Parsear resultados com Gemini
  console.log(`[Parser] Extraindo dados estruturados com Gemini...`)
  const concorrentes = await parsearResultadosComGemini(todosResultados, cidade, bairro)

  // 4. Remover duplicatas por nome similar
  const concorrentesUnicos = removerDuplicatas(concorrentes)

  console.log(`\n========== RESULTADO BUSCA HÍBRIDA ==========`)
  console.log(`Total de concorrentes: ${concorrentesUnicos.length}`)
  concorrentesUnicos.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nome} | ${c.construtora} | ${c.fonte} | ${c.link}`)
  })
  console.log(`==============================================\n`)

  return {
    concorrentes: concorrentesUnicos,
    queries: queries.slice(0, 3),
    totalResultados: todosResultados.length,
    fontes: Array.from(fontesEncontradas)
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function removerDuplicatas(concorrentes: Concorrente[]): Concorrente[] {
  const vistos = new Map<string, Concorrente>()

  for (const c of concorrentes) {
    // Criar chave normalizada do nome
    const chave = c.nome.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '')
      .substring(0, 20)

    const existente = vistos.get(chave)
    if (!existente) {
      vistos.set(chave, c)
    } else {
      // Manter o que tem mais dados
      const scoreExistente = (existente.precoM2 ? 3 : 0) + (existente.precoMin ? 2 : 0) + (existente.construtora !== 'Não identificada' ? 2 : 0) + (existente.link ? 1 : 0)
      const scoreNovo = (c.precoM2 ? 3 : 0) + (c.precoMin ? 2 : 0) + (c.construtora !== 'Não identificada' ? 2 : 0) + (c.link ? 1 : 0)

      if (scoreNovo > scoreExistente) {
        vistos.set(chave, c)
      }
    }
  }

  return Array.from(vistos.values())
}
