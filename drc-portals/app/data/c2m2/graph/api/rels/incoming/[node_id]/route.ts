import { getIncomingRelsCypher } from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import { NodeIncomingRelsResult } from "@/lib/neo4j/types";

export async function GET(
  request: Request,
  { params }: { params: { node_id: string } }
) {
  try {
    const incomingResults = await executeRead<NodeIncomingRelsResult>(
      getDriver(),
      getIncomingRelsCypher(),
      { nodeId: Number(params.node_id) }
    );
    return Response.json(
      incomingResults.map((record) => record.toObject()),
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message:
          "An error occured trying to find incoming relationships of the node. Please try again later.",
        error,
        params: {
          nodeId: params.node_id,
        },
      },
      { status: 500 }
    );
  }
}