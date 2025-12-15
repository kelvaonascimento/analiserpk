import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/admin/projetos/[id] - Detalhes do projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const projeto = await prisma.projeto.findUnique({
      where: { id },
      include: {
        lead: true
      }
    })

    if (!projeto) {
      return NextResponse.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    return NextResponse.json(projeto)
  } catch (error) {
    console.error('Erro ao buscar projeto:', error)
    return NextResponse.json({ error: 'Erro ao buscar projeto' }, { status: 500 })
  }
}

// DELETE /api/admin/projetos/[id] - Remover projeto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.projeto.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar projeto:', error)
    return NextResponse.json({ error: 'Erro ao deletar projeto' }, { status: 500 })
  }
}
