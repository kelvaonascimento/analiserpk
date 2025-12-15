import { NextRequest, NextResponse } from 'next/server'
import { buscarPanoramaCompleto } from '@/lib/panorama-automatico'

// ============================================================================
// API DE PANORAMA COMPLETO AUTOMÁTICO
// Gera relatório completo similar ao Caravela para qualquer cidade
// Inclui: Perfil Econômico + Panorama Atual + Panorama Imobiliário
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cidade, estado = 'SP' } = body

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

    console.log(`\n========== GERANDO PANORAMA COMPLETO ==========`)
    console.log(`Cidade: ${cidade}, Estado: ${estado}`)
    console.log(`Incluindo: Perfil Econômico + Panorama Atual + Panorama Imobiliário`)
    console.log(`================================================\n`)

    const panorama = await buscarPanoramaCompleto(cidade, estado)

    console.log(`\n========== PANORAMA GERADO COM SUCESSO ==========`)
    console.log(``)
    console.log(`--- PERFIL ECONÔMICO ---`)
    console.log(`População: ${panorama.perfilEconomico.populacao.total.toLocaleString('pt-BR')} hab`)
    console.log(`PIB: R$ ${panorama.perfilEconomico.pib.total} bi`)
    console.log(`PIB per capita: R$ ${panorama.perfilEconomico.pib.perCapita.toLocaleString('pt-BR')}`)
    console.log(`Salário médio: R$ ${panorama.perfilEconomico.salario.medio.toLocaleString('pt-BR')}`)
    console.log(`Empregos formais: ${panorama.perfilEconomico.empregosFormais.toLocaleString('pt-BR')}`)
    console.log(``)
    console.log(`--- PANORAMA ATUAL ---`)
    console.log(`Emprego: ${panorama.emprego.saldo > 0 ? '+' : ''}${panorama.emprego.saldo} saldo`)
    console.log(`Empresas: ${panorama.empresas.crescimentoAno} novas no ano`)
    console.log(`MEIs: ${panorama.mei.totalMEIs.toLocaleString('pt-BR')} total`)
    console.log(`PIX: R$ ${panorama.pix.volumeMensal}M/mês`)
    console.log(``)
    console.log(`--- PANORAMA IMOBILIÁRIO ---`)
    console.log(`Domicílios: ${panorama.panoramaImobiliario.domicilios.total.toLocaleString('pt-BR')}`)
    console.log(`Preço/m² médio: R$ ${panorama.panoramaImobiliario.precoM2Medio.toLocaleString('pt-BR')}`)
    console.log(`Preço/m² lançamentos: R$ ${panorama.panoramaImobiliario.precoM2Lancamentos.toLocaleString('pt-BR')}`)
    console.log(`Construções: ${panorama.panoramaImobiliario.construcao.edificacoesEmConstrucao} edificações`)
    console.log(``)
    console.log(`==================================================\n`)

    return NextResponse.json({
      success: true,
      panorama,
      resumo: {
        perfilEconomico: {
          populacao: panorama.perfilEconomico.populacao.total,
          pib: panorama.perfilEconomico.pib.total,
          pibPerCapita: panorama.perfilEconomico.pib.perCapita,
          salarioMedio: panorama.perfilEconomico.salario.medio,
          empregosFormais: panorama.perfilEconomico.empregosFormais
        },
        panoramaAtual: {
          saldoEmpregos: panorama.emprego.saldo,
          novasEmpresas: panorama.empresas.crescimentoAno,
          totalMEIs: panorama.mei.totalMEIs,
          volumePIX: panorama.pix.volumeMensal
        },
        panoramaImobiliario: {
          domicilios: panorama.panoramaImobiliario.domicilios.total,
          precoM2Medio: panorama.panoramaImobiliario.precoM2Medio,
          precoM2Lancamentos: panorama.panoramaImobiliario.precoM2Lancamentos,
          construcoesAtivas: panorama.panoramaImobiliario.construcao.edificacoesEmConstrucao
        }
      },
      mensagem: `Panorama completo de ${cidade} gerado com sucesso`,
      metodo: '100% Automático via Google AI (similar ao Caravela)',
      fontes: panorama.fontes
    })

  } catch (error) {
    console.error('Erro ao gerar panorama:', error)
    return NextResponse.json(
      {
        error: 'Erro ao gerar panorama econômico',
        detalhes: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const cidade = searchParams.get('cidade')
  const estado = searchParams.get('estado') || 'SP'

  if (!cidade) {
    return NextResponse.json(
      { error: 'Parâmetro cidade é obrigatório' },
      { status: 400 }
    )
  }

  // Redirecionar para POST
  const response = await POST(
    new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ cidade, estado }),
      headers: { 'Content-Type': 'application/json' }
    })
  )

  return response
}
