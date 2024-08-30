import { Direction } from "./enums";
import { createNodeReprStr, createRelReprStr } from "./utils";

export const getExpandNodeCypher = (
  nodeLabel: string,
  direction: string,
  relType: string
) => {
  const relMatch =
    direction === Direction.INCOMING
      ? `<-[r:${relType}]-`
      : `-[r:${relType}]->`;
  return [
    `MATCH (n)${relMatch}(m:${nodeLabel})`,
    `WHERE id(n) = $nodeId`,
    `WITH DISTINCT m, r`,
    "LIMIT $limit",
    `RETURN DISTINCT collect(DISTINCT ${createNodeReprStr(
      "m"
    )}) AS nodes, collect(DISTINCT ${createRelReprStr("r")}) AS relationships`,
  ].join("\n");
};

export const getOutgoingRelsCypher = () => `
  MATCH (n)-[outgoingRel]->(m)
  WHERE id(n) = $nodeId
  WITH labels(m) AS outgoingLabels, type(outgoingRel) AS outgoingType
  RETURN outgoingLabels, outgoingType, count([outgoingLabels, outgoingType]) AS count
`;

export const getIncomingRelsCypher = () => `
  MATCH (n)-[incomingRel]->(m)
  WHERE id(m) = $nodeId
  WITH labels(n) AS incomingLabels, type(incomingRel) AS incomingType
  RETURN incomingLabels, incomingType, count([incomingLabels, incomingType]) AS count
`;
