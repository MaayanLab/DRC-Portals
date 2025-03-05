-- AlterTable
ALTER TABLE "centers" ADD COLUMN     "institution" JSONB,
ADD COLUMN     "press_release" JSONB,
ADD COLUMN     "principal_investigator" JSONB,
ADD COLUMN     "project_title" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "video_tutorial" TEXT;
