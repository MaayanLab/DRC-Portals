import { Stack } from "@mui/material";
import { ReactElement } from "react";

import {
  LABEL_CONNECTIONS,
  NODE_LABELS,
  NODE_PROPERTY_MAP,
  NODE_REPR_OBJECT_STR,
  RELATIONSHIP_PROPERTY_MAP,
  RELATIONSHIP_TYPES,
  REL_REPR_OBJECT_STR,
  TYPE_CONNECTIONS,
} from "../constants/neo4j";
import {
  OPERATOR_FUNCTIONS,
  PROPERTY_OPERATORS,
  PredicateFn,
} from "../constants/search-bar";
import {
  BasePropertyFilter,
  SearchBarOption,
  SearchQuerySettings,
} from "../interfaces/search-bar";

import {
  ENTITY_TO_FACTORY_MAP,
  GraphElementFactory,
  createAnonymousNode,
  createArrowDivider,
  createLineDivider,
  keyInFactoryMapFilter,
} from "./shared";

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
    return "";
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

export const createCypher = (
  value: SearchBarOption[],
  settings?: SearchQuerySettings
) => {
  let cypherTraversal = "";
  const isSingleNode = value.length === 1 && !value[0].isRelationship;
  const wherePredicates: string[] = [];

  value.forEach((entity, index) => {
    const variable = entity.isRelationship ? `r${index}` : `n${index}`;
    const prevIsRelationship =
      index > 0 ? value[index - 1].isRelationship : false;

    // If the first element of the path is a relationship, prepend it with an anonymous node
    if (index === 0 && entity.isRelationship) {
      cypherTraversal += `(${variable})`;
    }

    // If the current and previous element are both Relationships, then we need to add an anonymous node between them
    if (entity.isRelationship && prevIsRelationship) {
      cypherTraversal += `(${variable})`;
    }

    // If the current and previous element are both Nodes, then we need to add an anonymous relationship between them
    if (index !== 0 && !entity.isRelationship && !prevIsRelationship) {
      cypherTraversal += `-[${variable}]-`;
    }

    if (entity.isRelationship) {
      cypherTraversal += `-[${variable}:${entity.name}]-`;
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
      if (entity.isRelationship) {
        cypherTraversal += "()";
      }
    }
  });

  const queryStmts = [`MATCH path=${cypherTraversal}`];

  if (wherePredicates.length > 0) {
    queryStmts.push(createWhereClause(wherePredicates));
  }

  queryStmts.push(
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
  if (value.length === 0) {
    return [
      ...Array.from(NODE_LABELS)
        .filter(keyInFactoryMapFilter)
        .map((label) => {
          return {
            name: label,
            isRelationship: false,
            filters: [],
          } as SearchBarOption;
        }),
      ...Array.from(RELATIONSHIP_TYPES)
        .filter(keyInFactoryMapFilter)
        .map((label) => {
          return {
            name: label,
            isRelationship: true,
            filters: [],
          } as SearchBarOption;
        }),
    ];
  }

  // We can safely rule out a possible undefined value because of the above `if` block
  const last = value.at(-1) as SearchBarOption;
  const connectionMap = last.isRelationship
    ? TYPE_CONNECTIONS
    : LABEL_CONNECTIONS;

  if (!connectionMap.has(last.name)) {
    console.warn(`Name "${last}" not found in connection map!`);
    return [];
  }

  // Same type coercion trick as above
  return (connectionMap.get(last.name) as string[])
    .filter(keyInFactoryMapFilter)
    .map((name: string) => {
      return {
        name,
        isRelationship: RELATIONSHIP_TYPES.has(name),
        filters: [],
      };
    });
};

export const createEntityElement = (entity: SearchBarOption) => {
  return (ENTITY_TO_FACTORY_MAP.get(entity.name) as GraphElementFactory)(
    entity.name
  );
};

export const createSearchPathEl = (path: SearchBarOption[]) => {
  const newPath: ReactElement[] = [];
  path
    .filter((entity) => keyInFactoryMapFilter(entity.name))
    .forEach((entity, index) => {
      // We know for sure the name is in the map from the filter above, but we need the explicit type coercion to ignore errors
      const element = createEntityElement(entity);

      // If the first element of the path is a relationship, prepend it with an anonymous node
      if (index === 0 && entity.isRelationship) {
        newPath.push(createAnonymousNode());
        newPath.push(createLineDivider());
      }

      // If the current and previous element are both Relationships, then we need to add an anonymous node between them
      if (
        index > 0 &&
        entity.isRelationship &&
        path[index - 1].isRelationship
      ) {
        newPath.push(createArrowDivider());
        newPath.push(createAnonymousNode());
      }

      // Always add a divider before the new element (unless it's the first one)
      if (index !== 0) {
        newPath.push(
          entity.isRelationship ? createLineDivider() : createArrowDivider()
        );
      }

      newPath.push(element);

      if (index === path.length - 1) {
        // If the last element is a relationship, tack on an anonymous node
        if (entity.isRelationship) {
          newPath.push(createArrowDivider());
          newPath.push(createAnonymousNode());
        }
      }
    });

  return <Stack direction="row">{newPath.map((element) => element)}</Stack>;
};

export const getEntityProperties = (value: SearchBarOption) =>
  value.isRelationship
    ? RELATIONSHIP_PROPERTY_MAP.get(value.name)
    : NODE_PROPERTY_MAP.get(value.name);

export const getPropertyOperators = (property: string) => {
  if (!PROPERTY_OPERATORS.has(property)) {
    console.warn(`No operators exist for property ${property}!`);
  }
  return PROPERTY_OPERATORS.get(property) || [];
};

export const createPropertyFilter = (
  name: string
): BasePropertyFilter | undefined => {
  {
    /* TODO: Relies on the assumption node labels and relationship types don't overlap... */
  }
  if (NODE_PROPERTY_MAP.has(name) || RELATIONSHIP_PROPERTY_MAP.has(name)) {
    const propertyName = NODE_PROPERTY_MAP.has(name)
      ? (NODE_PROPERTY_MAP.get(name) as string[])[0]
      : (RELATIONSHIP_PROPERTY_MAP.get(name) as string[])[0];
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
