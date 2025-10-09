import { CORE_LABELS } from "./constants";
import { Direction } from "./enums";
import { TreeParseResult } from "./types";
import {
  createNodeReprStr,
  createRelReprStr,
  escapeCypherString,
} from "./utils";

export const getNodeByIdAndLabelCypher = (labels: string) => `
  MATCH (n${labels})
  WHERE n._uuid = $id
  RETURN ${createNodeReprStr("n")} AS node
`;

export const getTermsCypher = () => `
    CALL {
      CALL db.index.fulltext.queryNodes('synonymIdx', $phrase)
      YIELD node AS s, score
      WITH s, score
      ORDER BY score DESC
      LIMIT $limit
      MATCH (s)<-[:HAS_SYNONYM]-(cvTerm)
      RETURN s.name AS synonym, cvTerm AS cvTerm

      UNION ALL

      CALL db.index.fulltext.queryNodes('synonymIdx', $substring)
      YIELD node AS s, score
      WITH s, score
      ORDER BY score DESC
      LIMIT $limit
      MATCH (s)<-[:HAS_SYNONYM]-(cvTerm)
      RETURN s.name AS synonym, cvTerm AS cvTerm

      UNION ALL

      CALL db.index.fulltext.queryNodes('synonymIdx', $fuzzy)
      YIELD node AS s, score
      WITH s, score
      ORDER BY score DESC
      LIMIT $limit
      MATCH (s)<-[:HAS_SYNONYM]-(cvTerm)
      RETURN s.name AS synonym, cvTerm AS cvTerm
    }
    RETURN DISTINCT collect(synonym)[0] AS synonym, ${createNodeReprStr(
      "cvTerm"
    )} AS cvTerm
    LIMIT $limit
  `;

export const filterTermBySynonyms = (nodeId: string) => `
    CALL {
      WITH ${nodeId}
      MATCH (s)<-[:HAS_SYNONYM]-(${nodeId})
      WHERE s.name = $phrase
      RETURN ${nodeId} AS term
      LIMIT $limit

      UNION ALL

      WITH ${nodeId}
      MATCH (s)<-[:HAS_SYNONYM]-(${nodeId})
      WHERE s.name =~ $substring
      RETURN ${nodeId} AS term
      LIMIT $limit

      UNION ALL

      WITH ${nodeId}
      MATCH (s)<-[:HAS_SYNONYM]-(${nodeId})
      WHERE apoc.text.fuzzyMatch($phrase, s.name)
      RETURN ${nodeId} AS term
      LIMIT $limit
    }
  `;

export const getTermsFromLabelCypher = (label: string) => `
  MATCH (term:${escapeCypherString(label)})
  WITH term.name AS name
  ORDER BY name
  RETURN collect(name) AS names
`;

export const getTermsFromLabelAndNameCypher = (label: string) => `
    CALL {
      CALL db.index.fulltext.queryNodes('synonymIdx', $name)
      YIELD node AS s
      MATCH (s)<-[:HAS_SYNONYM]-(cvTerm:${escapeCypherString(label)})
      RETURN DISTINCT cvTerm.name AS name
      ORDER BY size(cvTerm.name)
      LIMIT $limit
      UNION ALL
      MATCH (s:Synonym)<-[:HAS_SYNONYM]-(cvTerm:${escapeCypherString(label)})
      WHERE s.name STARTS WITH $name
      RETURN DISTINCT cvTerm.name AS name
      ORDER BY size(cvTerm.name)
      LIMIT $limit
    }
    RETURN collect(DISTINCT name) AS names
  `;

export const getSearchCypher = (coreLabels: string[]) => {
  if (coreLabels.length === 0) {
    coreLabels = Array.from(CORE_LABELS);
  }

  return `
    CALL {
      CALL db.index.fulltext.queryNodes('synonymIdx', $query)
      YIELD node AS synonym
      WITH synonym
      LIMIT $synLimit
      MATCH (synonym)<-[:HAS_SYNONYM]-(term)
      RETURN DISTINCT term
      LIMIT $termLimit
    }
    CALL {
      MATCH (dcc:DCC)
      WHERE size($dccAbbrevs) = 0 OR dcc.abbreviation IN $dccAbbrevs
      RETURN dcc
    }
    CALL {
      WITH term, dcc
      MATCH path=(dcc)-[:REGISTERED]->(:IDNamespace)-[:CONTAINS]->(core:${coreLabels
        .map(escapeCypherString)
        .join(
          "|"
        )})<-[:CONTAINS]-(:Collection)-[:IS_SUPERSET_OF*0..]->(:Collection)-[:CONTAINS]->(term)
      WHERE
        core:File OR
        core:Biosample OR
        (
            core:Subject AND
            (size($subjectGenders) = 0 OR core.sex IN $subjectGenders) AND
            (size($subjectRaces) = 0 OR core.race IN $subjectRaces)
        )
      RETURN DISTINCT path
      LIMIT $collectionLimit
      UNION ALL
      WITH term, dcc
      MATCH path=(term)<-[:ASSOCIATED_WITH|TESTED_FOR|SAMPLED_FROM]-(core:${coreLabels
        .map(escapeCypherString)
        .join(
          "|"
        )})<-[:CONTAINS]-(:Project)<-[:CONTAINS]-(:IDNamespace)<-[:REGISTERED]-(dcc:DCC)
      WHERE
        core:File OR
        core:Biosample OR
        (
            core:Subject AND
            (size($subjectGenders) = 0 OR core.sex IN $subjectGenders) AND
            (size($subjectRaces) = 0 OR core.race IN $subjectRaces)
        )
      RETURN DISTINCT path
      LIMIT $coreLimit
    }
    WITH nodes(path) AS pathNodes, relationships(path) AS pathRels
    UNWIND pathNodes AS n
    UNWIND pathRels AS r
    RETURN
      collect(DISTINCT ${createNodeReprStr("n")}) AS nodes,
      collect(DISTINCT ${createRelReprStr("r")}) AS relationships
    `;
};

export const getSingleMatchCountsQuery = (
  treeParseResult: TreeParseResult,
  usingJoin = false
) => {
  const usingJoinStmts = usingJoin ? treeParseResult.usingJoinStmts : [];

  return [
    "MATCH",
    `${treeParseResult.patterns.join(",\n")}`,
    ...usingJoinStmts,
    ...(treeParseResult.filterMap.size > 0
      ? ["WHERE", Array.from(treeParseResult.filterMap.values()).join(" AND ")]
      : []),
    "RETURN",
    "{\n\t",
    Array.from(treeParseResult.nodeIds)
      .map(escapeCypherString)
      .concat(Array.from(treeParseResult.relIds).map(escapeCypherString))
      .map((id) => `${id}: count(DISTINCT ${id})`)
      .join(",\n\t"),
    "} AS counts",
  ].join("\n");
};

export const createPathwaySearchAllPathsCypher = (
  treeParseResult: TreeParseResult,
  usingJoin = false,
  orderByKey?: string,
  orderByProp?: string,
  order?: "asc" | "desc" | undefined
) => {
  const nodeIds = Array.from(treeParseResult.nodeIds).map(escapeCypherString);
  const relIds = Array.from(treeParseResult.relIds).map(escapeCypherString);
  const usingJoinStmts = usingJoin ? treeParseResult.usingJoinStmts : [];

  return [
    "MATCH",
    `\t${treeParseResult.patterns.join(",\n\t")}`,
    ...usingJoinStmts,
    ...(treeParseResult.filterMap.size > 0
      ? ["WHERE", Array.from(treeParseResult.filterMap.values()).join(" AND ")]
      : []),
    "WITH *",
    // Need to order/paginate before aliasing the results to the return values. In other words: "First order *all* the results by this node
    // and property, then paginate the results, then map that page into the final result." If we did the ordering/pagination *after* the
    // return, we would be ordering the *page* and not the entire result set.
    orderByKey && orderByProp && order && (order === "asc" || order === "desc")
      ? `ORDER BY ${escapeCypherString(orderByKey)}.${escapeCypherString(
          orderByProp
        )} ${order === "asc" ? "ASC" : "DESC"}`
      : "",
    "SKIP $skip",
    "LIMIT $limit",
    "RETURN",
    nodeIds
      .map(
        (id) =>
          `{\n\tuuid: ${id}._uuid,\n\tlabels: labels(${id}),\n\tproperties: properties(${id})\n} AS ${id}`
      )
      .concat(
        relIds.map(
          (id) =>
            `{\n\tuuid: ${id}._uuid,\n\ttype: type(${id}),\n\tproperties: properties(${id}),\n\tstartUUID: startNode(${id})._uuid,\n\tendUUID: endNode(${id})._uuid\n} AS ${id}`
        )
      )
      .join(",\n"),
  ].join("\n");
};

export const createUpperPageBoundCypher = (
  treeParseResult: TreeParseResult,
  usingJoin = false
) => {
  const usingJoinStmts = usingJoin ? treeParseResult.usingJoinStmts : [];

  return [
    "MATCH",
    `\t${treeParseResult.patterns.join(",\n\t")}`,
    ...usingJoinStmts,
    ...(treeParseResult.filterMap.size > 0
      ? ["WHERE", Array.from(treeParseResult.filterMap.values()).join(" AND ")]
      : []),
    "WITH *",
    "SKIP $skip",
    "LIMIT ($maxSiblings - (($skip / $limit) - $lowerPageBound)) * $limit",
    "RETURN toInteger(ceil(toFloat(count(*)) / $limit)) + ($skip / $limit) AS upperPageBound",
  ].join("\n");
};

export const createConnectionPattern = (
  refNodeId: string,
  direction: Direction,
  label?: string,
  type?: string
) => {
  const relPattern =
    type === undefined ? "[]" : `[:${escapeCypherString(type)}]`;
  const nodePattern =
    label === undefined ? "()" : `(:${escapeCypherString(label)})`;
  return `(${escapeCypherString(refNodeId)})${
    direction === Direction.INCOMING ? "<" : ""
  }-${relPattern}-${direction === Direction.OUTGOING ? ">" : ""}${nodePattern}`;
};
