// === LEAD (Captação) ===
export interface Lead {
  id?: string
  nome: string
  email: string
  whatsapp: string
  cargo: string
  empresa: string
  numeroFuncionarios: '1-10' | '11-50' | '51-200' | '201-500' | '500+'
  cidadeEmpreendimento: string
  criadoEm?: Date
}

// === EMPREENDIMENTO ===
export interface Unidade {
  metragem: number
  dormitorios: number
  suites: number           // Quantidade de suítes
  banheiros: number        // Total de banheiros
  vagasGaragem: number
  precoMin: number
  precoMax: number
  precoM2: number
  quantidadeDisponivel: number
}

export interface Empreendimento {
  nome: string
  construtora: string
  incorporacao: string[]
  endereco: {
    cep?: string
    rua: string
    numero: string
    bairro?: string
    cidade: string
    estado: string
  }
  especificacoes: {
    torres: number
    andares: number
    unidadesTotal: number
    elevadores: number
  }
  unidades: Unidade[]
  entrega: { mes: number; ano: number }
  percentualVendido: number
  itensLazer: string[]
  diferenciais: string[]
  tecnologia: string[]
}

// === MERCADO (dados automatizados via Gemini) ===
export interface DadosMercado {
  cidade: string
  populacao: { total: number; variacao5anos: number }
  pib: { total: number; perCapita: number }
  salarioMedio: number
  domicilios: number
  pessoasPorDomicilio: number
  distribuicaoRenda: { classe: string; percentual: number; descricao: string }[]
  emprego: { mes: string; saldo: number }[]
  credito: { poupancaVariacao: number; creditoVariacao: number }
  imoveis: {
    precoM2Medio: number
    precoM2ABC?: number
    lancamentos: number
    demanda: string
  }
}

// === PANORAMA COMPLETO (3 PDFs automatizados) ===
export interface PanoramaCompleto {
  cidade: string
  estado: string
  dataGeracao: string

  // PDF 1 - Perfil Econômico
  perfilEconomico: {
    populacao: {
      total: number
      variacao5Anos: number
      ranking: number
      densidade: number
      evolucaoAnual: { ano: number; populacao: number }[]
      faixasEtarias: { faixa: string; percentual: number }[]
      genero: { masculino: number; feminino: number }
      fonte: string
    }
    pib: {
      total: number
      perCapita: number
      crescimento5Anos: number
      ranking: number
      composicao: { setor: string; percentual: number }[]
      evolucaoAnual: { ano: number; pib: number; perCapita: number }[]
      comparativoRegiao: { cidade: string; pib: number; perCapita: number }[]
      fonte: string
    }
    salario: {
      medio: number
      mediano: number
      variacao12Meses: number
      ranking: number
      faixas: { faixa: string; percentual: number; descricao: string }[]
      evolucaoAnual: { ano: number; salarioMedio: number }[]
      fonte: string
    }
    distribuicaoRenda: {
      classes: {
        classe: string
        percentual: number
        descricao: string
        faixaSalariosMinimos: string
        rendaMensalMin: number
        rendaMensalMax: number
      }[]
      gini: number
      comparativoEstado: { classe: string; percentualCidade: number; percentualEstado: number }[]
      fonte: string
    }
    empregosFormais: number
    fonte: string
  }

  // PDF 2 - Panorama Atual
  emprego: {
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
  empresas: {
    crescimentoAno: number
    crescimentoMes: number
    rankingUF: number
    empresasInternet: number
    setoresDestaque: { setor: string; quantidade: number }[]
    comparativoRegiao: { cidade: string; quantidade: number }[]
    fonte: string
  }
  mei: {
    totalMEIs: number
    taxaPorMilHabitantes: number
    crescimentoAno: number
    crescimentoMes: number
    rankingUF: number
    evolucaoMensal: { mes: string; total: number }[]
    fonte: string
  }
  pix: {
    volumeMensal: number
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
  vulnerabilidade: {
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
  bancario: {
    variacaoPoupanca: number
    variacaoCredito: number
    variacaoFinanciamentoImob: number
    evolucaoMensal: { mes: string; poupanca: number; credito: number; imobiliario: number }[]
    analise: string
    fonte: string
  }
  frota: {
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
  rendimentos: {
    declarantesIR: number
    percentualPopulacao: number
    variacaoDeclarantes: number
    rendimentosTributaveis: number
    bensDeclarados: number
    gastosSaude: number
    gastosInstrucao: number
    mediaSaudePorDeclarante: number
    mediaInstrucaoPorDeclarante: number
    evolucaoAnual: { ano: number; rendimentos: number; bens: number }[]
    fonte: string
  }

  // PDF 3 - Panorama Imobiliário
  panoramaImobiliario: {
    domicilios: {
      total: number
      residenciasPorTipo: {
        casas: { quantidade: number; moradores: number }
        condominios: { quantidade: number; moradores: number }
        apartamentos: { quantidade: number; moradores: number }
      }
      mediaHabitantesPorDomicilio: number
      densidadeDomiciliar: number
      evolucaoAnual: { ano: number; total: number }[]
      fonte: string
    }
    construcao: {
      edificacoesEmConstrucao: number
      unidadesEmConstrucao: number
      areaEmConstrucao: number
      crescimentoAno: number
      lancamentosUltimos12Meses: number
      evolucaoMensal: { mes: string; edificacoes: number; unidades: number }[]
      setoresAtivos: { setor: string; quantidade: number }[]
      fonte: string
    }
    comercio: {
      transacoesMes: number
      taxaPorMilHabitantes: number
      variacao12Meses: number
      ranking: number
      tipoTransacoes: { tipo: string; percentual: number }[]
      valorMedioTransacao: number
      evolucaoMensal: { mes: string; transacoes: number }[]
      fonte: string
    }
    urbanizacao: {
      areaUrbana: number
      areaDensamenteUrbanizada: number
      percentualUrbanizado: number
      zoneamento: { zona: string; area: number; percentual: number }[]
      crescimentoAreaUrbana5Anos: number
      fonte: string
    }
    precoM2Medio: number
    precoM2Lancamentos: number
    variacao12Meses: number
    fonte: string
  }

  fontes: string[]
}

// === CONCORRENTES ===
export interface Concorrente {
  nome: string
  construtora: string
  cidade: string
  bairro?: string
  metragemMin?: number
  metragemMax?: number
  precoMin?: number
  precoMax?: number
  precoM2?: number
  dormitorios?: string
  entrega: { ano: number; mes?: number }
  status: string
  itensLazer?: number
  // Campos adicionais para rastreamento de fonte
  fonte?: string
  link?: string
}

// === SWOT ===
export interface SWOT {
  forcas: { texto: string; critico: boolean }[]
  fraquezas: { texto: string; critico: boolean }[]
  oportunidades: { texto: string; chave: boolean }[]
  ameacas: { texto: string; grave: boolean }[]
  acoesEstrategicas: {
    categoria: 'explorar_forcas_oportunidades' | 'mitigar_fraquezas_ameacas'
    acoes: string[]
  }[]
}

// === PERSONA ===
export interface Persona {
  nome: string
  idade: number
  titulo: string
  tipo: 'executivo_regional' | 'lifestyle_migrator' | 'investidor'
  demografia: {
    faixaEtariaMin: number
    faixaEtariaMax: number
    rendaMin: number
    rendaMax: number
    familia: string
    trabalho: string
    localizacaoAtual: string
    valores: string[]
  }
  dores: string[]
  desejos: string[]
  comportamentoCompra: {
    canaisPesquisa: string[]
    tipoDecisao: 'racional' | 'emocional' | 'misto'
    tempoDecisaoMesesMin: number
    tempoDecisaoMesesMax: number
    influenciadores: string[]
    entradaPercentualMin: number
    entradaPercentualMax: number
  }
  chamadasPublicitarias: {
    headline: string
    formato: string
  }[]
}

// === ESTRATÉGIA ===
export interface Estrategia {
  presencaDigital: {
    tipo: string
    url?: string
    acao: string
  }[]
  fases: {
    numero: number
    titulo: string
    semanas: string
    tarefas: string[]
  }[]
  segmentacaoGeografica: {
    cidade: string
    prioridade: 'alta' | 'muito_alta' | 'estrategica'
  }[]
  kpis: {
    metrica: string
    alvo: string
  }[]
  budgetSugerido: {
    totalMensal: number
    alocacao: {
      tipo: string
      valor: number
      percentual: number
    }[]
  }
}

// === CHECKLIST ===
export interface Checklist {
  deadlineDias: number
  timelineTotalSemanas: number
  sprints: {
    semanas: string
    titulo: string
    tarefas: {
      item: string
      tipo: 'audit' | 'strategy' | 'creative' | 'execution' | 'analysis' | 'optimization' | 'reporting' | 'prep'
      concluida: boolean
    }[]
  }[]
}

// === FACILIDADES PRÓXIMAS ===
export interface FacilidadeProxima {
  tipo: 'shopping' | 'supermercado' | 'hospital' | 'escola' | 'metro' | 'trem' | 'parque' | 'farmacia' | 'banco' | 'restaurante' | 'academia' | 'universidade'
  nome: string
  distancia?: string
  endereco?: string
  destaque?: boolean
}

export interface FacilidadesRegiao {
  transporte: FacilidadeProxima[]
  saude: FacilidadeProxima[]
  educacao: FacilidadeProxima[]
  comercio: FacilidadeProxima[]
  lazer: FacilidadeProxima[]
  servicos: FacilidadeProxima[]
  resumo: string
  scoreMobilidade: number
  scoreServicos: number
  scoreConveniencia: number
}

// === ANÁLISE COMPLETA ===
export interface Analise {
  swot: SWOT
  personas: Persona[]
  estrategia: Estrategia
  checklist: Checklist
  resumoExecutivo: string
  facilidades?: FacilidadesRegiao
  narrativasLocalizacao?: string[]
  publicoQualificado: {
    familiasMin: number
    familiasMax: number
    rendaNecessariaMin: number
    rendaNecessariaMax: number
    entradaMinima: number
    parcelaMensal: number
    percentualPopulacao: number
  }
  // Alertas e Oportunidades de Mercado
  alertasMercado: {
    texto: string
    tipo: 'critico' | 'atencao' | 'info'
    valor?: string
  }[]
  oportunidadesMercado: {
    texto: string
    destaque: boolean
  }[]
  // Comparativo de Preço/m²
  comparativoPrecoM2: {
    local: string
    precoM2: number
    destaque: boolean
  }[]
  // Radar Competitivo (6 dimensões)
  radarCompetitivo: {
    dimensao: string
    empreendimento: number
    concorrente1?: number
    concorrente2?: number
    nomeConcorrente1?: string
    nomeConcorrente2?: string
  }[]
  // Vantagens competitivas resumidas
  vantagensCompetitivas: {
    titulo: string
    descricao: string
    icone: 'pioneirismo' | 'preco' | 'lazer' | 'localizacao' | 'tecnologia' | 'sustentabilidade'
  }[]
}

// === PROJETO COMPLETO ===
export type StatusProjeto =
  | 'captando_dados'
  | 'processando_pdfs'
  | 'buscando_concorrentes'
  | 'gerando_analise'
  | 'pronto'
  | 'erro'

export interface Projeto {
  id?: string
  slug: string
  leadId: string
  criadoEm?: Date
  status: StatusProjeto
  urlFinal?: string
  empreendimento?: Empreendimento
  mercado?: DadosMercado
  panorama?: PanoramaCompleto // Dados automatizados dos 3 PDFs
  concorrentes?: Concorrente[]
  analise?: Analise
}

// === ITENS DE LAZER PADRÃO ===
export const ITENS_LAZER_PADRAO = [
  'Piscina Aquecida',
  'Beach Arena / Piscina com Areia',
  'Cinema / Sala de Projeção',
  'Coworking Equipado',
  'Pet Place / Pet Care',
  'Academia Completa',
  'Espaço Gourmet',
  'Churrasqueira',
  'Salão de Festas',
  'Playground',
  'Brinquedoteca',
  'Espaço Zen / Meditação',
  'Quadra Poliesportiva',
  'Bike Share / Paraciclo',
  'Lavanderia Coletiva',
  'Carregador Veículos Elétricos',
  'Smart Home / Automação',
  'Spa / Sauna',
  'Área Verde Preservada',
  'Horta Comunitária',
  'Espaço para Yoga',
  'Lounge / Estar',
  'Wi-Fi nas Áreas Comuns',
  'Segurança 24h',
  'Portaria Remota',
  'Gerador de Emergência',
  'Elevadores (2+)',
  'Coleta Seletiva',
  'Captação Água da Chuva',
  'Energia Solar',
] as const

// === FORM DATA (para o formulário multi-step) ===
export interface FormData {
  // Step 1: Lead
  lead: Lead
  // Step 2: PDFs (OPCIONAL - dados buscados automaticamente)
  pdfs?: {
    perfilEconomico?: File
    panorama?: File
    imobiliario?: File
  }
  // Dados de mercado buscados automaticamente
  panoramaCompleto?: PanoramaCompleto
  // Step 3: Empreendimento básico
  empreendimentoBasico: {
    nome: string
    construtora: string
    incorporacao: string
    endereco: {
      cep?: string
      rua: string
      numero: string
      bairro?: string
      cidade: string
      estado: string
    }
    torres: number
    andares: number
    unidadesTotal: number
    elevadores: number
    entregaMes: number
    entregaAno: number
    percentualVendido: number
    vgv?: number // Valor Geral de Vendas estimado
  }
  // Step 4: Unidades e preços
  unidades: Unidade[]
  // Step 5: Lazer
  itensLazer: string[]
  diferenciais: string[]
  tecnologia: string[]
  // Step 6: Concorrentes (editável)
  concorrentes: Concorrente[]
}
