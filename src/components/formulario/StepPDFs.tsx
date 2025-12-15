'use client'

import { useState } from 'react'
import { Upload, FileText, CheckCircle2, X, Info } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface PDFData {
  perfilEconomico?: File
  panorama?: File
  imobiliario?: File
}

interface StepPDFsProps {
  data?: PDFData
  onChange: (data: PDFData) => void
}

const PDF_TYPES = [
  {
    key: 'perfilEconomico' as const,
    title: 'Perfil Econômico',
    description: 'Dados de PIB, renda, população, classes sociais',
    example: 'Ex: Relatório Caravela - Perfil Econômico',
  },
  {
    key: 'panorama' as const,
    title: 'Panorama Atual',
    description: 'Dados de emprego, crédito, tendências locais',
    example: 'Ex: Relatório Caravela - Panorama',
  },
  {
    key: 'imobiliario' as const,
    title: 'Panorama Imobiliário',
    description: 'Preços m², lançamentos, demanda',
    example: 'Ex: Relatório Caravela - Construção',
  },
]

export default function StepPDFs({ data, onChange }: StepPDFsProps) {
  const handleFileChange = (key: keyof PDFData, file: File | null) => {
    onChange({ ...data, [key]: file || undefined })
  }

  const handleDrop = (key: keyof PDFData, e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === 'application/pdf') {
      handleFileChange(key, file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-300">
          <p className="font-medium mb-1">Onde conseguir esses PDFs?</p>
          <p className="text-blue-300/80">
            Os relatórios da Caravela ou similares contêm dados públicos sobre o mercado local.
            Se você não tiver esses documentos, pode pular este passo e nós faremos uma análise
            com dados estimados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {PDF_TYPES.map((pdfType) => {
          const file = data?.[pdfType.key]
          const hasFile = !!file

          return (
            <div key={pdfType.key} className="space-y-2">
              <Label className="text-zinc-300">{pdfType.title}</Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(pdfType.key, e)}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
                  ${hasFile
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-zinc-700 hover:border-zinc-600 bg-zinc-800/50'
                  }
                `}
              >
                <input
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => handleFileChange(pdfType.key, e.target.files?.[0] || null)}
                />

                {hasFile ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-zinc-400 text-sm">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-zinc-400 hover:text-red-400"
                      onClick={(e) => {
                        e.preventDefault()
                        handleFileChange(pdfType.key, null)
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-zinc-400" />
                    </div>
                    <p className="text-white font-medium mb-1">
                      Arraste o PDF ou clique para selecionar
                    </p>
                    <p className="text-zinc-500 text-sm">{pdfType.description}</p>
                    <p className="text-zinc-600 text-xs mt-2">{pdfType.example}</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-zinc-500 text-sm text-center">
        * Estes documentos são opcionais. Se não enviados, usaremos estimativas baseadas em dados públicos.
      </p>
    </div>
  )
}
