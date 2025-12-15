import { NextRequest, NextResponse } from 'next/server'
import { buscarConcorrentesSimples } from '@/lib/busca-simples'
import { buscarConcorrentesInvestigativo } from '@/lib/busca-investigativa'
import { buscarPrecosRegioesCorrelacionadas } from '@/lib/gemini'
import { calcularFamiliasQualificadas } from '@/lib/calculo-familias'
import type { Concorrente } from '@/types'

// ============================================================================
// API DE PESQUISA DE CONCORRENTES
//
// Dois modos disponíveis:
// 1. SIMPLES (padrão): Uma busca rápida (~30s)
// 2. INVESTIGATIVO: Múltiplas buscas encadeadas (~60-90s)
//    - Busca direta por empreendimentos
//    - Descobre construtoras da região
//    - Busca empreendimentos de cada construtora
//    - Busca em portais específicos
//    - Consolida e deduplica
// ============================================================================

// Classificação de padrão baseada em preço/m² e metragem
function classificarPadrao(precoM2?: number, precoMin?: number, metragem?: number, itensLazer?: number): 'economico' | 'medio' | 'alto' {
  const preco = precoM2 || (precoMin && metragem ? precoMin / metragem : 0)

  // Se temos preço/m², usar ele como base
  if (preco > 0) {
    if (preco <= 5500) return 'economico'  // MCMV, populares
    if (preco <= 8500) return 'medio'      // Médio padrão
    return 'alto'                           // Alto padrão, luxo
  }

  // Se não temos preço, usar metragem como indicador
  if (metragem && metragem > 0) {
    if (metragem >= 100) return 'alto'
    if (metragem >= 70) return 'medio'
    return 'economico'
  }

  // Se temos muitos itens de lazer, provavelmente é alto padrão
  if (itensLazer && itensLazer > 0) {
    if (itensLazer >= 20) return 'alto'
    if (itensLazer >= 10) return 'medio'
  }

  // Default para MEDIO
  return 'medio'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cidade,
      bairro,
      estado = 'SP',
      metragemReferencia,
      empreendimento,
      modoInvestigativo = false // Novo parâmetro: true para busca intensiva
    } = body

    if (!cidade) {
      return NextResponse.json(
        { error: 'Cidade é obrigatória' },
        { status: 400 }
      )
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: 'API do Google AI não configurada' },
        { status: 500 }
      )
    }

    // ========================================
    // 1. DETERMINAR PADRÃO DO EMPREENDIMENTO
    // ========================================
    const metragemRef = metragemReferencia || empreendimento?.metragem
    const precoM2Ref = empreendimento?.precoM2 ||
                       (empreendimento?.precoMin && metragemRef
                         ? empreendimento.precoMin / metragemRef
                         : undefined)

    const padraoEmpreendimento = empreendimento?.padrao ||
                                  classificarPadrao(precoM2Ref, empreendimento?.precoMin, metragemRef, empreendimento?.itensLazer)

    console.log(`\n========== BUSCA DE CONCORRENTES ==========`)
    console.log(`Cidade: ${cidade}${bairro ? `, Bairro: ${bairro}` : ''}, Estado: ${estado}`)
    console.log(`Padrão de referência: ${padraoEmpreendimento.toUpperCase()}`)
    console.log(`Metragem referência: ${metragemRef ? `${metragemRef}m²` : 'não informada'}`)
    console.log(`Preço/m² referência: R$ ${precoM2Ref?.toLocaleString('pt-BR') || 'não informado'}`)
    console.log(`============================================\n`)

    // ========================================
    // 2. EXECUTAR BUSCA (Simples ou Investigativa)
    // ========================================
    let resultado: {
      concorrentes: Concorrente[]
      tempoExecucao: number
      fontes: string[]
      etapasExecutadas?: { nome: string; resultados: number; tempo: number }[]
      construtoresEncontradas?: string[]
    }

    if (modoInvestigativo) {
      console.log(`[API] Modo INVESTIGATIVO ativado`)
      const resultadoInvestigativo = await buscarConcorrentesInvestigativo({
        cidade,
        estado,
        bairro,
        padrao: padraoEmpreendimento
      })
      resultado = {
        concorrentes: resultadoInvestigativo.concorrentes,
        tempoExecucao: resultadoInvestigativo.tempoExecucao,
        fontes: resultadoInvestigativo.fontesConsultadas,
        etapasExecutadas: resultadoInvestigativo.etapasExecutadas,
        construtoresEncontradas: resultadoInvestigativo.construtoresEncontradas
      }
    } else {
      console.log(`[API] Modo SIMPLES`)
      const resultadoSimples = await buscarConcorrentesSimples({
        cidade,
        estado,
        bairro,
        padrao: padraoEmpreendimento
      })
      resultado = {
        concorrentes: resultadoSimples.concorrentes,
        tempoExecucao: resultadoSimples.tempoExecucao,
        fontes: resultadoSimples.fontes
      }
    }

    // ========================================
    // 3. BUSCAR PREÇOS POR REGIÃO
    // ========================================
    console.log(`[Preços] Buscando preços por região...`)
    const precosRegioes = await buscarPrecosRegioesCorrelacionadas(
      cidade,
      estado,
      [], // Busca simples não expande para outras cidades
      padraoEmpreendimento
    )

    // ========================================
    // 4. CALCULAR FAMÍLIAS QUALIFICADAS
    // ========================================
    let publicoAlvo = null
    if (empreendimento?.precoMin) {
      console.log(`[Famílias] Calculando público-alvo qualificado...`)
      try {
        const resultadoFamilias = await calcularFamiliasQualificadas(
          {
            precoMin: empreendimento.precoMin,
            precoMax: empreendimento.precoMax,
            precoM2: precoM2Ref,
            metragem: metragemRef,
            dormitorios: empreendimento.dormitorios,
            padrao: padraoEmpreendimento
          },
          { nome: cidade, estado }
        )

        publicoAlvo = {
          populacao: resultadoFamilias.populacaoTotal,
          domicilios: resultadoFamilias.totalDomicilios,
          familiasQualificadas: resultadoFamilias.familiasQualificadas,
          familiasAltoPotencial: resultadoFamilias.familiasAltoPotencial,
          percentualPopulacao: resultadoFamilias.percentualPopulacao,
          filtros: resultadoFamilias.filtros,
          calculoDetalhado: resultadoFamilias.calculoDetalhado,
          metodologia: resultadoFamilias.metodologia,
          fontes: resultadoFamilias.fontes
        }
      } catch (error) {
        console.error('[Famílias] Erro ao calcular:', error)
      }
    }

    // ========================================
    // 5. RETORNAR RESULTADOS
    // ========================================
    const metodo = modoInvestigativo ? 'investigativo' : 'simples'

    // Filtrar URLs do Vertex AI (são redirecionamentos internos do Gemini)
    const isVertexUrl = (url: string) => url?.includes('vertexaisearch.cloud.google.com')

    // Limpar fontes - remover URLs do Vertex
    const fontesLimpas = resultado.fontes.filter(f => !isVertexUrl(f))

    // Limpar links dos concorrentes - remover URLs do Vertex
    const concorrentesLimpos = resultado.concorrentes.map(c => ({
      ...c,
      link: c.link && isVertexUrl(c.link) ? undefined : c.link,
      fonte: c.fonte && isVertexUrl(c.fonte) ? 'Pesquisa Google' : c.fonte
    }))

    return NextResponse.json({
      concorrentes: concorrentesLimpos,
      precosRegioes: precosRegioes.map(p => ({
        regiao: p.regiao,
        precoM2Medio: p.precoM2Medio,
        precoM2Lancamentos: p.precoM2Lancamentos,
        variacao12meses: p.variacao12meses,
        fonte: p.fonte
      })),
      publicoAlvo,
      total: resultado.concorrentes.length,
      padraoAnalise: padraoEmpreendimento,
      cidadesAnalisadas: [cidade],
      bairrosAnalisados: { [cidade]: bairro ? [bairro] : [] },
      fontes: fontesLimpas.length > 0 ? fontesLimpas : ['Pesquisa Google'],
      tempoExecucao: resultado.tempoExecucao,
      mensagem: `${resultado.concorrentes.length} empreendimento(s) encontrado(s) em ${(resultado.tempoExecucao / 1000).toFixed(1)}s (modo ${metodo})`,
      metodo,
      // Dados extras do modo investigativo
      ...(modoInvestigativo && {
        etapasExecutadas: resultado.etapasExecutadas,
        construtoresEncontradas: resultado.construtoresEncontradas
      })
    })

  } catch (error) {
    console.error('Erro ao pesquisar concorrentes:', error)
    return NextResponse.json(
      {
        error: 'Erro ao pesquisar concorrentes',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
