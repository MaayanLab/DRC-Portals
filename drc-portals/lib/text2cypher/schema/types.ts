import type { Template } from "@/lib/text2cypher/neo4j/types";
import type { CytoscapeLayoutOptions } from "@/lib/text2cypher/cytoscape/types";
import type cytoscape from "cytoscape";
import type { CSSProperties } from "react";

export type SchemaNodes = ReadonlyArray<string>;
export type SchemaRelationships = ReadonlyArray<string>;
export type SchemaTemplates = ReadonlyArray<Template>;
export type SchemaNodeClassMap = ReadonlyMap<string, string>;
export type SchemaDisplayPropertyMap = ReadonlyMap<string, string>;
export type SchemaCytoscapeStylesheet =
  ReadonlyArray<cytoscape.StylesheetJsonBlock>;
export type SchemaCytoscapeElements =
  ReadonlyArray<cytoscape.ElementDefinition>;
export type SchemaEntityStyleMap = ReadonlyMap<string, CSSProperties>;
export type SchemaNodeProperties = ReadonlyMap<string, ReadonlyArray<string>>;
export type SchemaPathway = readonly [string, string, string];
export type SchemaPathways = ReadonlyArray<SchemaPathway>;

export interface SchemaDefinition {
  id: string;
  displayName: string;
  domainRules: string;
  nodes: SchemaNodes;
  nodeProperties: SchemaNodeProperties;
  relationships: SchemaRelationships;
  pathways: SchemaPathways;
  templates: SchemaTemplates;
  nodeClassMap: SchemaNodeClassMap;
  displayPropertyMap: SchemaDisplayPropertyMap;
  entityStyleMap: SchemaEntityStyleMap;
  resultStylesheet: SchemaCytoscapeStylesheet;
  presetElements: SchemaCytoscapeElements;
  presetLayout: CytoscapeLayoutOptions;
  presetStylesheet: SchemaCytoscapeStylesheet;
}
