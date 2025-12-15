import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Forçar Node.js runtime para Prisma funcionar corretamente
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/admin/leads - Lista leads com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const origem = searchParams.get('origem')
    const abordagem = searchParams.get('abordagem')
    const busca = searchParams.get('busca')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (status && status !== 'todos') {
      where.status = status
    }

    if (origem && origem !== 'todos') {
      where.origem = origem
    }

    if (abordagem && abordagem !== 'todos') {
      where.abordagem = abordagem
    }

    if (busca) {
      where.OR = [
        { nome: { contains: busca, mode: 'insensitive' } },
        { email: { contains: busca, mode: 'insensitive' } },
        { empresa: { contains: busca, mode: 'insensitive' } },
        { cidadeEmpreendimento: { contains: busca, mode: 'insensitive' } }
      ]
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          projetos: {
            select: { id: true, slug: true, status: true, criadoEm: true }
          }
        }
      }),
      prisma.lead.count({ where })
    ])

    // Contar por origem para métricas
    const contagens = await prisma.lead.groupBy({
      by: ['origem'],
      _count: { id: true }
    })

    const contagemPorOrigem = contagens.reduce((acc, item) => {
      acc[item.origem || 'organico'] = item._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      leads,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      contagemPorOrigem
    })
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json({ error: 'Erro ao buscar leads' }, { status: 500 })
  }
}
