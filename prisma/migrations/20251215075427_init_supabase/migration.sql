-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "numeroFuncionarios" TEXT NOT NULL,
    "cidadeEmpreendimento" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'novo',
    "origem" TEXT NOT NULL DEFAULT 'organico',
    "notas" TEXT,
    "ultimoContato" TIMESTAMP(3),

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'captando_dados',
    "urlFinal" TEXT,
    "empreendimento" JSONB,
    "mercado" JSONB,
    "panorama" JSONB,
    "concorrentes" JSONB,
    "analise" JSONB,
    "pdfPerfilEconomico" TEXT,
    "pdfPanorama" TEXT,
    "pdfImobiliario" TEXT,
    "visualizacoes" INTEGER NOT NULL DEFAULT 0,
    "ultimaVisualizacao" TIMESTAMP(3),

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_criadoEm_idx" ON "Lead"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "Projeto_slug_key" ON "Projeto"("slug");

-- CreateIndex
CREATE INDEX "Projeto_status_idx" ON "Projeto"("status");

-- CreateIndex
CREATE INDEX "Projeto_criadoEm_idx" ON "Projeto"("criadoEm");

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
