-- CreateTable
CREATE TABLE "DCC" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "homepage" TEXT NOT NULL,
    "icon" TEXT,
    "annotation" JSONB,

    CONSTRAINT "DCC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "citation" TEXT NOT NULL,
    "toolId" TEXT,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DCCPublication" (
    "publicationId" TEXT NOT NULL,
    "dccId" TEXT NOT NULL,

    CONSTRAINT "DCCPublication_pkey" PRIMARY KEY ("publicationId","dccId")
);

-- CreateTable
CREATE TABLE "Tool" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DccAsset" (
    "dccId" TEXT NOT NULL,
    "filetype" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "size" INTEGER,
    "lastmodified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "current" BOOLEAN NOT NULL DEFAULT true,
    "creator" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "annotation" JSONB,

    CONSTRAINT "DccAsset_pkey" PRIMARY KEY ("dccId","filetype","link","lastmodified")
);

-- CreateIndex
CREATE UNIQUE INDEX "DccAsset_dccId_filetype_link_lastmodified_key" ON "DccAsset"("dccId", "filetype", "link", "lastmodified");

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DCCPublication" ADD CONSTRAINT "DCCPublication_publicationId_fkey" FOREIGN KEY ("publicationId") REFERENCES "Publication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DCCPublication" ADD CONSTRAINT "DCCPublication_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "DCC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DccAsset" ADD CONSTRAINT "DccAsset_dccId_fkey" FOREIGN KEY ("dccId") REFERENCES "DCC"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
