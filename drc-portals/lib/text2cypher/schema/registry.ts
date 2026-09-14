// C2M2
import c2m2Preset from "@/lib/text2cypher/constants/cy/presets/c2m2";
import c2m2CytoscapeStyles from "@/lib/text2cypher/constants/cy/styles/c2m2";
import { COMPACT_C2M2_DOMAIN_RULES } from "@/lib/text2cypher/llm/prompts/c2m2";
import { templates as c2m2Templates } from "@/lib/text2cypher/neo4j/query-templates/c2m2";
import c2m2Schema from "@/lib/text2cypher/neo4j/schemas/c2m2";

// MW
import mwPreset from "@/lib/text2cypher/constants/cy/presets/mw";
import mwCytoscapeStyles from "@/lib/text2cypher/constants/cy/styles/mw";
import { MW_DOMAIN_RULES } from "@/lib/text2cypher/llm/prompts/mw";
import { templates as mwTemplates } from "@/lib/text2cypher/neo4j/query-templates/mw";
import mwSchema from "@/lib/text2cypher/neo4j/schemas/mw";

import type { SchemaDefinition } from "./types";

export const SCHEMA_REGISTRY = {
  c2m2: {
    id: "c2m2",
    displayName: "C2M2",
    domainRules: COMPACT_C2M2_DOMAIN_RULES,
    nodes: c2m2Schema.NODES,
    nodeProperties: c2m2Schema.NODE_PROPERTIES,
    relationships: c2m2Schema.RELATIONSHIPS,
    pathways: c2m2Schema.PATHWAYS,
    templates: c2m2Templates,
    nodeClassMap: c2m2CytoscapeStyles.NODE_CLASS_MAP,
    displayPropertyMap: c2m2CytoscapeStyles.NODE_DISPLAY_PROPERTY_MAP,
    entityStyleMap: c2m2CytoscapeStyles.ENTITY_STYLES_MAP,
    resultStylesheet: c2m2CytoscapeStyles.ENTITY_STYLESHEET_CLASSES,
    presetElements: c2m2Preset.ELEMENTS,
    presetLayout: c2m2Preset.LAYOUT,
    presetStylesheet: c2m2Preset.STYLESHEET,
  },
  mw: {
    id: "mw",
    displayName: "MW",
    domainRules: MW_DOMAIN_RULES,
    nodes: mwSchema.NODES,
    nodeProperties: mwSchema.NODE_PROPERTIES,
    relationships: mwSchema.RELATIONSHIPS,
    pathways: mwSchema.PATHWAYS,
    templates: mwTemplates,
    nodeClassMap: mwCytoscapeStyles.NODE_CLASS_MAP,
    displayPropertyMap: mwCytoscapeStyles.NODE_DISPLAY_PROPERTY_MAP,
    entityStyleMap: mwCytoscapeStyles.ENTITY_STYLES_MAP,
    resultStylesheet: mwCytoscapeStyles.ENTITY_STYLESHEET_CLASSES,
    presetElements: mwPreset.ELEMENTS,
    presetLayout: mwPreset.LAYOUT,
    presetStylesheet: mwPreset.STYLESHEET,
  },
} satisfies Record<string, SchemaDefinition>;

export type SchemaId = keyof typeof SCHEMA_REGISTRY;

export const isSchemaId = (value: string): value is SchemaId =>
  value in SCHEMA_REGISTRY;

export const getSchemaDefinition = (schemaId: SchemaId): SchemaDefinition =>
  SCHEMA_REGISTRY[schemaId];
