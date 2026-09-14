import { RefObject, useEffect } from "react";
import cytoscape from "cytoscape";

export interface CytoscapeSelectedNode {
  id: string;
  label: string;
  displayLabel?: string;
  properties: Record<string, unknown>;
  classes: string[];
}

export interface CytoscapeSelectedRelationship {
  type: string;
  source: string;
  target: string;
  properties: Record<string, unknown>;
}

export type CytoscapeReference = RefObject<cytoscape.Core | undefined>;

interface UseCytoscapeInteractionEventsOptions {
  cyRef: CytoscapeReference;
  onNodeTap?: (node: CytoscapeSelectedNode) => void;
  onRelationshipTap?: (relationship: CytoscapeSelectedRelationship) => void;
  onCanvasTap?: () => void;
  onNodeContextTap?: (node: CytoscapeSelectedNode) => void;
}

const asRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
};

const asOptionalString = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  return undefined;
};

export const toSelectedNode = (
  event: cytoscape.EventObjectNode,
): CytoscapeSelectedNode => {
  const data = asRecord(event.target.data());

  return {
    id: event.target.id(),
    label: asOptionalString(data.label) ?? event.target.id(),
    displayLabel: asOptionalString(data.displayLabel),
    properties: asRecord(data.properties),
    classes: Array.isArray(event.target.classes())
      ? (event.target.classes() as string[])
      : [],
  };
};

export const toSelectedRelationship = (
  event: cytoscape.EventObject,
): CytoscapeSelectedRelationship => {
  const data = asRecord(event.target.data());

  return {
    type: asOptionalString(data.type) ?? "",
    source: asOptionalString(data.source) ?? "",
    target: asOptionalString(data.target) ?? "",
    properties: asRecord(data.properties),
  };
};

export function useCytoscapeInteractionEvents({
  cyRef,
  onNodeTap,
  onRelationshipTap,
  onCanvasTap,
  onNodeContextTap,
}: UseCytoscapeInteractionEventsOptions) {
  useEffect(() => {
    let frameId: number | null = null;
    let unbind: (() => void) | null = null;

    const bindEvents = () => {
      const cy = cyRef.current;
      if (cy === undefined) {
        frameId = window.requestAnimationFrame(bindEvents);
        return;
      }

      const handleNodeTap = (event: cytoscape.EventObjectNode) => {
        onNodeTap?.(toSelectedNode(event));
      };

      const handleRelationshipTap = (event: cytoscape.EventObject) => {
        onRelationshipTap?.(toSelectedRelationship(event));
      };

      const handleCanvasTap = (event: cytoscape.EventObject) => {
        if (event.target === event.cy) {
          onCanvasTap?.();
        }
      };

      const handleNodeContextTap = (event: cytoscape.EventObjectNode) => {
        onNodeContextTap?.(toSelectedNode(event));
      };

      if (onNodeTap !== undefined) {
        cy.on("tap", "node", handleNodeTap);
      }

      if (onRelationshipTap !== undefined) {
        cy.on("tap", "edge", handleRelationshipTap);
      }

      if (onCanvasTap !== undefined) {
        cy.on("tap", handleCanvasTap);
      }

      if (onNodeContextTap !== undefined) {
        cy.on("cxttap", "node", handleNodeContextTap);
      }

      unbind = () => {
        if (onNodeTap !== undefined) {
          cy.off("tap", "node", handleNodeTap);
        }

        if (onRelationshipTap !== undefined) {
          cy.off("tap", "edge", handleRelationshipTap);
        }

        if (onCanvasTap !== undefined) {
          cy.off("tap", handleCanvasTap);
        }

        if (onNodeContextTap !== undefined) {
          cy.off("cxttap", "node", handleNodeContextTap);
        }
      };
    };

    bindEvents();

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      unbind?.();
    };
  }, [cyRef, onNodeTap, onRelationshipTap, onCanvasTap, onNodeContextTap]);
}
