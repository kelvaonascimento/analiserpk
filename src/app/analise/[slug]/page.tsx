import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import LandingPage from '@/components/landing/LandingPage'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function AnalisePage({ params }: PageProps) {
  const { slug } = await params

  const projeto = await prisma.projeto.findUnique({
    where: { slug },
    include: { lead: true },
  })

  if (!projeto || projeto.status !== 'pronto') {
    notFound()
  }

  return (
    <LandingPage
      projeto={{
        ...projeto,
        empreendimento: projeto.empreendimento as any,
        mercado: projeto.mercado as any,
        panorama: projeto.panorama as any,
        concorrentes: projeto.concorrentes as any,
        analise: projeto.analise as any,
      }}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params

  const projeto = await prisma.projeto.findUnique({
    where: { slug },
  })

  if (!projeto) {
    return { title: 'Análise não encontrada' }
  }

  const empreendimento = projeto.empreendimento as any

  return {
    title: `${empreendimento?.nome || 'Análise'} - Análise Estratégica | RPK Análise`,
    description: `Análise estratégica completa de mercado imobiliário para ${empreendimento?.nome || 'empreendimento'}`,
  }
}
