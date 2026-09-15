-- CreateTable
CREATE TABLE "dcc_tools" (
    "tool_id" TEXT NOT NULL,
    "dcc_id" TEXT NOT NULL,

    CONSTRAINT "dcc_tools_pkey" PRIMARY KEY ("tool_id","dcc_id")
);

-- AddForeignKey
ALTER TABLE "dcc_tools" ADD CONSTRAINT "dcc_tools_tool_id_fkey" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dcc_tools" ADD CONSTRAINT "dcc_tools_dcc_id_fkey" FOREIGN KEY ("dcc_id") REFERENCES "dccs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
