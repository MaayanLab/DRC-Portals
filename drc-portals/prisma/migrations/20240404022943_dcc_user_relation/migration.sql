-- CreateTable
CREATE TABLE "_DCCToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DCCToUser_AB_unique" ON "_DCCToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_DCCToUser_B_index" ON "_DCCToUser"("B");

-- AddForeignKey
ALTER TABLE "_DCCToUser" ADD CONSTRAINT "_DCCToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "dccs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DCCToUser" ADD CONSTRAINT "_DCCToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
