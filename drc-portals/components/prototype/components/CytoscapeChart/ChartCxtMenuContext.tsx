import { EventObject } from "cytoscape";
import { createContext } from "react";

export interface ChartCxtMenuContextProps {
  event: EventObject;
  onClose: () => void;
}

export const ChartCxtMenuContext =
  createContext<ChartCxtMenuContextProps | null>(null);
