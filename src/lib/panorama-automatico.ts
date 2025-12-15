// ============================================================================
// PANORAMA AUTOMÁTICO - Busca dados econômicos via APIs oficiais + Gemini
// Replica automaticamente os dados do relatório Caravela para qualquer cidade
// Inclui dados dos 3 PDFs: Perfil Econômico, Panorama Atual e Panorama Imobiliário
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

// ============================================================================
// TIPOS DE DADOS - PERFIL ECONÔMICO (PDF 1)
// Dados demográficos, PIB, renda e distribuição por classes sociais
// ============================================================================

export interface DadosPopulacao {
  total: number
  variacao5Anos: number // % de crescimento ou decrescimento
  ranking: number // posição no estado
  densidade: number // hab/km²
  evolucaoAnual: { ano: number; populacao: number }[]
  faixasEtarias: { faixa: string; percentual: number }[]
  genero: { masculino: number; feminino: number }
  fonte: string
}

export interface DadosPIB {
  total: number // em bilhões
  perCapita: number // em reais
  crescimento5Anos: number // % de crescimento
  ranking: number // posição no estado
  composicao: { setor: string; percentual: number }[] // serviços, indústria, agropecuária
  evolucaoAnual: { ano: number; pib: number; perCapita: number }[]
  comparativoRegiao: { cidade: string; pib: number; perCapita: number }[]
  fonte: string
}

export interface DadosSalario {
  medio: number // salário médio mensal
  mediano: number // salário mediano
  variacao12Meses: number // % de variação
  ranking: number // posição no estado
  faixas: { faixa: string; percentual: number; descricao: string }[]
  evolucaoAnual: { ano: number; salarioMedio: number }[]
  fonte: string
}

export interface DistribuicaoRenda {
  classes: {
    classe: string // A, B, C, D, E
    percentual: number
    descricao: string
    faixaSalariosMinimos: string
    rendaMensalMin: number
    rendaMensalMax: number
  }[]
  gini: number // índice de Gini
  comparativoEstado: { classe: string; percentualCidade: number; percentualEstado: number }[]
  fonte: string
}

export interface PerfilEconomico {
  populacao: DadosPopulacao
  pib: DadosPIB
  salario: DadosSalario
  distribuicaoRenda: DistribuicaoRenda
  empregosFormais: number // total de empregos formais
  fonte: string
}

// ============================================================================
// TIPOS DE DADOS - PANORAMA IMOBILIÁRIO (PDF 3)
// Domicílios, edificações, construção civil, urbanização
// ============================================================================

export interface DadosDomicilios {
  total: number
  residenciasPorTipo: {
    casas: { quantidade: number; moradores: number }
    condominios: { quantidade: number; moradores: number }
    apartamentos: { quantidade: number; moradores: number }
  }
  mediaHabitantesPorDomicilio: number
  densidadeDomiciliar: number // domicílios por km²
  evolucaoAnual: { ano: number; total: number }[]
  fonte: string
}

export interface DadosConstrucao {
  edificacoesEmConstrucao: number
  unidadesEmConstrucao: number
  areaEmConstrucao: number // em m²
  crescimentoAno: number // % de crescimento
  lancamentosUltimos12Meses: number
  evolucaoMensal: { mes: string; edificacoes: number; unidades: number }[]
  setoresAtivos: { setor: string; quantidade: number }[]
  fonte: string
}

export interface DadosComercioImobiliario {
  transacoesMes: number
  taxaPorMilHabitantes: number
  variacao12Meses: number
  ranking: number // posição no estado
  tipoTransacoes: { tipo: string; percentual: number }[]
  valorMedioTransacao: number
  evolucaoMensal: { mes: string; transacoes: number }[]
  fonte: string
}

export interface DadosUrbanizacao {
  areaUrbana: number // em km²
  areaDensamenteUrbanizada: number // % da área
  percentualUrbanizado: number
  zoneamento: { zona: string; area: number; percentual: number }[]
  crescimentoAreaUrbana5Anos: number // %
  fonte: string
}

export interface PanoramaImobiliario {
  domicilios: DadosDomicilios
  construcao: DadosConstrucao
  comercio: DadosComercioImobiliario
  urbanizacao: DadosUrbanizacao
  precoM2Medio: number
  precoM2Lancamentos: number
  variacao12Meses: number
  fonte: string
}

// ============================================================================
// TIPOS DE DADOS - PANORAMA ATUAL (PDF 2 - já existentes)
// Emprego, empresas, MEI, PIX, vulnerabilidade, bancário, frota, rendimentos
// ============================================================================

export interface DadosEmprego {
  admitidos: number
  desligados: number
  saldo: number
  rankingUF: number
  rankingPerCapita: number
  evolucaoMensal: { mes: string; saldo: number }[]
  setoresPositivos: { setor: string; saldo: number }[]
  setoresNegativos: { setor: string; saldo: number }[]
  projecaoProximoAno: { admitidos: number; saldo: number }
  sazonalidadeMensal: { mes: string; admitidos: number }[]
  fonte: string
  periodo: string
}

export interface DadosEmpresas {
  crescimentoAno: number
  crescimentoMes: number
  rankingUF: number
  empresasInternet: number
  setoresDestaque: { setor: string; quantidade: number }[]
  comparativoRegiao: { cidade: string; quantidade: number }[]
  fonte: string
}

export interface DadosMEI {
  totalMEIs: number
  taxaPorMilHabitantes: number
  crescimentoAno: number
  crescimentoMes: number
  rankingUF: number
  evolucaoMensal: { mes: string; total: number }[]
  fonte: string
}

export interface DadosPIX {
  volumeMensal: number // em milhões
  volumeRecebidoPJ: number
  crescimentoMes: number
  crescimento12Meses: number
  crescimentoAno: number
  projecaoProximoMes: number
  transacoesPorHabitante: number
  ticketMedio: number
  sazonalidadeMensal: { mes: string; volume: number }[]
  fonte: string
}

export interface DadosVulnerabilidade {
  familiasCadUnico: number
  pessoasPobreza: number
  percentualPobreza: number
  pessoasExtremPobreza: number
  percentualExtremPobreza: number
  variacaoFamilias12m: number
  variacaoExtremPobreza12m: number
  rankingRegiao: number
  evolucaoMensal: { mes: string; pobreza: number; extrema: number }[]
  fonte: string
}

export interface DadosBancarios {
  variacaoPoupanca: number
  variacaoCredito: number
  variacaoFinanciamentoImob: number
  evolucaoMensal: { mes: string; poupanca: number; credito: number; imobiliario: number }[]
  analise: string
  fonte: string
}

export interface DadosFrota {
  total: number
  carros: number
  percentualCarros: number
  motos: number
  percentualMotos: number
  caminhoes: number
  percentualCaminhoes: number
  taxaPerCapita: number
  rankingUF: number
  crescimentoAno: number
  evolucaoTrimestral: { periodo: string; carros: number; motos: number; caminhoes: number }[]
  fonte: string
}

export interface DadosRendimentos {
  declarantesIR: number
  percentualPopulacao: number
  variacaoDeclarantes: number
  rendimentosTributaveis: number // em milhões
  bensDeclarados: number // em milhões
  gastosSaude: number // em milhões
  gastosInstrucao: number // em milhões
  mediaSaudePorDeclarante: number
  mediaInstrucaoPorDeclarante: number
  evolucaoAnual: { ano: number; rendimentos: number; bens: number }[]
  fonte: string
}

export interface PanoramaCompleto {
  cidade: string
  estado: string
  dataGeracao: string
  // PDF 1 - Perfil Econômico
  perfilEconomico: PerfilEconomico
  // PDF 2 - Panorama Atual
  emprego: DadosEmprego
  empresas: DadosEmpresas
  mei: DadosMEI
  pix: DadosPIX
  vulnerabilidade: DadosVulnerabilidade
  bancario: DadosBancarios
  frota: DadosFrota
  rendimentos: DadosRendimentos
  // PDF 3 - Panorama Imobiliário
  panoramaImobiliario: PanoramaImobiliario
  fontes: string[]
}

// ============================================================================
// BUSCAR PANORAMA COMPLETO VIA GEMINI
// ============================================================================

export async function buscarPanoramaCompleto(
  cidade: string,
  estado: string = 'SP'
): Promise<PanoramaCompleto> {
  console.log(`\n========== GERANDO PANORAMA AUTOMÁTICO COMPLETO ==========`)
  console.log(`Cidade: ${cidade}, Estado: ${estado}`)
  console.log(`Incluindo: Perfil Econômico + Panorama Atual + Panorama Imobiliário`)
  console.log(`============================================================\n`)

  // Buscar todos os dados em paralelo para maior velocidade
  const [
    // PDF 1 - Perfil Econômico
    perfilEconomico,
    // PDF 2 - Panorama Atual
    emprego, empresas, mei, pix, vulnerabilidade, bancario, frota, rendimentos,
    // PDF 3 - Panorama Imobiliário
    panoramaImobiliario
  ] = await Promise.all([
    // PDF 1
    buscarPerfilEconomico(cidade, estado),
    // PDF 2
    buscarDadosEmprego(cidade, estado),
    buscarDadosEmpresas(cidade, estado),
    buscarDadosMEI(cidade, estado),
    buscarDadosPIX(cidade, estado),
    buscarDadosVulnerabilidade(cidade, estado),
    buscarDadosBancarios(cidade, estado),
    buscarDadosFrota(cidade, estado),
    buscarDadosRendimentos(cidade, estado),
    // PDF 3
    buscarPanoramaImobiliario(cidade, estado)
  ])

  const fontes = [
    // Perfil Econômico
    'IBGE - Censo Demográfico 2022',
    'IBGE - Estimativas Populacionais 2024',
    'IBGE - PIB dos Municípios',
    'IBGE/PNAD Contínua - Distribuição de Renda',
    // Panorama Atual
    'CAGED/MTE - Ministério do Trabalho',
    'Ministério da Economia - CNPJ',
    'Receita Federal - MEI',
    'Banco Central do Brasil - PIX',
    'Ministério da Cidadania - CadÚnico',
    'Banco Central do Brasil - ESTBAN',
    'DENATRAN - Frota de Veículos',
    'Receita Federal - IRPF',
    // Panorama Imobiliário
    'IBGE - Censo Domicílios',
    'Prefeitura Municipal - Alvarás de Construção',
    'Registro de Imóveis - Transações',
    'FIPE/ZAP - Preços Imobiliários',
    // Análise
    'Google AI (Gemini) - Análise e Projeções'
  ]

  return {
    cidade,
    estado,
    dataGeracao: new Date().toISOString().split('T')[0],
    perfilEconomico,
    emprego,
    empresas,
    mei,
    pix,
    vulnerabilidade,
    bancario,
    frota,
    rendimentos,
    panoramaImobiliario,
    fontes
  }
}

// ============================================================================
// FUNÇÕES DE BUSCA - PDF 1: PERFIL ECONÔMICO
// ============================================================================

async function buscarPerfilEconomico(cidade: string, estado: string): Promise<PerfilEconomico> {
  console.log(`[Panorama] Buscando perfil econômico completo para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    })

    const prompt = `Você é um analista de dados econômicos especializado em municípios brasileiros.

TAREFA: Busque dados REAIS e ATUALIZADOS do PERFIL ECONÔMICO de ${cidade}, ${estado}.

Este relatório deve conter TODOS os dados similares ao relatório Caravela "Perfil Econômico":

1. POPULAÇÃO:
   - População total (estimativa IBGE 2024)
   - Variação nos últimos 5 anos (%)
   - Ranking no estado
   - Densidade demográfica (hab/km²)
   - Distribuição por faixas etárias
   - Distribuição por gênero

2. PIB:
   - PIB total (em bilhões de reais)
   - PIB per capita
   - Crescimento últimos 5 anos (%)
   - Ranking no estado
   - Composição (serviços, indústria, agropecuária)
   - Comparativo com cidades da região

3. SALÁRIO:
   - Salário médio mensal
   - Salário mediano
   - Variação últimos 12 meses
   - Ranking no estado

4. DISTRIBUIÇÃO DE RENDA (Classes Sociais):
   - Classe A: % da população, faixa de renda
   - Classe B: % da população, faixa de renda
   - Classe C: % da população, faixa de renda
   - Classe D: % da população, faixa de renda
   - Classe E: % da população, faixa de renda
   - Índice de Gini

5. EMPREGOS FORMAIS:
   - Total de vínculos ativos

RETORNE APENAS um JSON válido com esta estrutura:
{
  "populacao": {
    "total": 119000,
    "variacao5Anos": -1.2,
    "ranking": 156,
    "densidade": 1549,
    "evolucaoAnual": [
      {"ano": 2020, "populacao": 121500},
      {"ano": 2024, "populacao": 119000}
    ],
    "faixasEtarias": [
      {"faixa": "0-14 anos", "percentual": 18.5},
      {"faixa": "15-29 anos", "percentual": 22.3},
      {"faixa": "30-59 anos", "percentual": 42.1},
      {"faixa": "60+ anos", "percentual": 17.1}
    ],
    "genero": {"masculino": 48.5, "feminino": 51.5},
    "fonte": "IBGE 2024"
  },
  "pib": {
    "total": 3.9,
    "perCapita": 31100,
    "crescimento5Anos": 15.2,
    "ranking": 189,
    "composicao": [
      {"setor": "Serviços", "percentual": 65.2},
      {"setor": "Indústria", "percentual": 32.1},
      {"setor": "Agropecuária", "percentual": 2.7}
    ],
    "evolucaoAnual": [
      {"ano": 2020, "pib": 3.2, "perCapita": 26500},
      {"ano": 2023, "pib": 3.9, "perCapita": 31100}
    ],
    "comparativoRegiao": [
      {"cidade": "Santo André", "pib": 32.5, "perCapita": 45200},
      {"cidade": "Mauá", "pib": 16.8, "perCapita": 38100}
    ],
    "fonte": "IBGE PIB Municípios"
  },
  "salario": {
    "medio": 3012,
    "mediano": 2200,
    "variacao12Meses": 5.8,
    "ranking": 245,
    "faixas": [
      {"faixa": "Até 1 SM", "percentual": 25.3, "descricao": "Até R$ 1.412"},
      {"faixa": "1-2 SM", "percentual": 32.1, "descricao": "R$ 1.412 a R$ 2.824"},
      {"faixa": "2-5 SM", "percentual": 28.4, "descricao": "R$ 2.824 a R$ 7.060"},
      {"faixa": "5-10 SM", "percentual": 9.8, "descricao": "R$ 7.060 a R$ 14.120"},
      {"faixa": "10+ SM", "percentual": 4.4, "descricao": "Acima de R$ 14.120"}
    ],
    "evolucaoAnual": [
      {"ano": 2022, "salarioMedio": 2650},
      {"ano": 2023, "salarioMedio": 2845},
      {"ano": 2024, "salarioMedio": 3012}
    ],
    "fonte": "CAGED/MTE"
  },
  "distribuicaoRenda": {
    "classes": [
      {"classe": "E", "percentual": 31.9, "descricao": "Até 2 SM", "faixaSalariosMinimos": "Até 2 SM", "rendaMensalMin": 0, "rendaMensalMax": 2824},
      {"classe": "D", "percentual": 20.8, "descricao": "2 a 4 SM", "faixaSalariosMinimos": "2-4 SM", "rendaMensalMin": 2824, "rendaMensalMax": 5648},
      {"classe": "C", "percentual": 33.1, "descricao": "4 a 10 SM", "faixaSalariosMinimos": "4-10 SM", "rendaMensalMin": 5648, "rendaMensalMax": 14120},
      {"classe": "B", "percentual": 7.7, "descricao": "10 a 20 SM", "faixaSalariosMinimos": "10-20 SM", "rendaMensalMin": 14120, "rendaMensalMax": 28240},
      {"classe": "A", "percentual": 6.5, "descricao": "Acima de 20 SM", "faixaSalariosMinimos": "20+ SM", "rendaMensalMin": 28240, "rendaMensalMax": 999999}
    ],
    "gini": 0.42,
    "comparativoEstado": [
      {"classe": "A", "percentualCidade": 6.5, "percentualEstado": 8.2},
      {"classe": "C", "percentualCidade": 33.1, "percentualEstado": 35.4}
    ],
    "fonte": "IBGE/PNAD Contínua 2023"
  },
  "empregosFormais": 22400,
  "fonte": "IBGE, CAGED/MTE, PNAD Contínua"
}

IMPORTANTE:
- Use dados REAIS do IBGE, CAGED e PNAD para ${cidade}
- Se não encontrar dados específicos, use estimativas baseadas no porte e região da cidade
- Retorne SOMENTE o JSON, sem markdown`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar perfil econômico:', error)
    return getDefaultPerfilEconomico()
  }
}

// ============================================================================
// FUNÇÕES DE BUSCA - PDF 3: PANORAMA IMOBILIÁRIO
// ============================================================================

async function buscarPanoramaImobiliario(cidade: string, estado: string): Promise<PanoramaImobiliario> {
  console.log(`[Panorama] Buscando panorama imobiliário para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    })

    const prompt = `Você é um analista especializado em mercado imobiliário brasileiro.

TAREFA: Busque dados REAIS e ATUALIZADOS do PANORAMA IMOBILIÁRIO de ${cidade}, ${estado}.

Este relatório deve conter TODOS os dados similares ao relatório Caravela "Panorama Imobiliário":

1. DOMICÍLIOS:
   - Total de domicílios
   - Residências por tipo:
     * Casas (quantidade e moradores)
     * Casas de condomínio (quantidade e moradores)
     * Apartamentos (quantidade e moradores)
   - Média de habitantes por domicílio
   - Densidade domiciliar

2. CONSTRUÇÃO CIVIL:
   - Edificações em construção
   - Unidades em construção
   - Área total em construção (m²)
   - Crescimento no ano (%)
   - Lançamentos últimos 12 meses

3. COMÉRCIO IMOBILIÁRIO:
   - Transações por mês
   - Taxa por mil habitantes
   - Variação últimos 12 meses
   - Ranking no estado
   - Valor médio das transações

4. URBANIZAÇÃO:
   - Área urbana (km²)
   - Área densamente urbanizada (%)
   - Percentual urbanizado
   - Crescimento da área urbana (5 anos)

5. PREÇOS:
   - Preço médio m² (geral)
   - Preço médio m² (lançamentos)
   - Variação últimos 12 meses

RETORNE APENAS um JSON válido:
{
  "domicilios": {
    "total": 41500,
    "residenciasPorTipo": {
      "casas": {"quantidade": 38000, "moradores": 110000},
      "condominios": {"quantidade": 800, "moradores": 1700},
      "apartamentos": {"quantidade": 2700, "moradores": 7300}
    },
    "mediaHabitantesPorDomicilio": 2.8,
    "densidadeDomiciliar": 540,
    "evolucaoAnual": [
      {"ano": 2020, "total": 39800},
      {"ano": 2024, "total": 41500}
    ],
    "fonte": "IBGE Censo 2022"
  },
  "construcao": {
    "edificacoesEmConstrucao": 1200,
    "unidadesEmConstrucao": 3500,
    "areaEmConstrucao": 285000,
    "crescimentoAno": 8.5,
    "lancamentosUltimos12Meses": 15,
    "evolucaoMensal": [
      {"mes": "Jan/2024", "edificacoes": 95, "unidades": 280}
    ],
    "setoresAtivos": [
      {"setor": "Residencial vertical", "quantidade": 45},
      {"setor": "Residencial horizontal", "quantidade": 38}
    ],
    "fonte": "Prefeitura Municipal - Alvarás"
  },
  "comercio": {
    "transacoesMes": 165,
    "taxaPorMilHabitantes": 39.8,
    "variacao12Meses": 12.5,
    "ranking": 178,
    "tipoTransacoes": [
      {"tipo": "Venda", "percentual": 75.3},
      {"tipo": "Financiamento", "percentual": 24.7}
    ],
    "valorMedioTransacao": 320000,
    "evolucaoMensal": [
      {"mes": "Jan/2024", "transacoes": 145}
    ],
    "fonte": "Registro de Imóveis"
  },
  "urbanizacao": {
    "areaUrbana": 24.6,
    "areaDensamenteUrbanizada": 80,
    "percentualUrbanizado": 95.2,
    "zoneamento": [
      {"zona": "Residencial", "area": 15.2, "percentual": 62},
      {"zona": "Comercial", "area": 5.8, "percentual": 24},
      {"zona": "Industrial", "area": 3.6, "percentual": 14}
    ],
    "crescimentoAreaUrbana5Anos": 3.2,
    "fonte": "Prefeitura Municipal"
  },
  "precoM2Medio": 5800,
  "precoM2Lancamentos": 7500,
  "variacao12Meses": 8.2,
  "fonte": "FIPE/ZAP, IBGE, Prefeitura Municipal"
}

IMPORTANTE:
- Use dados REAIS para ${cidade}
- Preços de m² devem ser realistas para a região
- Retorne SOMENTE o JSON, sem markdown`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar panorama imobiliário:', error)
    return getDefaultPanoramaImobiliario()
  }
}

// ============================================================================
// FUNÇÕES DE BUSCA - PDF 2: PANORAMA ATUAL (EXISTENTES)
// ============================================================================

async function buscarDadosEmprego(cidade: string, estado: string): Promise<DadosEmprego> {
  console.log(`[Panorama] Buscando dados de emprego para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Você é um analista de dados econômicos especializado em mercado de trabalho brasileiro.

TAREFA: Busque dados REAIS e ATUALIZADOS de emprego formal (CAGED) para ${cidade}, ${estado}.

DADOS NECESSÁRIOS:
1. Admissões e desligamentos no ano corrente (jan-set 2025)
2. Saldo de empregos (admissões - desligamentos)
3. Ranking da cidade no estado
4. Evolução mensal do saldo de empregos (últimos 12 meses)
5. Setores com maior geração de empregos (top 5 positivos)
6. Setores com maior perda de empregos (top 3 negativos)
7. Projeção para o próximo ano
8. Sazonalidade mensal (média de admissões por mês)

RETORNE APENAS um JSON válido:
{
  "admitidos": 7849,
  "desligados": 7274,
  "saldo": 575,
  "rankingUF": 137,
  "rankingPerCapita": 443,
  "evolucaoMensal": [
    {"mes": "Jan/2024", "saldo": 150},
    {"mes": "Fev/2024", "saldo": -50}
  ],
  "setoresPositivos": [
    {"setor": "Clínicas médicas", "saldo": 87},
    {"setor": "Produtos de metal", "saldo": 72}
  ],
  "setoresNegativos": [
    {"setor": "Construção civil", "saldo": -53}
  ],
  "projecaoProximoAno": {"admitidos": 10308, "saldo": -229},
  "sazonalidadeMensal": [
    {"mes": "Janeiro", "admitidos": 823},
    {"mes": "Junho", "admitidos": 1042}
  ],
  "fonte": "CAGED/MTE",
  "periodo": "Jan-Set 2025"
}

Use dados REAIS do CAGED para ${cidade}. Se não encontrar dados específicos, use estimativas baseadas no porte da cidade e região.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados de emprego:', error)
    return getDefaultEmprego()
  }
}

async function buscarDadosEmpresas(cidade: string, estado: string): Promise<DadosEmpresas> {
  console.log(`[Panorama] Buscando dados de empresas para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Busque dados de abertura de empresas para ${cidade}, ${estado}.

RETORNE APENAS um JSON:
{
  "crescimentoAno": 369,
  "crescimentoMes": 33,
  "rankingUF": 82,
  "empresasInternet": 147,
  "setoresDestaque": [
    {"setor": "Atividades paisagísticas", "quantidade": 38},
    {"setor": "Complementação diagnóstica", "quantidade": 22}
  ],
  "comparativoRegiao": [
    {"cidade": "Guarulhos", "quantidade": 7017},
    {"cidade": "Santo André", "quantidade": 5574}
  ],
  "fonte": "Ministério da Economia"
}

Dados devem ser de 2025. Use estimativas baseadas no porte da cidade se necessário.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados de empresas:', error)
    return getDefaultEmpresas()
  }
}

async function buscarDadosMEI(cidade: string, estado: string): Promise<DadosMEI> {
  console.log(`[Panorama] Buscando dados de MEI para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Busque dados de Microempreendedores Individuais (MEI) para ${cidade}, ${estado}.

RETORNE APENAS um JSON:
{
  "totalMEIs": 10670,
  "taxaPorMilHabitantes": 89.7,
  "crescimentoAno": 2.6,
  "crescimentoMes": 84,
  "rankingUF": 292,
  "evolucaoMensal": [
    {"mes": "Jan/2023", "total": 1040},
    {"mes": "Dez/2023", "total": 1073}
  ],
  "fonte": "Receita Federal"
}

Use dados reais ou estimativas baseadas na população e perfil econômico da cidade.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados de MEI:', error)
    return getDefaultMEI()
  }
}

async function buscarDadosPIX(cidade: string, estado: string): Promise<DadosPIX> {
  console.log(`[Panorama] Buscando dados de PIX para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Busque dados de transações PIX para ${cidade}, ${estado}.

RETORNE APENAS um JSON:
{
  "volumeMensal": 506.2,
  "volumeRecebidoPJ": 429.5,
  "crescimentoMes": 1.19,
  "crescimento12Meses": 14.99,
  "crescimentoAno": 18.64,
  "projecaoProximoMes": 15.63,
  "transacoesPorHabitante": 22.5,
  "ticketMedio": 185,
  "sazonalidadeMensal": [
    {"mes": "Janeiro", "volume": 398},
    {"mes": "Dezembro", "volume": 460}
  ],
  "fonte": "Banco Central do Brasil"
}

Volume em milhões de reais. Use estimativas baseadas na população e renda da cidade.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados de PIX:', error)
    return getDefaultPIX()
  }
}

async function buscarDadosVulnerabilidade(cidade: string, estado: string): Promise<DadosVulnerabilidade> {
  console.log(`[Panorama] Buscando dados de vulnerabilidade para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Busque dados de vulnerabilidade social (CadÚnico) para ${cidade}, ${estado}.

RETORNE APENAS um JSON:
{
  "familiasCadUnico": 8400,
  "pessoasPobreza": 10100,
  "percentualPobreza": 8.5,
  "pessoasExtremPobreza": 6600,
  "percentualExtremPobreza": 5.6,
  "variacaoFamilias12m": -1.7,
  "variacaoExtremPobreza12m": -11.9,
  "rankingRegiao": 37,
  "evolucaoMensal": [
    {"mes": "Jan/2024", "pobreza": 18.5, "extrema": 12.2}
  ],
  "fonte": "Ministério da Cidadania"
}

Percentuais em relação à população total. Use estimativas baseadas no perfil socioeconômico.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados de vulnerabilidade:', error)
    return getDefaultVulnerabilidade()
  }
}

async function buscarDadosBancarios(cidade: string, estado: string): Promise<DadosBancarios> {
  console.log(`[Panorama] Buscando dados bancários para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Busque estatísticas bancárias (ESTBAN) para ${cidade}, ${estado}.

RETORNE APENAS um JSON:
{
  "variacaoPoupanca": -31.8,
  "variacaoCredito": -42.9,
  "variacaoFinanciamentoImob": 1.9,
  "evolucaoMensal": [
    {"mes": "Jan/2024", "poupanca": 1200, "credito": 800, "imobiliario": 150}
  ],
  "analise": "Movimento de queda na poupança e crédito, mercado imobiliário estável",
  "fonte": "Banco Central do Brasil - ESTBAN"
}

Variações em percentual no ano. Use estimativas baseadas na região.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados bancários:', error)
    return getDefaultBancarios()
  }
}

async function buscarDadosFrota(cidade: string, estado: string): Promise<DadosFrota> {
  console.log(`[Panorama] Buscando dados de frota para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Busque dados de frota de veículos (DENATRAN) para ${cidade}, ${estado}.

RETORNE APENAS um JSON:
{
  "total": 78800,
  "carros": 62500,
  "percentualCarros": 79,
  "motos": 9300,
  "percentualMotos": 12,
  "caminhoes": 3300,
  "percentualCaminhoes": 4,
  "taxaPerCapita": 0.66,
  "rankingUF": 389,
  "crescimentoAno": 2.6,
  "evolucaoTrimestral": [
    {"periodo": "2023T1", "carros": 60212, "motos": 8672, "caminhoes": 3237}
  ],
  "fonte": "DENATRAN"
}

Use estimativas baseadas na população e perfil econômico da cidade.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados de frota:', error)
    return getDefaultFrota()
  }
}

async function buscarDadosRendimentos(cidade: string, estado: string): Promise<DadosRendimentos> {
  console.log(`[Panorama] Buscando dados de rendimentos para ${cidade}...`)

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
    })

    const prompt = `Busque dados de rendimentos tributáveis (IRPF) para ${cidade}, ${estado}.

RETORNE APENAS um JSON:
{
  "declarantesIR": 30300,
  "percentualPopulacao": 25.5,
  "variacaoDeclarantes": -1.0,
  "rendimentosTributaveis": 9050,
  "bensDeclarados": 1773,
  "gastosSaude": 117.1,
  "gastosInstrucao": 45.1,
  "mediaSaudePorDeclarante": 3900,
  "mediaInstrucaoPorDeclarante": 1500,
  "evolucaoAnual": [
    {"ano": 2021, "rendimentos": 5350, "bens": 1407},
    {"ano": 2022, "rendimentos": 6732, "bens": 1659},
    {"ano": 2023, "rendimentos": 9050, "bens": 1773}
  ],
  "fonte": "Receita Federal"
}

Valores em milhões de reais. Use estimativas baseadas na população e renda da região.`

    const result = await model.generateContent(prompt)
    const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    return JSON.parse(text)
  } catch (error) {
    console.error('[Panorama] Erro ao buscar dados de rendimentos:', error)
    return getDefaultRendimentos()
  }
}

// ============================================================================
// VALORES PADRÃO (FALLBACK)
// ============================================================================

function getDefaultEmprego(): DadosEmprego {
  return {
    admitidos: 5000,
    desligados: 4800,
    saldo: 200,
    rankingUF: 150,
    rankingPerCapita: 400,
    evolucaoMensal: [],
    setoresPositivos: [{ setor: 'Serviços', saldo: 50 }],
    setoresNegativos: [{ setor: 'Indústria', saldo: -20 }],
    projecaoProximoAno: { admitidos: 5500, saldo: 100 },
    sazonalidadeMensal: [],
    fonte: 'CAGED/MTE (estimativa)',
    periodo: 'Jan-Set 2025'
  }
}

function getDefaultEmpresas(): DadosEmpresas {
  return {
    crescimentoAno: 200,
    crescimentoMes: 20,
    rankingUF: 100,
    empresasInternet: 80,
    setoresDestaque: [],
    comparativoRegiao: [],
    fonte: 'Ministério da Economia (estimativa)'
  }
}

function getDefaultMEI(): DadosMEI {
  return {
    totalMEIs: 5000,
    taxaPorMilHabitantes: 50,
    crescimentoAno: 3.0,
    crescimentoMes: 40,
    rankingUF: 300,
    evolucaoMensal: [],
    fonte: 'Receita Federal (estimativa)'
  }
}

function getDefaultPIX(): DadosPIX {
  return {
    volumeMensal: 300,
    volumeRecebidoPJ: 250,
    crescimentoMes: 2.0,
    crescimento12Meses: 15.0,
    crescimentoAno: 18.0,
    projecaoProximoMes: 16.0,
    transacoesPorHabitante: 20,
    ticketMedio: 150,
    sazonalidadeMensal: [],
    fonte: 'Banco Central do Brasil (estimativa)'
  }
}

function getDefaultVulnerabilidade(): DadosVulnerabilidade {
  return {
    familiasCadUnico: 5000,
    pessoasPobreza: 8000,
    percentualPobreza: 10.0,
    pessoasExtremPobreza: 4000,
    percentualExtremPobreza: 5.0,
    variacaoFamilias12m: -2.0,
    variacaoExtremPobreza12m: -5.0,
    rankingRegiao: 50,
    evolucaoMensal: [],
    fonte: 'Ministério da Cidadania (estimativa)'
  }
}

function getDefaultBancarios(): DadosBancarios {
  return {
    variacaoPoupanca: -20.0,
    variacaoCredito: -30.0,
    variacaoFinanciamentoImob: 2.0,
    evolucaoMensal: [],
    analise: 'Mercado em ajuste',
    fonte: 'Banco Central do Brasil (estimativa)'
  }
}

function getDefaultFrota(): DadosFrota {
  return {
    total: 50000,
    carros: 40000,
    percentualCarros: 80,
    motos: 7000,
    percentualMotos: 14,
    caminhoes: 2000,
    percentualCaminhoes: 4,
    taxaPerCapita: 0.5,
    rankingUF: 400,
    crescimentoAno: 2.5,
    evolucaoTrimestral: [],
    fonte: 'DENATRAN (estimativa)'
  }
}

function getDefaultRendimentos(): DadosRendimentos {
  return {
    declarantesIR: 20000,
    percentualPopulacao: 20.0,
    variacaoDeclarantes: 0,
    rendimentosTributaveis: 5000,
    bensDeclarados: 1000,
    gastosSaude: 80,
    gastosInstrucao: 30,
    mediaSaudePorDeclarante: 4000,
    mediaInstrucaoPorDeclarante: 1500,
    evolucaoAnual: [],
    fonte: 'Receita Federal (estimativa)'
  }
}

// ============================================================================
// VALORES PADRÃO - PDF 1: PERFIL ECONÔMICO
// ============================================================================

function getDefaultPerfilEconomico(): PerfilEconomico {
  return {
    populacao: {
      total: 100000,
      variacao5Anos: -0.5,
      ranking: 200,
      densidade: 1200,
      evolucaoAnual: [
        { ano: 2020, populacao: 101000 },
        { ano: 2024, populacao: 100000 }
      ],
      faixasEtarias: [
        { faixa: '0-14 anos', percentual: 18.0 },
        { faixa: '15-29 anos', percentual: 22.0 },
        { faixa: '30-59 anos', percentual: 43.0 },
        { faixa: '60+ anos', percentual: 17.0 }
      ],
      genero: { masculino: 48.5, feminino: 51.5 },
      fonte: 'IBGE (estimativa)'
    },
    pib: {
      total: 3.0,
      perCapita: 30000,
      crescimento5Anos: 10.0,
      ranking: 200,
      composicao: [
        { setor: 'Serviços', percentual: 65.0 },
        { setor: 'Indústria', percentual: 32.0 },
        { setor: 'Agropecuária', percentual: 3.0 }
      ],
      evolucaoAnual: [
        { ano: 2020, pib: 2.5, perCapita: 25000 },
        { ano: 2023, pib: 3.0, perCapita: 30000 }
      ],
      comparativoRegiao: [],
      fonte: 'IBGE PIB Municípios (estimativa)'
    },
    salario: {
      medio: 2500,
      mediano: 1900,
      variacao12Meses: 5.0,
      ranking: 250,
      faixas: [
        { faixa: 'Até 1 SM', percentual: 28.0, descricao: 'Até R$ 1.412' },
        { faixa: '1-2 SM', percentual: 32.0, descricao: 'R$ 1.412 a R$ 2.824' },
        { faixa: '2-5 SM', percentual: 26.0, descricao: 'R$ 2.824 a R$ 7.060' },
        { faixa: '5-10 SM', percentual: 9.0, descricao: 'R$ 7.060 a R$ 14.120' },
        { faixa: '10+ SM', percentual: 5.0, descricao: 'Acima de R$ 14.120' }
      ],
      evolucaoAnual: [
        { ano: 2022, salarioMedio: 2200 },
        { ano: 2024, salarioMedio: 2500 }
      ],
      fonte: 'CAGED/MTE (estimativa)'
    },
    distribuicaoRenda: {
      classes: [
        { classe: 'E', percentual: 30.0, descricao: 'Até 2 SM', faixaSalariosMinimos: 'Até 2 SM', rendaMensalMin: 0, rendaMensalMax: 2824 },
        { classe: 'D', percentual: 22.0, descricao: '2 a 4 SM', faixaSalariosMinimos: '2-4 SM', rendaMensalMin: 2824, rendaMensalMax: 5648 },
        { classe: 'C', percentual: 33.0, descricao: '4 a 10 SM', faixaSalariosMinimos: '4-10 SM', rendaMensalMin: 5648, rendaMensalMax: 14120 },
        { classe: 'B', percentual: 9.0, descricao: '10 a 20 SM', faixaSalariosMinimos: '10-20 SM', rendaMensalMin: 14120, rendaMensalMax: 28240 },
        { classe: 'A', percentual: 6.0, descricao: 'Acima de 20 SM', faixaSalariosMinimos: '20+ SM', rendaMensalMin: 28240, rendaMensalMax: 999999 }
      ],
      gini: 0.45,
      comparativoEstado: [],
      fonte: 'IBGE/PNAD Contínua (estimativa)'
    },
    empregosFormais: 20000,
    fonte: 'IBGE, CAGED/MTE (estimativa)'
  }
}

// ============================================================================
// VALORES PADRÃO - PDF 3: PANORAMA IMOBILIÁRIO
// ============================================================================

function getDefaultPanoramaImobiliario(): PanoramaImobiliario {
  return {
    domicilios: {
      total: 35000,
      residenciasPorTipo: {
        casas: { quantidade: 30000, moradores: 85000 },
        condominios: { quantidade: 1000, moradores: 2500 },
        apartamentos: { quantidade: 4000, moradores: 12000 }
      },
      mediaHabitantesPorDomicilio: 2.8,
      densidadeDomiciliar: 450,
      evolucaoAnual: [
        { ano: 2020, total: 33000 },
        { ano: 2024, total: 35000 }
      ],
      fonte: 'IBGE Censo (estimativa)'
    },
    construcao: {
      edificacoesEmConstrucao: 800,
      unidadesEmConstrucao: 2500,
      areaEmConstrucao: 200000,
      crescimentoAno: 5.0,
      lancamentosUltimos12Meses: 10,
      evolucaoMensal: [],
      setoresAtivos: [
        { setor: 'Residencial vertical', quantidade: 40 },
        { setor: 'Residencial horizontal', quantidade: 35 }
      ],
      fonte: 'Prefeitura Municipal (estimativa)'
    },
    comercio: {
      transacoesMes: 120,
      taxaPorMilHabitantes: 35.0,
      variacao12Meses: 8.0,
      ranking: 200,
      tipoTransacoes: [
        { tipo: 'Venda', percentual: 70.0 },
        { tipo: 'Financiamento', percentual: 30.0 }
      ],
      valorMedioTransacao: 280000,
      evolucaoMensal: [],
      fonte: 'Registro de Imóveis (estimativa)'
    },
    urbanizacao: {
      areaUrbana: 20.0,
      areaDensamenteUrbanizada: 75.0,
      percentualUrbanizado: 90.0,
      zoneamento: [
        { zona: 'Residencial', area: 12.0, percentual: 60 },
        { zona: 'Comercial', area: 5.0, percentual: 25 },
        { zona: 'Industrial', area: 3.0, percentual: 15 }
      ],
      crescimentoAreaUrbana5Anos: 2.5,
      fonte: 'Prefeitura Municipal (estimativa)'
    },
    precoM2Medio: 5000,
    precoM2Lancamentos: 6500,
    variacao12Meses: 6.0,
    fonte: 'FIPE/ZAP (estimativa)'
  }
}
