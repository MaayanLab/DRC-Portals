-- AlterTable
ALTER TABLE "tools" ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "usecase" ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]';
