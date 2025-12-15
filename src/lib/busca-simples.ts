// ============================================================================
// BUSCA SIMPLES DE CONCORRENTES
// Uma única chamada ao Gemini Grounding - exatamente como fazer manualmente
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Concorrente } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export interface ResultadoBuscaSimples {
  concorrentes: Concorrente[]
  tempoExecucao: number
  fontes: string[]
}

/**
 * Busca concorrentes com UMA ÚNICA chamada ao Gemini Grounding
 * Exatamente como você faria perguntando diretamente ao Claude/Gemini
 */
export async function buscarConcorrentesSimples(params: {
  cidade: string
  estado: string
  bairro?: string
  padrao?: 'economico' | 'medio' | 'alto'
}): Promise<ResultadoBuscaSimples> {
  const inicio = Date.now()
  const { cidade, estado, bairro, padrao = 'medio' } = params

  console.log(`\n========== BUSCA SIMPLES (1 chamada) ==========`)
  console.log(`${bairro ? bairro + ', ' : ''}${cidade} - ${estado}`)
  console.log(`Padrão: ${padrao}`)
  console.log(`================================================\n`)

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    tools: [{
      // @ts-expect-error - google_search suportado mas não tipado
      google_search: {}
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 8192,
    }
  })

  // Determinar faixa de preço baseado no padrão
  const faixaPreco = padrao === 'economico'
    ? 'até 350 mil'
    : padrao === 'alto'
      ? 'acima de 700 mil'
      : '350 mil a 800 mil'

  const localBusca = bairro
    ? `bairro ${bairro} em ${cidade}`
    : cidade

  const prompt = `PESQUISE NA INTERNET AGORA: Liste TODOS os empreendimentos imobiliários (apartamentos) em ${localBusca} - ${estado}.

INCLUA TODOS OS TIPOS:
- Lançamentos e breve lançamento
- Em obras e na planta
- Prontos para morar (entregues nos últimos 5 anos: 2020-2025)
- Studios, 1, 2 e 3 dormitórios

BUSQUE EM MÚLTIPLAS FONTES:
1. Portais: VivaReal, ZAP Imóveis, Imovelweb, Apto.vc, Chaves na Mão
2. Imobiliárias: Lopes, Roma, ABC Apartamentos, Arara Imóveis, 90 Imóveis
3. Construtoras ABC: MBigucci (Unique, Stylo, Exuberance, Mundi), Living, Patriani, Toth (VISTTA), Nazaré, Maximo Aldana, MG Tec, Helbor, Cyrela, Even, Tenda, MRV, Eztec

FOCO ESPECIAL em ${bairro || cidade}:
- Busque por nome de empreendimentos conhecidos na região
- Inclua empreendimentos recém-entregues (prontos)
- Não ignore nenhum resultado

EXTRAIA para CADA empreendimento:
- nome: Nome COMPLETO (ex: "Unique MBigucci", "VISTTA Toth")
- construtora: Construtora/incorporadora
- cidade: Cidade
- bairro: Bairro específico
- metragemMin: Menor metragem m²
- metragemMax: Maior metragem m²
- precoMin: Preço inicial (número)
- precoMax: Preço máximo (número)
- precoM2: Preço por m² se disponível
- dormitorios: "1", "2", "2 e 3", etc
- entrega: Ano de entrega ou "Pronto"
- status: "Lançamento", "Em obras", "Pronto para morar", "Breve lançamento"
- link: URL do site/portal
- fonte: Nome do site

IMPORTANTE:
- Liste TODOS encontrados, mínimo 8-12 empreendimentos
- Inclua PRONTOS RECENTES (não só lançamentos)
- Dados parciais são aceitos (use null)
- Priorize ${bairro ? bairro : 'a cidade toda'}

JSON:
{
  "empreendimentos": [
    { "nome": "...", "construtora": "...", "cidade": "${cidade}", "bairro": "...", "metragemMin": null, "metragemMax": null, "precoMin": null, "precoMax": null, "precoM2": null, "dormitorios": "...", "entrega": 2025, "status": "...", "link": "...", "fonte": "..." }
  ]
}`

  try {
    console.log('[Busca] Executando pesquisa na internet via Gemini Grounding...')

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // Extrair fontes do grounding
    const candidate = response.candidates?.[0]
    const groundingMetadata = candidate?.groundingMetadata as {
      groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>
      webSearchQueries?: string[]
    } | undefined

    const fontesUsadas: string[] = []
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          fontesUsadas.push(chunk.web.uri)
        }
      }
    }

    console.log(`[Busca] ${fontesUsadas.length} fontes consultadas`)
    if (groundingMetadata?.webSearchQueries) {
      console.log(`[Busca] Queries: ${groundingMetadata.webSearchQueries.slice(0, 3).join(' | ')}`)
    }

    // Limpar e parsear JSON
    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
    if (jsonMatch) {
      // Limpar caracteres de controle que causam erro no JSON.parse
      jsonText = jsonMatch[0]
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
    }

    const data = JSON.parse(jsonText)
    const empreendimentos = data.empreendimentos || []

    console.log(`[Busca] ${empreendimentos.length} empreendimentos encontrados`)

    // Converter para formato Concorrente
    const concorrentes: Concorrente[] = empreendimentos.map((e: {
      nome: string
      construtora?: string
      cidade?: string
      bairro?: string
      metragemMin?: number
      metragemMax?: number
      precoMin?: number
      precoMax?: number
      precoM2?: number
      dormitorios?: string
      entrega?: number | string
      status?: string
      link?: string
      fonte?: string
    }) => {
      // Tratar entrega que pode ser número ou "Pronto"
      let anoEntrega = 2025
      if (typeof e.entrega === 'number') {
        anoEntrega = e.entrega
      } else if (typeof e.entrega === 'string') {
        const match = e.entrega.match(/\d{4}/)
        if (match) {
          anoEntrega = parseInt(match[0])
        } else if (e.entrega.toLowerCase().includes('pronto')) {
          anoEntrega = new Date().getFullYear()
        }
      }

      return {
        nome: e.nome,
        construtora: e.construtora || 'Não identificada',
        cidade: e.cidade || cidade,
        bairro: e.bairro,
        dormitorios: e.dormitorios,
        metragemMin: e.metragemMin,
        metragemMax: e.metragemMax,
        precoMin: e.precoMin,
        precoMax: e.precoMax,
        // Usar precoM2 do resultado ou calcular
        precoM2: e.precoM2 || (e.precoMin && e.metragemMin ? Math.round(e.precoMin / e.metragemMin) : undefined),
        entrega: { ano: anoEntrega },
        status: e.status || 'Em análise',
        link: e.link,
        fonte: e.fonte || 'Gemini Search'
      }
    })

    const tempoTotal = Date.now() - inicio

    console.log(`\n========== RESULTADO ==========`)
    console.log(`Total: ${concorrentes.length} concorrentes`)
    console.log(`Tempo: ${(tempoTotal / 1000).toFixed(1)}s`)
    concorrentes.forEach((c, i) => {
      console.log(`${i + 1}. ${c.nome} | ${c.construtora} | ${c.link ? '✓ link' : '✗ sem link'}`)
    })
    console.log(`================================\n`)

    return {
      concorrentes,
      tempoExecucao: tempoTotal,
      fontes: fontesUsadas
    }

  } catch (error) {
    console.error('[Busca] Erro:', error)
    return {
      concorrentes: [],
      tempoExecucao: Date.now() - inicio,
      fontes: []
    }
  }
}
