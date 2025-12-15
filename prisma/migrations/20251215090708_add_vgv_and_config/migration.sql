-- AlterTable
ALTER TABLE "Projeto" ADD COLUMN     "vgv" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_chave_key" ON "Config"("chave");

-- CreateIndex
CREATE INDEX "Config_chave_idx" ON "Config"("chave");
