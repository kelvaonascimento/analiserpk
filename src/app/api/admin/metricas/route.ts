import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const hoje = new Date()
    const inicioSemana = new Date(hoje)
    inicioSemana.setDate(hoje.getDate() - 7)

    // Métricas principais
    const [
      totalLeads,
      leadsEstaSemana,
      totalProjetos,
      projetosCompletos,
      leadsPorStatus,
      cidadesMaisAtivas,
      ultimosLeads,
      ultimosProjetos
    ] = await Promise.all([
      // Total de leads
      prisma.lead.count(),

      // Leads esta semana
      prisma.lead.count({
        where: { criadoEm: { gte: inicioSemana } }
      }),

      // Total de projetos
      prisma.projeto.count(),

      // Projetos completos
      prisma.projeto.count({
        where: { status: 'pronto' }
      }),

      // Leads por status
      prisma.lead.groupBy({
        by: ['status'],
        _count: { status: true }
      }),

      // Cidades mais ativas
      prisma.lead.groupBy({
        by: ['cidadeEmpreendimento'],
        _count: { cidadeEmpreendimento: true },
        orderBy: { _count: { cidadeEmpreendimento: 'desc' } },
        take: 10
      }),

      // Últimos 5 leads
      prisma.lead.findMany({
        take: 5,
        orderBy: { criadoEm: 'desc' },
        include: { projetos: { select: { id: true, status: true } } }
      }),

      // Últimos 5 projetos
      prisma.projeto.findMany({
        take: 5,
        orderBy: { criadoEm: 'desc' },
        include: { lead: { select: { nome: true, empresa: true } } }
      })
    ])

    const taxaConversao = totalLeads > 0
      ? Math.round((projetosCompletos / totalLeads) * 100)
      : 0

    return NextResponse.json({
      totalLeads,
      leadsEstaSemana,
      totalProjetos,
      projetosCompletos,
      taxaConversao,
      leadsPorStatus: (leadsPorStatus || []).map(l => ({
        status: l.status,
        count: l._count.status
      })),
      leadsPorDia: [],
      cidadesMaisAtivas: (cidadesMaisAtivas || []).map(c => ({
        cidade: c.cidadeEmpreendimento,
        count: c._count.cidadeEmpreendimento
      })),
      ultimosLeads: ultimosLeads || [],
      ultimosProjetos: ultimosProjetos || []
    })
  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json({
      totalLeads: 0,
      leadsEstaSemana: 0,
      totalProjetos: 0,
      projetosCompletos: 0,
      taxaConversao: 0,
      leadsPorStatus: [],
      leadsPorDia: [],
      cidadesMaisAtivas: [],
      ultimosLeads: [],
      ultimosProjetos: []
    })
  }
}
