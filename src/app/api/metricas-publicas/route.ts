import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// VGV inicial base (1 bilhão = 1.000.000.000)
const VGV_BASE = 1000000000

export async function GET() {
  try {
    // Buscar soma de todos os VGVs dos projetos
    const resultado = await prisma.projeto.aggregate({
      _sum: {
        vgv: true
      },
      _count: {
        id: true
      }
    })

    // Buscar total de leads únicos (construtoras)
    const totalLeads = await prisma.lead.count()

    // VGV total = base + soma dos projetos
    const vgvSomaProjetos = resultado._sum.vgv || 0
    const vgvTotal = VGV_BASE + vgvSomaProjetos
    const totalProjetos = resultado._count.id

    return NextResponse.json({
      vgvAnalisado: vgvTotal,
      vgvAnalisadoFormatado: formatarVGV(vgvTotal),
      totalDiagnosticos: totalProjetos,
      totalConstrutoras: totalLeads,
    })
  } catch (error) {
    console.error('Erro ao buscar métricas públicas:', error)

    // Retornar valores padrão em caso de erro
    return NextResponse.json({
      vgvAnalisado: VGV_BASE,
      vgvAnalisadoFormatado: 'R$ 1B+',
      totalDiagnosticos: 0,
      totalConstrutoras: 0,
    })
  }
}

function formatarVGV(valor: number): string {
  if (valor >= 1000000000) {
    const bilhoes = valor / 1000000000
    if (bilhoes >= 10) {
      return `R$ ${Math.floor(bilhoes)}B+`
    }
    return `R$ ${bilhoes.toFixed(1).replace('.', ',')}B+`
  }
  if (valor >= 1000000) {
    const milhoes = valor / 1000000
    return `R$ ${Math.floor(milhoes)}M+`
  }
  return `R$ ${valor.toLocaleString('pt-BR')}`
}
