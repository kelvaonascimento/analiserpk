// Integração com Google Gemini API
// Usa Google Search grounding para buscar dados em tempo real

import { GoogleGenerativeAI } from '@google/generative-ai'
import type { Concorrente } from '@/types'
import { getCidadesVizinhas, getRegiaoMetropolitana } from './cidades-brasil'

// Inicializar cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

// ============================================================================
// GROUNDING COM GOOGLE SEARCH - BUSCA REAL NA INTERNET
// Esta função permite que o Gemini faça buscas REAIS no Google
// ============================================================================

export interface FonteGrounding {
  titulo: string
  url: string
}

export interface ResultadoGrounding {
  texto: string
  fontes: FonteGrounding[]
  groundingMetadata?: unknown
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Busca com Grounding - permite ao Gemini acessar a internet em tempo real
 * @param query - O prompt/pergunta para o Gemini
 * @param tentativa - Número da tentativa (para retry automático)
 * @returns Texto da resposta + fontes usadas (URLs reais)
 */
export async function buscarComGrounding(query: string, tentativa = 1): Promise<ResultadoGrounding> {
  const MAX_TENTATIVAS = 3
  const DELAY_BASE = 5000 // 5 segundos

  console.log(`\n[Grounding] Executando busca real na internet...${tentativa > 1 ? ` (tentativa ${tentativa})` : ''}`)

  try {
    // Criar modelo com Google Search habilitado (Gemini 2.5 Flash - modelo estável)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash', // Modelo estável com maior rate limit e suporte a Grounding
      tools: [{
        // @ts-expect-error - google_search é suportado pelo modelo mas não está tipado no SDK
        google_search: {}
      }],
      generationConfig: {
        temperature: 0.2, // Mais determinístico
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    })

    const result = await model.generateContent(query)
    const response = result.response
    const texto = response.text()

    // Extrair fontes do groundingMetadata
    const candidate = response.candidates?.[0]
    const groundingMetadata = candidate?.groundingMetadata as {
      groundingChunks?: Array<{ web?: { title?: string; uri?: string } }>
      webSearchQueries?: string[]
    } | undefined

    const fontes: FonteGrounding[] = []

    // Extrair chunks (fontes usadas)
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          fontes.push({
            titulo: chunk.web.title || 'Fonte não identificada',
            url: chunk.web.uri
          })
        }
      }
    }

    // Log das queries de busca usadas
    if (groundingMetadata?.webSearchQueries) {
      console.log(`[Grounding] Queries usadas: ${groundingMetadata.webSearchQueries.join(' | ')}`)
    }

    console.log(`[Grounding] ${fontes.length} fontes encontradas`)
    fontes.forEach((f, i) => console.log(`  ${i + 1}. ${f.titulo}: ${f.url}`))

    return {
      texto,
      fontes,
      groundingMetadata
    }

  } catch (error) {
    // Verificar se é erro de rate limit (429)
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isRateLimit = errorMessage.includes('429') || errorMessage.includes('Too Many Requests')

    if (isRateLimit && tentativa < MAX_TENTATIVAS) {
      const tempoEspera = DELAY_BASE * tentativa // Backoff exponencial
      console.log(`[Grounding] Rate limit atingido. Aguardando ${tempoEspera / 1000}s antes de tentar novamente...`)
      await delay(tempoEspera)
      return buscarComGrounding(query, tentativa + 1)
    }

    console.error('[Grounding] Erro:', error)
    return {
      texto: '',
      fontes: []
    }
  }
}

/**
 * Busca de concorrentes usando Grounding (busca real na internet)
 * Esta função substitui a busca sem internet que inventava dados
 */
export async function buscarConcorrentesComGrounding(
  cidade: string,
  estado: string = 'SP',
  bairro?: string,
  metragemReferencia?: number,
  precoM2Referencia?: number
): Promise<{ concorrentes: Concorrente[]; fontes: string[]; queries?: string[] }> {
  console.log(`\n========== BUSCA COM GROUNDING (INTERNET REAL) ==========`)
  console.log(`Cidade: ${cidade}, Bairro: ${bairro || 'todos'}, Estado: ${estado}`)
  console.log(`=========================================================\n`)

  const termoBairro = bairro ? `bairro ${bairro}, ` : ''
  const termoMetragem = metragemReferencia ? `apartamentos de ${metragemReferencia}m², ` : ''

  const prompt = `Você é um especialista em mercado imobiliário. Faça uma BUSCA NA INTERNET para encontrar empreendimentos imobiliários residenciais em lançamento ou construção.

=== BUSCA OBRIGATÓRIA ===
Pesquise no Google por:
1. "apartamento lançamento ${termoBairro}${cidade} ${estado} 2024 2025"
2. "empreendimento residencial ${cidade} ${estado} construtora"
3. "${cidade} apartamento novo planta ${termoMetragem}"

=== FONTES PRIORITÁRIAS ===
- VivaReal.com.br
- ZapImoveis.com.br
- Sites oficiais de construtoras (MRV, Cyrela, Tenda, Patriani, Toth, F. Bonano, etc)
- Imovelweb.com.br

=== DADOS PARA EXTRAIR DE CADA EMPREENDIMENTO ===
Para cada empreendimento encontrado, extraia:
1. Nome EXATO do empreendimento (como aparece no site)
2. Nome EXATO da construtora/incorporadora
3. Link da página do empreendimento (URL completa)
4. Cidade e bairro
5. Metragens disponíveis (m²)
6. Faixa de preços (R$)
7. Preço por m² (calcular se não informado)
8. Previsão de entrega
9. Status: Lançamento, Em obras, ou Pronto para morar

=== REGRAS ESTRITAS ===
- SOMENTE empreendimentos encontrados na busca (NÃO INVENTE)
- INCLUA o link de onde encontrou cada empreendimento
- Se não encontrar o dado, deixe em branco
- Foco em empreendimentos de 2023, 2024, 2025

=== FORMATO DE RESPOSTA (JSON) ===
{
  "concorrentes": [
    {
      "nome": "Nome Real do Empreendimento",
      "construtora": "Construtora Real",
      "cidade": "${cidade}",
      "bairro": "Bairro Real",
      "metragemMin": 50,
      "metragemMax": 80,
      "precoMin": 300000,
      "precoMax": 500000,
      "precoM2": 6000,
      "entrega": "2025",
      "status": "Em obras",
      "link": "https://url-real-do-empreendimento.com.br",
      "fonte": "VivaReal ou Site Oficial"
    }
  ],
  "queriesUsadas": ["query1", "query2"]
}

RETORNE APENAS JSON VÁLIDO. Se não encontrar nenhum empreendimento, retorne: {"concorrentes": [], "queriesUsadas": []}`

  try {
    const resultado = await buscarComGrounding(prompt)

    // Extrair JSON da resposta
    let jsonText = resultado.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Tentar encontrar JSON válido na resposta
    const jsonMatch = jsonText.match(/\{[\s\S]*"concorrentes"[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    try {
      const data = JSON.parse(jsonText)

      // Converter para formato Concorrente
      const concorrentes: Concorrente[] = (data.concorrentes || []).map((c: {
        nome: string
        construtora?: string
        cidade?: string
        bairro?: string
        metragemMin?: number
        metragemMax?: number
        precoMin?: number
        precoMax?: number
        precoM2?: number
        entrega?: string
        status?: string
        link?: string
        fonte?: string
      }) => ({
        nome: c.nome,
        construtora: c.construtora || 'Não informada',
        cidade: c.cidade || cidade,
        metragemMin: c.metragemMin,
        metragemMax: c.metragemMax,
        precoMin: c.precoMin,
        precoMax: c.precoMax,
        precoM2: c.precoM2 || (c.precoMin && c.metragemMin ? Math.round(c.precoMin / c.metragemMin) : undefined),
        entrega: { ano: parseInt(String(c.entrega || '2025').replace(/\D/g, '').slice(0, 4)) || 2025 },
        status: c.status || 'Em análise',
        fonte: c.fonte || 'Google Search',
        link: c.link
      }))

      // Adicionar links das fontes do Grounding aos concorrentes que não têm link
      if (resultado.fontes.length > 0) {
        concorrentes.forEach((c, index) => {
          if (!c.link && resultado.fontes[index]) {
            c.link = resultado.fontes[index].url
            c.fonte = resultado.fontes[index].titulo
          }
        })
      }

      // Extrair URLs das fontes
      const fontesUrls = resultado.fontes.map(f => f.url)

      console.log(`\n========== RESULTADO GROUNDING ==========`)
      console.log(`Total de concorrentes: ${concorrentes.length}`)
      concorrentes.forEach((c, i) => {
        console.log(`${i + 1}. ${c.nome} | ${c.construtora} | ${c.link || 'sem link'}`)
      })
      console.log(`==========================================\n`)

      return {
        concorrentes,
        fontes: [...new Set([...fontesUrls, ...(data.queriesUsadas || [])])],
        queries: data.queriesUsadas
      }

    } catch (parseError) {
      console.error('[Grounding] Erro ao parsear JSON:', parseError)
      console.log('[Grounding] Texto recebido:', jsonText.substring(0, 1000))

      // Retornar fontes do Grounding mesmo sem conseguir parsear
      return {
        concorrentes: [],
        fontes: resultado.fontes.map(f => f.url)
      }
    }

  } catch (error) {
    console.error('[Grounding] Erro na busca:', error)
    return { concorrentes: [], fontes: [] }
  }
}

// Cache de construtoras conhecidas por região
const CONSTRUTORAS_POR_REGIAO: Record<string, string[]> = {
  'ABC': ['MRV', 'Tenda', 'Patriani', 'Toth', 'F. Bonano', 'Even', 'EZTec', 'Cyrela', 'Tecnisa', 'Plano & Plano', 'Tegra', 'Setin', 'You Inc', 'Econ', 'Living', 'Kallas'],
  'SP_CAPITAL': ['Cyrela', 'EZTec', 'Even', 'Gafisa', 'Tegra', 'Setin', 'You Inc', 'SKR', 'Stan', 'Vitacon', 'Mitre', 'Lavvi', 'Moura Dubeux'],
  'LITORAL_SP': ['MRV', 'Tenda', 'Momentum', 'Mac', 'Petinelli', 'Riviera'],
  'INTERIOR_SP': ['MRV', 'Tenda', 'Direcional', 'Goldfarb', 'RNI', 'Canopus', 'Buriti'],
  'RJ': ['MRV', 'Tenda', 'Cyrela', 'Gafisa', 'PDG', 'Performance', 'Calper', 'RJZ Cyrela'],
  'GERAL': ['MRV', 'Tenda', 'Direcional', 'Cury', 'Plano & Plano']
}

// Contexto de bairros por cidade (ABC Paulista)
// Isso ajuda a entender o público-alvo e concorrentes diretos
const BAIRROS_CONTEXTO: Record<string, { alto: string[]; medio: string[]; economico: string[] }> = {
  'santo andré': {
    alto: ['Jardim', 'Campestre', 'Bela Vista', 'Vila Assunção', 'Casa Branca'],
    medio: ['Centro', 'Paraíso', 'Santa Terezinha', 'Vila Pires', 'Parque das Nações'],
    economico: ['Cidade São Jorge', 'Jardim Santo André', 'Vila Luzita', 'Parque Novo Oratório', 'Camilópolis']
  },
  'são bernardo do campo': {
    alto: ['Jardim do Mar', 'Nova Petrópolis', 'Rudge Ramos', 'Centro', 'Anchieta'],
    medio: ['Assunção', 'Planalto', 'Baeta Neves', 'Paulicéia', 'Demarchi'],
    economico: ['Ferrazópolis', 'Montanhão', 'Alves Dias', 'Batistini', 'Cooperativa']
  },
  'são caetano do sul': {
    alto: ['Jardim São Caetano', 'Barcelona', 'Santa Paula', 'Santa Maria', 'Fundação'],
    medio: ['Centro', 'Oswaldo Cruz', 'Cerâmica', 'Santo Antônio', 'Olímpico'],
    economico: ['Prosperidade', 'Mauá (divisa)', 'Nova Gerty']
  },
  'mauá': {
    alto: ['Jardim Zaíra', 'Parque São Vicente', 'Vila Noêmia'],
    medio: ['Centro', 'Jardim Itapeva', 'Vila Magini', 'Parque das Américas'],
    economico: ['Jardim Oratório', 'Capuava', 'Sônia Maria', 'Jardim Primavera']
  },
  'ribeirão pires': {
    alto: ['Centro', 'Santa Luzia', 'Estância da Represa', 'Ouro Fino'],
    medio: ['Jardim Caçula', 'Quarta Divisão', 'Pilar Velho', 'Represa'],
    economico: ['Jardim Luso', 'Suíssa', 'Barro Branco', 'Jardim Pastoril']
  },
  'diadema': {
    alto: ['Centro', 'Conceição', 'Piraporinha'],
    medio: ['Serraria', 'Taboão', 'Casa Grande', 'Campanário'],
    economico: ['Eldorado', 'Navegantes', 'Jardim Canhema', 'Vila Nogueira']
  }
}

// ============================================================================
// BUSCAR CONCORRENTES EM TEMPO REAL
// ============================================================================

export interface ConcorrenteGemini {
  nome: string
  construtora: string
  cidade: string
  metragemMin?: number
  metragemMax?: number
  precoMin?: number
  precoMax?: number
  precoM2?: number
  entrega?: string
  status?: string
  link?: string
  itensLazer?: number
  diferenciais?: string[]
}

export async function buscarConcorrentesComGemini(
  cidade: string,
  estado: string = 'SP'
): Promise<{ concorrentes: Concorrente[]; fontes: string[] }> {
  console.log(`\n[Gemini] Buscando concorrentes em ${cidade}, ${estado}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1, // Mais determinístico
        topP: 0.8,
        maxOutputTokens: 8192,
      }
    })

    const prompt = `Você é um especialista em mercado imobiliário brasileiro com conhecimento profundo do ABC Paulista.

TAREFA: Pesquise e liste TODOS os empreendimentos imobiliários residenciais em ${cidade}, ${estado} e região.

FOCO DA BUSCA:
- Apartamentos em lançamento ou construção
- Residenciais, condomínios e resorts residenciais
- Empreendimentos de 2023, 2024 e 2025
- Inclua empreendimentos conhecidos como "Home Resort" ou similares

CONSTRUTORAS PARA PESQUISAR (se atuam na região):
- MRV, Tenda, Direcional, Cyrela, EZTec
- Construtoras locais do ABC (Patriani, Toth, F. Bonano)
- Incorporadoras regionais

INSTRUÇÕES:
1. Busque empreendimentos em obras, lançamentos e prontos para morar
2. Para cada um, forneça dados REAIS e VERIFICÁVEIS
3. Inclua preço por m² quando disponível
4. Se não souber um dado com certeza, omita (não invente)
5. Priorize empreendimentos com:
   - Mais de 1 torre ou bloco
   - Área de lazer completa
   - Preço acima de R$ 200.000

RETORNE APENAS um JSON válido:
{
  "concorrentes": [
    {
      "nome": "Nome do Empreendimento",
      "construtora": "Nome da Construtora",
      "cidade": "Cidade",
      "metragemMin": 50,
      "metragemMax": 80,
      "precoMin": 300000,
      "precoMax": 500000,
      "precoM2": 6000,
      "entrega": "2025",
      "status": "Em obras | Lançamento | Pronto para morar",
      "link": "https://site-oficial.com.br",
      "itensLazer": 20,
      "diferenciais": ["item1", "item2"]
    }
  ],
  "fontes": ["fonte1", "fonte2"]
}

IMPORTANTE:
- Retorne SOMENTE o JSON, sem markdown, sem explicações
- Dados devem ser REAIS de empreendimentos que existem
- Inclua o link oficial quando disponível
- Cidades vizinhas de ${cidade}: Mauá, Santo André, São Bernardo do Campo, São Caetano do Sul, Diadema`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log(`[Gemini] Resposta recebida (${text.length} chars)`)

    // Limpar resposta (remover markdown se houver)
    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    // Tentar parsear JSON
    try {
      const data = JSON.parse(jsonText)

      const concorrentes: Concorrente[] = (data.concorrentes || []).map((c: ConcorrenteGemini) => ({
        nome: c.nome,
        construtora: c.construtora || 'Não informada',
        cidade: c.cidade || cidade,
        metragemMin: c.metragemMin,
        metragemMax: c.metragemMax,
        precoMin: c.precoMin,
        precoMax: c.precoMax,
        precoM2: c.precoM2 || (c.precoMin && c.metragemMin ? Math.round(c.precoMin / c.metragemMin) : undefined),
        entrega: { ano: parseInt(c.entrega || '2025') || 2025 },
        status: c.status || 'Em análise',
        fonte: 'Gemini + Google Search',
        link: c.link,
        itensLazer: c.itensLazer
      }))

      console.log(`[Gemini] ${concorrentes.length} concorrentes encontrados`)

      return {
        concorrentes,
        fontes: data.fontes || ['Google Search via Gemini']
      }
    } catch (parseError) {
      console.error('[Gemini] Erro ao parsear JSON:', parseError)
      console.log('[Gemini] Texto recebido:', jsonText.substring(0, 500))
      return { concorrentes: [], fontes: [] }
    }

  } catch (error) {
    console.error('[Gemini] Erro na busca:', error)
    return { concorrentes: [], fontes: [] }
  }
}

// ============================================================================
// BUSCAR DADOS DE MERCADO
// ============================================================================

export interface DadosMercadoGemini {
  cidade: string
  populacao?: number
  pib?: number
  pibPerCapita?: number
  salarioMedio?: number
  precoM2Medio?: number
  precoM2Lancamentos?: number
  taxaDesemprego?: number
  crescimentoPopulacional?: number
  principaisSetores?: string[]
  fonteDados?: string[]
}

export async function buscarDadosMercadoComGemini(
  cidade: string,
  estado: string = 'SP'
): Promise<DadosMercadoGemini> {
  console.log(`\n[Gemini] Buscando dados de mercado para ${cidade}, ${estado}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `Você é um analista de dados especializado em mercado imobiliário e economia regional.

TAREFA: Busque dados demográficos e econômicos ATUALIZADOS de ${cidade}, ${estado}.

DADOS NECESSÁRIOS:
1. População atual (estimativa IBGE mais recente)
2. PIB municipal (em reais)
3. PIB per capita
4. Salário médio da população
5. Preço médio do m² de imóveis na cidade
6. Preço médio do m² de lançamentos (apartamentos novos)
7. Taxa de desemprego (se disponível)
8. Crescimento populacional (% últimos 5 anos)
9. Principais setores econômicos

RETORNE APENAS um JSON válido:
{
  "cidade": "${cidade}",
  "populacao": 120000,
  "pib": 3500000000,
  "pibPerCapita": 29000,
  "salarioMedio": 2500,
  "precoM2Medio": 5500,
  "precoM2Lancamentos": 7000,
  "taxaDesemprego": 9.5,
  "crescimentoPopulacional": -0.8,
  "principaisSetores": ["Indústria", "Comércio", "Serviços"],
  "fonteDados": ["IBGE 2024", "FIPE/ZAP"]
}

IMPORTANTE:
- Use dados REAIS e ATUALIZADOS
- Cite as fontes dos dados
- Se não souber um dado exato, forneça uma estimativa baseada em dados regionais
- Retorne SOMENTE o JSON, sem explicações`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Limpar resposta
    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    try {
      const data = JSON.parse(jsonText)
      console.log(`[Gemini] Dados de mercado obtidos para ${cidade}`)
      return data
    } catch (parseError) {
      console.error('[Gemini] Erro ao parsear dados de mercado:', parseError)
      return { cidade }
    }

  } catch (error) {
    console.error('[Gemini] Erro ao buscar dados de mercado:', error)
    return { cidade }
  }
}

// ============================================================================
// BUSCAR PREÇO/M² POR REGIÃO
// ============================================================================

export interface PrecoRegiaoGemini {
  regiao: string
  precoM2Medio: number
  precoM2Lancamentos?: number
  variacao12meses?: number
  fonte: string
}

export async function buscarPrecosRegioesComGemini(
  cidadeBase: string
): Promise<PrecoRegiaoGemini[]> {
  console.log(`\n[Gemini] Buscando preços por região próxima a ${cidadeBase}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `Você é um especialista em mercado imobiliário do ABC Paulista.

TAREFA: Busque o preço médio do m² de apartamentos em ${cidadeBase} e regiões próximas.

REGIÕES PARA PESQUISAR:
1. ${cidadeBase}
2. Cidades vizinhas (Mauá, Santo André, São Bernardo, São Caetano, Diadema)
3. São Paulo Capital (para comparação)
4. Média do ABC Paulista

RETORNE APENAS um JSON válido:
{
  "precos": [
    {
      "regiao": "Ribeirão Pires",
      "precoM2Medio": 5800,
      "precoM2Lancamentos": 7500,
      "variacao12meses": 8.5,
      "fonte": "FIPE/ZAP"
    }
  ]
}

IMPORTANTE:
- Dados devem ser de 2024
- Diferencie preço médio (usados + novos) de preço de lançamentos
- Inclua variação dos últimos 12 meses se disponível
- Retorne SOMENTE o JSON`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    try {
      const data = JSON.parse(jsonText)
      console.log(`[Gemini] ${data.precos?.length || 0} regiões com preços`)
      return data.precos || []
    } catch (parseError) {
      console.error('[Gemini] Erro ao parsear preços:', parseError)
      return []
    }

  } catch (error) {
    console.error('[Gemini] Erro ao buscar preços:', error)
    return []
  }
}

// ============================================================================
// ANALISAR SITE DE EMPREENDIMENTO
// ============================================================================

export async function analisarSiteEmpreendimento(url: string): Promise<ConcorrenteGemini | null> {
  console.log(`\n[Gemini] Analisando site: ${url}`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    })

    const prompt = `Você é um analista de mercado imobiliário.

TAREFA: Acesse e analise o site do empreendimento: ${url}

EXTRAIA as seguintes informações:
1. Nome do empreendimento
2. Construtora/Incorporadora
3. Cidade e endereço
4. Metragens disponíveis (m²)
5. Faixa de preços
6. Preço por m²
7. Previsão de entrega
8. Número de itens de lazer
9. Diferenciais do empreendimento
10. Status (lançamento, em obras, pronto)

RETORNE APENAS um JSON:
{
  "nome": "Nome do Empreendimento",
  "construtora": "Construtora X",
  "cidade": "Cidade",
  "endereco": "Rua X, 123",
  "metragemMin": 50,
  "metragemMax": 80,
  "precoMin": 300000,
  "precoMax": 500000,
  "precoM2": 6000,
  "entrega": "Agosto/2027",
  "status": "Em obras",
  "itensLazer": 25,
  "diferenciais": ["Piscina aquecida", "Coworking", "Pet place"],
  "link": "${url}"
}

IMPORTANTE: Retorne SOMENTE o JSON com dados REAIS do site`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    try {
      const data = JSON.parse(jsonText)
      console.log(`[Gemini] Empreendimento analisado: ${data.nome}`)
      return data
    } catch (parseError) {
      console.error('[Gemini] Erro ao parsear análise do site:', parseError)
      return null
    }

  } catch (error) {
    console.error('[Gemini] Erro ao analisar site:', error)
    return null
  }
}

// ============================================================================
// BUSCAR CIDADES CORRELACIONADAS DINAMICAMENTE
// Identifica cidades com perfil similar para comparação
// ============================================================================

export async function buscarCidadesCorrelacionadas(
  cidade: string,
  estado: string,
  padrao: 'economico' | 'medio' | 'alto'
): Promise<string[]> {
  console.log(`\n[Cidades] Buscando cidades correlacionadas para ${cidade} (padrão ${padrao})...`)

  // Primeiro, tentar usar nossa lista estática de cidades vizinhas
  let cidadesVizinhas = getCidadesVizinhas(cidade)

  // Se não encontrou, usar a região metropolitana
  if (cidadesVizinhas.length === 0) {
    cidadesVizinhas = getRegiaoMetropolitana(cidade, estado)
  }

  // Limitar a 5 cidades e filtrar a própria cidade
  const cidadesCorrelacionadas = cidadesVizinhas
    .filter(c => c.toLowerCase() !== cidade.toLowerCase())
    .slice(0, 5)

  console.log(`[Cidades] Cidades correlacionadas encontradas: ${cidadesCorrelacionadas.join(', ')}`)

  return cidadesCorrelacionadas
}

// ============================================================================
// BUSCAR CONCORRENTES POR PADRÃO (DINÂMICO)
// Busca específica por padrão do empreendimento
// ============================================================================

// Helper para classificar bairro baseado no contexto
function classificarBairroPorContexto(cidade: string, bairro?: string): 'alto' | 'medio' | 'economico' | null {
  if (!bairro) return null
  const cidadeLower = cidade.toLowerCase()
  const bairroLower = bairro.toLowerCase()
  const contexto = BAIRROS_CONTEXTO[cidadeLower]
  if (!contexto) return null

  if (contexto.alto.some(b => bairroLower.includes(b.toLowerCase()))) return 'alto'
  if (contexto.medio.some(b => bairroLower.includes(b.toLowerCase()))) return 'medio'
  if (contexto.economico.some(b => bairroLower.includes(b.toLowerCase()))) return 'economico'
  return null
}

export async function buscarConcorrentesPorPadrao(
  cidade: string,
  estado: string,
  padrao: 'economico' | 'medio' | 'alto',
  precoM2Referencia?: number,
  bairro?: string,
  metragemReferencia?: number
): Promise<{ concorrentes: Concorrente[]; fontes: string[] }> {
  console.log(`\n[Gemini] Buscando concorrentes ${padrao} em ${cidade}${bairro ? ` (${bairro})` : ''}${metragemReferencia ? ` ~${metragemReferencia}m²` : ''}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    })

    // Determinar construtoras relevantes para a região
    const cidadesABC = ['santo andré', 'são bernardo do campo', 'são caetano do sul', 'diadema', 'mauá', 'ribeirão pires', 'rio grande da serra']
    const cidadeLower = cidade.toLowerCase()
    let construtoras = CONSTRUTORAS_POR_REGIAO['GERAL']
    let regiao = 'Grande São Paulo'

    if (cidadesABC.includes(cidadeLower)) {
      construtoras = CONSTRUTORAS_POR_REGIAO['ABC']
      regiao = 'ABC Paulista'
    } else if (cidadeLower === 'são paulo') {
      construtoras = CONSTRUTORAS_POR_REGIAO['SP_CAPITAL']
      regiao = 'São Paulo Capital'
    }

    // Classificar bairro pelo contexto (rico/classe média/popular)
    const classificacaoBairro = classificarBairroPorContexto(cidade, bairro)
    const bairrosContexto = BAIRROS_CONTEXTO[cidadeLower]

    // Descrição do padrão para a busca
    const descricaoPadrao = {
      economico: 'apartamentos populares, MCMV, 2 quartos, até R$ 400mil, foco em primeiro imóvel',
      medio: 'apartamentos médio padrão, 2-3 quartos, R$ 400mil a R$ 900mil, condomínio com lazer',
      alto: 'apartamentos alto padrão/luxo, 3-4 quartos, acima de R$ 700mil, condomínio clube, varanda gourmet, home resort'
    }

    // Contexto de bairros para o prompt
    const contextoBairrosPrompt = bairrosContexto ? `
=== CONTEXTO DE BAIRROS DE ${cidade.toUpperCase()} ===
BAIRROS ALTO PADRÃO (público classe A/B+): ${bairrosContexto.alto.join(', ')}
BAIRROS MÉDIO PADRÃO (público classe B/C+): ${bairrosContexto.medio.join(', ')}
BAIRROS POPULARES (público classe C/D): ${bairrosContexto.economico.join(', ')}

${bairro ? `O bairro "${bairro}" é classificado como: ${classificacaoBairro?.toUpperCase() || 'NÃO IDENTIFICADO'}` : ''}
${classificacaoBairro ? `IMPORTANTE: Buscar concorrentes em BAIRROS SIMILARES (${classificacaoBairro === 'alto' ? bairrosContexto.alto.join(', ') : classificacaoBairro === 'medio' ? bairrosContexto.medio.join(', ') : bairrosContexto.economico.join(', ')})` : ''}` : ''

    // Termos de busca estilo Google
    const termosBusca = [
      `apartamento lançamento ${cidade} ${bairro || ''} 2024`,
      `apartamento na planta ${cidade} ${estado}`,
      metragemReferencia ? `apartamento ${metragemReferencia}m² ${cidade}` : '',
      padrao === 'alto' ? `condomínio clube ${cidade}` : '',
      padrao === 'alto' ? `home resort ${cidade}` : '',
    ].filter(Boolean).join(' | ')

    // Exemplos reais de empreendimentos para cada padrão no ABC
    const exemplosRegiao = cidadesABC.includes(cidadeLower) ? `
=== EMPREENDIMENTOS CONHECIDOS NO ABC (REFERÊNCIA) ===
ALTO PADRÃO:
- AYA Home Resort (Ribeirão Pires) - F. Bonano - ~R$ 8.500/m²
- Residencial Vistta (Santo André, Campestre) - Toth - ~R$ 10.000/m²
- Living Gardens (São Bernardo, Jardim do Mar) - Even - ~R$ 11.000/m²
- Residencial Essenza (Santo André) - F. Bonano - ~R$ 11.500/m²

MÉDIO PADRÃO:
- Empreendimentos Patriani, Toth, EZTec nos bairros Centro e adjacentes
- Faixa de R$ 6.000 a R$ 8.500/m²

ECONÔMICO:
- MRV, Tenda, Direcional nos bairros periféricos
- Faixa de R$ 4.000 a R$ 6.000/m²` : ''

    const prompt = `Você é um corretor de imóveis especialista em ${regiao} com 15 anos de experiência.

MISSÃO CRÍTICA: Liste empreendimentos REAIS e VERIFICÁVEIS em ${cidade}, ${estado}.

=== PARÂMETROS DA BUSCA ===
CIDADE: ${cidade}
BAIRRO REFERÊNCIA: ${bairro || 'Qualquer bairro'}
PADRÃO: ${padrao.toUpperCase()} (${descricaoPadrao[padrao]})
${metragemReferencia ? `METRAGEM: ~${metragemReferencia}m² (aceitar 50% variação)` : ''}
${precoM2Referencia ? `PREÇO/M²: ~R$ ${precoM2Referencia.toLocaleString('pt-BR')}/m²` : ''}
${contextoBairrosPrompt}

=== COMO BUSCAR (ESTILO GOOGLE) ===
${termosBusca}

=== CONSTRUTORAS DA REGIÃO ===
${construtoras.join(', ')}
${exemplosRegiao}

=== FONTES OBRIGATÓRIAS ===
1. VivaReal.com.br - buscar "${cidade} apartamento lançamento"
2. ZAP Imóveis - buscar por cidade e filtrar por "lançamento"
3. Sites das construtoras (Patriani, Toth, F. Bonano, MRV, etc.)
4. Imovelweb.com.br
5. Portais locais do ABC

=== REGRAS ESTRITAS ===
1. APENAS empreendimentos em LANÇAMENTO ou EM CONSTRUÇÃO
2. NÃO invente nomes - só liste se existir de verdade
3. Priorize 2024 e 2025
4. INCLUA O LINK OFICIAL quando souber
5. Liste pelo menos 3-5 empreendimentos se possível
6. Busque em bairros similares se não encontrar no bairro específico

=== FORMATO JSON (OBRIGATÓRIO) ===
{
  "concorrentes": [
    {
      "nome": "Nome Exato do Empreendimento",
      "construtora": "Construtora Real",
      "cidade": "${cidade}",
      "bairro": "Bairro Real",
      "metragemMin": 70,
      "metragemMax": 120,
      "precoMin": 500000,
      "precoMax": 800000,
      "precoM2": 7000,
      "entrega": "Dez/2026",
      "status": "Em obras",
      "link": "https://site-oficial.com.br",
      "itensLazer": 20,
      "dormitorios": "3 dorms (1 suíte)"
    }
  ],
  "fontes": ["VivaReal", "Site Patriani"]
}

RETORNE APENAS JSON VÁLIDO. Se não encontrar nada, retorne: {"concorrentes": [], "fontes": []}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const data = JSON.parse(jsonText)

      const concorrentes: Concorrente[] = (data.concorrentes || []).map((c: ConcorrenteGemini) => ({
        nome: c.nome,
        construtora: c.construtora || 'Não informada',
        cidade: c.cidade || cidade,
        metragemMin: c.metragemMin,
        metragemMax: c.metragemMax,
        precoMin: c.precoMin,
        precoMax: c.precoMax,
        precoM2: c.precoM2 || (c.precoMin && c.metragemMin ? Math.round(c.precoMin / c.metragemMin) : undefined),
        entrega: { ano: parseInt(String(c.entrega || '2025').replace(/\D/g, '').slice(0,4)) || 2025 },
        status: c.status || 'Em análise',
        fonte: `Pesquisa ${cidade}`,
        link: c.link,
        itensLazer: c.itensLazer
      }))

      // Validar que os concorrentes são da cidade correta (ou região próxima)
      const concorrentesValidos = concorrentes.filter(c => {
        const cidadeC = c.cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        const cidadeRef = cidade.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        // Aceitar se a cidade contém o nome ou vice-versa
        return cidadeC.includes(cidadeRef) || cidadeRef.includes(cidadeC) ||
               // Aceitar cidades do ABC se estamos buscando no ABC
               (cidadesABC.includes(cidadeLower) && cidadesABC.some(abc => cidadeC.includes(abc.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))))
      })

      console.log(`[Gemini] ${concorrentesValidos.length} concorrentes encontrados em ${cidade}`)

      return {
        concorrentes: concorrentesValidos,
        fontes: data.fontes || ['Pesquisa de mercado']
      }
    } catch (parseError) {
      console.error('[Gemini] Erro ao parsear JSON:', parseError)
      return { concorrentes: [], fontes: [] }
    }

  } catch (error) {
    console.error('[Gemini] Erro na busca:', error)
    return { concorrentes: [], fontes: [] }
  }
}

// ============================================================================
// BUSCAR PREÇOS POR REGIÕES CORRELACIONADAS
// ============================================================================

export async function buscarPrecosRegioesCorrelacionadas(
  cidadeBase: string,
  estado: string,
  cidadesCorrelacionadas: string[],
  padrao: 'economico' | 'medio' | 'alto'
): Promise<PrecoRegiaoGemini[]> {
  console.log(`\n[Gemini] Buscando preços para ${cidadeBase} e regiões correlacionadas...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    })

    const todasCidades = [cidadeBase, ...cidadesCorrelacionadas]

    const prompt = `Você é um especialista em mercado imobiliário brasileiro.

TAREFA: Busque o preço médio do m² de apartamentos de padrão ${padrao.toUpperCase()} nas seguintes cidades:

CIDADES PARA PESQUISAR:
${todasCidades.map((c, i) => `${i + 1}. ${c}`).join('\n')}

PADRÃO: ${padrao.toUpperCase()}
${padrao === 'economico' ? '(apartamentos populares, MCMV)' :
  padrao === 'medio' ? '(apartamentos 2-3 quartos, médio acabamento)' :
  '(apartamentos premium, alto acabamento, condomínios clube)'}

RETORNE APENAS um JSON válido:
{
  "precos": [
    {
      "regiao": "Nome da Cidade",
      "precoM2Medio": 5800,
      "precoM2Lancamentos": 7500,
      "variacao12meses": 8.5,
      "fonte": "FIPE/ZAP ou similar"
    }
  ]
}

IMPORTANTE:
- Preços devem refletir o padrão ${padrao.toUpperCase()} específico
- Diferencie preço médio de preço de lançamentos
- Inclua variação dos últimos 12 meses
- Dados de 2024/2025
- Retorne SOMENTE o JSON`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const data = JSON.parse(jsonText)
      console.log(`[Gemini] ${data.precos?.length || 0} regiões com preços`)
      return data.precos || []
    } catch {
      console.error('[Gemini] Erro ao parsear preços')
      return []
    }

  } catch (error) {
    console.error('[Gemini] Erro ao buscar preços:', error)
    return []
  }
}

// ============================================================================
// BUSCA COMPLETA (CONCORRENTES + MERCADO + PREÇOS)
// ============================================================================

export interface BuscaCompletaGemini {
  concorrentes: Concorrente[]
  dadosMercado: DadosMercadoGemini
  precosRegioes: PrecoRegiaoGemini[]
  fontes: string[]
}

export async function buscarDadosCompletosComGemini(
  cidade: string,
  estado: string = 'SP'
): Promise<BuscaCompletaGemini> {
  console.log(`\n========== BUSCA COMPLETA COM GEMINI ==========`)
  console.log(`Cidade: ${cidade}, Estado: ${estado}`)
  console.log(`================================================\n`)

  // Executar buscas em paralelo para maior velocidade
  const [concorrentesResult, dadosMercado, precosRegioes] = await Promise.all([
    buscarConcorrentesComGemini(cidade, estado),
    buscarDadosMercadoComGemini(cidade, estado),
    buscarPrecosRegioesComGemini(cidade)
  ])

  const fontes = [
    ...concorrentesResult.fontes,
    ...(dadosMercado.fonteDados || []),
    ...precosRegioes.map(p => p.fonte).filter((f, i, arr) => arr.indexOf(f) === i)
  ]

  console.log(`\n========== RESULTADO BUSCA GEMINI ==========`)
  console.log(`Concorrentes: ${concorrentesResult.concorrentes.length}`)
  console.log(`Dados de mercado: ${dadosMercado.populacao ? 'OK' : 'Parcial'}`)
  console.log(`Preços por região: ${precosRegioes.length}`)
  console.log(`=============================================\n`)

  return {
    concorrentes: concorrentesResult.concorrentes,
    dadosMercado,
    precosRegioes,
    fontes: [...new Set(fontes)]
  }
}
