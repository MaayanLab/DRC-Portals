import { CORE_LABELS } from "@/components/prototype/constants/neo4j";

import { Direction } from "./enums";
import {
  createNodeReprStr,
  createRelReprStr,
  escapeCypherString,
} from "./utils";

export const getExpandNodeCypher = (
  nodeLabel: string,
  direction: string,
  relType: string
) => {
  const relMatch =
    direction === Direction.INCOMING
      ? `<-[r:${relType}]-`
      : `-[r:${relType}]->`;
  return [
    `MATCH (n)${relMatch}(m:${nodeLabel})`,
    `WHERE id(n) = $nodeId`,
    `WITH DISTINCT m, r`,
    "LIMIT $limit",
    `RETURN DISTINCT collect(DISTINCT ${createNodeReprStr(
      "m"
    )}) AS nodes, collect(DISTINCT ${createRelReprStr("r")}) AS relationships`,
  ].join("\n");
};

export const getOutgoingRelsCypher = () => `
  MATCH (n)-[outgoingRel]->(m)
  WHERE id(n) = $nodeId
  WITH labels(m) AS outgoingLabels, type(outgoingRel) AS outgoingType
  RETURN outgoingLabels, outgoingType, count([outgoingLabels, outgoingType]) AS count
`;

export const getIncomingRelsCypher = () => `
  MATCH (n)-[incomingRel]->(m)
  WHERE id(m) = $nodeId
  WITH labels(n) AS incomingLabels, type(incomingRel) AS incomingType
  RETURN incomingLabels, incomingType, count([incomingLabels, incomingType]) AS count
`;

export const getSynonymsCypher = () => `
  CALL {
    CALL db.index.fulltext.queryNodes('synonymIdx', $query)
    YIELD node AS s
    RETURN s.name AS synonym
    LIMIT $limit
    UNION ALL
    MATCH (s:Synonym)
    WHERE s.name STARTS WITH $query
    RETURN s.name AS synonym
    ORDER BY size(s.name)
    LIMIT $limit
  }
  RETURN DISTINCT synonym
  ORDER BY size(synonym)
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
        .join("|")})<-[:CONTAINS]-(:IDNamespace)<-[:REGISTERED]-(dcc:DCC)
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
