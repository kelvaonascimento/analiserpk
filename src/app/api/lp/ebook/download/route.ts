import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Forçar Node.js runtime para Prisma funcionar corretamente
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const leadId = searchParams.get('leadId')

    // Se tiver leadId, marcar como ebook baixado
    if (leadId) {
      await prisma.lead.update({
        where: { id: leadId },
        data: { ebookBaixado: true },
      })
    }

    // Redirecionar para o PDF estático ou gerar dinamicamente
    // Por enquanto, vamos retornar um placeholder
    // O PDF será gerado pelo @react-pdf/renderer no client
    return NextResponse.json({
      success: true,
      message: 'Download registrado',
      downloadUrl: '/ebook/rpk-metodologia-analise-mercado.pdf',
    })
  } catch (error) {
    console.error('Erro ao registrar download:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
