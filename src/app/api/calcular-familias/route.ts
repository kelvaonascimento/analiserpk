import { NextRequest, NextResponse } from 'next/server'
import { calcularFamiliasQualificadas, calcularFamiliasRapido } from '@/lib/calculo-familias'

// ============================================================================
// API DE CÁLCULO DE FAMÍLIAS QUALIFICADAS
// Calcula automaticamente o público-alvo potencial baseado na população
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      cidade,
      estado = 'SP',
      populacao, // Opcional - se não informar, busca automaticamente
      empreendimento
    } = body

    if (!cidade) {
      return NextResponse.json(
        { error: 'Cidade é obrigatória' },
        { status: 400 }
      )
    }

    if (!empreendimento?.precoMin) {
      return NextResponse.json(
        { error: 'Preço mínimo do empreendimento é obrigatório' },
        { status: 400 }
      )
    }

    // Determinar padrão se não informado
    const precoM2 = empreendimento.precoM2 ||
                    (empreendimento.precoMin && empreendimento.metragem
                      ? empreendimento.precoMin / empreendimento.metragem
                      : 7000)

    const padrao = empreendimento.padrao ||
                   (precoM2 <= 5500 ? 'economico' : precoM2 <= 9000 ? 'medio' : 'alto')

    console.log(`\n========== CÁLCULO DE FAMÍLIAS QUALIFICADAS ==========`)
    console.log(`Cidade: ${cidade}, ${estado}`)
    console.log(`Preço: R$ ${empreendimento.precoMin.toLocaleString('pt-BR')}`)
    console.log(`Padrão: ${padrao}`)
    console.log(`======================================================\n`)

    // Se população foi informada, usar cálculo rápido
    if (populacao) {
      const resultado = calcularFamiliasRapido(populacao, empreendimento.precoMin, padrao)

      return NextResponse.json({
        cidade,
        estado,
        populacao,
        familias: {
          qualificadas: resultado.qualificadas,
          altoPotencial: resultado.altoPotencial,
          percentualPopulacao: resultado.percentual
        },
        metodo: 'calculo_rapido'
      })
    }

    // Cálculo completo com busca de dados da cidade
    const resultado = await calcularFamiliasQualificadas(
      {
        precoMin: empreendimento.precoMin,
        precoMax: empreendimento.precoMax,
        precoM2: precoM2,
        metragem: empreendimento.metragem,
        dormitorios: empreendimento.dormitorios,
        padrao
      },
      { nome: cidade, estado }
    )

    return NextResponse.json({
      cidade,
      estado,
      populacao: resultado.populacaoTotal,
      domicilios: resultado.totalDomicilios,
      familias: {
        qualificadas: resultado.familiasQualificadas,
        altoPotencial: resultado.familiasAltoPotencial,
        percentualPopulacao: resultado.percentualPopulacao
      },
      filtros: resultado.filtros,
      calculoDetalhado: resultado.calculoDetalhado,
      metodologia: resultado.metodologia,
      fontes: resultado.fontes,
      metodo: 'calculo_completo'
    })

  } catch (error) {
    console.error('Erro ao calcular famílias qualificadas:', error)
    return NextResponse.json(
      {
        error: 'Erro ao calcular famílias qualificadas',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
