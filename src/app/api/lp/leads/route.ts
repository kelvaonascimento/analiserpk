import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      nome,
      email,
      whatsapp,
      empresa,
      cargo,
      aceitaComunicacao,
      abordagem,
      persona,
      landingPage,
      utmSource,
      utmMedium,
      utmCampaign,
    } = body

    // Validar campos obrigatórios
    if (!nome || !email || !whatsapp) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Verificar se lead já existe pelo email
    const leadExistente = await prisma.lead.findFirst({
      where: { email },
    })

    if (leadExistente) {
      // Atualizar lead existente com novos dados de LP
      const leadAtualizado = await prisma.lead.update({
        where: { id: leadExistente.id },
        data: {
          nome,
          whatsapp,
          empresa: empresa || leadExistente.empresa,
          cargo: cargo || leadExistente.cargo,
          abordagem: abordagem || leadExistente.abordagem,
          persona: persona || leadExistente.persona,
          landingPage: landingPage || leadExistente.landingPage,
          utmSource: utmSource || leadExistente.utmSource,
          utmMedium: utmMedium || leadExistente.utmMedium,
          utmCampaign: utmCampaign || leadExistente.utmCampaign,
          atualizadoEm: new Date(),
        },
      })

      return NextResponse.json({
        success: true,
        lead: leadAtualizado,
        isNew: false,
      })
    }

    // Criar novo lead
    const novoLead = await prisma.lead.create({
      data: {
        nome,
        email,
        whatsapp,
        empresa: empresa || '',
        cargo: cargo || '',
        numeroFuncionarios: '',
        cidadeEmpreendimento: '',
        origem: `lp-${abordagem || 'organico'}`,
        abordagem,
        persona,
        landingPage,
        utmSource,
        utmMedium,
        utmCampaign,
      },
    })

    return NextResponse.json({
      success: true,
      lead: novoLead,
      isNew: true,
    })
  } catch (error) {
    console.error('Erro ao criar lead LP:', error)

    // Retornar detalhes do erro para debug
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorStack = error instanceof Error ? error.stack : ''

    return NextResponse.json(
      {
        error: 'Erro interno do servidor',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
