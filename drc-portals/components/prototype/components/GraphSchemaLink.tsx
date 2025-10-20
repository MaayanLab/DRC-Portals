"use client";

import { getExternalLinkElement } from "../utils/shared";

export default function GraphSchemaLink() {
  return getExternalLinkElement(
    "/data/c2m2/graph/schema",
    "Graph Schema Diagram"
  );
}
