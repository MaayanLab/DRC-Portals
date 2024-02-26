-- AlterTable
ALTER TABLE "c2m2_file_node" ADD COLUMN     "access_url" TEXT,
ADD COLUMN     "md5" TEXT,
ADD COLUMN     "mime_type" TEXT,
ADD COLUMN     "sha256" TEXT;
