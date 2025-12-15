'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight } from 'lucide-react'
import type { Abordagem } from '@/lib/lp-content'

interface LpHeaderProps {
  abordagem?: Abordagem
  showCta?: boolean
}

const corPorAbordagem: Record<Abordagem, string> = {
  racional: 'bg-amber-500/20 text-amber-400',
  emocional: 'bg-purple-500/20 text-purple-400',
  urgencia: 'bg-red-500/20 text-red-400',
  ebook: 'bg-green-500/20 text-green-400',
}

export default function LpHeader({ abordagem, showCta = true }: LpHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/lp" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">RPK</span>
            <span className="text-xl font-bold text-orange-500">Análise</span>
            {abordagem && (
              <Badge className={`ml-2 text-xs ${corPorAbordagem[abordagem]}`}>
                {abordagem === 'racional' && 'Dados'}
                {abordagem === 'emocional' && 'Histórias'}
                {abordagem === 'urgencia' && '72h'}
                {abordagem === 'ebook' && 'Grátis'}
              </Badge>
            )}
          </Link>

          {showCta && (
            <Link href="/criar">
              <Button className="bg-orange-500 hover:bg-orange-600 text-sm">
                Criar Diagnóstico
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
