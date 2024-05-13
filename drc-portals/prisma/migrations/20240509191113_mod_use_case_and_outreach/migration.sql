-- AlterTable
ALTER TABLE "outreach" ADD COLUMN     "cfde_specific" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "usecase" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tool_icon" TEXT,
ALTER COLUMN "inputs" DROP NOT NULL,
ALTER COLUMN "outputs" DROP NOT NULL,
ALTER COLUMN "sources" DROP NOT NULL;
