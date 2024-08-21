import { EventObject } from "cytoscape";
import { createContext } from "react";

export interface ChartCxtMenuContextProps {
  open: boolean;
  event: EventObject;
  onClose: () => void;
}

export const ChartCxtMenuContext =
  createContext<ChartCxtMenuContextProps | null>(null);
