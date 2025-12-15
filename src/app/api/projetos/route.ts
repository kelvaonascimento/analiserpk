import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

function generateSlug(nome: string, cidade: string): string {
  const base = `${nome}-${cidade}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')     // Substitui caracteres especiais por -
    .replace(/^-+|-+$/g, '')          // Remove - do início e fim

  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const slug = generateSlug(
      body.empreendimento?.nome || 'projeto',
      body.empreendimento?.endereco?.cidade || 'cidade'
    )

    const projeto = await prisma.projeto.create({
      data: {
        slug,
        leadId: body.leadId,
        status: 'captando_dados',
        empreendimento: body.empreendimento || null,
        concorrentes: body.concorrentes || null,
      },
    })

    return NextResponse.json(projeto)
  } catch (error) {
    console.error('Erro ao criar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao criar projeto' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  try {
    if (slug) {
      const projeto = await prisma.projeto.findUnique({
        where: { slug },
        include: { lead: true },
      })

      if (!projeto) {
        return NextResponse.json(
          { error: 'Projeto não encontrado' },
          { status: 404 }
        )
      }

      return NextResponse.json(projeto)
    }

    const projetos = await prisma.projeto.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { lead: true },
    })
    return NextResponse.json(projetos)
  } catch (error) {
    console.error('Erro ao buscar projetos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar projetos' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    const projeto = await prisma.projeto.update({
      where: { id },
      data,
    })

    return NextResponse.json(projeto)
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar projeto' },
      { status: 500 }
    )
  }
}
