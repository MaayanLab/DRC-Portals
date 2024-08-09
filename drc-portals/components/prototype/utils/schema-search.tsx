import { Paper, Popper } from "@mui/material";
import { CSSProperties, ReactElement } from "react";
import { v4 } from "uuid";

import {
  INCOMING_CONNECTIONS,
  NODE_LABELS,
  OUTGOING_CONNECTIONS,
  PROPERTY_MAP,
  RELATIONSHIP_TYPES,
} from "../constants/neo4j";
import { PROPERTY_OPERATORS } from "../constants/schema-search";
import { Direction } from "../enums/schema-search";
import {
  BasePropertyFilter,
  NodeOption,
  RelationshipOption,
} from "../interfaces/schema-search";
import { SearchBarOption } from "../types/schema-search";
import {
  NodeElementFactory,
  RelationshipElementFactory,
} from "../types/shared";

import {
  LABEL_TO_FACTORY_MAP,
  TYPE_TO_FACTORY_MAP,
  createAnonymousNodeElement,
  createLineDividerElement,
  factoryExistsFilter,
  labelInFactoryMapFilter,
  typeInFactoryMapFilter,
} from "./shared";

export const CustomPaper = (props: any) => (
  <Paper {...props} sx={{ width: "fit-content" }} />
);

export const CustomPopper = (props: any) => (
  <Popper {...props} placement="bottom-start" />
);

export const isRelationshipOption = (
  option: NodeOption | RelationshipOption
): option is RelationshipOption => {
  return (option as RelationshipOption).direction !== undefined;
};

export const getAllNodeOptions = () => {
  return Array.from(NODE_LABELS)
    .filter(labelInFactoryMapFilter)
    .map((label) => {
      return {
        name: label,
        filters: [],
      };
    });
};

export const getAllRelationshipOptions = () => {
  return Array.from(RELATIONSHIP_TYPES)
    .filter(typeInFactoryMapFilter)
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
};

export const getOptions = (value?: SearchBarOption[]): SearchBarOption[] => {
  let nodes: NodeOption[];
  let relationships: RelationshipOption[];
  if (value === undefined || value.length === 0) {
    nodes = getAllNodeOptions();
    relationships = getAllRelationshipOptions();
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

export const createEntityElement = (
  entity: SearchBarOption,
  style?: CSSProperties
) => {
  if (isRelationshipOption(entity)) {
    return (TYPE_TO_FACTORY_MAP.get(entity.name) as RelationshipElementFactory)(
      entity.name,
      entity.direction,
      entity.key
    );
  } else {
    return (LABEL_TO_FACTORY_MAP.get(entity.name) as NodeElementFactory)(
      entity.name,
      entity.key,
      style
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

export const getSearchPathElements = (path: SearchBarOption[]) => {
  const newPath: ReactElement[][] = [];
  path
    .filter((entity) => factoryExistsFilter(entity.name))
    .forEach((entity, index) => {
      // We know for sure the name is in the map from the filter above, but we need the explicit type coercion to ignore errors
      const compositeElement: ReactElement[] = [];
      const entityElement = createEntityElement(entity);
      const entityIsRelationship = isRelationshipOption(entity);
      const prevEntity = index > 0 ? path[index - 1] : undefined;
      const prevIsRelationship =
        prevEntity !== undefined && isRelationshipOption(prevEntity);

      // If the first element of the path is a relationship, prepend it with an anonymous node
      if (index === 0 && entityIsRelationship) {
        compositeElement.push(createAnonymousNodeElement());
      }

      // If the current and previous element are both Relationships, then we need to add an anonymous node between them
      if (index > 0 && entityIsRelationship && prevIsRelationship) {
        compositeElement.push(createAnonymousNodeElement());
      }

      // Add the current entity
      if (entityIsRelationship) {
        compositeElement.push(entityElement);
      } else {
        if (prevEntity !== undefined && !prevIsRelationship) {
          compositeElement.push(createLineDividerElement());
        }
        compositeElement.push(entityElement);
      }

      // If the last element is a relationship, append an anonymous node
      if (entityIsRelationship && index === path.length - 1) {
        compositeElement.push(createAnonymousNodeElement());
      }
      newPath.push(compositeElement);
    });

  return newPath;
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
      paramName: v4().replace(/\-/g, "_"),
    };
  } else {
    return undefined;
  }
};
