import { NextResponse } from "next/server";

import type { Neo4jTemplatesResponse } from "@/lib/text2cypher/api/contracts/neo4j";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";

export async function GET() {
  try {
    const activeSchema = getActiveSchemaDefinition();
    const response = {
      templates: [...activeSchema.templates],
    } satisfies Neo4jTemplatesResponse;

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json(
      {
        message: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
