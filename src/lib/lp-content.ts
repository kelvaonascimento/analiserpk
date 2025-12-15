// Conteúdo centralizado para Landing Pages segmentadas

export type Persona = 'ceo' | 'marketing' | 'comercial'
export type Abordagem = 'racional' | 'emocional' | 'urgencia' | 'ebook'

export interface PersonaContent {
  slug: Persona
  titulo: string
  subtitulo: string
  icone: string
  cor: string
  dores: string[]
  argumentos: string[]
  ctaTexto: string
  testimonial: {
    texto: string
    autor: string
    cargo: string
  }
}

export interface AbordagemContent {
  slug: Abordagem
  titulo: string
  subtitulo: string
  descricao: string
  icone: string
  cor: string
  corGradient: string
  badge: string
}

// Conteúdo por Persona
export const PERSONAS: Record<Persona, PersonaContent> = {
  ceo: {
    slug: 'ceo',
    titulo: 'CEOs e Diretores',
    subtitulo: 'Decisões estratégicas baseadas em dados',
    icone: 'Crown',
    cor: 'amber',
    dores: [
      'Decisões de investimento sem dados confiáveis',
      'Dependência de consultorias caras e demoradas',
      'Risco de lançamentos mal posicionados',
      'Falta de visão macro do mercado regional',
      'Concorrentes chegando primeiro com melhores estratégias',
    ],
    argumentos: [
      'Reduza o risco de investimento com dados reais de mercado',
      'Tome decisões em horas, não semanas',
      'Economize até R$ 50.000 em consultorias tradicionais',
      'Tenha vantagem competitiva com IA exclusiva',
      'ROI comprovado em mais de 50 incorporadoras',
    ],
    ctaTexto: 'Solicitar Análise Estratégica',
    testimonial: {
      texto: 'O diagnóstico nos deu clareza para aprovar o projeto com confiança. Dados que antes levaríamos meses para obter.',
      autor: 'Ricardo Mendes',
      cargo: 'CEO - Incorporadora ABC',
    },
  },
  marketing: {
    slug: 'marketing',
    titulo: 'Gerentes de Marketing',
    subtitulo: 'Campanhas que convertem de verdade',
    icone: 'Megaphone',
    cor: 'purple',
    dores: [
      'Briefings incompletos da diretoria',
      'Campanhas que não convertem leads qualificados',
      'Falta de dados para segmentação precisa',
      'Personas baseadas em achismos, não dados',
      'Budget desperdiçado em canais errados',
    ],
    argumentos: [
      '3 personas detalhadas prontas para campanhas',
      '18 chamadas publicitárias testadas e validadas',
      'Segmentação geográfica com dados IBGE reais',
      'Budget sugerido por fase de campanha',
      'KPIs de referência do mercado imobiliário',
    ],
    ctaTexto: 'Gerar Minhas Personas',
    testimonial: {
      texto: 'As personas vieram tão completas que economizamos 2 semanas de pesquisa. As chamadas publicitárias já estamos usando!',
      autor: 'Camila Torres',
      cargo: 'Gerente de Marketing - Construtora XYZ',
    },
  },
  comercial: {
    slug: 'comercial',
    titulo: 'Gerentes Comerciais',
    subtitulo: 'Venda mais com argumentos certeiros',
    icone: 'Handshake',
    cor: 'green',
    dores: [
      'Perder vendas para concorrentes por falta de argumentos',
      'Objeções de preço sem dados para rebater',
      'Desconhecer diferenciais reais do produto',
      'Equipe de vendas sem material de apoio',
      'Clientes mais informados que os corretores',
    ],
    argumentos: [
      'Mapeamento completo de todos os concorrentes da região',
      'Comparativo de preço/m² com fundamentação',
      'Argumentário de vendas baseado em dados reais',
      'Análise SWOT para treinar equipe',
      'Vantagens competitivas documentadas',
    ],
    ctaTexto: 'Mapear Meus Concorrentes',
    testimonial: {
      texto: 'Com o comparativo de concorrentes, nossa equipe fechou 23% mais vendas no primeiro mês.',
      autor: 'Fernando Silva',
      cargo: 'Diretor Comercial - Incorporadora DEF',
    },
  },
}

// Conteúdo por Abordagem
export const ABORDAGENS: Record<Abordagem, AbordagemContent> = {
  racional: {
    slug: 'racional',
    titulo: 'Racional & Direto',
    subtitulo: 'Dados, números e ROI comprovado',
    descricao: 'Para quem decide com métricas e quer ver os números antes de agir',
    icone: 'BarChart3',
    cor: 'amber',
    corGradient: 'from-amber-500/20 to-orange-500/20',
    badge: 'BASEADO EM DADOS',
  },
  emocional: {
    slug: 'emocional',
    titulo: 'Histórias & Transformação',
    subtitulo: 'Cases reais de sucesso',
    descricao: 'Para quem quer ver resultados reais e histórias de transformação',
    icone: 'Heart',
    cor: 'purple',
    corGradient: 'from-purple-500/20 to-pink-500/20',
    badge: 'CASOS REAIS',
  },
  urgencia: {
    slug: 'urgencia',
    titulo: '72h para Resultados',
    subtitulo: 'Diagnóstico completo em 72 horas',
    descricao: 'Para quem precisa agir rápido e quer resultados imediatos',
    icone: 'Clock',
    cor: 'red',
    corGradient: 'from-red-500/20 to-orange-500/20',
    badge: 'VAGAS LIMITADAS',
  },
  ebook: {
    slug: 'ebook',
    titulo: 'Metodologia Gratuita',
    subtitulo: 'PDF completo para download',
    descricao: 'Aprenda nossa metodologia completa de análise de mercado',
    icone: 'BookOpen',
    cor: 'green',
    corGradient: 'from-green-500/20 to-emerald-500/20',
    badge: '100% GRÁTIS',
  },
}

// Métricas da RPK (compartilhadas)
export const METRICAS = [
  { valor: 'R$ 700M+', label: 'em VGV Lançados' },
  { valor: '50+', label: 'Construtoras Atendidas' },
  { valor: '200+', label: 'Análises Geradas' },
  { valor: '8 anos', label: 'de Mercado' },
]

// Conteúdo específico da LP Racional
export const LP_RACIONAL = {
  hero: {
    badge: 'DECISÕES BASEADAS EM DADOS',
    titulo: 'ROI Comprovado em Diagnósticos de Mercado',
    subtitulo: 'Economize semanas de pesquisa e dezenas de milhares de reais com análises precisas geradas por IA',
  },
  metricas: [
    { valor: '95%', label: 'Tempo economizado vs pesquisa manual' },
    { valor: 'R$ 50k', label: 'Economia média vs consultoria' },
    { valor: '95%+', label: 'Precisão em identificação de concorrentes' },
  ],
  pilares: [
    { titulo: 'Dados Demográficos', descricao: 'População, renda, PIB e crescimento da região com dados IBGE atualizados' },
    { titulo: 'Análise Econômica', descricao: 'Emprego formal, salário médio e tendências do CAGED e Banco Central' },
    { titulo: 'Mapeamento de Mercado', descricao: 'Todos os concorrentes mapeados com preços, metragem e diferenciais' },
    { titulo: 'Estratégia Completa', descricao: 'SWOT, personas, plano de marketing e argumentário de vendas' },
  ],
  fontes: ['IBGE Cidades', 'CAGED/MTE', 'Banco Central', 'Portais Imobiliários', 'Prefeituras', 'Cartórios', 'SECOVI', 'CBIC'],
  comparativo: {
    titulo: 'Comparativo de Investimento',
    tradicional: [
      'Prazo de 4-6 semanas para entrega',
      'Investimento de R$ 30.000 a R$ 80.000',
      'Apenas 1 relatório estático em PDF',
      'Atualizações manuais com custo extra',
      'Máximo de 5-10 concorrentes mapeados',
    ],
    rpk: [
      'Diagnóstico completo em até 72 horas',
      'Gratuito durante o período beta',
      'Análise dinâmica + SWOT + Personas + Marketing',
      'Dados atualizados automaticamente',
      'Todos os concorrentes da região via IA',
    ],
  },
  entregaveis: [
    { titulo: 'Perfil Econômico', descricao: 'Dados completos de população, renda, PIB e emprego' },
    { titulo: 'Panorama de Mercado', descricao: 'Análise do setor imobiliário na região' },
    { titulo: 'Mapeamento de Concorrentes', descricao: 'Todos os empreendimentos com preços e diferenciais' },
    { titulo: 'Análise SWOT', descricao: '40+ pontos estratégicos do seu empreendimento' },
    { titulo: '3 Personas Detalhadas', descricao: 'Perfis completos do seu público-alvo' },
    { titulo: 'Plano de Marketing', descricao: '4 fases com KPIs e budget sugerido' },
    { titulo: '18 Chamadas Publicitárias', descricao: 'Textos prontos para suas campanhas' },
    { titulo: 'Argumentário de Vendas', descricao: 'Respostas para objeções comuns' },
    { titulo: 'Comparativo de Preços', descricao: 'Análise detalhada de preço/m²' },
  ],
  faq: [
    {
      pergunta: 'De onde vêm os dados utilizados?',
      resposta: 'Utilizamos fontes oficiais como IBGE, CAGED, BCB, além de web scraping inteligente para dados de mercado imobiliário em tempo real.',
    },
    {
      pergunta: 'Qual a precisão do mapeamento de concorrentes?',
      resposta: 'Nossa IA identifica mais de 95% dos empreendimentos concorrentes na região, com dados de preço, metragem e status atualizados.',
    },
    {
      pergunta: 'Como funciona o cálculo de público qualificado?',
      resposta: 'Cruzamos dados de renda média da região com o valor do imóvel para calcular quantas famílias têm capacidade de compra real.',
    },
    {
      pergunta: 'Posso usar os dados em apresentações?',
      resposta: 'Sim! Todos os dados vêm com fonte citada e podem ser utilizados em materiais comerciais, apresentações para diretoria e campanhas.',
    },
  ],
}

// Conteúdo específico da LP Emocional
export const LP_EMOCIONAL = {
  hero: {
    badge: 'SUA HISTÓRIA PODE SER DIFERENTE',
    titulo: 'Chega de Lançamentos que Não Vendem',
    subtitulo: 'Descubra como incorporadoras como a sua transformaram dados em vendas recordes',
  },
  aDor: {
    titulo: 'Você conhece essa história?',
    historia: 'Um empreendimento planejado durante meses. Milhões investidos em terreno, projeto e marketing. O dia do lançamento chega... e as vendas não acontecem. Os meses passam, as unidades encalham, e a pergunta que não cala: onde erramos?',
    consequencias: [
      'Estoque parado drenando caixa da empresa',
      'Equipe comercial desmotivada sem argumentos',
      'Pressão do board por resultados que não vêm',
      'Concorrentes vendendo mais com produtos similares',
    ],
  },
  jornada: [
    { fase: 'Antes', titulo: 'No escuro', descricao: 'Decisões baseadas em feeling, consultorias caras e lentas, surpresas com a concorrência' },
    { fase: 'Descoberta', titulo: 'A virada', descricao: 'Você descobre que existe uma forma de ter dados reais em horas, não semanas' },
    { fase: 'Implementação', titulo: 'Ação com dados', descricao: 'Personas definidas, concorrentes mapeados, estratégia clara' },
    { fase: 'Resultado', titulo: 'Sucesso comprovado', descricao: 'Vendas acima da meta, equipe confiante, decisões certeiras' },
  ],
  depoimentos: [
    { texto: 'O diagnóstico revelou um público que nem sabíamos que existia. Ajustamos a campanha e as vendas decolaram.', nome: 'Mariana Santos', cargo: 'Diretora de Marketing - MRV Regional', resultado: '+47% nas vendas' },
    { texto: 'Estávamos prestes a errar o preço em R$ 50 mil por unidade. Os dados mostraram o caminho certo.', nome: 'Roberto Almeida', cargo: 'CEO - Construtora Horizonte', resultado: 'R$ 3M salvos' },
    { texto: 'Em 3 dias tínhamos o que consultorias levariam 2 meses para entregar. E de graça.', nome: 'Fernanda Costa', cargo: 'Gerente Comercial - Patrimar', resultado: '72h para análise' },
  ],
  revelacao: {
    titulo: 'Descobrimos algo que muda tudo',
    texto: '80% dos lançamentos que fracassam têm uma coisa em comum: falta de dados reais sobre o público e a concorrência. Não é falta de qualidade do produto. É falta de informação.',
    estatisticas: [
      { valor: '80%', label: 'fracassam por falta de dados' },
      { valor: '3x', label: 'mais sucesso com análise' },
      { valor: '40%', label: 'não atingem metas no 1º ano' },
    ],
  },
  garantias: [
    { titulo: '100% Gratuito', descricao: 'Sem cartão de crédito, sem compromisso, sem letras miúdas' },
    { titulo: 'Dados Reais', descricao: 'Fontes oficiais como IBGE, CAGED e Banco Central' },
    { titulo: 'Sem Spam', descricao: 'Seus dados são usados apenas para gerar sua análise' },
  ],
  transformacao: {
    antes: [
      'Semanas esperando relatórios de consultoria',
      'Decisões baseadas em feeling e experiência',
      'Campanhas genéricas sem segmentação',
      'Surpresas com concorrentes desconhecidos',
    ],
    depois: [
      'Análise completa em 72 horas',
      'Decisões fundamentadas em dados IBGE reais',
      '3 personas detalhadas para campanhas certeiras',
      'Mapeamento completo de todos os concorrentes',
    ],
  },
}

// Conteúdo específico da LP Urgência
export const LP_URGENCIA = {
  hero: {
    badge: '72H PARA RESULTADOS',
    titulo: 'Diagnóstico Completo em 72 Horas',
    subtitulo: 'Enquanto você decide, seu concorrente já está lançando com dados que você não tem',
  },
  timeline: [
    { hora: '0-2h', titulo: 'Coleta de Dados', descricao: 'Nossa IA coleta dados demográficos, econômicos e de mercado da região', itens: ['IBGE', 'CAGED', 'BCB', 'Portais'] },
    { hora: '2-24h', titulo: 'Mapeamento de Concorrentes', descricao: 'Identificação automática de todos os empreendimentos concorrentes', itens: ['Preços', 'Metragens', 'Diferenciais', 'Status'] },
    { hora: '24-48h', titulo: 'Análise SWOT + Personas', descricao: 'Geração de 40+ pontos estratégicos e 3 personas detalhadas', itens: ['Forças', 'Fraquezas', 'Oportunidades', 'Ameaças'] },
    { hora: '48-72h', titulo: 'Estratégia Completa', descricao: 'Plano de marketing, budget sugerido e checklist de implementação', itens: ['Marketing', 'Budget', 'Vendas', 'KPIs'] },
  ],
  custoInacao: {
    titulo: 'O que você perde a cada dia sem dados',
    itens: [
      { titulo: 'Vantagem competitiva', descricao: 'Seu concorrente pode estar usando esses dados agora mesmo' },
      { titulo: 'Decisões arriscadas', descricao: 'Cada decisão sem dados é um risco desnecessário' },
      { titulo: 'Budget desperdiçado', descricao: 'Campanhas sem dados convertem menos e custam mais' },
      { titulo: 'Oportunidades perdidas', descricao: 'O mercado não espera. Oportunidades passam rápido' },
    ],
  },
  bonus: [
    { titulo: 'Relatório de Tendências 2025', descricao: 'Análise exclusiva do mercado imobiliário para o próximo ano', valor: 'R$ 2.500' },
    { titulo: 'Consultoria de 30 minutos', descricao: 'Sessão individual para tirar dúvidas sobre sua estratégia', valor: 'R$ 1.500' },
    { titulo: 'Acesso ao Grupo VIP', descricao: 'Comunidade exclusiva de incorporadores e insights semanais', valor: 'Sem preço' },
  ],
  depoimentos: [
    { texto: 'Recebi minha análise completa em 48 horas. Impressionante a velocidade e qualidade.', nome: 'Carlos Mendes', cargo: 'Diretor - Construtora Nova Era', tempo: 'Recebeu em 48h', resultado: '100% satisfeito' },
    { texto: 'Achei que ia demorar semanas como as consultorias. Veio tudo em 3 dias.', nome: 'Ana Paula', cargo: 'Gerente de Marketing - Incorporadora Viva', tempo: 'Recebeu em 72h', resultado: 'Superou expectativas' },
  ],
  capacidade: {
    titulo: 'Por que limitamos as vagas?',
    descricao: 'Nossa IA processa análises com alta qualidade. Para manter o padrão de excelência, limitamos a quantidade diária de diagnósticos.',
    total: 50,
    usadas: 37,
  },
  fomo: [
    'Seu concorrente já pode estar usando dados que você não tem',
    'Cada semana sem análise é uma semana de vantagem perdida',
    'O custo da indecisão: oportunidades que não voltam',
  ],
}

// Conteúdo do Ebook
export const EBOOK_CONTENT = {
  titulo: 'Metodologia Completa de Análise de Mercado Imobiliário',
  subtitulo: 'O mesmo processo que usamos para analisar R$ 700M+ em VGV',
  badge: '100% GRATUITO',
  destaques: [
    '10 capítulos práticos e aplicáveis',
    'Templates prontos para usar',
    'Passo a passo detalhado',
    'Fontes de dados gratuitas',
    'Sem enrolação, direto ao ponto',
  ],
  capitulos: [
    {
      numero: 1,
      titulo: 'Introdução',
      descricao: 'Por que análise de mercado é essencial para o sucesso de um lançamento',
      topicos: ['O custo da falta de dados', 'Casos reais de sucesso e fracasso', 'O que você vai aprender'],
    },
    {
      numero: 2,
      titulo: 'Coleta de Dados',
      descricao: 'Fontes oficiais e como acessar cada uma delas',
      topicos: ['IBGE: dados demográficos', 'CAGED: emprego e renda', 'BCB: crédito e financiamento'],
    },
    {
      numero: 3,
      titulo: 'Análise Demográfica',
      descricao: 'Como interpretar população, renda, PIB e emprego',
      topicos: ['Indicadores essenciais', 'O que cada métrica significa', 'Template de planilha'],
    },
    {
      numero: 4,
      titulo: 'Mapeamento de Concorrentes',
      descricao: 'Onde encontrar e quais dados coletar',
      topicos: ['Portais imobiliários', 'Dados a coletar', 'Template de mapeamento'],
    },
    {
      numero: 5,
      titulo: 'Cálculo de Público Qualificado',
      descricao: 'Fórmula para estimar famílias com capacidade de compra',
      topicos: ['Renda necessária', 'Entrada e parcelas', 'Cálculo passo a passo'],
    },
    {
      numero: 6,
      titulo: 'Análise SWOT',
      descricao: 'Metodologia completa com 40+ pontos estratégicos',
      topicos: ['O que é SWOT', 'Pontos específicos para imobiliário', 'Template preenchível'],
    },
    {
      numero: 7,
      titulo: 'Definição de Personas',
      descricao: '3 personas típicas do mercado imobiliário',
      topicos: ['Executivo Regional', 'Lifestyle Migrator', 'Investidor'],
    },
    {
      numero: 8,
      titulo: 'Estratégia de Marketing',
      descricao: 'Fases, KPIs e alocação de budget',
      topicos: ['4 fases de campanha', 'KPIs de referência', 'Budget sugerido'],
    },
    {
      numero: 9,
      titulo: 'Checklist de Implementação',
      descricao: 'Timeline de 12 semanas para execução',
      topicos: ['Sprint 1-4: Preparação', 'Sprint 5-8: Lançamento', 'Sprint 9-12: Sustentação'],
    },
    {
      numero: 10,
      titulo: 'Próximos Passos',
      descricao: 'Como automatizar tudo isso com a RPK Análise',
      topicos: ['O que a IA faz por você', 'Criar seu diagnóstico gratuito', 'Suporte e comunidade'],
    },
  ],
  paraQuem: [
    'CEOs e Diretores de Incorporadoras',
    'Gerentes de Marketing Imobiliário',
    'Gerentes Comerciais',
    'Consultores do setor',
    'Profissionais de inteligência de mercado',
  ],
}

// Função helper para obter conteúdo combinado
export function getPersonaContent(persona: Persona): PersonaContent {
  return PERSONAS[persona]
}

export function getAbordagemContent(abordagem: Abordagem): AbordagemContent {
  return ABORDAGENS[abordagem]
}

export function getFullContent(abordagem: Abordagem, persona?: Persona) {
  const abordagemContent = getAbordagemContent(abordagem)
  const personaContent = persona ? getPersonaContent(persona) : null

  return {
    abordagem: abordagemContent,
    persona: personaContent,
  }
}
