const VALID_STARTS = /^\s*(MATCH|RETURN|WITH|MERGE|CREATE|CALL|UNWIND)\b/i;

// Captures everything after the last RETURN keyword
const RETURN_CLAUSE_RE = /\bRETURN\s+(.*?)$/i;

export const isValid = (cypher: string): boolean => {
  return VALID_STARTS.test(cypher.trim());
};

/* Strip markdown fences and return the first Cypher-looking statement. */
export const extract = (raw: string): string => {
  let text = raw.trim();

  // Unescape literal \n / \t that some models emit instead of real whitespace
  text = text.replace(/\\n/g, "\n").replace(/\\t/g, "\t");

  // Handle ```cypher ... ``` or ``` ... ```
  const fenceMatch = text.match(/```(?:cypher)?\s*\n?(.*?)```/is);
  if (fenceMatch) {
    text = fenceMatch[1].trim();
  }

  // Walk lines to find first valid Cypher start
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    if (isValid(lines[i])) {
      return lines.slice(i).join("\n").trim();
    }
  }

  return text;
};

export const detectEntityMismatch = (
  cypher: string,
  labels: ReadonlyArray<string>,
  types: ReadonlyArray<string>,
): string[] => {
  const validLabels = new Set(labels);
  const validTypes = new Set(types);

  // Node labels: (var:Label) or (:Label) anywhere in the query
  const foundLabels = new Set(
    Array.from(cypher.matchAll(/\(\w*\s*:(\w+)/g), (m) => m[1]),
  );
  // WHERE/AND/OR label predicates: e.g. "WHERE n:Patient"
  for (const m of cypher.matchAll(/(?:WHERE|AND|OR)\s+\w+:(\w+)/gi)) {
    foundLabels.add(m[1]);
  }

  // Relationship types: [:Type] or [r:Type]
  const foundRelationships = new Set(
    Array.from(cypher.matchAll(/\[\w*\s*:(\w+)/g), (m) => m[1]),
  );

  const errors: string[] = [];

  const invalidLabels = [...foundLabels].filter((l) => !validLabels.has(l));
  if (invalidLabels.length > 0) {
    errors.push(
      `Invalid node labels: ${invalidLabels.join(", ")}. Valid labels: ${[
        ...validLabels,
      ].join(", ")}`,
    );
  }

  const invalidRels = [...foundRelationships].filter((r) => !validTypes.has(r));
  if (invalidRels.length > 0) {
    errors.push(
      `Invalid relationship types: ${invalidRels.join(
        ", ",
      )}. Valid types: ${[...validTypes].join(", ")}`,
    );
  }

  return errors;
};

export const detectNotInSchema = (raw: string): string | null => {
  const stripped = raw.trim();
  if (stripped.startsWith("NOT_IN_SCHEMA:")) {
    return stripped;
  }
  return null;
};

export const validateReturn = (cypher: string): boolean => {
  const match = RETURN_CLAUSE_RE.exec(cypher);
  if (!match) {
    return true;
  }

  let returnClause = match[1].trim();
  // Strip ORDER BY / LIMIT / SKIP suffixes before checking items
  returnClause = returnClause.split(/\b(ORDER\s+BY|LIMIT|SKIP)\b/i)[0];

  const items = returnClause.split(",").map((item) => item.trim());
  for (const item of items) {
    // Remove alias (AS ...) to inspect the expression
    const expr = item.split(/\bAS\b/i)[0].trim();
    // A bare variable has no dot and is a simple identifier
    if (expr && /^\w+$/.test(expr)) {
      console.warn(
        "Bare RETURN variable detected: %r in query: %s",
        expr,
        cypher,
      );
      return false;
    }
  }
  return true;
};
