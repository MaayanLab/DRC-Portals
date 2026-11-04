import type {
  SchemaNodeProperties,
  SchemaPathways,
} from "@/lib/text2cypher/schema/types";

const composeNodes = (nodePropertyMap: SchemaNodeProperties) => {
  return Array.from(nodePropertyMap.entries())
    .map(([nodeLabel, properties]) => {
      const propertyString = properties.join(", ");
      return `- ${nodeLabel}: ${propertyString}`;
    })
    .join("\n");
};

const composePathways = (pathways: SchemaPathways) => {
  return pathways
    .map(([from, rel, to]) => {
      return `- (:${from})-[:${rel}]->(:${to})`;
    })
    .join("\n");
};

export const composeSchema = (
  nodePropertyMap: SchemaNodeProperties,
  pathways: SchemaPathways,
) => {
  const nodes = composeNodes(nodePropertyMap);
  const relationships = composePathways(pathways);
  return [
    "### Nodes",
    `${nodes}`,
    "### Relationship pathways",
    `${relationships}`,
  ].join("\n");
};
