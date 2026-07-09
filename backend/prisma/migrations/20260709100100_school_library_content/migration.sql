-- CreateEnum
CREATE TYPE "BookGenre" AS ENUM ('NARRATIVO', 'LIRICO', 'DRAMATICO', 'INFORMATIVO', 'OPINION');

-- CreateEnum
CREATE TYPE "Publication" AS ENUM ('PERIODICO', 'REVISTA');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "genre" "BookGenre" NOT NULL DEFAULT 'NARRATIVO',
ADD COLUMN     "isBookOfMonth" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicationArticle" (
    "id" SERIAL NOT NULL,
    "publication" "Publication" NOT NULL,
    "section" TEXT NOT NULL,
    "edition" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PublicationArticle_pkey" PRIMARY KEY ("id")
);
