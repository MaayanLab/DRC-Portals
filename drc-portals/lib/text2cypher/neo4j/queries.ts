import { Neo4jError, Plan, RecordShape, int } from "neo4j-driver";

import type { Neo4jVarType } from "./types";
import { getSession } from "./session";

const serializeParams = (params: { [key: string]: Neo4jVarType }) => {
  Object.keys(params).forEach((key) => {
    if (typeof params[key] === "number") {
      params[key] = int(params[key]);
    }
  });
  return params;
};

export const runCypherQuery = async <T extends RecordShape>(
  query: string,
  params?: { [key: string]: Neo4jVarType },
): Promise<T[]> => {
  const session = getSession();

  try {
    const clean = query.trim();
    const res = await session.executeRead((tx) => {
      return tx.run(clean, serializeParams(params || {}));
    });
    return res.records.map((record) => record.toObject());
  } catch (e: unknown) {
    if (e instanceof Neo4jError) {
      if (e.code === "Neo.ClientError.Statement.SyntaxError") {
        return Promise.reject(`CypherSyntaxError: ${e.message}`);
      } else if (e.code && e.code.startsWith("Neo.ClientError")) {
        return Promise.reject(`Neo4jError: ${e.message}`);
      }
    }
    return Promise.reject(`An unexpected error occurred: ${e}`);
  } finally {
    await session.close();
  }
};

export const fetchSchema = async (): Promise<string> => {
  // const nodePropsQuery = `
  //   CALL db.schema.nodeTypeProperties()
  //   YIELD nodeType, nodeLabels, propertyName, propertyTypes
  //   RETURN nodeLabels, propertyName, propertyTypes
  //   ORDER BY nodeLabels, propertyName
  // `;

  const patternQuery = `
    MATCH (a)-[r]->(b)
    RETURN DISTINCT
        labels(a)[0]  AS from_label,
        type(r)       AS rel_type,
        labels(b)[0]  AS to_label
    ORDER BY rel_type
  `;

  // const _SKIP_ENUM = new Set(["id", "title", "doi", "email"]);

  try {
    // const nodeRecords = await runCypherQuery<{
    //   nodeLabels: string[];
    //   propertyName: string;
    //   propertyTypes: string[];
    // }>(nodePropsQuery);

    // const labelProps: Record<string, [string, string][]> = {};
    // const stringProps: [string, string][] = [];

    // for (const rec of nodeRecords) {
    //   const label = rec.nodeLabels[0] || "Unknown";
    //   const prop = rec.propertyName;
    //   const ptype = rec.propertyTypes[0]?.toLowerCase() || "unknown";
    //   if (prop) {
    //     if (!labelProps[label]) {
    //       labelProps[label] = [];
    //     }
    //     labelProps[label].push([prop, ptype]);
    //     if (ptype.startsWith("string") && !_SKIP_ENUM.has(prop)) {
    //       stringProps.push([label, prop]);
    //     }
    //   }
    // }

    // // Enumerate low-cardinality string properties
    // const enumValues: Record<string, string[]> = {};
    // for (const [label, prop] of stringProps) {
    //   const countRec = await runCypherQuery<{ cnt: number }>(
    //     `MATCH (n:${label}) WHERE n.${prop} IS NOT NULL RETURN count(DISTINCT n.${prop}) AS cnt`,
    //   );
    //   const cnt = countRec[0]?.cnt || 0;
    //   if (cnt > 0 && cnt <= 20) {
    //     const valRecs = await runCypherQuery<{ val: string }>(
    //       `MATCH (n:${label}) WHERE n.${prop} IS NOT NULL RETURN DISTINCT n.${prop} AS val LIMIT 20`,
    //     );
    //     enumValues[`${label}.${prop}`] = valRecs.map((r) => r.val);
    //   }
    // }

    // // Render node section
    // let nodeSection = "Node properties:\n";
    // for (const [label, props] of Object.entries(labelProps).sort()) {
    //   const parts = props.map(([prop, ptype]) => {
    //     let desc = `${prop} (${ptype})`;
    //     const vals = enumValues[`${label}.${prop}`];
    //     if (vals) {
    //       desc += ` [values: ${vals.join(", ")}]`;
    //     }
    //     return desc;
    //   });
    //   nodeSection += `- ${label}: ${parts.join(", ")}\n`;
    // }

    // Build relationships section
    const patternRecords = await runCypherQuery<{
      from_label: string;
      rel_type: string;
      to_label: string;
    }>(patternQuery);
    let relSection = "\nRelationships:\n";
    const seen = new Set<string>();
    for (const rec of patternRecords) {
      const pattern = `(:${rec.from_label})-[:${rec.rel_type}]->(:${rec.to_label})`;
      if (!seen.has(pattern)) {
        relSection += `${pattern}\n`;
        seen.add(pattern);
      }
    }

    return relSection;
    // return nodeSection + relSection;
  } catch (e: unknown) {
    if (e instanceof Neo4jError) {
      return `Schema retrieval error: ${e.message}`;
    }
    return `An unexpected error occurred: ${e}`;
  }
};

export const fetchNodeCount = async (): Promise<number> => {
  const query = "MATCH (n) RETURN count(n) AS total";
  try {
    const result = await runCypherQuery<{ total: number }>(query);
    return result[0]?.total || 0;
  } catch (e: unknown) {
    if (e instanceof Neo4jError) {
      console.error(`Error getting node count: ${e.message}`);
      return 0;
    }
    console.error(`An unexpected error occurred: ${e}`);
    return 0;
  }
};

export const fetchLabels = async () => {
  const query = "CALL db.labels() YIELD label RETURN label ORDER BY label";
  const result = await runCypherQuery<{ label: string }>(query);
  return result.map((record) => record.label as string);
};

export const fetchRelationshipTypes = async (): Promise<string[]> => {
  const query =
    "CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType ORDER BY relationshipType";
  const result = await runCypherQuery<{ relationshipType: string }>(query);
  return result.map((record) => record.relationshipType as string);
};

export const explainQuery = async (
  query: string,
  params?: { [key: string]: Neo4jVarType },
) => {
  const session = getSession();

  try {
    try {
      const clean = query.trim().replace(/^EXPLAIN\s+/i, "");
      const res = await session.executeRead((tx) => {
        return tx.run(`EXPLAIN ${clean}`, params);
      });
      const summary = res.summary;
      const plan = summary.plan;

      const formatPlan = (p: Plan, indent: number = 0): string => {
        const prefix = "  ".repeat(indent);
        const argsStr = Object.entries(p.arguments || {})
          .map(([k, v]) => `${k}=${v}`)
          .join(", ");
        let out = `${prefix}${p.operatorType || "Unknown"}(${argsStr})\n`;
        for (const child of p.children || []) {
          out += formatPlan(child, indent + 1);
        }
        return out;
      };

      if (plan) {
        return formatPlan(plan);
      }
    } catch (e: unknown) {
      if (e instanceof Neo4jError) {
        if (e.code === "Neo.ClientError.Statement.SyntaxError") {
          return `CypherSyntaxError: ${e.message}`;
        } else if (e.code && e.code.startsWith("Neo.ClientError")) {
          return `Neo4jError: ${e.message}`;
        }
      } else {
        return `An unexpected error occurred: ${e}`;
      }
    }
    return "No plan returned.";
  } finally {
    await session.close();
  }
};
