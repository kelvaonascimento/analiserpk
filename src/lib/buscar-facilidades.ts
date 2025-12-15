// Busca facilidades e serviços próximos ao empreendimento
// Usa Gemini para pesquisar POIs baseado no endereço

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

// Interface para facilidades próximas
export interface FacilidadeProxima {
  tipo: 'shopping' | 'supermercado' | 'hospital' | 'escola' | 'metro' | 'trem' | 'parque' | 'farmacia' | 'banco' | 'restaurante' | 'academia' | 'universidade'
  nome: string
  distancia?: string // Ex: "500m", "2km", "5 min de carro"
  endereco?: string
  destaque?: boolean // Se é um POI importante para destacar
}

export interface FacilidadesRegiao {
  transporte: FacilidadeProxima[]
  saude: FacilidadeProxima[]
  educacao: FacilidadeProxima[]
  comercio: FacilidadeProxima[]
  lazer: FacilidadeProxima[]
  servicos: FacilidadeProxima[]
  resumo: string // Resumo narrativo da localização
  scoreMobilidade: number // 0-100
  scoreServicos: number // 0-100
  scoreConveniencia: number // 0-100
}

// Buscar facilidades próximas usando Gemini
export async function buscarFacilidadesProximas(
  endereco: {
    rua?: string
    numero?: string
    bairro?: string
    cidade: string
    estado: string
    cep?: string
  }
): Promise<FacilidadesRegiao> {
  console.log(`\n========== BUSCANDO FACILIDADES PRÓXIMAS ==========`)
  console.log(`Endereço: ${endereco.rua || ''} ${endereco.numero || ''}, ${endereco.bairro || ''}, ${endereco.cidade}, ${endereco.estado}`)
  console.log(`CEP: ${endereco.cep || 'não informado'}`)
  console.log(`====================================================\n`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.2,
        topP: 0.9,
        maxOutputTokens: 8192,
      }
    })

    const enderecoCompleto = [
      endereco.rua,
      endereco.numero,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      endereco.cep
    ].filter(Boolean).join(', ')

    const prompt = `Você é um especialista em mercado imobiliário que conhece profundamente a infraestrutura urbana brasileira.

TAREFA: Pesquise e liste TODAS as facilidades, serviços e conveniências próximas ao endereço informado.

ENDEREÇO DO EMPREENDIMENTO:
${enderecoCompleto}

IMPORTANTE: Pesquise informações REAIS sobre a região. Se não conhecer a região com certeza, indique "distância estimada".

PESQUISE AS SEGUINTES CATEGORIAS:

1. TRANSPORTE:
   - Estações de metrô mais próximas (nome, linha, distância)
   - Estações de trem/CPTM (nome, linha, distância)
   - Terminais de ônibus
   - Acesso a rodovias principais
   - Ciclovias

2. SAÚDE:
   - Hospitais (públicos e privados)
   - UBS/Postos de saúde
   - Clínicas especializadas
   - Farmácias 24h

3. EDUCAÇÃO:
   - Escolas públicas e privadas
   - Creches
   - Universidades/Faculdades
   - Cursos técnicos (SENAI, ETEC)

4. COMÉRCIO:
   - Shoppings centers (nome, distância)
   - Supermercados (redes conhecidas)
   - Hipermercados
   - Centros comerciais
   - Feiras livres

5. LAZER:
   - Parques públicos
   - Praças
   - Clubes
   - Cinemas
   - Teatros

6. SERVIÇOS:
   - Bancos (agências)
   - Correios
   - Cartórios
   - Delegacias
   - Corpo de bombeiros

RETORNE APENAS um JSON válido (sem markdown):
{
  "transporte": [
    {"tipo": "metro", "nome": "Estação X", "distancia": "2km", "destaque": true},
    {"tipo": "trem", "nome": "Estação Y", "distancia": "1.5km", "destaque": false}
  ],
  "saude": [
    {"tipo": "hospital", "nome": "Hospital ABC", "distancia": "3km", "destaque": true}
  ],
  "educacao": [
    {"tipo": "escola", "nome": "Colégio X", "distancia": "500m", "destaque": false},
    {"tipo": "universidade", "nome": "USCS", "distancia": "5km", "destaque": true}
  ],
  "comercio": [
    {"tipo": "shopping", "nome": "Shopping ABC", "distancia": "4km", "destaque": true},
    {"tipo": "supermercado", "nome": "Carrefour", "distancia": "1km", "destaque": false}
  ],
  "lazer": [
    {"tipo": "parque", "nome": "Parque X", "distancia": "2km", "destaque": false}
  ],
  "servicos": [
    {"tipo": "banco", "nome": "Bradesco/Itaú/BB", "distancia": "500m", "destaque": false}
  ],
  "resumo": "Localização privilegiada a X minutos do metrô, com fácil acesso ao Shopping Y e Hospital Z. Região bem servida de comércio e serviços.",
  "scoreMobilidade": 75,
  "scoreServicos": 80,
  "scoreConveniencia": 85
}

REGRAS:
- Liste APENAS facilidades REAIS que existem na região
- Se não souber com certeza, use "distância estimada" ou omita
- Priorize facilidades mais relevantes para compradores de imóveis
- Scores devem ser de 0 a 100 baseados na quantidade e proximidade das facilidades
- Destaque (destaque: true) para as 2-3 facilidades mais importantes de cada categoria`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Limpar JSON
    let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    try {
      const data = JSON.parse(jsonText)

      console.log(`[Facilidades] Transporte: ${data.transporte?.length || 0} itens`)
      console.log(`[Facilidades] Saúde: ${data.saude?.length || 0} itens`)
      console.log(`[Facilidades] Educação: ${data.educacao?.length || 0} itens`)
      console.log(`[Facilidades] Comércio: ${data.comercio?.length || 0} itens`)
      console.log(`[Facilidades] Lazer: ${data.lazer?.length || 0} itens`)
      console.log(`[Facilidades] Serviços: ${data.servicos?.length || 0} itens`)
      console.log(`[Facilidades] Score Mobilidade: ${data.scoreMobilidade}`)
      console.log(`[Facilidades] Score Serviços: ${data.scoreServicos}`)
      console.log(`[Facilidades] Score Conveniência: ${data.scoreConveniencia}`)

      return {
        transporte: data.transporte || [],
        saude: data.saude || [],
        educacao: data.educacao || [],
        comercio: data.comercio || [],
        lazer: data.lazer || [],
        servicos: data.servicos || [],
        resumo: data.resumo || `Região de ${endereco.cidade} com infraestrutura urbana.`,
        scoreMobilidade: data.scoreMobilidade || 50,
        scoreServicos: data.scoreServicos || 50,
        scoreConveniencia: data.scoreConveniencia || 50,
      }
    } catch (parseError) {
      console.error('[Facilidades] Erro ao parsear JSON:', parseError)
      return gerarFacilidadesDefault(endereco.cidade)
    }
  } catch (error) {
    console.error('[Facilidades] Erro ao buscar:', error)
    return gerarFacilidadesDefault(endereco.cidade)
  }
}

// Facilidades padrão quando não consegue buscar
function gerarFacilidadesDefault(cidade: string): FacilidadesRegiao {
  return {
    transporte: [
      { tipo: 'trem', nome: 'Estação de trem da região', distancia: 'Na região', destaque: true },
    ],
    saude: [
      { tipo: 'hospital', nome: 'Hospital regional', distancia: 'Na região', destaque: true },
    ],
    educacao: [
      { tipo: 'escola', nome: 'Escolas públicas e privadas', distancia: 'Na região', destaque: false },
    ],
    comercio: [
      { tipo: 'supermercado', nome: 'Supermercados da região', distancia: 'Na região', destaque: false },
    ],
    lazer: [
      { tipo: 'parque', nome: 'Áreas verdes da região', distancia: 'Na região', destaque: false },
    ],
    servicos: [
      { tipo: 'banco', nome: 'Agências bancárias', distancia: 'Na região', destaque: false },
    ],
    resumo: `Região de ${cidade} com infraestrutura urbana em desenvolvimento.`,
    scoreMobilidade: 50,
    scoreServicos: 50,
    scoreConveniencia: 50,
  }
}

// Gerar narrativas de localização baseadas nas facilidades
export function gerarNarrativasLocalizacao(facilidades: FacilidadesRegiao): string[] {
  const narrativas: string[] = []

  // Transporte
  const metroProximo = facilidades.transporte.find(t => t.tipo === 'metro' && t.destaque)
  const tremProximo = facilidades.transporte.find(t => t.tipo === 'trem' && t.destaque)

  if (metroProximo) {
    narrativas.push(`A ${metroProximo.distancia} da ${metroProximo.nome}`)
  }
  if (tremProximo) {
    narrativas.push(`Próximo à ${tremProximo.nome} (${tremProximo.distancia})`)
  }

  // Comércio
  const shoppingProximo = facilidades.comercio.find(c => c.tipo === 'shopping' && c.destaque)
  if (shoppingProximo) {
    narrativas.push(`${shoppingProximo.distancia} do ${shoppingProximo.nome}`)
  }

  // Saúde
  const hospitalProximo = facilidades.saude.find(s => s.tipo === 'hospital' && s.destaque)
  if (hospitalProximo) {
    narrativas.push(`${hospitalProximo.nome} a ${hospitalProximo.distancia}`)
  }

  // Educação
  const universidadeProxima = facilidades.educacao.find(e => e.tipo === 'universidade' && e.destaque)
  if (universidadeProxima) {
    narrativas.push(`Próximo à ${universidadeProxima.nome}`)
  }

  // Score geral
  const scoreGeral = Math.round((facilidades.scoreMobilidade + facilidades.scoreServicos + facilidades.scoreConveniencia) / 3)
  if (scoreGeral >= 80) {
    narrativas.push('Região com excelente infraestrutura urbana')
  } else if (scoreGeral >= 60) {
    narrativas.push('Região bem servida de comércios e serviços')
  }

  return narrativas
}

// Comparar facilidades do empreendimento vs concorrentes (para SWOT)
export function compararFacilidadesVsConcorrentes(
  facilidadesEmpreendimento: FacilidadesRegiao,
  cidadesConcorrentes: string[]
): { vantagens: string[]; desvantagens: string[] } {
  const vantagens: string[] = []
  const desvantagens: string[] = []

  // Se tem metrô/trem próximo, é vantagem
  const temTransportePublico = facilidadesEmpreendimento.transporte.some(t =>
    (t.tipo === 'metro' || t.tipo === 'trem') && t.destaque
  )
  if (temTransportePublico) {
    vantagens.push('Acesso facilitado a transporte público (metrô/trem)')
  }

  // Se tem shopping próximo, é vantagem
  const temShoppingProximo = facilidadesEmpreendimento.comercio.some(c =>
    c.tipo === 'shopping' && c.destaque
  )
  if (temShoppingProximo) {
    vantagens.push('Proximidade com shopping center')
  }

  // Score de mobilidade alto
  if (facilidadesEmpreendimento.scoreMobilidade >= 70) {
    vantagens.push('Excelente mobilidade urbana na região')
  } else if (facilidadesEmpreendimento.scoreMobilidade < 50) {
    desvantagens.push('Mobilidade urbana limitada - dependência de carro')
  }

  // Score de serviços
  if (facilidadesEmpreendimento.scoreServicos >= 70) {
    vantagens.push('Região bem estruturada com serviços essenciais')
  } else if (facilidadesEmpreendimento.scoreServicos < 50) {
    desvantagens.push('Infraestrutura de serviços ainda em desenvolvimento')
  }

  // Hospitais
  const temHospitalProximo = facilidadesEmpreendimento.saude.some(s =>
    s.tipo === 'hospital' && s.destaque
  )
  if (temHospitalProximo) {
    vantagens.push('Hospital de referência nas proximidades')
  }

  return { vantagens, desvantagens }
}
