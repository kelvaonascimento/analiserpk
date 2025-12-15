// ============================================================================
// BUSCA INVESTIGATIVA DE CONCORRENTES
// Modo similar ao "Deep Research" - múltiplas buscas encadeadas
//
// Etapas:
// 1. Busca direta por empreendimentos
// 2. Descobrir construtoras da região
// 3. Buscar empreendimentos de cada construtora
// 4. Busca em portais imobiliários
// 5. Consolidar e deduplicar
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Concorrente } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

// ============================================================================
// INTERFACES
// ============================================================================

export interface ResultadoInvestigacao {
  concorrentes: Concorrente[]
  etapasExecutadas: EtapaInvestigacao[]
  totalBuscas: number
  tempoExecucao: number
  construtoresEncontradas: string[]
  fontesConsultadas: string[]
}

interface EtapaInvestigacao {
  nome: string
  query: string
  resultados: number
  tempo: number
}

interface EmpreendimentoBruto {
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
}

// ============================================================================
// FUNÇÃO PRINCIPAL - INVESTIGAÇÃO COMPLETA
// ============================================================================

export async function buscarConcorrentesInvestigativo(params: {
  cidade: string
  estado: string
  bairro?: string
  padrao?: 'economico' | 'medio' | 'alto'
}): Promise<ResultadoInvestigacao> {
  const inicio = Date.now()
  const { cidade, estado, bairro, padrao = 'medio' } = params

  console.log(`\n${'='.repeat(60)}`)
  console.log(`  MODO INVESTIGAÇÃO - Busca Completa de Concorrentes`)
  console.log(`${'='.repeat(60)}`)
  console.log(`  Cidade: ${cidade} - ${estado}`)
  console.log(`  Bairro: ${bairro || 'Todos'}`)
  console.log(`  Padrão: ${padrao}`)
  console.log(`${'='.repeat(60)}\n`)

  const etapas: EtapaInvestigacao[] = []
  const todosEmpreendimentos: EmpreendimentoBruto[] = []
  const todasFontes: Set<string> = new Set()

  // ========================================
  // ETAPA 1: Busca Direta por Empreendimentos
  // ========================================
  console.log(`\n>>> ETAPA 1: Busca Direta por Empreendimentos`)
  const etapa1Inicio = Date.now()

  const resultadoEtapa1 = await executarBusca(`
PESQUISE NA INTERNET: Todos os apartamentos em LANÇAMENTO ou EM OBRAS em ${bairro ? bairro + ', ' : ''}${cidade} - ${estado}.

Busque em: VivaReal, ZAP Imóveis, Lopes, OLX, e sites de construtoras.

Para cada empreendimento encontrado, extraia:
- nome, construtora, cidade, bairro, metragemMin, metragemMax, precoMin, precoMax, dormitorios, entrega, status, link, fonte

Retorne JSON: { "empreendimentos": [...] }
`, cidade)

  etapas.push({
    nome: 'Busca Direta',
    query: `lançamentos ${bairro || ''} ${cidade}`,
    resultados: resultadoEtapa1.empreendimentos.length,
    tempo: Date.now() - etapa1Inicio
  })

  todosEmpreendimentos.push(...resultadoEtapa1.empreendimentos)
  resultadoEtapa1.fontes.forEach(f => todasFontes.add(f))
  console.log(`   ✓ ${resultadoEtapa1.empreendimentos.length} empreendimentos encontrados`)

  // ========================================
  // ETAPA 2: Descobrir Construtoras da Região
  // ========================================
  console.log(`\n>>> ETAPA 2: Descobrir Construtoras da Região`)
  const etapa2Inicio = Date.now()

  const resultadoEtapa2 = await executarBuscaConstrutoras(cidade, estado)

  etapas.push({
    nome: 'Descobrir Construtoras',
    query: `construtoras incorporadoras ${cidade}`,
    resultados: resultadoEtapa2.construtoras.length,
    tempo: Date.now() - etapa2Inicio
  })

  console.log(`   ✓ ${resultadoEtapa2.construtoras.length} construtoras identificadas:`)
  resultadoEtapa2.construtoras.forEach(c => console.log(`     - ${c}`))

  // ========================================
  // ETAPA 3: Buscar Empreendimentos por Construtora
  // ========================================
  console.log(`\n>>> ETAPA 3: Buscar Empreendimentos por Construtora`)
  const etapa3Inicio = Date.now()

  // Limitar a 5 construtoras para não demorar muito
  const construtorasParaBuscar = resultadoEtapa2.construtoras.slice(0, 5)

  // Buscar em paralelo (2 por vez para não sobrecarregar)
  const promessasConstrutoras = construtorasParaBuscar.map(construtora =>
    executarBuscaPorConstrutora(construtora, cidade, estado)
  )

  const resultadosConstrutoras = await Promise.all(promessasConstrutoras)

  let totalEtapa3 = 0
  for (const resultado of resultadosConstrutoras) {
    todosEmpreendimentos.push(...resultado.empreendimentos)
    resultado.fontes.forEach(f => todasFontes.add(f))
    totalEtapa3 += resultado.empreendimentos.length
  }

  etapas.push({
    nome: 'Empreendimentos por Construtora',
    query: `${construtorasParaBuscar.length} construtoras`,
    resultados: totalEtapa3,
    tempo: Date.now() - etapa3Inicio
  })

  console.log(`   ✓ ${totalEtapa3} empreendimentos adicionais encontrados`)

  // ========================================
  // ETAPA 4: Busca em Portais Específicos
  // ========================================
  console.log(`\n>>> ETAPA 4: Busca em Portais Imobiliários`)
  const etapa4Inicio = Date.now()

  const resultadoEtapa4 = await executarBuscaPortais(cidade, estado, bairro)

  etapas.push({
    nome: 'Portais Imobiliários',
    query: `VivaReal, ZAP, Lopes - ${cidade}`,
    resultados: resultadoEtapa4.empreendimentos.length,
    tempo: Date.now() - etapa4Inicio
  })

  todosEmpreendimentos.push(...resultadoEtapa4.empreendimentos)
  resultadoEtapa4.fontes.forEach(f => todasFontes.add(f))
  console.log(`   ✓ ${resultadoEtapa4.empreendimentos.length} empreendimentos dos portais`)

  // ========================================
  // ETAPA 5: Consolidar e Deduplicar
  // ========================================
  console.log(`\n>>> ETAPA 5: Consolidar e Deduplicar`)
  const etapa5Inicio = Date.now()

  const concorrentesFinais = consolidarEmpreendimentos(todosEmpreendimentos, cidade)

  etapas.push({
    nome: 'Consolidação',
    query: `${todosEmpreendimentos.length} → ${concorrentesFinais.length}`,
    resultados: concorrentesFinais.length,
    tempo: Date.now() - etapa5Inicio
  })

  console.log(`   ✓ ${todosEmpreendimentos.length} brutos → ${concorrentesFinais.length} únicos`)

  // ========================================
  // RESULTADO FINAL
  // ========================================
  const tempoTotal = Date.now() - inicio

  console.log(`\n${'='.repeat(60)}`)
  console.log(`  RESULTADO DA INVESTIGAÇÃO`)
  console.log(`${'='.repeat(60)}`)
  console.log(`  Total de concorrentes: ${concorrentesFinais.length}`)
  console.log(`  Construtoras mapeadas: ${resultadoEtapa2.construtoras.length}`)
  console.log(`  Fontes consultadas: ${todasFontes.size}`)
  console.log(`  Tempo total: ${(tempoTotal / 1000).toFixed(1)}s`)
  console.log(`${'='.repeat(60)}`)

  console.log(`\n  Empreendimentos encontrados:`)
  concorrentesFinais.forEach((c, i) => {
    console.log(`  ${i + 1}. ${c.nome} | ${c.construtora} | ${c.status}`)
  })
  console.log(`${'='.repeat(60)}\n`)

  return {
    concorrentes: concorrentesFinais,
    etapasExecutadas: etapas,
    totalBuscas: etapas.length,
    tempoExecucao: tempoTotal,
    construtoresEncontradas: resultadoEtapa2.construtoras,
    fontesConsultadas: Array.from(todasFontes)
  }
}

// ============================================================================
// FUNÇÕES DE BUSCA ESPECÍFICAS
// ============================================================================

async function executarBusca(prompt: string, cidade: string): Promise<{
  empreendimentos: EmpreendimentoBruto[]
  fontes: string[]
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{
      // @ts-expect-error - google_search suportado
      google_search: {}
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
  })

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Extrair fontes
    const fontes: string[] = []
    const metadata = response.candidates?.[0]?.groundingMetadata as {
      groundingChunks?: Array<{ web?: { uri?: string } }>
    } | undefined

    if (metadata?.groundingChunks) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web?.uri) fontes.push(chunk.web.uri)
      }
    }

    // Parsear JSON
    const jsonMatch = text.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
    if (jsonMatch) {
      const cleanJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
      const data = JSON.parse(cleanJson)
      return {
        empreendimentos: data.empreendimentos || [],
        fontes
      }
    }

    return { empreendimentos: [], fontes }

  } catch (error) {
    console.error('   Erro na busca:', error)
    return { empreendimentos: [], fontes: [] }
  }
}

async function executarBuscaConstrutoras(cidade: string, estado: string): Promise<{
  construtoras: string[]
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{
      // @ts-expect-error - google_search suportado
      google_search: {}
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
  })

  const prompt = `PESQUISE NA INTERNET: Quais são as principais construtoras e incorporadoras que atuam em ${cidade} - ${estado}?

Inclua:
- Construtoras locais
- Grandes incorporadoras com projetos na cidade (MRV, Tenda, Cyrela, Even, Eztec, etc.)
- Construtoras regionais do ABC Paulista (se aplicável)

Liste APENAS os nomes das construtoras que têm ou tiveram empreendimentos recentes na cidade.

Retorne JSON: { "construtoras": ["Nome 1", "Nome 2", ...] }`

  try {
    const result = await model.generateContent(prompt)
    const text = result.response.text()

    const jsonMatch = text.match(/\{[\s\S]*"construtoras"[\s\S]*\}/)
    if (jsonMatch) {
      const cleanJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
      const data = JSON.parse(cleanJson)
      return { construtoras: data.construtoras || [] }
    }

    return { construtoras: [] }

  } catch (error) {
    console.error('   Erro ao buscar construtoras:', error)
    return { construtoras: [] }
  }
}

async function executarBuscaPorConstrutora(
  construtora: string,
  cidade: string,
  estado: string
): Promise<{
  empreendimentos: EmpreendimentoBruto[]
  fontes: string[]
}> {
  console.log(`     Buscando: ${construtora}...`)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{
      // @ts-expect-error - google_search suportado
      google_search: {}
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
  })

  const prompt = `PESQUISE NA INTERNET: Empreendimentos da construtora ${construtora} em ${cidade} - ${estado}.

Busque no site oficial da construtora e em portais imobiliários.
Foque em empreendimentos em LANÇAMENTO ou EM OBRAS.

Para cada empreendimento, extraia: nome, construtora, cidade, bairro, metragemMin, metragemMax, precoMin, precoMax, dormitorios, entrega, status, link, fonte

Retorne JSON: { "empreendimentos": [...] }`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    const fontes: string[] = []
    const metadata = response.candidates?.[0]?.groundingMetadata as {
      groundingChunks?: Array<{ web?: { uri?: string } }>
    } | undefined

    if (metadata?.groundingChunks) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web?.uri) fontes.push(chunk.web.uri)
      }
    }

    const jsonMatch = text.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
    if (jsonMatch) {
      const cleanJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
      const data = JSON.parse(cleanJson)
      const empreendimentos = (data.empreendimentos || []).map((e: EmpreendimentoBruto) => ({
        ...e,
        construtora: e.construtora || construtora
      }))
      console.log(`       ✓ ${empreendimentos.length} empreendimentos`)
      return { empreendimentos, fontes }
    }

    console.log(`       ✗ Nenhum encontrado`)
    return { empreendimentos: [], fontes }

  } catch (error) {
    console.error(`       ✗ Erro: ${error}`)
    return { empreendimentos: [], fontes: [] }
  }
}

async function executarBuscaPortais(
  cidade: string,
  estado: string,
  bairro?: string
): Promise<{
  empreendimentos: EmpreendimentoBruto[]
  fontes: string[]
}> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{
      // @ts-expect-error - google_search suportado
      google_search: {}
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 8192 }
  })

  const prompt = `PESQUISE NA INTERNET nos principais portais imobiliários:

1. site:vivareal.com.br lançamento ${cidade} ${bairro || ''}
2. site:zapimoveis.com.br apartamento novo ${cidade}
3. site:lopes.com.br lançamento ${cidade}
4. site:imovelweb.com.br lançamento ${cidade}

Liste TODOS os empreendimentos em LANÇAMENTO encontrados.

Para cada um, extraia: nome, construtora, cidade, bairro, metragemMin, metragemMax, precoMin, precoMax, dormitorios, entrega, status, link, fonte

Retorne JSON: { "empreendimentos": [...] }`

  try {
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    const fontes: string[] = []
    const metadata = response.candidates?.[0]?.groundingMetadata as {
      groundingChunks?: Array<{ web?: { uri?: string } }>
    } | undefined

    if (metadata?.groundingChunks) {
      for (const chunk of metadata.groundingChunks) {
        if (chunk.web?.uri) fontes.push(chunk.web.uri)
      }
    }

    const jsonMatch = text.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
    if (jsonMatch) {
      // Limpar caracteres de controle inválidos no JSON
      const cleanJson = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, ' ') // Remove caracteres de controle
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
      const data = JSON.parse(cleanJson)
      return { empreendimentos: data.empreendimentos || [], fontes }
    }

    return { empreendimentos: [], fontes }

  } catch (error) {
    console.error('   Erro na busca de portais:', error)
    return { empreendimentos: [], fontes: [] }
  }
}

// ============================================================================
// CONSOLIDAÇÃO E DEDUPLICAÇÃO
// ============================================================================

function consolidarEmpreendimentos(
  empreendimentos: EmpreendimentoBruto[],
  cidadePadrao: string
): Concorrente[] {
  const mapa = new Map<string, Concorrente>()

  for (const emp of empreendimentos) {
    if (!emp.nome) continue

    // Normalizar nome para chave
    const chave = emp.nome
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/[^\w]/g, '')
      .substring(0, 30)

    const existente = mapa.get(chave)

    const novo: Concorrente = {
      nome: emp.nome,
      construtora: emp.construtora || existente?.construtora || 'Não identificada',
      cidade: emp.cidade || existente?.cidade || cidadePadrao,
      bairro: emp.bairro || existente?.bairro,
      metragemMin: emp.metragemMin || existente?.metragemMin,
      metragemMax: emp.metragemMax || existente?.metragemMax,
      precoMin: emp.precoMin || existente?.precoMin,
      precoMax: emp.precoMax || existente?.precoMax,
      precoM2: calcularPrecoM2(emp, existente),
      entrega: { ano: emp.entrega || existente?.entrega?.ano || 2025 },
      status: emp.status || existente?.status || 'Em análise',
      link: emp.link || existente?.link,
      fonte: emp.fonte || existente?.fonte || 'Investigação'
    }

    // Manter o registro mais completo
    if (!existente || calcularCompletude(novo) > calcularCompletude(existente)) {
      mapa.set(chave, novo)
    }
  }

  // Ordenar por completude
  return Array.from(mapa.values()).sort((a, b) =>
    calcularCompletude(b) - calcularCompletude(a)
  )
}

function calcularPrecoM2(emp: EmpreendimentoBruto, existente?: Concorrente): number | undefined {
  if (emp.precoMin && emp.metragemMin) {
    return Math.round(emp.precoMin / emp.metragemMin)
  }
  return existente?.precoM2
}

function calcularCompletude(c: Concorrente): number {
  let score = 0
  if (c.nome) score += 2
  if (c.construtora && c.construtora !== 'Não identificada') score += 3
  if (c.precoMin) score += 3
  if (c.precoM2) score += 2
  if (c.metragemMin) score += 2
  if (c.metragemMax) score += 1
  if (c.dormitorios) score += 1
  if (c.entrega?.ano) score += 1
  if (c.link) score += 3
  if (c.bairro) score += 1
  return score
}
