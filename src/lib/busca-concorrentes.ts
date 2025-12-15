// ============================================================================
// BUSCA DE CONCORRENTES - WORKFLOW COMPLETO
// Foco em links oficiais (site do empreendimento ou construtora)
// ============================================================================

import { buscarComGrounding } from './gemini'
import type { Concorrente } from '@/types'

// ============================================================================
// TIPOS
// ============================================================================

export interface ParametrosBusca {
  cidade: string
  estado: string
  bairro?: string
  metragemReferencia?: number
  precoM2Referencia?: number
  padrao: 'economico' | 'medio' | 'alto'
  dormitorios?: number
}

export interface EmpreendimentoDescoberto {
  nome: string
  construtora?: string
  cidade: string
  bairro?: string
  metragemMin?: number
  metragemMax?: number
  precoMin?: number
  precoMax?: number
  precoM2?: number
  entrega?: string
  status?: string
  linkPortal?: string // Link do portal (VivaReal, ZAP, etc.)
  linkOficial?: string // Link oficial (construtora ou landing page)
  fonte?: string
}

export interface ResultadoBuscaCompleta {
  concorrentes: Concorrente[]
  cidadesAnalisadas: string[]
  bairrosAnalisados: Record<string, string[]>
  fontes: string[]
  metodo: string
}

// ============================================================================
// BUSCA DINÂMICA DE CIDADES E BAIRROS
// Usa Gemini para descobrir cidades vizinhas e bairros equivalentes
// para QUALQUER cidade do Brasil
// ============================================================================

interface CidadesVizinhasCache {
  cidades: string[]
  timestamp: number
}

interface BairrosEquivalentesCache {
  bairros: string[]
  timestamp: number
}

// Cache em memória para evitar buscas repetidas
const cacheCidadesVizinhas: Record<string, CidadesVizinhasCache> = {}
const cacheBairrosEquivalentes: Record<string, BairrosEquivalentesCache> = {}
const CACHE_TTL = 1000 * 60 * 60 // 1 hora

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function normalizarCidade(cidade: string): string {
  return cidade.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Busca cidades vizinhas DINAMICAMENTE usando Gemini
 * Funciona para qualquer cidade do Brasil
 */
async function getCidadesVizinhasDinamico(cidade: string, estado: string): Promise<string[]> {
  const cacheKey = `${cidade}-${estado}`.toLowerCase()

  // Verificar cache
  const cached = cacheCidadesVizinhas[cacheKey]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cidades] Cache hit para ${cidade}`)
    return cached.cidades
  }

  console.log(`[Cidades] Buscando cidades vizinhas de ${cidade}, ${estado}...`)

  const prompt = `Liste as 5 principais cidades vizinhas de ${cidade}, ${estado} que tenham mercado imobiliário relevante.

CRITÉRIOS:
1. Cidades que fazem divisa ou estão próximas (até 30km)
2. Cidades com lançamentos imobiliários similares
3. Cidades da mesma região metropolitana (se aplicável)

FORMATO DE RESPOSTA (JSON):
{
  "cidadesVizinhas": ["Cidade 1", "Cidade 2", "Cidade 3", "Cidade 4", "Cidade 5"]
}

Retorne APENAS o JSON, sem explicações.`

  try {
    const resultado = await buscarComGrounding(prompt)

    let jsonText = resultado.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*"cidadesVizinhas"[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const data = JSON.parse(jsonText)
    const cidades = data.cidadesVizinhas || []

    // Salvar em cache
    cacheCidadesVizinhas[cacheKey] = {
      cidades,
      timestamp: Date.now()
    }

    console.log(`[Cidades] Encontradas: ${cidades.join(', ')}`)
    return cidades

  } catch (error) {
    console.error(`[Cidades] Erro ao buscar cidades vizinhas:`, error)
    return []
  }
}

/**
 * Busca bairros equivalentes DINAMICAMENTE usando Gemini
 * Encontra bairros com perfil similar em outra cidade
 */
async function getBairrosEquivalentesDinamico(
  cidadeOrigem: string,
  bairroOrigem: string,
  cidadeDestino: string,
  estado: string,
  padrao: 'economico' | 'medio' | 'alto'
): Promise<string[]> {
  const cacheKey = `${cidadeDestino}-${padrao}`.toLowerCase()

  // Verificar cache
  const cached = cacheBairrosEquivalentes[cacheKey]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Bairros] Cache hit para ${cidadeDestino} (${padrao})`)
    return cached.bairros
  }

  console.log(`[Bairros] Buscando bairros ${padrao} em ${cidadeDestino}...`)

  const descricaoPadrao = {
    economico: 'populares, classe C/D, MCMV, primeiro imóvel',
    medio: 'classe média, classe B/C, bom custo-benefício',
    alto: 'alto padrão, classe A/B, luxo, condomínio clube'
  }

  const prompt = `Quais são os principais bairros de ${cidadeDestino}, ${estado} que têm perfil ${padrao.toUpperCase()} (${descricaoPadrao[padrao]})?

CONTEXTO: Estou buscando bairros similares ao ${bairroOrigem} em ${cidadeOrigem}, que é um bairro de padrão ${padrao}.

CRITÉRIOS:
1. Bairros com empreendimentos imobiliários de padrão ${padrao}
2. Bairros com perfil de público similar
3. Bairros onde construtoras lançam produtos de padrão ${padrao}

FORMATO DE RESPOSTA (JSON):
{
  "bairros": ["Bairro 1", "Bairro 2", "Bairro 3", "Bairro 4", "Bairro 5"]
}

Retorne APENAS o JSON, sem explicações.`

  try {
    const resultado = await buscarComGrounding(prompt)

    let jsonText = resultado.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*"bairros"[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const data = JSON.parse(jsonText)
    const bairros = data.bairros || []

    // Salvar em cache
    cacheBairrosEquivalentes[cacheKey] = {
      bairros,
      timestamp: Date.now()
    }

    console.log(`[Bairros] Encontrados em ${cidadeDestino}: ${bairros.join(', ')}`)
    return bairros

  } catch (error) {
    console.error(`[Bairros] Erro ao buscar bairros:`, error)
    return []
  }
}

// Verifica se um nome de empreendimento é válido (não genérico)
function isNomeValido(nome: string): boolean {
  const nomesGenericos = [
    'apartamento', 'apartamentos', 'casa', 'casas', 'imóvel', 'imovel', 'imoveis', 'imóveis',
    'lançamento', 'lancamento', 'residencial', 'empreendimento', 'condomínio', 'condominio'
  ]

  const nomeNorm = nome.toLowerCase().trim()

  // Se o nome é muito curto ou é um termo genérico, é inválido
  if (nomeNorm.length < 3) return false
  if (nomesGenericos.includes(nomeNorm)) return false

  // Se o nome começa com termo genérico seguido de número/metragem, é inválido
  // Ex: "Apartamento 114 m²", "Casa 3 quartos", "Apartamento 2 dorms"
  const padroesGenericos = [
    /^apartamento\s*\d+/i,
    /^casa\s*\d+/i,
    /^residencial\s*\d+$/i,
    /^lançamento\s*\d+$/i,
    /^apartamento\s+\d+\s*m/i,  // "Apartamento 114 m²"
    /^apartamento\s+de\s+\d+/i, // "Apartamento de 114m²"
    /^apartamento\s+com\s+\d+/i, // "Apartamento com 3 quartos"
  ]

  if (padroesGenericos.some(p => p.test(nomeNorm))) return false

  return true
}

// Classifica o tipo de link (construtora, portal, imobiliária)
function classificarLink(link: string | undefined): { tipo: 'construtora' | 'portal' | 'imobiliaria' | 'landing_page' | 'invalido'; prioridade: number } {
  if (!link) return { tipo: 'invalido', prioridade: 0 }

  // Excluir links de redirect do Google
  if (link.includes('vertexaisearch.cloud.google.com')) return { tipo: 'invalido', prioridade: 0 }
  if (link.includes('google.com/grounding')) return { tipo: 'invalido', prioridade: 0 }

  const linkLower = link.toLowerCase()

  // 1. CONSTRUTORAS (maior prioridade)
  const construtoras = [
    'mrv.com.br', 'tenda.com.br', 'cyrela.com.br', 'eztec.com.br', 'even.com.br',
    'cury.net', 'cury.com.br', 'direcional.com.br', 'tegra.com.br', 'setin.com.br',
    'lavvi.com.br', 'mitre.com.br', 'planoeplano.com.br', 'helbor.com.br',
    'patriani.com.br', 'tothconstrutora.com.br', 'fbonanoengenharia.com.br',
    'econconstrutora.com.br', 'mbigucci.com.br', 'nazareconstrutora.com.br',
    'lorenzini.com.br', 'grupomotiro.com.br', 'motiro.com.br', 'exkalla.com.br',
    'viapavan.com.br', 'artconstrutora.com.br', 'paddan.com.br', 'fratta.com.br',
    'construtora', 'incorporadora', 'engenharia'
  ]
  if (construtoras.some(c => linkLower.includes(c))) {
    return { tipo: 'construtora', prioridade: 100 }
  }

  // 2. IMOBILIÁRIAS LOCAIS (alta prioridade)
  const imobiliarias = [
    'lopes.com.br', 'coelhocampos.com.br', 'fernandezmenezesimoveis.com.br',
    'araraimoveis.com.br', 'auxiliadorapredial.com.br', 'apolar.com.br',
    'remax.com.br', 'century21.com.br', 'kwbrasil.com.br',
    'imoveis', 'imobiliaria', 'imob'
  ]
  if (imobiliarias.some(i => linkLower.includes(i))) {
    return { tipo: 'imobiliaria', prioridade: 80 }
  }

  // 3. PORTAIS IMOBILIÁRIOS (média prioridade - mas aceitamos páginas específicas)
  const portais = [
    'vivareal.com.br', 'zapimoveis.com.br', 'imovelweb.com.br',
    'chfrancisco.com.br', '123i.com.br', 'trovit.com.br',
    'quintoandar.com.br', 'lugarcerto.com.br'
  ]
  if (portais.some(p => linkLower.includes(p))) {
    return { tipo: 'portal', prioridade: 60 }
  }

  // 4. LANDING PAGES PRÓPRIAS (verificar se tem padrões de empreendimento)
  if (linkLower.includes('/empreendimentos/') || linkLower.includes('/lancamentos/') ||
      linkLower.includes('/lancamento/') || linkLower.includes('/imoveis/')) {
    return { tipo: 'landing_page', prioridade: 90 }
  }

  // 5. Domínio próprio (pode ser landing page do empreendimento)
  return { tipo: 'landing_page', prioridade: 70 }
}

// Verifica se um link é válido (página específica, não homepage)
function isLinkValido(link: string | undefined): boolean {
  if (!link) return false
  const classificacao = classificarLink(link)
  return classificacao.tipo !== 'invalido' && classificacao.prioridade > 0
}

// ============================================================================
// ETAPA 1: DESCOBERTA DE EMPREENDIMENTOS
// Busca inicial para descobrir nomes de empreendimentos e construtoras
// ============================================================================

async function descobrirEmpreendimentos(params: ParametrosBusca): Promise<EmpreendimentoDescoberto[]> {
  const { cidade, estado, bairro, metragemReferencia, padrao } = params

  console.log(`\n[Descoberta] Buscando empreendimentos em ${bairro ? bairro + ', ' : ''}${cidade}...`)

  const termoBairro = bairro || ''
  const termoMetragem = metragemReferencia ? `${metragemReferencia}m²` : ''
  const termoPadrao = padrao === 'alto' ? 'alto padrão' :
                       padrao === 'economico' ? 'minha casa minha vida' : 'médio padrão'

  // Prompt otimizado para descobrir TODOS os empreendimentos da região
  const prompt = `Você é um corretor de imóveis experiente. Faça MÚLTIPLAS BUSCAS no Google para encontrar TODOS os empreendimentos imobiliários em lançamento na região.

=== BUSCAS QUE VOCÊ DEVE FAZER (como digitaria no Google) ===

1. "apartamento lançamento ${termoBairro} ${cidade} ${estado}"
2. "empreendimento ${termoBairro} ${cidade} construtora"
3. "residencial ${termoBairro} ${cidade} 2024 2025"
4. "apartamento na planta ${cidade} ${termoBairro}"
5. site:vivareal.com.br apartamento lançamento ${termoBairro} ${cidade}
6. site:zapimoveis.com.br apartamento novo ${termoBairro} ${cidade}
7. site:lopes.com.br lancamento ${termoBairro} ${cidade}
${termoMetragem ? `8. "${termoMetragem}" apartamento ${cidade} ${termoBairro}` : ''}

=== CONSTRUTORAS CONHECIDAS NA REGIÃO ===
Também pesquise diretamente:
- site:mbigucci.com.br ${cidade}
- site:patriani.com.br ${cidade}
- site:exkalla.com.br ${cidade}
- site:tothconstrutora.com.br ${cidade}
- site:helbor.com.br ${cidade}
- site:lavvi.com.br ${cidade}

=== O QUE EXTRAIR ===
Para CADA empreendimento encontrado, extraia:
- nome: Nome EXATO do empreendimento
- construtora: Nome da construtora (MUITO IMPORTANTE!)
- bairro: Bairro do empreendimento
- metragemMin/metragemMax: Metragens disponíveis
- precoMin/precoMax: Faixa de preços
- precoM2: Preço por m²
- entrega: Ano de entrega
- status: "Lançamento", "Em obras" ou "Pronto"

=== REGRAS ===
- Liste TODOS os empreendimentos que encontrar (mínimo 10 se houver)
- Inclua empreendimentos de construtoras diferentes
- NÃO repita o mesmo empreendimento
- Se não souber a construtora, escreva "Verificar"

=== FORMATO JSON ===
{
  "empreendimentos": [
    {
      "nome": "Nome do Empreendimento",
      "construtora": "Nome da Construtora",
      "cidade": "${cidade}",
      "bairro": "${termoBairro}",
      "metragemMin": 50,
      "metragemMax": 80,
      "precoMin": 350000,
      "precoMax": 500000,
      "precoM2": 7000,
      "entrega": "2026",
      "status": "Em obras"
    }
  ]
}

RETORNE APENAS JSON VÁLIDO.`

  try {
    const resultado = await buscarComGrounding(prompt)

    let jsonText = resultado.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const data = JSON.parse(jsonText)
    const empreendimentosRaw: EmpreendimentoDescoberto[] = (data.empreendimentos || []).map((e: {
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
      linkPortal?: string
      fonte?: string
    }) => ({
      nome: e.nome,
      construtora: e.construtora,
      cidade: e.cidade || cidade,
      bairro: e.bairro,
      metragemMin: e.metragemMin,
      metragemMax: e.metragemMax,
      precoMin: e.precoMin,
      precoMax: e.precoMax,
      precoM2: e.precoM2,
      entrega: e.entrega,
      status: e.status,
      linkPortal: e.linkPortal,
      fonte: e.fonte
    }))

    // Filtrar nomes genéricos (como "Apartamento", "Lançamento", etc.)
    const empreendimentos = empreendimentosRaw.filter(e => isNomeValido(e.nome))

    console.log(`[Descoberta] ${empreendimentos.length} empreendimentos válidos (${empreendimentosRaw.length - empreendimentos.length} genéricos filtrados)`)
    empreendimentos.forEach((e, i) => {
      console.log(`  ${i + 1}. ${e.nome} | ${e.construtora || '?'} | ${e.bairro || cidade}`)
    })

    return empreendimentos

  } catch (error) {
    console.error('[Descoberta] Erro:', error)
    return []
  }
}

// ============================================================================
// ETAPA 2: BUSCAR LINK ESPECÍFICO DO EMPREENDIMENTO
// Busca a URL EXATA da página do produto (não homepage!)
// Prioridade: Site oficial > Página na construtora > Página no portal
// ============================================================================

interface ResultadoBuscaLink {
  url: string
  tipo: 'landing_page' | 'site_construtora' | 'pagina_portal' | 'nao_encontrado'
  construtora?: string
  confianca: 'alta' | 'media' | 'baixa'
}

/**
 * Valida se uma URL é específica do empreendimento (não é homepage genérica)
 */
function isUrlEspecifica(url: string, nomeEmpreendimento: string): boolean {
  if (!url || url === 'null' || url === 'undefined') return false

  // Rejeitar URLs muito longas (provavelmente malformadas)
  if (url.length > 300) {
    console.log(`[isUrlEspecifica] ✗ URL muito longa (malformada): ${url.substring(0, 100)}...`)
    return false
  }

  try {
    const urlLower = url.toLowerCase()
    const nomeSlug = nomeEmpreendimento
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    // Rejeitar links de redirect do Google
    if (url.includes('vertexaisearch.cloud.google.com')) return false
    if (url.includes('google.com/grounding')) return false

    // Rejeitar URLs de imagens, PDFs, e outros arquivos não-HTML
    const extensoesInvalidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx', '.xls', '.xlsx']
    if (extensoesInvalidas.some(ext => urlLower.endsWith(ext))) {
      console.log(`[isUrlEspecifica] ✗ URL de arquivo (não é página): ${url}`)
      return false
    }

    // Rejeitar URLs de CDN de imagens
    const cdnsImagem = ['cloudfront.net', 'cloudinary.com', 'imgix.net', 'amazonaws.com/images', 'storage.googleapis.com']
    if (cdnsImagem.some(cdn => urlLower.includes(cdn))) {
      console.log(`[isUrlEspecifica] ✗ URL de CDN de imagem: ${url}`)
      return false
    }

    // Tentar parsear URL
    let urlPath = ''
    let urlDomain = ''
    try {
      const parsed = new URL(url)
      urlPath = parsed.pathname
      urlDomain = parsed.hostname
    } catch {
      // Se não conseguir parsear, verificar se tem path
      urlPath = url.split('.com.br')[1] || url.split('.com')[1] || ''
      const domainMatch = url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)/)
      urlDomain = domainMatch ? domainMatch[1] : ''
    }

    // Verificar se a URL contém referência ao empreendimento
    const palavrasNome = nomeEmpreendimento
      .toLowerCase()
      .split(/\s+/)
      .filter(p => p.length > 3)
      .map(p => p.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))

    // CASO 1: Landing page própria (domínio contém nome do empreendimento)
    // Ex: horizonte-campestre.com.br, visioncampestre.com.br
    // MAS só se não for homepage (deve ter path ou nome completo no domínio)
    const dominioContemNome = palavrasNome.some(palavra => urlDomain.includes(palavra)) ||
                               urlDomain.includes(nomeSlug.split('-')[0]) // Primeira palavra do slug

    if (dominioContemNome) {
      // Se é homepage (path vazio), verificar se o domínio é ESPECÍFICO do empreendimento
      // Ex: douro-residencial.com.br é específico, nazareconstrutora.com.br NÃO é
      const ehHomepage = urlPath === '/' || urlPath === '' || urlPath.length < 3

      if (ehHomepage) {
        // Verificar se é construtora/incorporadora (não é landing page do empreendimento)
        const ehSiteConstrutora = urlDomain.includes('construtora') ||
                                   urlDomain.includes('incorporadora') ||
                                   urlDomain.includes('engenharia')
        if (ehSiteConstrutora) {
          console.log(`[isUrlEspecifica] ✗ Homepage de construtora (não landing page): ${url}`)
          return false
        }
      }

      console.log(`[isUrlEspecifica] ✓ Landing page própria: ${url}`)
      return true
    }

    // CASO 2: Página específica em portal/construtora
    // Rejeitar URLs que são apenas homepage
    if (urlPath === '/' || urlPath === '' || urlPath.length < 5) {
      console.log(`[isUrlEspecifica] ✗ Homepage genérica: ${url}`)
      return false
    }

    // URL deve conter pelo menos uma palavra significativa do nome OU o slug no PATH
    const pathContemReferencia = palavrasNome.some(palavra => urlPath.toLowerCase().includes(palavra)) ||
                                  urlPath.toLowerCase().includes(nomeSlug)

    if (pathContemReferencia) {
      console.log(`[isUrlEspecifica] ✓ Página específica: ${url}`)
      return true
    }

    // FALLBACK: Aceitar URLs de portais/imobiliárias que tenham estrutura de página de imóvel
    // mesmo que não tenham o nome exato (pode ter código/ID)
    const padroesPaginaImovel = [
      /\/lancamento\/[^\/]+\/\d+/,      // lopes.com.br/lancamento/xxx/12345
      /\/imovel\/[^\/]+\/\d+/,           // vivareal.com.br/imovel/xxx/12345
      /\/empreendimento\/[^\/]+/,        // site.com.br/empreendimento/xxx
      /\/apartamento[^\/]*\/\d+/,        // site.com.br/apartamento-xxx/123
      /\/imoveis\/[^\/]+$/,              // construtora.com.br/imoveis/nome
      /\/ap\d+/i,                         // lopes.com.br/.../AP12345
      /\/rem\d+/i                         // lopes.com.br/.../REM12345
    ]

    if (padroesPaginaImovel.some(p => p.test(urlPath))) {
      console.log(`[isUrlEspecifica] ✓ Página de imóvel (padrão válido): ${url}`)
      return true
    }

    console.log(`[isUrlEspecifica] ✗ URL não contém referência a "${nomeEmpreendimento}": ${url}`)
    return false

  } catch (error) {
    console.error(`[isUrlEspecifica] Erro ao validar URL: ${url}`, error)
    return false
  }
}

/**
 * Busca link ESPECÍFICO do empreendimento em múltiplas etapas
 * Faz a busca EXATAMENTE como um humano faria no Google
 */
async function buscarLinkEmpreendimento(empreendimento: EmpreendimentoDescoberto): Promise<ResultadoBuscaLink> {
  const { nome, construtora, cidade, bairro } = empreendimento

  console.log(`[Link] Buscando página específica: ${nome}${bairro ? ` (${bairro})` : ''}${construtora ? ` - ${construtora}` : ''}`)

  // ========================================
  // ETAPA 1: Busca EXATA como humano faria
  // Pesquisar: "nome do empreendimento" + bairro + cidade
  // ========================================
  const termoBairro = bairro || ''
  const termoConstrutora = construtora && !construtora.includes('Não') ? construtora : ''

  const promptOficial = `Você é um corretor de imóveis experiente fazendo uma pesquisa no Google.

FAÇA ESTAS BUSCAS EXATAS (como você digitaria no Google):
1. "${nome}" ${termoBairro} ${cidade}
2. "${nome}" construtora
3. "${nome}" imobiliária ${cidade}
${termoConstrutora ? `4. "${nome}" ${termoConstrutora}` : ''}
5. site:lopes.com.br "${nome}" ${cidade}
6. site:vivareal.com.br "${nome}" ${cidade}

OBJETIVO: Encontrar a PÁGINA ESPECÍFICA do empreendimento "${nome}".

ACEITO LINKS DE (em ordem de prioridade):
1. Site da CONSTRUTORA - página do empreendimento
   Ex: www.exkalla.com.br/empreendimentos/residencial-douro
   Ex: www.patriani.com.br/imoveis/magno-jardim

2. IMOBILIÁRIA LOCAL - página do empreendimento
   Ex: www.lopes.com.br/lancamento/residencial-douro-campestre/12345
   Ex: www.imobiliarialocal.com.br/imovel/nome-empreendimento

3. PORTAL IMOBILIÁRIO - página específica do produto
   Ex: www.vivareal.com.br/imovel/residencial-douro-id12345
   Ex: www.zapimoveis.com.br/imovel/nome-empreendimento

4. Landing page própria do empreendimento
   Ex: www.residencialdouro.com.br

O QUE EU NÃO QUERO:
- Homepage de qualquer site (construtora, portal, imobiliária)
- Página de busca/listagem genérica
- URLs sem o nome do empreendimento

A URL DEVE ter o NOME DO EMPREENDIMENTO no caminho!

FORMATO JSON:
{
  "url": "https://url-completa-da-pagina-do-empreendimento",
  "tipo": "construtora | imobiliaria | portal | landing_page",
  "construtora": "Nome da Construtora (se descobrir)",
  "confianca": "alta | media | baixa"
}

Se não encontrar: {"url": null, "tipo": "nao_encontrado", "construtora": null, "confianca": "baixa"}

RETORNE APENAS JSON.`

  try {
    const resultado1 = await buscarComGrounding(promptOficial)

    let jsonText = resultado1.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch = jsonText.match(/\{[\s\S]*"url"[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    const data1 = JSON.parse(jsonText)

    // Atualizar construtora se descoberta
    if (data1.construtora && (!empreendimento.construtora || empreendimento.construtora.includes('Não'))) {
      empreendimento.construtora = data1.construtora
    }

    // Verificar se URL é válida e específica
    if (data1.url && isUrlEspecifica(data1.url, nome)) {
      console.log(`[Link] ✓ Encontrado (${data1.tipo}): ${data1.url}`)
      return {
        url: data1.url,
        tipo: data1.tipo || 'site_construtora',
        construtora: data1.construtora,
        confianca: data1.confianca || 'media'
      }
    }

    // ========================================
    // ETAPA 2: Se não encontrou site oficial, tentar busca mais específica
    // ========================================
    console.log(`[Link] Tentando busca mais específica com bairro...`)

    const promptEspecifico = `Pesquise no Google EXATAMENTE assim:

"${nome}" "${termoBairro || cidade}" site construtora

OBJETIVO: Encontrar o site da CONSTRUTORA que está vendendo o empreendimento "${nome}".

Exemplo do que espero encontrar:
- Se for da Exkalla: www.exkalla.com.br/empreendimentos/${nome.toLowerCase().replace(/\s+/g, '-')}
- Se for da Patriani: www.patriani.com.br/imoveis/${nome.toLowerCase().replace(/\s+/g, '-')}
- Se for da Toth: www.tothconstrutora.com.br/empreendimento/${nome.toLowerCase().replace(/\s+/g, '-')}

A URL DEVE:
1. Ser do site de uma CONSTRUTORA (não portal)
2. Ter o NOME DO EMPREENDIMENTO no caminho da URL

FORMATO JSON:
{
  "url": "https://url-da-construtora/empreendimentos/nome-empreendimento",
  "construtora": "Nome da Construtora",
  "confianca": "alta | media | baixa"
}

Se não encontrar: {"url": null, "construtora": null, "confianca": "baixa"}

APENAS JSON.`

    const resultado2 = await buscarComGrounding(promptEspecifico)

    let jsonText2 = resultado2.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch2 = jsonText2.match(/\{[\s\S]*"url"[\s\S]*\}/)
    if (jsonMatch2) {
      jsonText2 = jsonMatch2[0]
    }

    const data2 = JSON.parse(jsonText2)

    // Atualizar construtora se descoberta
    if (data2.construtora && (!empreendimento.construtora || empreendimento.construtora.includes('Não'))) {
      empreendimento.construtora = data2.construtora
    }

    if (data2.url && isUrlEspecifica(data2.url, nome)) {
      console.log(`[Link] ✓ Encontrado (${data2.construtora || 'site oficial'}): ${data2.url}`)
      return {
        url: data2.url,
        tipo: 'site_construtora',
        construtora: data2.construtora,
        confianca: 'alta'
      }
    }

    // ========================================
    // ETAPA 3: Busca ampla em todos os portais e imobiliárias
    // ========================================
    console.log(`[Link] Tentativa final: busca ampla em portais e imobiliárias...`)

    const promptFinal = `Pesquise no Google por: "${nome}" ${termoBairro || cidade} apartamento

ACEITO QUALQUER UM DESSES TIPOS DE LINK:
1. Site de construtora com página do empreendimento
2. Imobiliária local com página do empreendimento
3. Portal imobiliário (Lopes, VivaReal, ZAP, ImovelWeb, etc.)
4. Site de corretores autônomos
5. Qualquer página que tenha informações do empreendimento "${nome}"

A URL DEVE ter referência ao nome "${nome}" no caminho ou conter "${termoBairro || cidade}" junto com tipo de imóvel.

Exemplos válidos:
- lopes.com.br/lancamento/nome-empreendimento/12345
- vivareal.com.br/imovel/nome-empreendimento-cidade
- imobiliarialocal.com.br/imoveis/apartamento-nome
- corretorx.com.br/empreendimento/nome

RETORNE JSON:
{
  "url": "https://url-da-pagina",
  "fonte": "nome do site",
  "construtora": "se descobrir"
}

Se não encontrar: {"url": null, "fonte": null, "construtora": null}

APENAS JSON.`

    const resultado3 = await buscarComGrounding(promptFinal)

    let jsonText3 = resultado3.texto
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    const jsonMatch3 = jsonText3.match(/\{[\s\S]*"url"[\s\S]*\}/)
    if (jsonMatch3) {
      jsonText3 = jsonMatch3[0]
    }

    const data3 = JSON.parse(jsonText3)

    if (data3.construtora && (!empreendimento.construtora || empreendimento.construtora.includes('Não'))) {
      empreendimento.construtora = data3.construtora
    }

    if (data3.url && isUrlEspecifica(data3.url, nome)) {
      console.log(`[Link] ✓ Encontrado (busca ampla): ${data3.url}`)
      return {
        url: data3.url,
        tipo: 'pagina_portal',
        construtora: data3.construtora,
        confianca: 'baixa'
      }
    }

    console.log(`[Link] ✗ Não encontrado link específico para ${nome}`)
    return {
      url: '',
      tipo: 'nao_encontrado',
      construtora: empreendimento.construtora,
      confianca: 'baixa'
    }

  } catch (error) {
    console.error(`[Link] Erro ao buscar para ${nome}:`, error)
    return {
      url: '',
      tipo: 'nao_encontrado',
      confianca: 'baixa'
    }
  }
}

// Wrapper para manter compatibilidade
async function buscarLinkOficial(empreendimento: EmpreendimentoDescoberto): Promise<string | null> {
  const resultado = await buscarLinkEmpreendimento(empreendimento)
  return resultado.url || null
}

// ============================================================================
// ETAPA 3: EXPANSÃO GEOGRÁFICA
// Buscar em cidades vizinhas, em bairros equivalentes
// Funciona para QUALQUER cidade do Brasil
// ============================================================================

async function expandirBuscaGeografica(
  params: ParametrosBusca,
  empreendimentosExistentes: EmpreendimentoDescoberto[]
): Promise<{ empreendimentos: EmpreendimentoDescoberto[]; cidadesAnalisadas: string[]; bairrosAnalisados: Record<string, string[]> }> {
  const { cidade, estado, bairro, padrao, metragemReferencia, precoM2Referencia } = params

  console.log(`\n[Expansão] Buscando cidades vizinhas de ${cidade}, ${estado}...`)

  // Buscar cidades vizinhas DINAMICAMENTE
  const cidadesVizinhas = await getCidadesVizinhasDinamico(cidade, estado)

  if (cidadesVizinhas.length === 0) {
    console.log(`[Expansão] Nenhuma cidade vizinha encontrada`)
    return { empreendimentos: [], cidadesAnalisadas: [], bairrosAnalisados: {} }
  }

  console.log(`[Expansão] Padrão de referência: ${padrao}`)
  console.log(`[Expansão] Cidades vizinhas: ${cidadesVizinhas.join(', ')}`)

  const novosEmpreendimentos: EmpreendimentoDescoberto[] = []
  const cidadesAnalisadas: string[] = []
  const bairrosAnalisados: Record<string, string[]> = {}

  // Buscar em até 2 cidades vizinhas
  for (const cidadeVizinha of cidadesVizinhas.slice(0, 2)) {
    // Buscar bairros equivalentes DINAMICAMENTE
    const bairrosEquivalentes = await getBairrosEquivalentesDinamico(
      cidade,
      bairro || 'Centro',
      cidadeVizinha,
      estado,
      padrao
    )

    cidadesAnalisadas.push(cidadeVizinha)
    bairrosAnalisados[cidadeVizinha] = bairrosEquivalentes

    if (bairrosEquivalentes.length === 0) {
      console.log(`[Expansão] Sem bairros encontrados para ${cidadeVizinha}`)
      continue
    }

    console.log(`[Expansão] ${cidadeVizinha}: bairros ${padrao} = ${bairrosEquivalentes.slice(0, 3).join(', ')}...`)

    // Criar prompt específico para essa cidade
    const prompt = `Você é um corretor de imóveis especialista em ${cidadeVizinha}, ${estado}. Faça uma BUSCA NA INTERNET.

=== BUSCA OBRIGATÓRIA ===
Pesquise no Google:
1. "apartamento lançamento ${cidadeVizinha} ${estado} 2024 2025"
2. "empreendimento ${bairrosEquivalentes.slice(0, 3).join(' ou ')} ${cidadeVizinha}"
${metragemReferencia ? `3. "apartamento ${metragemReferencia}m² ${cidadeVizinha} lançamento"` : ''}

=== BAIRROS PRIORITÁRIOS (padrão ${padrao}) ===
${bairrosEquivalentes.join(', ')}

=== CRITÉRIOS DE SIMILARIDADE ===
Busque empreendimentos SIMILARES a:
- Padrão: ${padrao.toUpperCase()}
${metragemReferencia ? `- Metragem: ~${metragemReferencia}m² (aceitar ±40%)` : ''}
${precoM2Referencia ? `- Preço/m²: ~R$ ${precoM2Referencia.toLocaleString('pt-BR')} (aceitar ±35%)` : ''}

=== REGRAS ===
- IDENTIFIQUE A CONSTRUTORA de cada empreendimento
- Foco nos bairros listados acima (são equivalentes ao bairro de referência)
- Apenas empreendimentos em LANÇAMENTO ou EM CONSTRUÇÃO
- NÃO INVENTE dados

=== FORMATO JSON ===
{
  "empreendimentos": [
    {
      "nome": "Nome do Empreendimento",
      "construtora": "Construtora",
      "cidade": "${cidadeVizinha}",
      "bairro": "Bairro",
      "metragemMin": 50,
      "metragemMax": 80,
      "precoMin": 350000,
      "precoMax": 500000,
      "precoM2": 7000,
      "entrega": "2026",
      "status": "Em obras"
    }
  ]
}

RETORNE APENAS JSON.`

    try {
      const resultado = await buscarComGrounding(prompt)

      let jsonText = resultado.texto
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      const jsonMatch = jsonText.match(/\{[\s\S]*"empreendimentos"[\s\S]*\}/)
      if (jsonMatch) {
        jsonText = jsonMatch[0]
      }

      const data = JSON.parse(jsonText)
      const empreendimentos: EmpreendimentoDescoberto[] = (data.empreendimentos || []).map((e: {
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
      }) => ({
        nome: e.nome,
        construtora: e.construtora,
        cidade: e.cidade || cidadeVizinha,
        bairro: e.bairro,
        metragemMin: e.metragemMin,
        metragemMax: e.metragemMax,
        precoMin: e.precoMin,
        precoMax: e.precoMax,
        precoM2: e.precoM2,
        entrega: e.entrega,
        status: e.status,
        fonte: `Expansão: ${cidadeVizinha}`
      }))

      // Filtrar duplicatas (mesmo nome já encontrado)
      const nomesExistentes = new Set(empreendimentosExistentes.map(e =>
        e.nome.toLowerCase().replace(/\s+/g, '')
      ))

      const novos = empreendimentos.filter(e =>
        !nomesExistentes.has(e.nome.toLowerCase().replace(/\s+/g, ''))
      )

      novosEmpreendimentos.push(...novos)
      console.log(`[Expansão] ${cidadeVizinha}: ${novos.length} novos empreendimentos`)

    } catch (error) {
      console.error(`[Expansão] Erro em ${cidadeVizinha}:`, error)
    }

    // Pequeno delay entre cidades
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return {
    empreendimentos: novosEmpreendimentos,
    cidadesAnalisadas,
    bairrosAnalisados
  }
}

// ============================================================================
// ETAPA 4: FILTRAR POR SIMILARIDADE
// Manter apenas empreendimentos com perfil similar ao de referência
// ============================================================================

function filtrarPorSimilaridade(
  empreendimentos: EmpreendimentoDescoberto[],
  params: ParametrosBusca
): EmpreendimentoDescoberto[] {
  const { metragemReferencia, precoM2Referencia, padrao } = params

  console.log(`\n[Filtro] Aplicando filtros de similaridade...`)
  console.log(`[Filtro] Referência: ${metragemReferencia ? `${metragemReferencia}m²` : '-'}, ${precoM2Referencia ? `R$ ${precoM2Referencia}/m²` : '-'}, padrão ${padrao}`)

  const filtrados = empreendimentos.filter(e => {
    // Filtro de metragem (±40%)
    if (metragemReferencia && e.metragemMin) {
      const minAceitavel = metragemReferencia * 0.6
      const maxAceitavel = metragemReferencia * 1.4
      if (e.metragemMin < minAceitavel || e.metragemMin > maxAceitavel) {
        return false
      }
    }

    // Filtro de preço/m² (±35%)
    if (precoM2Referencia && e.precoM2) {
      const minAceitavel = precoM2Referencia * 0.65
      const maxAceitavel = precoM2Referencia * 1.35
      if (e.precoM2 < minAceitavel || e.precoM2 > maxAceitavel) {
        return false
      }
    }

    return true
  })

  console.log(`[Filtro] ${empreendimentos.length} → ${filtrados.length} empreendimentos após filtro`)

  // Se filtrou demais, retornar todos
  if (filtrados.length < 3 && empreendimentos.length >= 3) {
    console.log(`[Filtro] Poucos resultados, mantendo todos`)
    return empreendimentos
  }

  return filtrados
}

// ============================================================================
// FUNÇÃO PRINCIPAL: BUSCA COMPLETA DE CONCORRENTES
// Orquestra todas as etapas do workflow
// ============================================================================

export async function buscarConcorrentesCompleto(
  params: ParametrosBusca
): Promise<ResultadoBuscaCompleta> {
  const { cidade, estado, bairro, padrao } = params

  console.log(`\n${'='.repeat(60)}`)
  console.log(`BUSCA COMPLETA DE CONCORRENTES`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Cidade: ${cidade}${bairro ? `, Bairro: ${bairro}` : ''}`)
  console.log(`Padrão: ${padrao.toUpperCase()}`)
  console.log(`Metragem ref: ${params.metragemReferencia ? `${params.metragemReferencia}m²` : 'não informada'}`)
  console.log(`Preço/m² ref: ${params.precoM2Referencia ? `R$ ${params.precoM2Referencia.toLocaleString('pt-BR')}` : 'não informado'}`)
  console.log(`${'='.repeat(60)}\n`)

  const cidadesAnalisadas: string[] = [cidade]
  const bairrosAnalisados: Record<string, string[]> = {}
  const fontes: string[] = []

  // ========================================
  // ETAPA 1: Descoberta de empreendimentos
  // ========================================
  console.log(`\n>>> ETAPA 1: Descoberta de Empreendimentos`)
  let todosEmpreendimentos = await descobrirEmpreendimentos(params)

  // ========================================
  // ETAPA 2: Buscar links (sequencial para evitar rate limit)
  // ========================================
  console.log(`\n>>> ETAPA 2: Busca de Links`)

  // Buscar link para cada empreendimento (SEQUENCIAL para evitar rate limit do Gemini)
  // Gemini tem limite de 10 req/min, então fazemos com delay
  const empreendimentosParaBuscar = todosEmpreendimentos.slice(0, 5) // Limitar a 5

  for (const emp of empreendimentosParaBuscar) {
    const linkOficial = await buscarLinkOficial(emp)
    if (linkOficial) {
      emp.linkOficial = linkOficial
    }
    // Delay entre buscas para evitar rate limit (2s entre cada)
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  // ========================================
  // ETAPA 3: Expansão Geográfica (DINÂMICA)
  // ========================================
  console.log(`\n>>> ETAPA 3: Expansão Geográfica`)
  console.log(`[Expansão] Buscando em cidades vizinhas com bairros equivalentes...`)

  // Expandir para cidades vizinhas para ter comparação completa
  {
    const resultadoExpansao = await expandirBuscaGeografica(params, todosEmpreendimentos)

    if (resultadoExpansao.empreendimentos.length > 0) {
      // Buscar links dos novos também (SEQUENCIAL para evitar rate limit)
      const novosParaBuscar = resultadoExpansao.empreendimentos.slice(0, 3) // Limitar a 3

      for (const emp of novosParaBuscar) {
        const linkOficial = await buscarLinkOficial(emp)
        if (linkOficial) {
          emp.linkOficial = linkOficial
        }
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      todosEmpreendimentos.push(...resultadoExpansao.empreendimentos)
    }

    // Adicionar cidades e bairros analisados (do resultado da expansão dinâmica)
    cidadesAnalisadas.push(...resultadoExpansao.cidadesAnalisadas)
    Object.assign(bairrosAnalisados, resultadoExpansao.bairrosAnalisados)
  }

  // Registrar bairro da cidade principal
  bairrosAnalisados[cidade] = bairro ? [bairro] : ['Centro']

  // ========================================
  // ETAPA 4: Filtrar por similaridade
  // ========================================
  console.log(`\n>>> ETAPA 4: Filtro de Similaridade`)
  todosEmpreendimentos = filtrarPorSimilaridade(todosEmpreendimentos, params)

  // ========================================
  // ETAPA 5: Converter para formato final
  // Validar que todos os links são específicos do empreendimento
  // ========================================
  const concorrentes: Concorrente[] = todosEmpreendimentos.map(e => {
    // Determinar melhor link disponível
    let linkFinal = e.linkOficial || e.linkPortal

    // VALIDAÇÃO: Se o link não é específico do empreendimento, descartar
    if (linkFinal && !isUrlEspecifica(linkFinal, e.nome)) {
      console.log(`[Validação] Link descartado para ${e.nome}: ${linkFinal} (não contém referência ao nome)`)
      linkFinal = undefined
    }

    // Classificar tipo do link
    const classificacao = classificarLink(linkFinal)

    // Extrair construtora do link se não tiver
    let construtora = e.construtora
    if (!construtora || construtora === 'Não identificada' || construtora.includes('Não especificada') || construtora === 'Verificar') {
      if (linkFinal && classificacao.tipo === 'construtora') {
        // Só extrair construtora do domínio se for site de construtora (não portal/imobiliária)
        const dominioMatch = linkFinal.match(/(?:www\.)?([^.]+)(?:construtora|incorporadora)?\.com\.br/i)
        if (dominioMatch) {
          const nomeExtraido = dominioMatch[1]
            .replace(/construtora|incorporadora|engenharia|imoveis|imobiliaria/gi, '')
            .trim()
          if (nomeExtraido.length > 2) {
            construtora = nomeExtraido.charAt(0).toUpperCase() + nomeExtraido.slice(1)
          }
        }
      }
      // Se é portal ou imobiliária, manter como não identificada para buscar depois
      if (!construtora || construtora.length < 3) {
        construtora = 'A verificar'
      }
    }

    // Determinar fonte baseada no tipo de link
    const fontePorTipo: Record<string, string> = {
      'construtora': 'Site Construtora',
      'imobiliaria': 'Imobiliária',
      'portal': 'Portal Imobiliário',
      'landing_page': 'Site Oficial',
      'invalido': 'Não verificado'
    }

    return {
      nome: e.nome,
      construtora: construtora || 'Não identificada',
      cidade: e.cidade,
      metragemMin: e.metragemMin,
      metragemMax: e.metragemMax,
      precoMin: e.precoMin,
      precoMax: e.precoMax,
      precoM2: e.precoM2 || (e.precoMin && e.metragemMin ? Math.round(e.precoMin / e.metragemMin) : undefined),
      entrega: { ano: parseInt(String(e.entrega || '2025').replace(/\D/g, '').slice(0, 4)) || 2025 },
      status: e.status || 'Em análise',
      link: linkFinal,
      fonte: fontePorTipo[classificacao.tipo] || (e.fonte || 'Portal'),
      tipoLink: classificacao.tipo,
      prioridadeLink: classificacao.prioridade
    }
  })

  // Ordenar por: prioridade do link > cidade > completude de dados
  concorrentes.sort((a, b) => {
    // 1. Priorizar por tipo de link (construtora > imobiliária > portal)
    const aPrioridade = (a as { prioridadeLink?: number }).prioridadeLink || 0
    const bPrioridade = (b as { prioridadeLink?: number }).prioridadeLink || 0
    if (aPrioridade !== bPrioridade) return bPrioridade - aPrioridade

    // 2. Depois por cidade (mesma cidade primeiro)
    const aCidade = normalizarCidade(a.cidade) === normalizarCidade(cidade) ? 1 : 0
    const bCidade = normalizarCidade(b.cidade) === normalizarCidade(cidade) ? 1 : 0
    if (aCidade !== bCidade) return bCidade - aCidade

    // 3. Depois por completude de dados
    const aScore = (a.precoM2 ? 3 : 0) + (a.metragemMin ? 2 : 0) + (a.construtora !== 'Não identificada' ? 2 : 0) + (a.link ? 1 : 0)
    const bScore = (b.precoM2 ? 3 : 0) + (b.metragemMin ? 2 : 0) + (b.construtora !== 'Não identificada' ? 2 : 0) + (b.link ? 1 : 0)
    return bScore - aScore
  })

  // Filtrar concorrentes: APENAS manter se tiver link ESPECÍFICO verificado
  // Requisito do usuário: "dados 200% corretos, não posso correr risco de entregar dados vazios"
  const concorrentesFiltrados = concorrentes.filter(c => {
    // DEVE ter link para ser incluído
    if (!c.link) {
      console.log(`[Filtro Final] Excluído ${c.nome}: sem link`)
      return false
    }

    // O link já foi validado por isUrlEspecifica na etapa anterior
    return true
  })

  // Usar lista filtrada
  const concorrentesFinais = concorrentesFiltrados

  // Coletar fontes
  concorrentesFinais.forEach(c => {
    if (c.fonte && !fontes.includes(c.fonte)) {
      fontes.push(c.fonte)
    }
  })

  // ========================================
  // RESULTADO FINAL
  // ========================================
  console.log(`\n${'='.repeat(60)}`)
  console.log(`RESULTADO FINAL`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Total de concorrentes: ${concorrentesFinais.length}`)
  console.log(`Cidades analisadas: ${cidadesAnalisadas.join(', ')}`)
  console.log(`\nEmpreendimentos:`)
  concorrentesFinais.forEach((c, i) => {
    const tipoLink = (c as { tipoLink?: string }).tipoLink || 'desconhecido'
    const icone = tipoLink === 'construtora' ? '🏗️' :
                  tipoLink === 'imobiliaria' ? '🏠' :
                  tipoLink === 'portal' ? '🌐' :
                  tipoLink === 'landing_page' ? '📄' : '○'
    console.log(`${i + 1}. ${c.nome} | ${c.construtora} | ${c.cidade} | ${icone} ${c.fonte}`)
    if (c.link) console.log(`   ${c.link}`)
  })
  console.log(`${'='.repeat(60)}\n`)

  return {
    concorrentes: concorrentesFinais,
    cidadesAnalisadas: [...new Set(cidadesAnalisadas)],
    bairrosAnalisados,
    fontes,
    metodo: 'Busca Completa (Descoberta + Links Oficiais + Expansão Geográfica)'
  }
}
