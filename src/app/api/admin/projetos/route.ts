import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/admin/projetos - Lista projetos com filtros
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}

    if (status && status !== 'todos') {
      where.status = status
    }

    const [projetos, total] = await Promise.all([
      prisma.projeto.findMany({
        where,
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lead: {
            select: { id: true, nome: true, empresa: true, email: true, whatsapp: true }
          }
        }
      }),
      prisma.projeto.count({ where })
    ])

    // Extrair info do empreendimento do JSON
    const projetosComInfo = projetos.map(p => {
      const emp = p.empreendimento as any
      return {
        ...p,
        nomeEmpreendimento: emp?.nome || 'Sem nome',
        cidade: emp?.endereco?.cidade || '-',
        bairro: emp?.endereco?.bairro || '-'
      }
    })

    return NextResponse.json({
      projetos: projetosComInfo,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json({ error: 'Erro ao buscar projetos' }, { status: 500 })
  }
}
