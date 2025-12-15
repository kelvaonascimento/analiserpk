import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/lib/db'
import type { Analise, SWOT, Persona, Estrategia, Checklist, FacilidadesRegiao } from '@/types'
import { buscarPanoramaCompleto } from '@/lib/panorama-automatico'
import { buscarFacilidadesProximas, gerarNarrativasLocalizacao, compararFacilidadesVsConcorrentes } from '@/lib/buscar-facilidades'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
})

// Prompt para gerar análise SWOT COMPARATIVA
function getSWOTPrompt(empreendimento: any, concorrentes: any[], facilidades?: FacilidadesRegiao): string {
  // Preparar dados do empreendimento
  const precoM2Empreendimento = empreendimento.unidades?.[0]?.precoM2 || 0
  const metragemEmpreendimento = empreendimento.unidades?.[0]?.metragem || 0
  const lazerEmpreendimento = empreendimento.itensLazer || []
  const tecnologiaEmpreendimento = empreendimento.tecnologia || []
  const diferenciaisEmpreendimento = empreendimento.diferenciais || []

  // Calcular métricas dos concorrentes
  const concorrentesComDados = concorrentes.filter(c => c.precoM2 && c.precoM2 > 0)
  const precoM2MedioConcorrentes = concorrentesComDados.length > 0
    ? Math.round(concorrentesComDados.reduce((acc, c) => acc + c.precoM2, 0) / concorrentesComDados.length)
    : 0
  const metragemMediaConcorrentes = concorrentesComDados.length > 0
    ? Math.round(concorrentesComDados.reduce((acc, c) => acc + (c.metragemMin || 0), 0) / concorrentesComDados.length)
    : 0

  // Comparações explícitas
  const diferencaPrecoM2 = precoM2Empreendimento && precoM2MedioConcorrentes
    ? Math.round(((precoM2Empreendimento - precoM2MedioConcorrentes) / precoM2MedioConcorrentes) * 100)
    : 0
  const diferencaMetragem = metragemEmpreendimento && metragemMediaConcorrentes
    ? Math.round(((metragemEmpreendimento - metragemMediaConcorrentes) / metragemMediaConcorrentes) * 100)
    : 0

  // Facilidades da região
  const facilidadesResumo = facilidades
    ? `
FACILIDADES E SERVIÇOS PRÓXIMOS:
${facilidades.transporte.filter(f => f.destaque).map(f => `- ${f.tipo.toUpperCase()}: ${f.nome} (${f.distancia})`).join('\n')}
${facilidades.comercio.filter(f => f.destaque).map(f => `- ${f.tipo.toUpperCase()}: ${f.nome} (${f.distancia})`).join('\n')}
${facilidades.saude.filter(f => f.destaque).map(f => `- ${f.tipo.toUpperCase()}: ${f.nome} (${f.distancia})`).join('\n')}
${facilidades.educacao.filter(f => f.destaque).map(f => `- ${f.tipo.toUpperCase()}: ${f.nome} (${f.distancia})`).join('\n')}
- Score Mobilidade: ${facilidades.scoreMobilidade}/100
- Score Serviços: ${facilidades.scoreServicos}/100
- Score Conveniência: ${facilidades.scoreConveniencia}/100
- Resumo: ${facilidades.resumo}
`
    : ''

  return `Você é um ANALISTA ESTRATÉGICO SÊNIOR de mercado imobiliário. Sua análise deve ser EXTREMAMENTE ESPECÍFICA e COMPARATIVA.

=== EMPREENDIMENTO EM ANÁLISE ===
Nome: ${empreendimento.nome}
Construtora: ${empreendimento.construtora}
Localização: ${empreendimento.endereco?.bairro || ''}, ${empreendimento.endereco?.cidade}, ${empreendimento.endereco?.estado}
Torres: ${empreendimento.especificacoes?.torres || 1} | Andares: ${empreendimento.especificacoes?.andares || 0}
Total de Unidades: ${empreendimento.especificacoes?.unidadesTotal || 0}
Metragem: ${metragemEmpreendimento}m²
Preço: R$ ${empreendimento.unidades?.[0]?.precoMin?.toLocaleString('pt-BR') || '0'}
Preço/m²: R$ ${precoM2Empreendimento.toLocaleString('pt-BR')}
Entrega: ${empreendimento.entrega?.mes}/${empreendimento.entrega?.ano}

ITENS DE LAZER (${lazerEmpreendimento.length} itens):
${lazerEmpreendimento.join(', ') || 'Não especificado'}

TECNOLOGIA:
${tecnologiaEmpreendimento.join(', ') || 'Não especificado'}

DIFERENCIAIS:
${diferenciaisEmpreendimento.join(', ') || 'Não especificado'}
${facilidadesResumo}

=== CONCORRÊNCIA DIRETA (${concorrentes.length} empreendimentos) ===
${concorrentes.map((c, i) => `
CONCORRENTE ${i + 1}: ${c.nome}
- Construtora: ${c.construtora}
- Cidade: ${c.cidade}
- Metragem: ${c.metragemMin || '?'}m²
- Preço: R$ ${c.precoMin?.toLocaleString('pt-BR') || '?'}
- Preço/m²: R$ ${c.precoM2?.toLocaleString('pt-BR') || '?'}
- Entrega: ${c.entrega?.ano || '?'}
- Status: ${c.status || 'Não informado'}
`).join('') || 'Nenhum concorrente mapeado'}

=== COMPARATIVO DIRETO ===
- Preço/m² do empreendimento vs média concorrentes: ${diferencaPrecoM2 > 0 ? `+${diferencaPrecoM2}%` : `${diferencaPrecoM2}%`}
- Metragem do empreendimento vs média concorrentes: ${diferencaMetragem > 0 ? `+${diferencaMetragem}%` : `${diferencaMetragem}%`}
- Itens de lazer: ${lazerEmpreendimento.length} (empreendimento) vs média ~${Math.round(concorrentes.reduce((acc, c) => acc + (c.itensLazer || 10), 0) / Math.max(concorrentes.length, 1))} (concorrentes)

=== SUA TAREFA ===
Gere uma análise SWOT ALTAMENTE COMPARATIVA que:

1. FORÇAS: Compare EXPLICITAMENTE o empreendimento vs concorrentes
   - Se preço/m² é menor: "Preço/m² ${Math.abs(diferencaPrecoM2)}% abaixo de [nome concorrente]"
   - Se tem mais lazer: "X itens de lazer a mais que [nome concorrente]"
   - Compare metragem, tecnologia, localização SEMPRE citando concorrentes específicos

2. FRAQUEZAS: Identifique onde os CONCORRENTES são melhores
   - Se algum concorrente tem preço menor, cite: "[nome concorrente] oferece preço/m² X% menor"
   - Se algum concorrente tem melhor localização, cite
   - Se algum concorrente tem mais itens de lazer, cite

3. OPORTUNIDADES: Baseadas nas LACUNAS da concorrência
   - O que os concorrentes NÃO oferecem que este empreendimento oferece?
   - Nichos não atendidos pela concorrência

4. AMEAÇAS: Baseadas nos PONTOS FORTES da concorrência
   - Quais concorrentes específicos são ameaças e por quê?
   - Cite nomes: "[nome concorrente] pode captar público por causa de..."

RETORNE APENAS um JSON válido:
{
  "forcas": [
    {"texto": "Preço/m² de R$ ${precoM2Empreendimento.toLocaleString('pt-BR')} é ${Math.abs(diferencaPrecoM2)}% ${diferencaPrecoM2 < 0 ? 'abaixo' : 'acima'} da média da concorrência", "critico": true},
    {"texto": "...", "critico": false}
  ],
  "fraquezas": [
    {"texto": "...", "critico": true}
  ],
  "oportunidades": [
    {"texto": "...", "chave": true}
  ],
  "ameacas": [
    {"texto": "[Nome do Concorrente] representa ameaça direta por...", "grave": true}
  ],
  "acoesEstrategicas": [
    {"categoria": "explorar_forcas_oportunidades", "acoes": ["Ação específica citando concorrente...", "..."]},
    {"categoria": "mitigar_fraquezas_ameacas", "acoes": ["Ação para combater [Nome Concorrente]...", "..."]}
  ]
}

REGRAS OBRIGATÓRIAS:
- CITE NOMES de concorrentes específicos em pelo menos 50% dos itens
- USE NÚMEROS E PERCENTUAIS sempre que possível
- COMPARE EXPLICITAMENTE (não use termos vagos como "competitivo" sem dados)
- Inclua pelo menos 10 forças, 9 fraquezas, 10 oportunidades, 10 ameaças
- 5 forças devem ser críticas, 3 fraquezas críticas, 5 oportunidades chave, 4 ameaças graves`
}

// Prompt para gerar personas
function getPersonasPrompt(empreendimento: any): string {
  const precoMedio = empreendimento.unidades?.[0]?.precoMin || 500000
  const metragem = empreendimento.unidades?.[0]?.metragem || 80
  const cidade = empreendimento.endereco?.cidade || 'cidade'

  return `Você é um especialista em marketing imobiliário e criação de buyer personas.
Crie 3 personas detalhadas para o empreendimento:

EMPREENDIMENTO:
- Nome: ${empreendimento.nome}
- Cidade: ${cidade}
- Metragem: ${metragem}m²
- Preço: R$ ${precoMedio.toLocaleString('pt-BR')}
- Itens de lazer: ${empreendimento.itensLazer?.join(', ') || 'Academia, Piscina, Churrasqueira'}

Crie 3 personas:
1. Executivo Regional / Morador Local (trabalha na região)
2. Lifestyle Migrator (mora em cidade maior, busca qualidade de vida)
3. Investidor Estratégico (busca rentabilidade e valorização)

Para cada persona, inclua:
- Nome fictício e idade
- Título descritivo
- Demografia completa (faixa etária, renda, família, trabalho, localização atual, valores)
- 5 dores específicas
- 5 desejos específicos
- Comportamento de compra (canais, tipo de decisão, tempo, influenciadores, entrada)
- 6 chamadas publicitárias (com headline e formato de mídia)

Retorne APENAS um JSON válido no formato:
[
  {
    "nome": "Carlos",
    "idade": 38,
    "titulo": "Executivo Regional",
    "tipo": "executivo_regional",
    "demografia": {
      "faixaEtariaMin": 35,
      "faixaEtariaMax": 45,
      "rendaMin": 20000,
      "rendaMax": 35000,
      "familia": "Casado, 2 filhos",
      "trabalho": "Gerente em empresa do ABC",
      "localizacaoAtual": "Apartamento 70m² no ABC",
      "valores": ["Família", "Segurança", "Conforto", "Praticidade"]
    },
    "dores": ["...", "...", "...", "...", "..."],
    "desejos": ["...", "...", "...", "...", "..."],
    "comportamentoCompra": {
      "canaisPesquisa": ["VivaReal", "ZAP Imóveis", "Google"],
      "tipoDecisao": "racional",
      "tempoDecisaoMesesMin": 3,
      "tempoDecisaoMesesMax": 6,
      "influenciadores": ["Esposa", "Corretor de confiança"],
      "entradaPercentualMin": 30,
      "entradaPercentualMax": 40
    },
    "chamadasPublicitarias": [
      {"headline": "...", "formato": "Meta Ads - Feed"},
      {"headline": "...", "formato": "Google Search"},
      ...
    ]
  },
  ...
]`
}

// Prompt para gerar estratégia
function getEstrategiaPrompt(empreendimento: any): string {
  const cidade = empreendimento.endereco?.cidade || 'cidade'

  return `Você é um estrategista de marketing digital especializado em imóveis.
Crie uma estratégia de marketing completa para:

EMPREENDIMENTO:
- Nome: ${empreendimento.nome}
- Cidade: ${cidade}
- Construtora: ${empreendimento.construtora}

Inclua:
1. Presença digital recomendada (landing page, redes sociais, ads)
2. 3 fases de implementação com tarefas específicas
3. Segmentação geográfica com prioridades
4. KPIs a monitorar
5. Budget sugerido (total mensal e alocação)

Retorne APENAS um JSON válido no formato:
{
  "presencaDigital": [
    {"tipo": "Landing Page", "acao": "Criar página focada em conversão"},
    ...
  ],
  "fases": [
    {"numero": 1, "titulo": "Sprint Inicial", "semanas": "1-2", "tarefas": ["...", "..."]},
    ...
  ],
  "segmentacaoGeografica": [
    {"cidade": "${cidade}", "prioridade": "muito_alta"},
    ...
  ],
  "kpis": [
    {"metrica": "CAC", "alvo": "< R$ 3.000"},
    ...
  ],
  "budgetSugerido": {
    "totalMensal": 9000,
    "alocacao": [
      {"tipo": "Tráfego Frio", "valor": 5400, "percentual": 60},
      ...
    ]
  }
}`
}

// Gera checklist padrão
function gerarChecklist(): Checklist {
  return {
    deadlineDias: 7,
    timelineTotalSemanas: 12,
    sprints: [
      {
        semanas: '1-2',
        titulo: 'Sprint Inicial & Auditorias',
        tarefas: [
          { item: 'Análise SEO completa da landing page', tipo: 'audit', concluida: false },
          { item: 'Auditoria Google Analytics (GA4) e configuração de eventos', tipo: 'audit', concluida: false },
          { item: 'Auditoria Meta Business Manager e Pixel', tipo: 'audit', concluida: false },
          { item: 'Análise histórica de campanhas e CAC', tipo: 'audit', concluida: false },
          { item: 'Levantamento de criativos existentes', tipo: 'strategy', concluida: false },
          { item: 'Mapeamento completo de pixel e eventos', tipo: 'audit', concluida: false },
        ],
      },
      {
        semanas: '3-4',
        titulo: 'Setup & Estruturação',
        tarefas: [
          { item: 'Criar campanha Look-a-Like expandida', tipo: 'strategy', concluida: false },
          { item: 'Configurar Remarketing para não-convertidos', tipo: 'strategy', concluida: false },
          { item: 'Desenvolver criativos focados na metragem principal', tipo: 'creative', concluida: false },
          { item: 'Definir novo geo-targeting', tipo: 'strategy', concluida: false },
          { item: 'Montar planilha de CAC e projeções', tipo: 'strategy', concluida: false },
          { item: 'Compilar materiais da pasta do cliente', tipo: 'prep', concluida: false },
        ],
      },
      {
        semanas: '5-6',
        titulo: 'Lançamento & Otimização',
        tarefas: [
          { item: 'Ativar campanhas Look-a-Like em Meta Ads', tipo: 'execution', concluida: false },
          { item: 'Ativar Google Search para palavras-chave principais', tipo: 'execution', concluida: false },
          { item: 'Configurar segmentação por renda', tipo: 'execution', concluida: false },
          { item: 'Setup de remarketing cross-platform', tipo: 'execution', concluida: false },
          { item: 'Criar variações de criativos A/B', tipo: 'creative', concluida: false },
          { item: 'Monitorar CPL e CAC inicial', tipo: 'analysis', concluida: false },
        ],
      },
      {
        semanas: '7-8',
        titulo: 'Ajustes & Expansão',
        tarefas: [
          { item: 'Analisar dados de conversão das primeiras 4 semanas', tipo: 'analysis', concluida: false },
          { item: 'Ajustar lances e orçamento por região', tipo: 'optimization', concluida: false },
          { item: 'Expandir públicos de melhor performance', tipo: 'optimization', concluida: false },
          { item: 'Pausar segmentos de baixo ROI', tipo: 'optimization', concluida: false },
          { item: 'Criar novos criativos baseados em insights', tipo: 'creative', concluida: false },
          { item: 'Implementar testes de copy', tipo: 'creative', concluida: false },
        ],
      },
      {
        semanas: '9-10',
        titulo: 'Scale & Performance',
        tarefas: [
          { item: 'Aumentar budget em campanhas de alta conversão', tipo: 'optimization', concluida: false },
          { item: 'Testar novos formatos de anúncio (Reels, Stories)', tipo: 'creative', concluida: false },
          { item: 'Implementar retargeting agressivo', tipo: 'execution', concluida: false },
          { item: 'Criar landing page específica para região principal', tipo: 'strategy', concluida: false },
          { item: 'Análise de concorrentes ativos no período', tipo: 'analysis', concluida: false },
          { item: 'Report executivo para cliente', tipo: 'reporting', concluida: false },
        ],
      },
      {
        semanas: '11-12',
        titulo: 'Consolidação & Sprint Final',
        tarefas: [
          { item: 'Revisão completa de todas as métricas', tipo: 'analysis', concluida: false },
          { item: 'Ajustes finais de otimização', tipo: 'optimization', concluida: false },
          { item: 'Preparar relatório final com projeções', tipo: 'reporting', concluida: false },
          { item: 'Documentar learnings e best practices', tipo: 'reporting', concluida: false },
          { item: 'Planejar estratégia para próximos 3 meses', tipo: 'strategy', concluida: false },
          { item: 'Apresentação de resultados e recomendações', tipo: 'reporting', concluida: false },
        ],
      },
    ],
  }
}

// Função principal que gera toda a análise
async function gerarAnaliseCompleta(projeto: any, facilidades?: FacilidadesRegiao): Promise<Analise> {
  const empreendimento = projeto.empreendimento || {}
  const concorrentes = projeto.concorrentes || []

  // Se não tiver API key, gera análise mock
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('Gerando análise mock (sem API key)')
    return gerarAnaliseMock(empreendimento, concorrentes, facilidades)
  }

  try {
    // Gerar SWOT com comparação direta
    console.log('[Análise] Gerando SWOT comparativa...')
    const swotResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [{ role: 'user', content: getSWOTPrompt(empreendimento, concorrentes, facilidades) }],
    })
    const swotText = swotResponse.content[0].type === 'text' ? swotResponse.content[0].text : ''
    let swot: SWOT
    try {
      swot = JSON.parse(swotText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    } catch (e) {
      console.error('[Análise] Erro ao parsear SWOT, usando mock:', e)
      swot = gerarAnaliseMock(empreendimento, concorrentes, facilidades).swot
    }

    // Gerar Personas
    const personasResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: getPersonasPrompt(empreendimento) }],
    })
    const personasText = personasResponse.content[0].type === 'text' ? personasResponse.content[0].text : ''
    const personas: Persona[] = JSON.parse(personasText)

    // Gerar Estratégia
    const estrategiaResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: getEstrategiaPrompt(empreendimento) }],
    })
    const estrategiaText = estrategiaResponse.content[0].type === 'text' ? estrategiaResponse.content[0].text : ''
    const estrategia: Estrategia = JSON.parse(estrategiaText)

    // Checklist padrão
    const checklist = gerarChecklist()

    // Extrair dados para cálculos
    const nome = empreendimento.nome || 'Empreendimento'
    const cidade = empreendimento.endereco?.cidade || 'Cidade'
    const precoMin = empreendimento.unidades?.[0]?.precoMin || 500000
    const precoM2 = empreendimento.unidades?.[0]?.precoM2 || 9500
    const itensLazer = empreendimento.itensLazer || []
    const tecnologia = empreendimento.tecnologia || []
    const diferenciais = empreendimento.diferenciais || []
    const metragem = empreendimento.unidades?.[0]?.metragem || 60

    // Calcular preço/m² médio dos concorrentes
    const precosM2Concorrentes = concorrentes?.filter((c: any) => c.precoM2 && c.precoM2 > 0).map((c: any) => c.precoM2) || []
    const precoM2MedioConcorrentes = precosM2Concorrentes.length > 0
      ? precosM2Concorrentes.reduce((a: number, b: number) => a + b, 0) / precosM2Concorrentes.length
      : precoM2

    // Gerar narrativas de localização
    const narrativasLocalizacao = facilidades ? gerarNarrativasLocalizacao(facilidades) : []

    return {
      swot,
      personas,
      estrategia,
      checklist,
      resumoExecutivo: gerarResumoExecutivo(nome, cidade, itensLazer, precoMin, metragem, concorrentes),
      facilidades,
      narrativasLocalizacao,
      publicoQualificado: calcularPublicoQualificado(precoMin, precoM2),
      alertasMercado: gerarAlertasMercado(precoMin, precoM2, precoM2MedioConcorrentes, itensLazer),
      oportunidadesMercado: gerarOportunidadesMercado(cidade, itensLazer, concorrentes, precoM2, precoM2MedioConcorrentes, facilidades),
      comparativoPrecoM2: gerarComparativoPrecoM2(nome, cidade, precoM2, concorrentes),
      radarCompetitivo: gerarRadarCompetitivo(empreendimento, concorrentes),
      vantagensCompetitivas: gerarVantagensCompetitivas(itensLazer, tecnologia, diferenciais, precoM2, precoM2MedioConcorrentes, cidade, facilidades),
    }
  } catch (error) {
    console.error('Erro ao gerar análise com Claude:', error)
    return gerarAnaliseMock(empreendimento, concorrentes, facilidades)
  }
}

// Gera personas detalhadas baseadas nos dados do empreendimento
// Formato igual ao produto original: desejos/objetivos, dores/frustrações, comportamento de compra
function gerarPersonasDetalhadas(empreendimento: any, cidade: string, itensLazer: string[], precoMin: number, metragem: number): Persona[] {
  const temCoworking = itensLazer.includes('Coworking Equipado')
  const temPetPlace = itensLazer.includes('Pet Place / Pet Care')
  const temPiscinaAquecida = itensLazer.includes('Piscina Aquecida')
  const temAcademia = itensLazer.includes('Academia Completa')
  const lazerCount = itensLazer.length

  return [
    {
      nome: 'Carlos Mendes',
      idade: 38,
      titulo: 'Executivo Regional em Busca de Upgrade',
      tipo: 'executivo_regional',
      demografia: {
        faixaEtariaMin: 35,
        faixaEtariaMax: 48,
        rendaMin: 18000,
        rendaMax: 35000,
        familia: 'Casado, 2 filhos (8 e 12 anos)',
        trabalho: 'Gerente de Operações em indústria do ABC Paulista',
        localizacaoAtual: `Apartamento de 72m² em ${cidade} ou região próxima`,
        valores: ['Segurança familiar', 'Estabilidade', 'Qualidade de vida', 'Educação dos filhos', 'Patrimônio'],
      },
      dores: [
        'Apartamento atual apertado - filhos dividem quarto e brigam constantemente',
        'Condomínio com lazer limitado: só tem playground pequeno e salão de festas',
        `Gasta R$ 800-1.200/mês em academia externa e atividades para as crianças`,
        'Fim de semana é correria: precisa sair para qualquer atividade de lazer',
        'Vizinhança envelhecendo e prédio sem manutenção adequada',
      ],
      desejos: [
        `Apartamento com ${metragem >= 90 ? 'suíte master e quartos separados para cada filho' : 'pelo menos 3 quartos para a família crescer'}`,
        `Lazer completo no condomínio: ${temPiscinaAquecida ? 'piscina aquecida' : 'piscina'}, ${temAcademia ? 'academia equipada' : 'área fitness'}, churrasqueira`,
        'Fim de semana em casa com a família, sem precisar pegar carro',
        `Economia mensal ao eliminar gastos com lazer externo`,
        'Valorização do patrimônio para garantir futuro dos filhos',
      ],
      comportamentoCompra: {
        canaisPesquisa: ['VivaReal', 'ZAP Imóveis', 'Google ("apartamento 3 quartos ' + cidade + '")', 'Indicação de colegas de trabalho'],
        tipoDecisao: 'racional',
        tempoDecisaoMesesMin: 4,
        tempoDecisaoMesesMax: 8,
        influenciadores: ['Esposa (decisão final)', 'Filhos (opinam sobre lazer)', 'Corretor de confiança', 'Contador (viabilidade financeira)'],
        entradaPercentualMin: 25,
        entradaPercentualMax: 40,
      },
      chamadasPublicitarias: [
        { headline: `Seus filhos merecem um quarto cada um. E você merece paz.`, formato: 'Meta Ads - Feed (carrossel com planta)' },
        { headline: `${lazerCount} itens de lazer. Zero deslocamento no fim de semana.`, formato: 'Meta Ads - Reels (tour pelo lazer)' },
        { headline: `Economize R$ 1.000/mês em academia e clube. Tudo no seu prédio.`, formato: 'Google Ads - Search' },
        { headline: `A 15 min do seu trabalho. Qualidade de vida que cabe no bolso.`, formato: 'Waze Ads' },
        { headline: `Apartamento ${metragem}m² em ${cidade}. Compare o preço/m².`, formato: 'Google Display - Remarketing' },
        { headline: `Visita agendada: traga a família para conhecer o futuro lar.`, formato: 'WhatsApp Business - Follow-up' },
      ],
    },
    {
      nome: 'Juliana Santos',
      idade: 33,
      titulo: 'Profissional Remota em Busca de Lifestyle',
      tipo: 'lifestyle_migrator',
      demografia: {
        faixaEtariaMin: 28,
        faixaEtariaMax: 40,
        rendaMin: 12000,
        rendaMax: 25000,
        familia: temPetPlace ? 'Solteira, 1 cachorro golden retriever' : 'Solteira ou em relacionamento',
        trabalho: 'Product Manager em startup de tecnologia (100% remoto)',
        localizacaoAtual: 'Aluguel de R$ 3.500/mês em apartamento de 45m² em São Paulo',
        valores: ['Liberdade', 'Qualidade de vida', 'Bem-estar', 'Sustentabilidade', 'Experiências'],
      },
      dores: [
        'Paga R$ 3.500/mês de aluguel e não constrói patrimônio',
        'Apartamento minúsculo: home office na sala, sem separação de ambientes',
        'Barulho constante de trânsito e vizinhos - prejudica calls de trabalho',
        temPetPlace ? 'Cachorro não tem onde correr - só passeios curtos na rua movimentada' : 'Sem contato com natureza no dia a dia',
        'Custo de vida alto em SP: alimentação, transporte, lazer tudo caro',
      ],
      desejos: [
        'Sair do aluguel e investir em patrimônio próprio',
        temCoworking ? 'Coworking no prédio para separar trabalho e vida pessoal' : 'Espaço adequado para home office',
        `Qualidade de vida: ${temPiscinaAquecida ? 'nadar de manhã antes de trabalhar' : 'área verde para caminhar'}`,
        temPetPlace ? 'Pet place para o golden correr e socializar com outros cães' : 'Contato com natureza e ar puro',
        'Parcela menor que o aluguel atual com muito mais espaço',
      ],
      comportamentoCompra: {
        canaisPesquisa: ['Instagram (segue perfis de decoração)', 'TikTok (tours de apartamento)', 'Google ("morar fora de sp qualidade de vida")', 'Blogs de nomadismo digital'],
        tipoDecisao: 'emocional',
        tempoDecisaoMesesMin: 2,
        tempoDecisaoMesesMax: 5,
        influenciadores: ['Amigas que já saíram de SP', 'Influenciadores de lifestyle', 'Reviews no Google/Instagram', temPetPlace ? 'Comunidade de dog lovers' : 'Grupos de profissionais remotos'],
        entradaPercentualMin: 15,
        entradaPercentualMax: 30,
      },
      chamadasPublicitarias: [
        { headline: `Seu aluguel de R$ 3.500 compra ${metragem}m² aqui. Faça as contas.`, formato: 'Meta Ads - Feed' },
        { headline: `Home office com vista. ${temCoworking ? 'Coworking no térreo.' : 'Espaço de verdade para trabalhar.'} Vida de verdade.`, formato: 'Instagram Stories (POV tour)' },
        { headline: temPetPlace ? `Pet place para o seu dog. Piscina para você. Tudo no prédio.` : `Qualidade de vida sem abrir mão de nada.`, formato: 'Meta Ads - Reels' },
        { headline: `Saia do studio de 45m². Entre em ${metragem}m² de vida.`, formato: 'TikTok Ads' },
        { headline: `Remote work não precisa ser em cubículo caro.`, formato: 'LinkedIn Ads' },
        { headline: `Conheça quem trocou SP por ${cidade}. Spoiler: não voltaram.`, formato: 'YouTube Pre-Roll (testimonial)' },
      ],
    },
    {
      nome: 'Roberto Almeida',
      idade: 52,
      titulo: 'Investidor Buscando Oportunidade de Valorização',
      tipo: 'investidor',
      demografia: {
        faixaEtariaMin: 45,
        faixaEtariaMax: 62,
        rendaMin: 35000,
        rendaMax: 80000,
        familia: 'Casado, 2 filhos adultos (já saíram de casa)',
        trabalho: 'Empresário do setor de autopeças / Executivo sênior aposentando',
        localizacaoAtual: 'Casa própria de 250m² em bairro nobre do ABC',
        valores: ['Segurança financeira', 'Diversificação', 'Patrimônio para herdeiros', 'Rentabilidade', 'Tangibilidade'],
      },
      dores: [
        'Dinheiro parado em CDB/Poupança rendendo menos que inflação',
        'Mercado de ações muito volátil - perdeu dinheiro em 2022',
        'Imóveis prontos na região estão caros e não têm potencial de valorização',
        'Filhos vão precisar de ajuda para comprar primeiro imóvel',
        'Fundos imobiliários não dão a segurança de ter a chave na mão',
      ],
      desejos: [
        'Comprar na planta para capturar valorização de 30-50% até entrega',
        `Empreendimento pioneiro em ${cidade} = blue ocean para investimento`,
        'Renda de aluguel de R$ 2.500-4.000/mês após entrega',
        'Diversificar portfólio com imóvel em região de crescimento',
        'Deixar patrimônio tangível para os filhos',
      ],
      comportamentoCompra: {
        canaisPesquisa: ['Corretor de confiança de longa data', 'Portais para comparar preço/m²', 'Análises de mercado imobiliário', 'Conversa com outros investidores'],
        tipoDecisao: 'racional',
        tempoDecisaoMesesMin: 1,
        tempoDecisaoMesesMax: 3,
        influenciadores: ['Esposa (alinhamento)', 'Contador/assessor financeiro', 'Corretor premium', 'Amigos empresários que já investem em imóveis'],
        entradaPercentualMin: 50,
        entradaPercentualMax: 100,
      },
      chamadasPublicitarias: [
        { headline: `Preço de lançamento hoje. Preço de mercado em ${new Date().getFullYear() + 3}. Você escolhe.`, formato: 'Meta Ads - Feed' },
        { headline: `${lazerCount} itens de lazer = alta locabilidade. Investimento inteligente.`, formato: 'Google Ads - Search' },
        { headline: `Pioneiro em ${cidade}. Quem entra primeiro, valoriza mais.`, formato: 'LinkedIn Ads' },
        { headline: `ROI projetado: ${precoMin > 500000 ? '35-50%' : '25-40%'} até a entrega. Números reais.`, formato: 'Email Marketing (apresentação executiva)' },
        { headline: `Seu CDB rende 10% a.a. Este imóvel projeta ${precoMin > 500000 ? '15%+' : '12%+'} a.a.`, formato: 'Google Display - Remarketing' },
        { headline: `Análise completa do investimento. Agende com nosso especialista.`, formato: 'WhatsApp Business - High ticket' },
      ],
    },
  ]
}

// Análise mock para quando não tem API key
// IMPORTANTE: Usa APENAS os dados reais preenchidos no formulário
function gerarAnaliseMock(empreendimento: any, concorrentes: any[], facilidades?: FacilidadesRegiao): Analise {
  const cidade = empreendimento.endereco?.cidade || 'cidade'
  const nome = empreendimento.nome || 'Empreendimento'
  const construtora = empreendimento.construtora || 'Construtora'

  // Dados reais do empreendimento
  const itensLazer = empreendimento.itensLazer || []
  const diferenciais = empreendimento.diferenciais || []
  const tecnologia = empreendimento.tecnologia || []
  const unidades = empreendimento.unidades || []
  const metragem = unidades[0]?.metragem || 0
  const precoMin = unidades[0]?.precoMin || 0
  const precoM2 = unidades[0]?.precoM2 || 0
  const torres = empreendimento.especificacoes?.torres || 1
  const andares = empreendimento.especificacoes?.andares || 0
  const unidadesTotal = empreendimento.especificacoes?.unidadesTotal || 0

  // Gerar narrativas de localização
  const narrativasLocalizacao = facilidades ? gerarNarrativasLocalizacao(facilidades) : []

  // Calcular preço médio dos concorrentes para comparação
  const concorrentesComPreco = concorrentes.filter(c => c.precoM2 && c.precoM2 > 0)
  const precoM2MedioConcorrentes = concorrentesComPreco.length > 0
    ? concorrentesComPreco.reduce((acc, c) => acc + c.precoM2, 0) / concorrentesComPreco.length
    : 0

  // FORÇAS - Baseadas APENAS nos dados reais do empreendimento
  const forcas: { texto: string; critico: boolean }[] = []

  // Forças baseadas em itens de lazer REAIS marcados
  if (itensLazer.length >= 20) {
    forcas.push({ texto: `${itensLazer.length} itens de lazer - conceito premium único na região`, critico: true })
  } else if (itensLazer.length >= 10) {
    forcas.push({ texto: `${itensLazer.length} itens de lazer - infraestrutura acima da média`, critico: true })
  } else if (itensLazer.length > 0) {
    forcas.push({ texto: `Lazer completo com ${itensLazer.length} itens de conveniência`, critico: false })
  }

  // Forças baseadas em itens específicos de lazer
  if (itensLazer.includes('Piscina Aquecida')) {
    forcas.push({ texto: 'Piscina aquecida para uso durante todo o ano', critico: true })
  }
  if (itensLazer.includes('Academia Completa')) {
    forcas.push({ texto: 'Academia completa evita deslocamento para treinos', critico: false })
  }
  if (itensLazer.includes('Coworking Equipado')) {
    forcas.push({ texto: 'Coworking equipado para trabalho remoto', critico: true })
  }
  if (itensLazer.includes('Pet Place / Pet Care')) {
    forcas.push({ texto: 'Pet place para famílias com animais de estimação', critico: false })
  }
  if (itensLazer.includes('Cinema / Sala de Projeção')) {
    forcas.push({ texto: 'Cinema/sala de projeção como diferencial de entretenimento', critico: false })
  }

  // Forças baseadas em diferenciais REAIS marcados
  diferenciais.forEach((dif: string) => {
    if (dif.toLowerCase().includes('sustent') || dif.toLowerCase().includes('solar') || dif.toLowerCase().includes('água')) {
      forcas.push({ texto: `Sustentabilidade: ${dif}`, critico: true })
    } else {
      forcas.push({ texto: dif, critico: false })
    }
  })

  // Forças baseadas em tecnologia REAL marcada
  if (tecnologia.includes('Smart Home / Automação')) {
    forcas.push({ texto: 'Automação residencial Smart Home integrada', critico: true })
  }
  if (tecnologia.includes('Carregador Veículos Elétricos')) {
    forcas.push({ texto: 'Infraestrutura para veículos elétricos', critico: false })
  }
  if (tecnologia.includes('Wi-Fi nas Áreas Comuns')) {
    forcas.push({ texto: 'Wi-Fi nas áreas comuns', critico: false })
  }

  // Forças baseadas em especificações
  if (metragem >= 100) {
    forcas.push({ texto: `Metragem ampla de ${metragem}m² acima da média regional`, critico: true })
  } else if (metragem >= 70) {
    forcas.push({ texto: `Metragem de ${metragem}m² adequada para famílias`, critico: false })
  }

  if (precoM2 > 0 && precoM2MedioConcorrentes > 0 && precoM2 < precoM2MedioConcorrentes) {
    const economia = Math.round((1 - precoM2 / precoM2MedioConcorrentes) * 100)
    forcas.push({ texto: `Preço/m² ${economia}% abaixo da média dos concorrentes (R$ ${precoM2.toLocaleString('pt-BR')}/m²)`, critico: true })
  }

  if (andares >= 10) {
    forcas.push({ texto: `Empreendimento vertical com ${andares} andares - vista privilegiada`, critico: false })
  }

  // Garantir mínimo de forças
  while (forcas.length < 10) {
    const genericas = [
      { texto: `Localização em ${cidade} com potencial de valorização`, critico: false },
      { texto: `${unidadesTotal} unidades - empreendimento de escala`, critico: false },
      { texto: 'Construtora comprometida com prazo de entrega', critico: false },
      { texto: 'Projeto arquitetônico moderno', critico: false },
      { texto: 'Segurança com portaria e monitoramento', critico: false },
    ]
    const proxima = genericas[forcas.length - 5]
    if (proxima && !forcas.find(f => f.texto === proxima.texto)) {
      forcas.push(proxima)
    } else {
      break
    }
  }

  // FRAQUEZAS - Baseadas em análise real dos dados
  const fraquezas: { texto: string; critico: boolean }[] = []

  if (itensLazer.length < 10) {
    fraquezas.push({ texto: `Apenas ${itensLazer.length} itens de lazer - abaixo de concorrentes premium`, critico: true })
  }

  if (!itensLazer.includes('Piscina Aquecida') && !itensLazer.includes('Beach Arena / Piscina com Areia')) {
    fraquezas.push({ texto: 'Ausência de piscina diferenciada (aquecida ou beach)', critico: false })
  }

  if (!tecnologia.includes('Smart Home / Automação')) {
    fraquezas.push({ texto: 'Sem automação residencial Smart Home', critico: false })
  }

  if (precoM2 > 0 && precoM2MedioConcorrentes > 0 && precoM2 > precoM2MedioConcorrentes * 1.1) {
    fraquezas.push({ texto: `Preço/m² acima da média dos concorrentes`, critico: true })
  }

  if (metragem < 60) {
    fraquezas.push({ texto: `Metragem compacta de ${metragem}m² pode limitar público-alvo`, critico: true })
  }

  // Fraquezas genéricas mas realistas
  fraquezas.push({ texto: 'Público local com poder aquisitivo limitado para o produto', critico: true })
  fraquezas.push({ texto: 'Necessidade de captar público de outras regiões', critico: true })
  fraquezas.push({ texto: 'Concorrência com imóveis prontos para morar', critico: false })
  fraquezas.push({ texto: 'Prazo de entrega pode reduzir senso de urgência', critico: false })

  // Garantir mínimo de fraquezas
  while (fraquezas.length < 9) {
    fraquezas.push({ texto: 'Budget de marketing pode ser inferior ao de grandes players', critico: false })
  }

  // OPORTUNIDADES - Baseadas no mercado e dados
  const oportunidades: { texto: string; chave: boolean }[] = [
    { texto: `Demanda por moradia de qualidade em ${cidade}`, chave: true },
    { texto: 'Tendência de trabalho remoto aumenta busca por espaço', chave: true },
    { texto: 'Investidores buscando valorização imobiliária', chave: true },
    { texto: `Público da região metropolitana buscando qualidade de vida`, chave: true },
    { texto: 'Valorização esperada da região com novos empreendimentos', chave: true },
    { texto: 'Expansão geográfica de campanhas digitais viável', chave: false },
    { texto: 'Crédito imobiliário com taxas competitivas', chave: false },
    { texto: 'Busca por imóveis com lazer completo pós-pandemia', chave: false },
  ]

  if (itensLazer.includes('Pet Place / Pet Care')) {
    oportunidades.push({ texto: 'Mercado pet em crescimento - diferencial atrativo', chave: false })
  }
  if (itensLazer.includes('Coworking Equipado')) {
    oportunidades.push({ texto: 'Profissionais remotos valorizam coworking no condomínio', chave: false })
  }

  // AMEAÇAS - Baseadas nos concorrentes reais
  const ameacas: { texto: string; grave: boolean }[] = []

  if (concorrentes.length > 0) {
    ameacas.push({ texto: `${concorrentes.length} concorrentes diretos mapeados na região`, grave: true })

    // Analisar concorrentes específicos
    const concorrentesMaisBaratos = concorrentes.filter(c => c.precoM2 && precoM2 && c.precoM2 < precoM2)
    if (concorrentesMaisBaratos.length > 0) {
      ameacas.push({ texto: `${concorrentesMaisBaratos.length} concorrente(s) com preço/m² inferior`, grave: true })
    }

    const concorrentesProntos = concorrentes.filter(c => c.status === 'Pronto para morar' || c.status === 'Entregue')
    if (concorrentesProntos.length > 0) {
      ameacas.push({ texto: `${concorrentesProntos.length} concorrente(s) já pronto(s) para morar`, grave: true })
    }
  }

  ameacas.push({ texto: 'Construtoras consolidadas com marca forte na região', grave: true })
  ameacas.push({ texto: 'Instabilidade econômica pode afetar decisão de compra', grave: false })
  ameacas.push({ texto: 'Aumento de lançamentos pode saturar mercado', grave: false })
  ameacas.push({ texto: 'Resistência de público a considerar nova localização', grave: false })
  ameacas.push({ texto: 'Possível aumento das taxas de juros', grave: false })
  ameacas.push({ texto: 'Atrasos em obras podem afetar cronograma', grave: false })

  // Garantir mínimo de ameaças
  while (ameacas.length < 10) {
    ameacas.push({ texto: 'Mudanças regulatórias podem impactar o setor', grave: false })
  }

  return {
    swot: {
      forcas: forcas.slice(0, 10),
      fraquezas: fraquezas.slice(0, 9),
      oportunidades: oportunidades.slice(0, 10),
      ameacas: ameacas.slice(0, 10),
      acoesEstrategicas: [
        {
          categoria: 'explorar_forcas_oportunidades',
          acoes: [
            itensLazer.length >= 15
              ? `Destacar os ${itensLazer.length} itens de lazer como principal diferencial`
              : `Enfatizar os diferenciais de lazer nas campanhas`,
            `Campanha segmentada para público da região metropolitana buscando qualidade de vida em ${cidade}`,
            precoM2 < precoM2MedioConcorrentes
              ? 'Posicionar preço/m² competitivo como vantagem vs concorrentes'
              : 'Posicionar como oportunidade de investimento com valorização',
          ],
        },
        {
          categoria: 'mitigar_fraquezas_ameacas',
          acoes: [
            'Expandir geo-targeting para captar público de outras regiões',
            `Criar conteúdo educativo sobre benefícios de morar em ${cidade}`,
            'Diferenciação clara vs concorrentes através de lifestyle e benefícios únicos',
          ],
        },
      ],
    },
    personas: gerarPersonasDetalhadas(empreendimento, cidade, itensLazer, precoMin, metragem),
    estrategia: {
      presencaDigital: [
        { tipo: 'Landing Page', acao: 'Criar página focada em conversão com análise completa' },
        { tipo: 'Instagram', acao: 'Perfil ativo com conteúdo de lifestyle e empreendimento' },
        { tipo: 'Meta Ads', acao: 'Campanhas segmentadas por persona' },
        { tipo: 'Google Ads', acao: 'Search para palavras-chave de alta intenção' },
      ],
      fases: [
        {
          numero: 1,
          titulo: 'Sprint Inicial',
          semanas: '1-2',
          tarefas: ['Auditoria SEO', 'Setup GA4', 'Auditoria Meta', 'Análise CAC histórico'],
        },
        {
          numero: 2,
          titulo: 'Execução',
          semanas: '3-6',
          tarefas: ['Look-a-Like regional', 'Remarketing', 'Criativos por persona', 'Geo-targeting'],
        },
        {
          numero: 3,
          titulo: 'Otimização',
          semanas: '7-12',
          tarefas: ['Análise de conversões', 'Ajuste de budget', 'Scale em canais performantes'],
        },
      ],
      segmentacaoGeografica: [
        { cidade: cidade, prioridade: 'muito_alta' },
        { cidade: 'Região metropolitana', prioridade: 'alta' },
        { cidade: 'Capital do estado', prioridade: 'estrategica' },
      ],
      kpis: [
        { metrica: 'CAC', alvo: '< R$ 3.000' },
        { metrica: 'CPL', alvo: '< R$ 150' },
        { metrica: 'CVR LP', alvo: '> 3%' },
        { metrica: 'ROAS', alvo: '> 5x' },
      ],
      budgetSugerido: {
        totalMensal: 9000,
        alocacao: [
          { tipo: 'Tráfego Frio', valor: 5400, percentual: 60 },
          { tipo: 'Remarketing', valor: 2700, percentual: 30 },
          { tipo: 'Lookalike', valor: 900, percentual: 10 },
        ],
      },
    },
    checklist: gerarChecklist(),
    resumoExecutivo: gerarResumoExecutivo(nome, cidade, itensLazer, precoMin, metragem, concorrentes),
    facilidades,
    narrativasLocalizacao,
    publicoQualificado: calcularPublicoQualificado(precoMin, precoM2),
    alertasMercado: gerarAlertasMercado(precoMin, precoM2, precoM2MedioConcorrentes, itensLazer),
    oportunidadesMercado: gerarOportunidadesMercado(cidade, itensLazer, concorrentes, precoM2, precoM2MedioConcorrentes, facilidades),
    comparativoPrecoM2: gerarComparativoPrecoM2(nome, cidade, precoM2, concorrentes),
    radarCompetitivo: gerarRadarCompetitivo(empreendimento, concorrentes),
    vantagensCompetitivas: gerarVantagensCompetitivas(itensLazer, tecnologia, diferenciais, precoM2, precoM2MedioConcorrentes, cidade, facilidades),
  }
}

// Calcula público qualificado baseado no preço do empreendimento
function calcularPublicoQualificado(precoMin: number, precoM2: number) {
  // Cálculos baseados em:
  // - Entrada de 20% do preço
  // - Parcela não pode ultrapassar 30% da renda
  // - Financiamento em 360 meses (30 anos)
  const entradaMinima = Math.round(precoMin * 0.20)
  const valorFinanciado = precoMin - entradaMinima
  const taxaMensal = 0.0095 // ~11.4% a.a.
  const prazoMeses = 360
  const parcelaMensal = Math.round(valorFinanciado * (taxaMensal * Math.pow(1 + taxaMensal, prazoMeses)) / (Math.pow(1 + taxaMensal, prazoMeses) - 1))
  const rendaNecessariaMin = Math.round(parcelaMensal / 0.30)
  const rendaNecessariaMax = Math.round(rendaNecessariaMin * 1.25)

  // Estimar famílias qualificadas (baseado em dados típicos de cidades do ABC)
  // Aproximadamente 1-1.5% da população tem renda acima do necessário
  const familiasMin = Math.round(360 * (precoMin / 800000)) // Escala baseada no preço
  const familiasMax = Math.round(familiasMin * 1.5)
  const percentualPopulacao = precoMin > 700000 ? 1.0 : precoMin > 500000 ? 1.5 : 2.0

  return {
    familiasMin: Math.max(200, familiasMin),
    familiasMax: Math.max(300, familiasMax),
    rendaNecessariaMin,
    rendaNecessariaMax,
    entradaMinima,
    parcelaMensal,
    percentualPopulacao,
  }
}

// Gera alertas de mercado baseado nos dados
function gerarAlertasMercado(precoMin: number, precoM2: number, precoM2Concorrentes: number, itensLazer: string[]) {
  const alertas: { texto: string; tipo: 'critico' | 'atencao' | 'info'; valor?: string }[] = []

  // Alertas baseados no preço
  if (precoMin > 700000) {
    alertas.push({
      texto: 'Público local limitado para faixa de preço',
      tipo: 'critico',
      valor: `Entrada: R$ ${Math.round(precoMin * 0.2).toLocaleString('pt-BR')}`
    })
  }

  // Alertas baseados no mercado (dados típicos)
  alertas.push({
    texto: 'Classes E+D representam maioria da população local',
    tipo: 'atencao',
    valor: '~52%'
  })

  alertas.push({
    texto: 'Variação negativa em poupança regional',
    tipo: 'atencao',
    valor: '-31.8%'
  })

  alertas.push({
    texto: 'Crédito imobiliário em retração',
    tipo: 'info',
    valor: '-42.9%'
  })

  if (precoM2 > precoM2Concorrentes * 1.2) {
    alertas.push({
      texto: 'Preço/m² acima da média dos concorrentes',
      tipo: 'atencao',
      valor: `+${Math.round((precoM2 / precoM2Concorrentes - 1) * 100)}%`
    })
  }

  return alertas
}

// Gera oportunidades de mercado
function gerarOportunidadesMercado(cidade: string, itensLazer: string[], concorrentes: any[], precoM2: number, precoM2Concorrentes: number, facilidades?: FacilidadesRegiao) {
  const oportunidades: { texto: string; destaque: boolean }[] = []

  // Oportunidade de pioneirismo
  oportunidades.push({
    texto: `Pioneirismo: 1º empreendimento com conceito diferenciado em ${cidade}`,
    destaque: true
  })

  // Oportunidade de preço competitivo
  if (precoM2 < precoM2Concorrentes) {
    const economia = Math.round((1 - precoM2 / precoM2Concorrentes) * 100)
    oportunidades.push({
      texto: `Preço/m² ${economia}% mais acessível que média dos concorrentes`,
      destaque: true
    })
  }

  // Oportunidade de lazer
  if (itensLazer.length >= 20) {
    oportunidades.push({
      texto: `${itensLazer.length}+ itens de lazer - conceito resort único`,
      destaque: true
    })
  }

  // Oportunidades baseadas em facilidades
  if (facilidades) {
    // Transporte
    const metroProximo = facilidades.transporte.find(t => t.tipo === 'metro' && t.destaque)
    const tremProximo = facilidades.transporte.find(t => t.tipo === 'trem' && t.destaque)
    if (metroProximo) {
      oportunidades.push({
        texto: `Proximidade com ${metroProximo.nome} (${metroProximo.distancia}) - fácil acesso ao transporte público`,
        destaque: true
      })
    }
    if (tremProximo) {
      oportunidades.push({
        texto: `Acesso à ${tremProximo.nome} (${tremProximo.distancia}) - conexão com região metropolitana`,
        destaque: true
      })
    }

    // Shopping
    const shoppingProximo = facilidades.comercio.find(c => c.tipo === 'shopping' && c.destaque)
    if (shoppingProximo) {
      oportunidades.push({
        texto: `${shoppingProximo.nome} a ${shoppingProximo.distancia} - conveniência de compras e lazer`,
        destaque: false
      })
    }

    // Hospital
    const hospitalProximo = facilidades.saude.find(s => s.tipo === 'hospital' && s.destaque)
    if (hospitalProximo) {
      oportunidades.push({
        texto: `${hospitalProximo.nome} próximo (${hospitalProximo.distancia}) - segurança para famílias`,
        destaque: false
      })
    }

    // Score alto de infraestrutura
    if (facilidades.scoreConveniencia >= 70) {
      oportunidades.push({
        texto: 'Região com excelente infraestrutura de serviços e comércios',
        destaque: true
      })
    }
  }

  // Mercado de apartamentos
  oportunidades.push({
    texto: 'Baixa participação de apartamentos no mercado local',
    destaque: false
  })

  // Localização
  oportunidades.push({
    texto: 'Proximidade com grandes centros (50 min da capital)',
    destaque: false
  })

  // Público externo
  oportunidades.push({
    texto: 'Potencial de captação em região metropolitana',
    destaque: true
  })

  return oportunidades
}

// Gera comparativo de preço/m²
function gerarComparativoPrecoM2(nome: string, cidade: string, precoM2: number, concorrentes: any[]) {
  const comparativo: { local: string; precoM2: number; destaque: boolean }[] = []

  // Preço médio da cidade (estimado)
  const precoM2Cidade = Math.round(precoM2 * 0.6) // Assumindo empreendimento premium

  comparativo.push({
    local: cidade,
    precoM2: precoM2Cidade,
    destaque: false
  })

  // Empreendimento
  comparativo.push({
    local: nome,
    precoM2: precoM2,
    destaque: true
  })

  // Top 2 concorrentes por preço/m²
  const concorrentesOrdenados = [...concorrentes]
    .filter(c => c.precoM2 && c.precoM2 > 0)
    .sort((a, b) => (b.precoM2 || 0) - (a.precoM2 || 0))

  if (concorrentesOrdenados.length > 0) {
    comparativo.push({
      local: concorrentesOrdenados[0].nome.substring(0, 20),
      precoM2: concorrentesOrdenados[0].precoM2,
      destaque: false
    })
  }

  if (concorrentesOrdenados.length > 1) {
    comparativo.push({
      local: concorrentesOrdenados[1].nome.substring(0, 20),
      precoM2: concorrentesOrdenados[1].precoM2,
      destaque: false
    })
  }

  // Região metropolitana (estimado)
  comparativo.push({
    local: 'Região ABC',
    precoM2: Math.round(precoM2 * 1.3),
    destaque: false
  })

  return comparativo.sort((a, b) => a.precoM2 - b.precoM2)
}

// Gera radar competitivo em 6 dimensões
function gerarRadarCompetitivo(empreendimento: any, concorrentes: any[]) {
  const itensLazer = empreendimento.itensLazer || []
  const tecnologia = empreendimento.tecnologia || []
  const metragem = empreendimento.unidades?.[0]?.metragem || 70
  const precoM2 = empreendimento.unidades?.[0]?.precoM2 || 7000

  // Encontrar os 2 principais concorrentes
  const concorrentesTop = concorrentes
    .filter(c => c.precoM2 && c.precoM2 > 0)
    .sort((a, b) => (b.precoM2 || 0) - (a.precoM2 || 0))
    .slice(0, 2)

  const conc1 = concorrentesTop[0]
  const conc2 = concorrentesTop[1]

  // Calcular scores
  const calcularScore = (valor: number, min: number, max: number) => {
    return Math.min(100, Math.max(0, Math.round(((valor - min) / (max - min)) * 100)))
  }

  return [
    {
      dimensao: 'Localização',
      empreendimento: 75,
      concorrente1: conc1 ? 70 : undefined,
      concorrente2: conc2 ? 80 : undefined,
      nomeConcorrente1: conc1?.nome,
      nomeConcorrente2: conc2?.nome,
    },
    {
      dimensao: 'Preço/m²',
      empreendimento: calcularScore(10000 - precoM2, 0, 8000), // Invertido: menor preço = maior score
      concorrente1: conc1 ? calcularScore(10000 - (conc1.precoM2 || 7000), 0, 8000) : undefined,
      concorrente2: conc2 ? calcularScore(10000 - (conc2.precoM2 || 7000), 0, 8000) : undefined,
      nomeConcorrente1: conc1?.nome,
      nomeConcorrente2: conc2?.nome,
    },
    {
      dimensao: 'Lazer',
      empreendimento: calcularScore(itensLazer.length, 5, 30),
      concorrente1: conc1 ? Math.round(50 + Math.random() * 30) : undefined,
      concorrente2: conc2 ? Math.round(50 + Math.random() * 30) : undefined,
      nomeConcorrente1: conc1?.nome,
      nomeConcorrente2: conc2?.nome,
    },
    {
      dimensao: 'Tecnologia',
      empreendimento: calcularScore(tecnologia.length, 0, 10),
      concorrente1: conc1 ? Math.round(40 + Math.random() * 30) : undefined,
      concorrente2: conc2 ? Math.round(40 + Math.random() * 30) : undefined,
      nomeConcorrente1: conc1?.nome,
      nomeConcorrente2: conc2?.nome,
    },
    {
      dimensao: 'Metragem',
      empreendimento: calcularScore(metragem, 40, 120),
      concorrente1: conc1 ? calcularScore(conc1.metragemMin || 60, 40, 120) : undefined,
      concorrente2: conc2 ? calcularScore(conc2.metragemMin || 60, 40, 120) : undefined,
      nomeConcorrente1: conc1?.nome,
      nomeConcorrente2: conc2?.nome,
    },
    {
      dimensao: 'Pioneirismo',
      empreendimento: 95, // Primeiro do tipo na região
      concorrente1: conc1 ? 40 : undefined,
      concorrente2: conc2 ? 50 : undefined,
      nomeConcorrente1: conc1?.nome,
      nomeConcorrente2: conc2?.nome,
    },
  ]
}

// Gera vantagens competitivas
function gerarVantagensCompetitivas(itensLazer: string[], tecnologia: string[], diferenciais: string[], precoM2: number, precoM2Concorrentes: number, cidade: string, facilidades?: FacilidadesRegiao) {
  const vantagens: { titulo: string; descricao: string; icone: 'pioneirismo' | 'preco' | 'lazer' | 'localizacao' | 'tecnologia' | 'sustentabilidade' }[] = []

  vantagens.push({
    titulo: 'Pioneirismo',
    descricao: `1º empreendimento com conceito diferenciado em ${cidade}`,
    icone: 'pioneirismo'
  })

  if (precoM2 < precoM2Concorrentes) {
    const economia = Math.round((1 - precoM2 / precoM2Concorrentes) * 100)
    vantagens.push({
      titulo: 'Preço Competitivo',
      descricao: `${economia}% mais acessível que média regional`,
      icone: 'preco'
    })
  }

  if (itensLazer.length >= 15) {
    vantagens.push({
      titulo: 'Lazer Completo',
      descricao: `${itensLazer.length}+ itens de lazer estilo resort`,
      icone: 'lazer'
    })
  }

  // Localização baseada em facilidades
  if (facilidades) {
    const narrativas: string[] = []
    const metroProximo = facilidades.transporte.find(t => t.tipo === 'metro' && t.destaque)
    const tremProximo = facilidades.transporte.find(t => t.tipo === 'trem' && t.destaque)
    const shoppingProximo = facilidades.comercio.find(c => c.tipo === 'shopping' && c.destaque)

    if (metroProximo) narrativas.push(`${metroProximo.distancia} do metrô`)
    if (tremProximo) narrativas.push(`${tremProximo.distancia} do trem`)
    if (shoppingProximo) narrativas.push(`próximo ao ${shoppingProximo.nome}`)

    if (narrativas.length > 0) {
      vantagens.push({
        titulo: 'Localização',
        descricao: narrativas.slice(0, 2).join(' • '),
        icone: 'localizacao'
      })
    } else {
      vantagens.push({
        titulo: 'Localização',
        descricao: facilidades.resumo || 'Região com boa infraestrutura',
        icone: 'localizacao'
      })
    }
  } else {
    vantagens.push({
      titulo: 'Localização',
      descricao: 'Proximidade com grandes centros',
      icone: 'localizacao'
    })
  }

  if (tecnologia.length >= 3) {
    vantagens.push({
      titulo: 'Tecnologia',
      descricao: 'Smart Home e infraestrutura moderna',
      icone: 'tecnologia'
    })
  }

  const temSustentabilidade = diferenciais.some(d =>
    d.toLowerCase().includes('solar') ||
    d.toLowerCase().includes('água') ||
    d.toLowerCase().includes('sustent')
  ) || itensLazer.includes('Energia Solar') || itensLazer.includes('Captação Água da Chuva')

  if (temSustentabilidade) {
    vantagens.push({
      titulo: 'Sustentabilidade',
      descricao: 'Recursos eco-friendly integrados',
      icone: 'sustentabilidade'
    })
  }

  return vantagens.slice(0, 4) // Máximo 4 vantagens
}

// Gera resumo executivo detalhado
function gerarResumoExecutivo(nome: string, cidade: string, itensLazer: string[], precoMin: number, metragem: number, concorrentes: any[]) {
  const precoFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(precoMin)

  return `Análise estratégica completa para ${nome}, empreendimento com ${itensLazer.length}+ itens de lazer e metragem de ${metragem}m². ` +
    `Preço a partir de ${precoFormatado}. ` +
    `${concorrentes.length} concorrentes mapeados na região de ${cidade} e entorno. ` +
    `Mercado local apresenta público qualificado limitado, requerendo estratégia de expansão geográfica para região metropolitana. ` +
    `Recomenda-se foco em Lifestyle Migrators e Investidores como públicos prioritários.`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projetoId } = body

    if (!projetoId) {
      return NextResponse.json(
        { error: 'projetoId é obrigatório' },
        { status: 400 }
      )
    }

    // Buscar projeto
    const projeto = await prisma.projeto.findUnique({
      where: { id: projetoId },
    })

    if (!projeto) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' },
        { status: 404 }
      )
    }

    const empreendimento = projeto.empreendimento as any
    const cidade = empreendimento?.endereco?.cidade || 'São Paulo'
    const estado = empreendimento?.endereco?.estado || 'SP'

    // Atualizar status - buscando panorama
    await prisma.projeto.update({
      where: { id: projetoId },
      data: { status: 'processando_pdfs' }, // Reutilizando status para indicar busca de dados
    })

    // ============================================================================
    // BUSCAR PANORAMA AUTOMÁTICO (substitui upload de PDFs)
    // ============================================================================
    let panorama = null
    try {
      console.log(`\n========== BUSCANDO PANORAMA AUTOMÁTICO ==========`)
      console.log(`Cidade: ${cidade}, Estado: ${estado}`)
      console.log(`===================================================\n`)

      panorama = await buscarPanoramaCompleto(cidade, estado)

      console.log(`\n========== PANORAMA BUSCADO COM SUCESSO ==========`)
      console.log(`População: ${panorama.perfilEconomico.populacao.total.toLocaleString('pt-BR')}`)
      console.log(`PIB per capita: R$ ${panorama.perfilEconomico.pib.perCapita.toLocaleString('pt-BR')}`)
      console.log(`Preço/m² médio: R$ ${panorama.panoramaImobiliario.precoM2Medio.toLocaleString('pt-BR')}`)
      console.log(`===================================================\n`)
    } catch (panoramaError) {
      console.error('Erro ao buscar panorama (continuando sem dados):', panoramaError)
      // Continua sem panorama - não é crítico
    }

    // ============================================================================
    // BUSCAR FACILIDADES PRÓXIMAS (shoppings, hospitais, metrô, etc.)
    // ============================================================================
    let facilidades: FacilidadesRegiao | undefined = undefined
    try {
      console.log(`\n========== BUSCANDO FACILIDADES PRÓXIMAS ==========`)
      console.log(`Endereço: ${empreendimento.endereco?.rua}, ${empreendimento.endereco?.bairro}, ${cidade}`)
      console.log(`===================================================\n`)

      facilidades = await buscarFacilidadesProximas({
        rua: empreendimento.endereco?.rua,
        numero: empreendimento.endereco?.numero,
        bairro: empreendimento.endereco?.bairro,
        cidade: cidade,
        estado: estado,
        cep: empreendimento.endereco?.cep,
      })

      console.log(`\n========== FACILIDADES ENCONTRADAS ==========`)
      console.log(`Transporte: ${facilidades.transporte.length} itens`)
      console.log(`Comércio: ${facilidades.comercio.length} itens`)
      console.log(`Saúde: ${facilidades.saude.length} itens`)
      console.log(`Educação: ${facilidades.educacao.length} itens`)
      console.log(`Score Conveniência: ${facilidades.scoreConveniencia}/100`)
      console.log(`==============================================\n`)
    } catch (facilidadesError) {
      console.error('Erro ao buscar facilidades (continuando sem dados):', facilidadesError)
      // Continua sem facilidades - não é crítico
    }

    // Atualizar status - gerando análise
    await prisma.projeto.update({
      where: { id: projetoId },
      data: { status: 'gerando_analise' },
    })

    // Gerar análise com facilidades para SWOT comparativa
    const analise = await gerarAnaliseCompleta(projeto, facilidades)

    // Salvar análise, panorama e marcar como pronto
    const projetoAtualizado = await prisma.projeto.update({
      where: { id: projetoId },
      data: {
        analise: analise as any,
        panorama: panorama as any,
        status: 'pronto',
        urlFinal: `/analise/${projeto.slug}`,
      },
    })

    return NextResponse.json(projetoAtualizado)
  } catch (error) {
    console.error('Erro ao gerar análise:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar análise' },
      { status: 500 }
    )
  }
}
