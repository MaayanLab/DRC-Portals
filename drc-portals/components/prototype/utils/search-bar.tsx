import { Paper, Popper, Stack } from "@mui/material";
import { ReactElement } from "react";

import {
  INCOMING_CONNECTIONS,
  NODE_LABELS,
  NODE_REPR_OBJECT_STR,
  OUTGOING_CONNECTIONS,
  PROPERTY_MAP,
  RELATIONSHIP_TYPES,
  REL_REPR_OBJECT_STR,
} from "../constants/neo4j";
import {
  OPERATOR_FUNCTIONS,
  PROPERTY_OPERATORS,
} from "../constants/search-bar";
import { Direction } from "../enums/search-bar";
import {
  BasePropertyFilter,
  NodeOption,
  RelationshipOption,
  SearchBarState,
} from "../interfaces/search-bar";
import { SearchBarStateSchema } from "../schemas/search-bar";
import { PredicateFn, SearchBarOption } from "../types/search-bar";
import {
  NodeElementFactory,
  RelationshipElementFactory,
} from "../types/shared";

import {
  ENTITY_TO_FACTORY_MAP,
  createAnonymousNodeElement,
  createLineDividerElement,
  keyInFactoryMapFilter,
} from "./shared";

export const CustomPaper = (props: any) => (
  <Paper {...props} sx={{ width: "fit-content" }} />
);

export const CustomPopper = (props: any) => (
  <Popper {...props} placement="bottom-start" />
);

export const getStateFromQuery = (state: any): SearchBarState | undefined => {
  try {
    SearchBarStateSchema.parse(state);
    return state;
  } catch {
    // If for whatever reason (decoding, parsing, etc.) we couldn't get the state, return undefined instead
    return undefined;
  }
};

export const isRelationshipOption = (
  option: NodeOption | RelationshipOption
): option is RelationshipOption => {
  return (option as RelationshipOption).direction !== undefined;
};

export const createPredicate = (
  variable: string,
  filter: BasePropertyFilter
) => {
  const predicate = OPERATOR_FUNCTIONS.has(filter.operator)
    ? (OPERATOR_FUNCTIONS.get(filter.operator) as PredicateFn)(
        variable,
        filter.name,
        filter.value
      )
    : undefined;

  if (predicate === undefined) {
    console.warn(
      `No predicates exist for operator ${filter.operator} on property ${filter.name}!`
    );
  }
  return predicate;
};

export const createWhereClause = (predicates: string[]) => {
  if (predicates.length === 0) {
    return "// No WHERE clause in this query!";
  }

  let clause = "WHERE ";
  predicates.forEach((predicate, index) => {
    // If it's the first filter in a list of one, or it's the last filter, don't add a boolean operator
    if (
      (index === 0 && predicates.length === 1) ||
      index === predicates.length - 1
    ) {
      clause += `${predicate}`;
    } else {
      clause += `${predicate} AND `; // TODO: Could extend this to allow multiple types of boolean operators, it's a bit of a big feature though
    }
  });

  return clause;
};

export const createCypher = (state: SearchBarState) => {
  const { value, settings } = state;
  let cypherTraversal = "";
  const isSingleNode = value.length === 1 && !isRelationshipOption(value[0]);
  const wherePredicates: string[] = [];
  const nodeLimits: [string, number][] = [];

  value.forEach((entity, index) => {
    const entityIsRelationship = isRelationshipOption(entity);
    const variable = entityIsRelationship ? `r${index}` : `n${index}`;
    const prevIsRelationship =
      index > 0 ? isRelationshipOption(value[index - 1]) : false;

    if (!entityIsRelationship && entity.limit !== undefined) {
      nodeLimits.push([variable, entity.limit]);
    }

    // If the first element of the path is a relationship, prepend it with an anonymous node
    if (index === 0 && entityIsRelationship) {
      cypherTraversal += `(aN${index})`;
    }

    // If the current and previous element are both Relationships, then we need to add an anonymous node between them
    if (entityIsRelationship && prevIsRelationship) {
      cypherTraversal += `(aN${index})`;
    }

    // If the current and previous element are both Nodes, then we need to add an anonymous relationship between them
    if (index !== 0 && !entityIsRelationship && !prevIsRelationship) {
      cypherTraversal += `-[aR${index}]-`;
    }

    if (entityIsRelationship) {
      if (entity.direction === Direction.OUTGOING) {
        cypherTraversal += `-[${variable}:${entity.name}]->`;
      } else if (entity.direction === Direction.INCOMING) {
        cypherTraversal += `<-[${variable}:${entity.name}]-`;
      } else {
        cypherTraversal += `-[${variable}]-`;
      }
    } else {
      cypherTraversal += `(${variable}:${entity.name})`;
    }

    if (entity.filters.length > 0) {
      entity.filters.forEach((filter) => {
        const predicate = createPredicate(variable, filter);
        if (predicate !== undefined) {
          wherePredicates.push(predicate);
        }
      });
    }

    // We've reached the last element in the original path
    if (index === value.length - 1) {
      // If the last element is a relationship, tack on an anonymous node
      if (entityIsRelationship) {
        cypherTraversal += `(end)`;
      }
    }
  });

  const whereClause = createWhereClause(wherePredicates);
  const queryStmts = [];
  const prevVars: string[] = [];

  nodeLimits.forEach(([nodeVar, limit], idx) => {
    queryStmts.push(
      "CALL {",
      prevVars.length > 0
        ? `\tWITH ${prevVars.join(", ")}`
        : "\t// No previous vars to include!",
      `\tMATCH ${cypherTraversal}`,
      `\t${whereClause}`,
      `\tRETURN DISTINCT ${nodeVar}`,
      `\tLIMIT ${limit}`,
      "}"
    );
    prevVars.push(nodeVar);
  });

  queryStmts.push(
    `MATCH path=${cypherTraversal}`,
    whereClause,
    "WITH path",
    `SKIP ${settings?.skip || 0}`,
    `LIMIT ${settings?.limit || 10}`,
    "UNWIND nodes(path) AS n"
  );

  if (isSingleNode) {
    queryStmts.push(
      `RETURN collect(DISTINCT ${NODE_REPR_OBJECT_STR}) AS nodes, [] as relationships`
    );
  } else {
    queryStmts.push(
      "UNWIND relationships(path) AS r",
      `RETURN collect(DISTINCT ${NODE_REPR_OBJECT_STR}) AS nodes, collect(DISTINCT ${REL_REPR_OBJECT_STR}) AS relationships`
    );
  }
  return queryStmts.join("\n");
};

export const getOptions = (value: SearchBarOption[]): SearchBarOption[] => {
  let nodes: NodeOption[];
  let relationships: RelationshipOption[];
  if (value.length === 0) {
    nodes = Array.from(NODE_LABELS)
      .filter(keyInFactoryMapFilter)
      .map((label) => {
        return {
          name: label,
          filters: [],
        };
      });
    relationships = Array.from(RELATIONSHIP_TYPES)
      .filter(keyInFactoryMapFilter)
      .flatMap((type) => {
        return [
          {
            name: type,
            direction: Direction.OUTGOING,
            filters: [],
          },
          {
            name: type,
            direction: Direction.INCOMING,
            filters: [],
          },
        ];
      });
  } else {
    // We can safely rule out a possible undefined value because of the above `if` block
    const last = value.at(-1) as SearchBarOption;

    if (isRelationshipOption(last)) {
      const relationshipType = last.name;
      const secondLast = value.at(-2);

      if (secondLast !== undefined && !isRelationshipOption(secondLast)) {
        // When we know both the preceding node's label and the direction of the relationship, we can simply look into the appropriate
        // connection map for the correct values
        const TYPE_CONNECTIONS =
          last.direction === Direction.OUTGOING
            ? OUTGOING_CONNECTIONS
            : INCOMING_CONNECTIONS;

        nodes =
          TYPE_CONNECTIONS.get(secondLast.name)
            ?.get(last.name)
            ?.map((label) => {
              return {
                name: label,
                filters: [],
              };
            }) || [];
      } else {
        // If there is no previous element, or it is a relationship, the list of nodes is *all* nodes which are possibly connected by this
        // relationship in the *opposite* of the given direction. I.e., if `last` is outgoing, we will find the list of nodes where the type
        // of `last` is *incoming*. ()-[LAST]->(node)
        //
        // Note that we *could* implement this without looking in the opposite direction, but we would need to map over the values of the
        // connection map, which is messier.
        const TYPE_CONNECTIONS =
          last.direction === Direction.OUTGOING
            ? INCOMING_CONNECTIONS
            : OUTGOING_CONNECTIONS;

        nodes = Array.from(TYPE_CONNECTIONS.entries())
          .filter(([_, typeMap]) => typeMap.has(relationshipType))
          .map(([label, _]) => {
            return {
              name: label,
              filters: [],
            };
          });
      }

      if (nodes.length === 0) {
        console.warn(`Type "${relationshipType}" has no node connections!`);
        return [];
      }

      const outgoingSet = new Set<string>();
      const incomingSet = new Set<string>();
      nodes.forEach(({ name }) => {
        // From the potentially connected nodes calculated above, get all outgoing and incoming types.
        Array.from(OUTGOING_CONNECTIONS.get(name)?.keys() || []).forEach(
          (type) => outgoingSet.add(type)
        );
        Array.from(INCOMING_CONNECTIONS.get(name)?.keys() || []).forEach(
          (type) => incomingSet.add(type)
        );
      });
      relationships = [
        ...Array.from(outgoingSet).map((type) => {
          return {
            name: type,
            direction: Direction.OUTGOING,
            filters: [],
          };
        }),
        ...Array.from(incomingSet).map((type) => {
          return {
            name: type,
            direction: Direction.INCOMING,
            filters: [],
          };
        }),
      ];
    } else {
      const nodeLabel = last.name;
      if (
        !OUTGOING_CONNECTIONS.has(nodeLabel) &&
        !INCOMING_CONNECTIONS.has(nodeLabel)
      ) {
        console.warn(`Label "${nodeLabel}" not found in connection map!`);
        return [];
      }
      const outgoing = Array.from(
        OUTGOING_CONNECTIONS.get(nodeLabel)?.keys() || []
      );
      const incoming = Array.from(
        INCOMING_CONNECTIONS.get(nodeLabel)?.keys() || []
      );
      relationships = [
        ...Array.from(outgoing).map((type) => {
          return {
            name: type,
            direction: Direction.OUTGOING,
            filters: [],
          };
        }),
        ...Array.from(incoming).map((type) => {
          return {
            name: type,
            direction: Direction.INCOMING,
            filters: [],
          };
        }),
      ];
      nodes = Array.from(
        new Set([
          ...Array.from(
            OUTGOING_CONNECTIONS.get(nodeLabel)?.values() || []
          ).flat(),
          ...Array.from(
            INCOMING_CONNECTIONS.get(nodeLabel)?.values() || []
          ).flat(),
        ])
      ).map((label) => {
        return {
          name: label,
          filters: [],
        };
      });
    }
  }

  // Sorting relationships and *not* nodes is intentional. Node labels are grouped by "type" (e.g. "Core", "Term", etc.). Relationships
  // don't have a natural grouping, so we instead opt to sort them alphabetically. This has the additional intended effect of putting the
  // outgoing/incoming directions next to each other in the list.
  return [
    ...nodes,
    ...relationships.sort((a, b) => a.name.localeCompare(b.name)),
  ];
};

export const createEntityElement = (entity: SearchBarOption) => {
  if (isRelationshipOption(entity)) {
    return (
      ENTITY_TO_FACTORY_MAP.get(entity.name) as RelationshipElementFactory
    )(entity.name, entity.direction);
  } else {
    return (ENTITY_TO_FACTORY_MAP.get(entity.name) as NodeElementFactory)(
      entity.name
    );
  }
};

export const createNodeSegment = (
  node: JSX.Element,
  prev?: SearchBarOption
) => {
  let segment: JSX.Element[] = [];

  if (prev !== undefined && !isRelationshipOption(prev)) {
    segment.push(createLineDividerElement());
  }

  segment.push(node);

  return segment;
};

export const createSearchPathEl = (path: SearchBarOption[]) => {
  const newPath: ReactElement[] = [];
  path
    .filter((entity) => keyInFactoryMapFilter(entity.name))
    .forEach((entity, index) => {
      // We know for sure the name is in the map from the filter above, but we need the explicit type coercion to ignore errors
      const entityElement = createEntityElement(entity);
      const entityIsRelationship = isRelationshipOption(entity);
      const prevEntity = index > 0 ? path[index - 1] : undefined;
      const prevIsRelationship =
        prevEntity !== undefined && isRelationshipOption(prevEntity);

      // If the first element of the path is a relationship, prepend it with an anonymous node
      if (index === 0 && entityIsRelationship) {
        newPath.push(createAnonymousNodeElement());
      }

      // If the current and previous element are both Relationships, then we need to add an anonymous node between them
      if (index > 0 && entityIsRelationship && prevIsRelationship) {
        newPath.push(createAnonymousNodeElement());
      }

      // Add the current entity
      if (entityIsRelationship) {
        newPath.push(entityElement);
      } else {
        if (prevEntity !== undefined && !prevIsRelationship) {
          newPath.push(createLineDividerElement());
        }
        newPath.push(entityElement);
      }

      // If the last element is a relationship, append an anonymous node
      if (entityIsRelationship && index === path.length - 1) {
        newPath.push(createAnonymousNodeElement());
      }
    });

  return <Stack direction="row">{newPath.map((element) => element)}</Stack>;
};

export const getEntityProperties = (value: SearchBarOption) =>
  PROPERTY_MAP.get(value.name);

export const getPropertyOperators = (property: string) => {
  if (!PROPERTY_OPERATORS.has(property)) {
    console.warn(`No operators exist for property ${property}!`);
  }
  return PROPERTY_OPERATORS.get(property) || [];
};

export const createPropertyFilter = (
  name: string
): BasePropertyFilter | undefined => {
  if (PROPERTY_MAP.has(name)) {
    const propertyName = (PROPERTY_MAP.get(name) as string[])[0];

    const propertyOperator = PROPERTY_OPERATORS.has(propertyName)
      ? (PROPERTY_OPERATORS.get(propertyName) as string[])[0]
      : undefined;

    if (propertyOperator === undefined) {
      return undefined;
    }

    return {
      name: propertyName,
      // type: PropertyType, // TODO
      operator: propertyOperator,
      value: "",
    };
  } else {
    return undefined;
  }
};

export const createSynonymSearchCypher = (
  searchTerm: string,
  synLimit = 100,
  termLimit = 100,
  coreLimit = 10,
  projLimit = 3,
  dccLimit = 1
) => {
  const queryStmts: string[] = [];

  // TODO: Consider pushing the parameterization to the driver
  queryStmts.push(
    `
  CALL db.index.fulltext.queryNodes('synonymIdx', '${searchTerm}')
  YIELD node AS synonym
  WITH synonym
  LIMIT ${synLimit}
  CALL {
    WITH synonym
    MATCH (synonym)<-[:HAS_SYNONYM]-(term)
    RETURN DISTINCT term
    LIMIT ${termLimit}
  }
  CALL {
    WITH synonym, term
    MATCH (term)<-[]-(core)
    WHERE core:File OR core:Biosample OR core:Subject
    RETURN DISTINCT core
    LIMIT ${coreLimit}
  }
  CALL {
    WITH synonym, term, core
    MATCH (core)<-[:CONTAINS]-(project:Project)
    RETURN DISTINCT project
    LIMIT ${projLimit}
  }
  CALL {
    WITH synonym, term, core, project
    MATCH (project)<-[*]-(dcc:DCC)
    RETURN DISTINCT dcc
    LIMIT ${dccLimit}
  }
  MATCH path=(term)<-[]-(core)<-[:CONTAINS]-(project:Project)<-[*]-(dcc:DCC)
  UNWIND nodes(path) AS n
  UNWIND relationships(path) AS r
  RETURN collect(DISTINCT ${NODE_REPR_OBJECT_STR}) AS nodes, collect(DISTINCT ${REL_REPR_OBJECT_STR}) AS relationships
  `
  );

  return queryStmts.join("\n");
};
