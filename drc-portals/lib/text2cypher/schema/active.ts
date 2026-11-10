import {
  getSchemaDefinition,
  isSchemaId,
  type SchemaId,
  SCHEMA_REGISTRY,
} from "@/lib/text2cypher/schema/registry";

const DEFAULT_SCHEMA_ID: SchemaId = "c2m2";
const configuredSchemaId =
  process.env.NEXT_PUBLIC_SCHEMA_ID ?? DEFAULT_SCHEMA_ID;

if (!isSchemaId(configuredSchemaId)) {
  const validSchemaIds = Object.keys(SCHEMA_REGISTRY).join(", ");
  throw new Error(
    `Invalid NEXT_PUBLIC_SCHEMA_ID: ${configuredSchemaId}. Expected one of: ${validSchemaIds}`,
  );
}

export const ACTIVE_SCHEMA_ID: SchemaId = configuredSchemaId;

export const getActiveSchemaDefinition = () =>
  getSchemaDefinition(ACTIVE_SCHEMA_ID);
