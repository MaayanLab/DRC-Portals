-- AlterTable
ALTER TABLE "outreach" ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "schedule" TEXT;
