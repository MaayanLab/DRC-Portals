"use client";

import CytoscapeChartWrapper from "./shared/CytoscapeChartWrapper";
import { getActiveSchemaDefinition } from "@/lib/text2cypher/schema/active";

export default function SchemaTab() {
  const activeSchema = getActiveSchemaDefinition();

  return (
    <CytoscapeChartWrapper
      layout={activeSchema.presetLayout}
      elements={[...activeSchema.presetElements]}
      stylesheet={[...activeSchema.presetStylesheet]}
      showContextMenu={false}
      showDrawer={false}
      style={{
        height: "100em",
        width: "100em",
        maxWidth: "100%",
        minWidth: "30%",
        maxHeight: "512px",
      }}
    />
  );
}
