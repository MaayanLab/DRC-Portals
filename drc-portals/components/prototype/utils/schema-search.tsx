import { Direction } from "@/lib/neo4j/enums";
import {
  INCOMING_CONNECTIONS,
  NODE_LABELS,
  OUTGOING_CONNECTIONS,
  RELATIONSHIP_TYPES,
} from "@/lib/neo4j/constants";
import {
  NodePathElement,
  PathElement,
  RelationshipPathElement,
} from "@/lib/neo4j/types";

import { labelInFactoryMapFilter, typeInFactoryMapFilter } from "./shared";

const isRelationshipOption = (
  option: NodePathElement | RelationshipPathElement
): option is RelationshipPathElement => {
  return (option as RelationshipPathElement).direction !== undefined;
};

const getAllNodeOptions = () => {
  return Array.from(NODE_LABELS)
    .filter(labelInFactoryMapFilter)
    .map((label) => {
      return {
        name: label,
        filters: [],
      };
    });
};

const getAllRelationshipOptions = () => {
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

export const getOptions = (value?: PathElement[]): PathElement[] => {
  let nodes: NodePathElement[];
  let relationships: RelationshipPathElement[];
  if (value === undefined || value.length === 0) {
    nodes = getAllNodeOptions();
    relationships = getAllRelationshipOptions();
  } else {
    // We can safely rule out a possible undefined value because of the above `if` block
    const last = value.at(-1) as PathElement;

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
