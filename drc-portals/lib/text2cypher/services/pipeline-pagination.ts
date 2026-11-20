import type { Neo4jVarType } from "@/lib/text2cypher/neo4j/types";

export const DEFAULT_PIPELINE_LIMIT = 10;
export const MAX_PIPELINE_LIMIT = 50;

export interface PipelinePaginationInput {
  limit?: number;
  offset?: number;
}

export interface PipelinePagination {
  limit: number;
  offset: number;
}

export interface PipelineQueries {
  pagedCypher: string;
  countCypher: string;
}

interface Neo4jIntegerLike {
  toNumber: () => number;
}

const isFiniteInteger = (value: unknown): value is number => {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value)
  );
};

const isNeo4jIntegerLike = (value: unknown): value is Neo4jIntegerLike => {
  return (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: unknown }).toNumber === "function"
  );
};

export const asNonNegativeInteger = (value: unknown): number | null => {
  if (isFiniteInteger(value) && value >= 0) {
    return value;
  }

  if (isNeo4jIntegerLike(value)) {
    const converted = value.toNumber();
    if (isFiniteInteger(converted) && converted >= 0) {
      return converted;
    }
  }

  return null;
};

export const toNeo4jParams = (
  params?: Record<string, unknown>,
): Record<string, Neo4jVarType> => {
  const normalized: Record<string, Neo4jVarType> = {};
  if (!params || typeof params !== "object" || Array.isArray(params)) {
    return normalized;
  }

  for (const [key, value] of Object.entries(params)) {
    normalized[key] = value as Neo4jVarType;
  }

  return normalized;
};

export const resolvePipelinePagination = (
  input?: PipelinePaginationInput,
): PipelinePagination => {
  const rawLimit = input?.limit;
  const rawOffset = input?.offset;

  if (rawLimit !== undefined && !isFiniteInteger(rawLimit)) {
    throw new Error("Invalid pagination: limit must be an integer.");
  }

  if (rawOffset !== undefined && !isFiniteInteger(rawOffset)) {
    throw new Error("Invalid pagination: offset must be an integer.");
  }

  const limit = rawLimit ?? DEFAULT_PIPELINE_LIMIT;
  const offset = Math.max(0, rawOffset ?? 0);

  if (limit < 1) {
    throw new Error("Invalid pagination: limit must be greater than 0.");
  }

  if (limit > MAX_PIPELINE_LIMIT) {
    throw new Error(
      `Invalid pagination: limit must be less than or equal to ${MAX_PIPELINE_LIMIT}.`,
    );
  }

  return {
    limit,
    offset,
  };
};

const getLastTopLevelReturnIndex = (query: string): number => {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let lastReturn = -1;

  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prev = i > 0 ? query[i - 1] : "";

    if (char === "'" && prev !== "\\" && !inDoubleQuote && !inBacktick) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && prev !== "\\" && !inSingleQuote && !inBacktick) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (char === "`" && prev !== "\\" && !inSingleQuote && !inDoubleQuote) {
      inBacktick = !inBacktick;
      continue;
    }

    if (inSingleQuote || inDoubleQuote || inBacktick) {
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth !== 0) {
      continue;
    }

    const maybeReturn = query.slice(i, i + 6);
    if (
      /^return$/i.test(maybeReturn) &&
      !/[A-Za-z0-9_]/.test(query[i + 6] ?? "") &&
      !/[A-Za-z0-9_]/.test(query[i - 1] ?? "")
    ) {
      lastReturn = i;
    }
  }

  return lastReturn;
};

const stripTrailingTopLevelPagination = (queryPrefix: string): string => {
  return queryPrefix
    .replace(/\s+LIMIT\s+\$?[A-Za-z_][A-Za-z0-9_]*\s*$/i, "")
    .replace(/\s+LIMIT\s+\d+\s*$/i, "")
    .replace(/\s+SKIP\s+\$?[A-Za-z_][A-Za-z0-9_]*\s*$/i, "")
    .replace(/\s+SKIP\s+\d+\s*$/i, "")
    .trimEnd();
};

const hasTopLevelUnion = (query: string): boolean => {
  let braceDepth = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inBacktick = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    const prev = i > 0 ? query[i - 1] : "";
    const next = query[i + 1] ?? "";

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }

    if (inSingleQuote) {
      if (char === "'" && prev !== "\\") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inDoubleQuote) {
      if (char === '"' && prev !== "\\") {
        inDoubleQuote = false;
      }
      continue;
    }

    if (inBacktick) {
      if (char === "`" && prev !== "\\") {
        inBacktick = false;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      i += 1;
      continue;
    }

    if (char === "'" && prev !== "\\") {
      inSingleQuote = true;
      continue;
    }

    if (char === '"' && prev !== "\\") {
      inDoubleQuote = true;
      continue;
    }

    if (char === "`" && prev !== "\\") {
      inBacktick = true;
      continue;
    }

    if (char === "{") {
      braceDepth += 1;
      continue;
    }

    if (char === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (char === "(") {
      parenDepth += 1;
      continue;
    }

    if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
      continue;
    }

    if (char === "[") {
      bracketDepth += 1;
      continue;
    }

    if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
      continue;
    }

    if (braceDepth !== 0 || parenDepth !== 0 || bracketDepth !== 0) {
      continue;
    }

    const maybeUnion = query.slice(i, i + 6);
    if (
      /^union$/i.test(maybeUnion) &&
      !/[A-Za-z0-9_]/.test(query[i + 5] ?? "") &&
      !/[A-Za-z0-9_]/.test(query[i - 1] ?? "")
    ) {
      return true;
    }
  }

  return false;
};

export const buildPaginationQueries = (
  cypher: string,
  pagination: PipelinePagination,
): PipelineQueries => {
  if (hasTopLevelUnion(cypher)) {
    throw new Error(
      "Unsupported query shape for pagination: top-level UNION queries are not supported.",
    );
  }

  const returnIndex = getLastTopLevelReturnIndex(cypher);
  if (returnIndex < 0) {
    throw new Error(
      "Unsupported query shape for pagination: missing top-level RETURN clause.",
    );
  }

  const queryPrefix = cypher.slice(0, returnIndex).trimEnd();
  const returnClause = cypher.slice(returnIndex).trimStart();

  const unpagedPrefix = stripTrailingTopLevelPagination(queryPrefix);
  if (!unpagedPrefix) {
    throw new Error(
      "Unsupported query shape for pagination: empty query body before RETURN.",
    );
  }

  const pagedCypher = [
    unpagedPrefix,
    `SKIP ${pagination.offset}`,
    `LIMIT ${pagination.limit}`,
    returnClause,
  ].join("\n");

  const countCypher = `${unpagedPrefix}\nRETURN count(*) AS total_row_count`;

  return {
    pagedCypher,
    countCypher,
  };
};
