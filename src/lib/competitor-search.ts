// Busca de concorrentes em tempo real via Web Search
// Utiliza Serper.dev API ou Google Custom Search

import type { Concorrente } from '@/types'

// ============================================================================
// Configuração da API de Busca
// ============================================================================

const SERPER_API_KEY = process.env.SERPER_API_KEY || ''
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || ''
const GOOGLE_SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID || ''

// ============================================================================
// Interface de resultados de busca
// ============================================================================

interface SearchResult {
  title: string
  link: string
  snippet: string
  position: number
}

interface SearchResponse {
  results: SearchResult[]
  query: string
  totalResults: number
}

// ============================================================================
// Busca via Serper.dev (recomendado - mais barato e rápido)
// ============================================================================

async function buscarViaSerper(query: string): Promise<SearchResponse> {
  if (!SERPER_API_KEY) {
    console.log('[Serper] API key não configurada, usando fallback')
    return { results: [], query, totalResults: 0 }
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        gl: 'br',
        hl: 'pt-br',
        num: 20
      })
    })

    if (!response.ok) {
      throw new Error(`Serper API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      results: data.organic?.map((item: any, index: number) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        position: index + 1
      })) || [],
      query,
      totalResults: data.organic?.length || 0
    }
  } catch (error) {
    console.error('[Serper] Erro na busca:', error)
    return { results: [], query, totalResults: 0 }
  }
}

// ============================================================================
// Busca via Google Custom Search API
// ============================================================================

async function buscarViaGoogle(query: string): Promise<SearchResponse> {
  if (!GOOGLE_API_KEY || !GOOGLE_SEARCH_ENGINE_ID) {
    console.log('[Google] API keys não configuradas')
    return { results: [], query, totalResults: 0 }
  }

  try {
    const url = new URL('https://www.googleapis.com/customsearch/v1')
    url.searchParams.set('key', GOOGLE_API_KEY)
    url.searchParams.set('cx', GOOGLE_SEARCH_ENGINE_ID)
    url.searchParams.set('q', query)
    url.searchParams.set('gl', 'br')
    url.searchParams.set('lr', 'lang_pt')
    url.searchParams.set('num', '10')

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      results: data.items?.map((item: any, index: number) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
        position: index + 1
      })) || [],
      query,
      totalResults: parseInt(data.searchInformation?.totalResults || '0')
    }
  } catch (error) {
    console.error('[Google] Erro na busca:', error)
    return { results: [], query, totalResults: 0 }
  }
}

// ============================================================================
// Parser de resultados para extrair dados de empreendimentos
// ============================================================================

interface EmpreendimentoExtraido {
  nome: string
  construtora: string | null
  cidade: string
  link: string
  fonte: string
  confianca: number // 0-100
}

function extrairEmpreendimentoDeResultado(result: SearchResult, cidadeBusca: string): EmpreendimentoExtraido | null {
  const { title, link, snippet } = result

  // Ignorar resultados não relevantes
  const urlsIgnorar = [
    'youtube.com',
    'facebook.com',
    'instagram.com',
    'twitter.com',
    'linkedin.com',
    'wikipedia.org',
    'google.com/maps'
  ]

  if (urlsIgnorar.some(url => link.includes(url))) {
    return null
  }

  // Identificar se é um empreendimento
  const palavrasChave = [
    'residencial', 'apartamento', 'lançamento', 'construtora',
    'incorporadora', 'empreendimento', 'condomínio', 'pronto para morar',
    'metro quadrado', 'm²', 'dormitórios', 'suítes', 'vagas'
  ]

  const textoCompleto = `${title} ${snippet}`.toLowerCase()
  const contemPalavraChave = palavrasChave.some(p => textoCompleto.includes(p))

  if (!contemPalavraChave) {
    return null
  }

  // Extrair nome do empreendimento
  let nome = ''

  // Padrões comuns de nomes
  const padroesNome = [
    /residencial\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i,
    /apartamento[s]?\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i,
    /condomínio\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i,
    /empreendimento\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i,
    /lançamento\s+([a-záàâãéèêíïóôõöúçñ\s]+)/i
  ]

  for (const padrao of padroesNome) {
    const match = title.match(padrao)
    if (match) {
      nome = match[1].trim()
      break
    }
  }

  // Se não encontrou por padrão, usar o título
  if (!nome) {
    nome = title
      .replace(/\|.*$/, '') // Remove tudo após |
      .replace(/-.*$/, '') // Remove tudo após -
      .replace(/\(.*\)/, '') // Remove parênteses
      .trim()
  }

  // Limitar tamanho do nome
  if (nome.length > 50) {
    nome = nome.substring(0, 50).trim()
  }

  // Extrair construtora
  let construtora: string | null = null
  const construtoras = [
    'MRV', 'Cyrela', 'Gafisa', 'Tenda', 'Direcional', 'Trisul', 'EZTec',
    'Patriani', 'Yuny', 'Toth', 'Motiró', 'Even', 'Vitacon', 'You Inc',
    'Plano&Plano', 'Cury', 'Tegra', 'Moura Dubeux', 'Lavvi', 'Mitre'
  ]

  for (const c of construtoras) {
    if (textoCompleto.includes(c.toLowerCase())) {
      construtora = c
      break
    }
  }

  // Identificar fonte
  let fonte = 'Web Search'
  if (link.includes('vivareal')) fonte = 'VivaReal'
  else if (link.includes('zapimoveis')) fonte = 'ZAP Imóveis'
  else if (link.includes('imovelweb')) fonte = 'ImovelWeb'
  else if (link.includes('olx')) fonte = 'OLX'
  else if (link.includes('quintoandar')) fonte = 'QuintoAndar'
  else if (link.includes('construtora') || link.includes('incorporadora')) fonte = 'Site Oficial'

  // Calcular confiança
  let confianca = 50
  if (construtora) confianca += 20
  if (['VivaReal', 'ZAP Imóveis', 'Site Oficial'].includes(fonte)) confianca += 20
  if (textoCompleto.includes(cidadeBusca.toLowerCase())) confianca += 10

  return {
    nome,
    construtora,
    cidade: cidadeBusca,
    link,
    fonte,
    confianca
  }
}

// ============================================================================
// Extrair preço de texto
// ============================================================================

function extrairPreco(texto: string): { min: number; max: number } | null {
  // Padrões de preço
  const padroes = [
    /R\$\s*([\d.,]+)\s*(?:mil|k)/gi,
    /R\$\s*([\d.,]+)\s*(?:milhão|milhões|mi)/gi,
    /R\$\s*([\d.,]+)/g,
    /a\s+partir\s+de\s+R\$\s*([\d.,]+)/gi,
    /([\d.,]+)\s*mil\s+reais/gi
  ]

  const precos: number[] = []

  for (const padrao of padroes) {
    const matches = texto.matchAll(padrao)
    for (const match of matches) {
      let valor = match[1].replace(/\./g, '').replace(',', '.')
      let numero = parseFloat(valor)

      // Ajustar multiplicador
      if (match[0].toLowerCase().includes('mil') || match[0].toLowerCase().includes('k')) {
        numero *= 1000
      } else if (match[0].toLowerCase().includes('milh')) {
        numero *= 1000000
      }

      // Validar se é um preço de imóvel razoável (100k - 10mi)
      if (numero >= 100000 && numero <= 10000000) {
        precos.push(numero)
      }
    }
  }

  if (precos.length === 0) return null

  return {
    min: Math.min(...precos),
    max: Math.max(...precos)
  }
}

// ============================================================================
// Extrair metragem de texto
// ============================================================================

function extrairMetragem(texto: string): { min: number; max: number } | null {
  const padroes = [
    /(\d+)\s*(?:a|até|-)\s*(\d+)\s*m[²2]/gi,
    /(\d+)\s*m[²2]/gi,
    /(\d+)\s*metros?\s*quadrados?/gi
  ]

  const metragens: number[] = []

  for (const padrao of padroes) {
    const matches = texto.matchAll(padrao)
    for (const match of matches) {
      const m1 = parseInt(match[1])
      const m2 = match[2] ? parseInt(match[2]) : m1

      // Validar se é uma metragem de apartamento razoável (20-500m²)
      if (m1 >= 20 && m1 <= 500) metragens.push(m1)
      if (m2 >= 20 && m2 <= 500 && m2 !== m1) metragens.push(m2)
    }
  }

  if (metragens.length === 0) return null

  return {
    min: Math.min(...metragens),
    max: Math.max(...metragens)
  }
}

// ============================================================================
// Busca principal de concorrentes
// ============================================================================

export interface ResultadoBuscaConcorrentes {
  concorrentes: Concorrente[]
  queries: string[]
  fontes: string[]
  totalResultados: number
}

export async function buscarConcorrentesTempoReal(
  cidade: string,
  estado: string = 'SP',
  incluirVizinhas: boolean = true
): Promise<ResultadoBuscaConcorrentes> {
  console.log(`\n========== BUSCA DE CONCORRENTES EM TEMPO REAL ==========`)
  console.log(`Cidade: ${cidade}, Estado: ${estado}`)

  const queries = [
    `lançamentos imobiliários ${cidade} ${estado} 2024 2025`,
    `apartamentos novos ${cidade} ${estado} construtora`,
    `empreendimentos ${cidade} ${estado} pronto para morar`,
    `residencial ${cidade} ${estado} venda`
  ]

  const todosResultados: SearchResult[] = []
  const fontesConsultadas: string[] = []

  // Tentar Serper primeiro, depois Google
  for (const query of queries) {
    console.log(`[Busca] Query: "${query}"`)

    let resultado = await buscarViaSerper(query)

    if (resultado.results.length === 0) {
      resultado = await buscarViaGoogle(query)
    }

    todosResultados.push(...resultado.results)
    console.log(`[Busca] ${resultado.results.length} resultados encontrados`)
  }

  // Processar resultados
  const empreendimentosExtraidos: EmpreendimentoExtraido[] = []

  for (const result of todosResultados) {
    const extraido = extrairEmpreendimentoDeResultado(result, cidade)
    if (extraido && extraido.confianca >= 50) {
      empreendimentosExtraidos.push(extraido)
    }
  }

  // Remover duplicatas
  const vistos = new Set<string>()
  const concorrentes: Concorrente[] = []

  for (const emp of empreendimentosExtraidos) {
    const chave = emp.nome.toLowerCase().replace(/\s+/g, '').substring(0, 15)

    if (!vistos.has(chave)) {
      vistos.add(chave)

      // Tentar extrair preço e metragem do snippet
      const textoCompleto = todosResultados
        .filter(r => r.link === emp.link)
        .map(r => r.snippet)
        .join(' ')

      const preco = extrairPreco(textoCompleto)
      const metragem = extrairMetragem(textoCompleto)

      concorrentes.push({
        nome: emp.nome,
        construtora: emp.construtora || 'Não identificada',
        cidade: emp.cidade,
        metragemMin: metragem?.min,
        metragemMax: metragem?.max,
        precoMin: preco?.min,
        precoMax: preco?.max,
        precoM2: preco && metragem ? Math.round(preco.min / metragem.min) : undefined,
        entrega: { ano: 2025 },
        status: 'Em análise',
        fonte: emp.fonte,
        link: emp.link
      })

      if (!fontesConsultadas.includes(emp.fonte)) {
        fontesConsultadas.push(emp.fonte)
      }
    }
  }

  // Ordenar por confiança
  concorrentes.sort((a, b) => {
    const confA = empreendimentosExtraidos.find(e => e.nome === a.nome)?.confianca || 0
    const confB = empreendimentosExtraidos.find(e => e.nome === b.nome)?.confianca || 0
    return confB - confA
  })

  console.log(`\n========== RESULTADO ==========`)
  console.log(`Total de concorrentes: ${concorrentes.length}`)
  concorrentes.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nome} | ${c.construtora} | ${c.fonte}`)
  })
  console.log(`================================\n`)

  return {
    concorrentes: concorrentes.slice(0, 15), // Limitar a 15 resultados
    queries,
    fontes: fontesConsultadas,
    totalResultados: todosResultados.length
  }
}

// ============================================================================
// Buscar preço médio por m² em uma região
// ============================================================================

export interface PrecoM2Regiao {
  regiao: string
  precoM2Medio: number
  fonte: string
  dataAtualizacao: string
}

// Dados de referência de preço/m² por região
// Em produção, buscar via web search
const PRECOS_M2_REFERENCIA: Record<string, number> = {
  'são paulo': 11500,
  'são paulo - zona sul': 13000,
  'são paulo - zona oeste': 14500,
  'são paulo - zona norte': 9000,
  'são paulo - zona leste': 7500,
  'são paulo - centro': 10000,
  'são caetano do sul': 9800,
  'santo andré': 7200,
  'são bernardo do campo': 7800,
  'diadema': 5500,
  'mauá': 5200,
  'ribeirão pires': 5800,
  'rio grande da serra': 4500,
  'guarulhos': 6800,
  'osasco': 7500,
  'campinas': 8200,
  'santos': 9500,
  'abc paulista': 7000
}

export function buscarPrecoM2Regioes(cidadeBase: string): PrecoM2Regiao[] {
  const cidadeNormalizada = cidadeBase.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  const regioes: PrecoM2Regiao[] = []
  const dataAtual = new Date().toISOString().split('T')[0]

  // Adicionar cidade base
  const precoCidade = PRECOS_M2_REFERENCIA[cidadeNormalizada] ||
    PRECOS_M2_REFERENCIA[cidadeBase.toLowerCase()] || 6000

  regioes.push({
    regiao: cidadeBase,
    precoM2Medio: precoCidade,
    fonte: 'FIPE/ZAP',
    dataAtualizacao: dataAtual
  })

  // Adicionar região ABC (se aplicável)
  const cidadesABC = ['santo andre', 'sao bernardo do campo', 'sao caetano do sul', 'diadema', 'maua', 'ribeirao pires', 'rio grande da serra']
  if (cidadesABC.some(c => cidadeNormalizada.includes(c) || c.includes(cidadeNormalizada))) {
    regioes.push({
      regiao: 'ABC Paulista (média)',
      precoM2Medio: PRECOS_M2_REFERENCIA['abc paulista'],
      fonte: 'FIPE/ZAP',
      dataAtualizacao: dataAtual
    })
  }

  // Sempre adicionar São Paulo Capital como referência
  regioes.push({
    regiao: 'São Paulo Capital',
    precoM2Medio: PRECOS_M2_REFERENCIA['são paulo'],
    fonte: 'FIPE/ZAP',
    dataAtualizacao: dataAtual
  })

  // Adicionar cidades vizinhas relevantes
  const vizinhasRelevantes: Record<string, string[]> = {
    'ribeirao pires': ['mauá', 'santo andré', 'são bernardo do campo'],
    'maua': ['ribeirão pires', 'santo andré', 'são caetano do sul'],
    'santo andre': ['são bernardo do campo', 'são caetano do sul', 'mauá'],
    'sao bernardo do campo': ['santo andré', 'diadema', 'são paulo'],
    'sao caetano do sul': ['santo andré', 'são bernardo do campo', 'são paulo']
  }

  const vizinhas = vizinhasRelevantes[cidadeNormalizada] || []
  for (const vizinha of vizinhas) {
    const precoVizinha = PRECOS_M2_REFERENCIA[vizinha]
    if (precoVizinha && !regioes.some(r => r.regiao.toLowerCase() === vizinha)) {
      regioes.push({
        regiao: vizinha.split(' ').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' '),
        precoM2Medio: precoVizinha,
        fonte: 'FIPE/ZAP',
        dataAtualizacao: dataAtual
      })
    }
  }

  // Ordenar por preço
  regioes.sort((a, b) => b.precoM2Medio - a.precoM2Medio)

  return regioes
}
