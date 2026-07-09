-- Añade soporte para adjuntar un archivo (PDF o Word) a cada artículo del
-- Periódico / Revista Digital, además de la imagen de portada que ya existía.
ALTER TABLE "PublicationArticle" ADD COLUMN IF NOT EXISTS "attachmentUrl" TEXT;
ALTER TABLE "PublicationArticle" ADD COLUMN IF NOT EXISTS "attachmentName" TEXT;
