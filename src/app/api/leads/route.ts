import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const lead = await prisma.lead.create({
      data: {
        nome: body.nome,
        email: body.email,
        whatsapp: body.whatsapp,
        cargo: body.cargo,
        empresa: body.empresa,
        numeroFuncionarios: body.numeroFuncionarios,
        cidadeEmpreendimento: body.cidadeEmpreendimento,
      },
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Erro ao criar lead:', error)
    return NextResponse.json(
      { error: 'Erro ao criar lead' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { projetos: true },
    })
    return NextResponse.json(leads)
  } catch (error) {
    console.error('Erro ao buscar leads:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar leads' },
      { status: 500 }
    )
  }
}
