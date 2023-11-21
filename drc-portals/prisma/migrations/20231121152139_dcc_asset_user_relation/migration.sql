-- AddForeignKey
ALTER TABLE "dcc_assets" ADD CONSTRAINT "dcc_assets_creator_fkey" FOREIGN KEY ("creator") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
