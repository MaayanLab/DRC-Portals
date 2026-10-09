import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";

export const DEFAULT_NODE_BADGE_COLOR = "#bdbdbd";

const getElementClassName = (classes: unknown): string | null => {
  if (typeof classes === "string") {
    const firstToken = classes.split(/\s+/).find((token) => token.length > 0);
    return firstToken ?? null;
  }

  if (Array.isArray(classes)) {
    for (const className of classes) {
      if (typeof className === "string" && className.trim().length > 0) {
        return className;
      }
    }
  }

  return null;
};

export const getNodeColor = (element: cytoscape.ElementDefinition): string => {
  const activeSchema = getActiveSchemaDefinition();
  const className =
    getElementClassName(element.classes) ??
    activeSchema.nodeClassMap.get(element.data.label) ??
    null;
  const backgroundColor =
    className !== null
      ? activeSchema.entityStyleMap.get(className)?.backgroundColor
      : undefined;

  return typeof backgroundColor === "string"
    ? backgroundColor
    : DEFAULT_NODE_BADGE_COLOR;
};
