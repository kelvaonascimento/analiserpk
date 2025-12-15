'use client'

import { Badge } from '@/components/ui/badge'

export default function LpFooter() {
  return (
    <footer className="py-12 px-4 border-t border-zinc-800">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-white">RPK</span>
            <span className="text-2xl font-bold text-orange-500">Análise</span>
            <Badge className="bg-zinc-800 text-zinc-400 text-xs">
              Powered by Gemini AI
            </Badge>
          </div>
          <div className="flex items-center gap-6 text-zinc-500 text-sm">
            <span>Pioneiros em IA para o Mercado Imobiliário</span>
          </div>
          <p className="text-zinc-600 text-sm">
            © {new Date().getFullYear()} Agência RPK. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
