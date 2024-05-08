-- AlterTable
ALTER TABLE "publications" ADD COLUMN     "carousel" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "carousel_description" TEXT,
ADD COLUMN     "carousel_link" TEXT,
ADD COLUMN     "carousel_title" TEXT,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "image" TEXT;
