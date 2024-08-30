import {
  getIncomingRelsCypher,
  getOutgoingRelsCypher,
} from "@/lib/neo4j/cypher";
import { executeRead, getDriver } from "@/lib/neo4j/driver";
import {
  NodeIncomingRelsResult,
  NodeOutgoingRelsResult,
} from "@/lib/neo4j/interfaces";

export async function GET(
  request: Request,
  { params }: { params: { node_id: string } }
) {
  try {
    const outgoingResults = await executeRead<NodeOutgoingRelsResult>(
      getDriver(),
      getOutgoingRelsCypher(),
      { nodeId: Number(params.node_id) }
    );
    const incomingResults = await executeRead<NodeIncomingRelsResult>(
      getDriver(),
      getIncomingRelsCypher(),
      { nodeId: Number(params.node_id) }
    );
    return Response.json(
      {
        outgoing: outgoingResults.map((record) => record.toObject()),
        incoming: incomingResults.map((record) => record.toObject()),
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      {
        message:
          "An error occured trying to find all relationships of the node. Please try again later.",
        error,
        params: {
          nodeId: params.node_id,
        },
      },
      { status: 500 }
    );
  }
}
