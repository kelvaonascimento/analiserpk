import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/admin/leads/[id] - Detalhes do lead
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        projetos: {
          orderBy: { criadoEm: 'desc' }
        }
      }
    })

    if (!lead) {
      return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Erro ao buscar lead:', error)
    return NextResponse.json({ error: 'Erro ao buscar lead' }, { status: 500 })
  }
}

// PATCH /api/admin/leads/[id] - Atualizar lead
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { status, notas, ultimoContato } = body

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(notas !== undefined && { notas }),
        ...(ultimoContato && { ultimoContato: new Date(ultimoContato) })
      }
    })

    return NextResponse.json(lead)
  } catch (error) {
    console.error('Erro ao atualizar lead:', error)
    return NextResponse.json({ error: 'Erro ao atualizar lead' }, { status: 500 })
  }
}

// DELETE /api/admin/leads/[id] - Remover lead
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.lead.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao deletar lead:', error)
    return NextResponse.json({ error: 'Erro ao deletar lead' }, { status: 500 })
  }
}
