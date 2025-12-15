import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diagnóstico de Mercado Imobiliário com IA | RPK Análise',
  description: 'Análise estratégica completa do seu empreendimento em 72 horas. Dados IBGE, mapeamento de concorrentes, personas e estratégia de marketing.',
}

export default function LpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
      {children}
    </div>
  )
}
