import { EventObject } from "cytoscape";
import { createContext } from "react";

import { CxtMenuTree } from "../../interfaces/cxt-menu";

export interface ChartCxtMenuContextProps {
  open: boolean;
  event: EventObject;
  tree: CxtMenuTree;
  hoveredItemId: string | null;
  suppressLeaveItem: boolean;
  updateTreeItem: (item: CxtMenuTree) => void;
  onItemEnter: (itemId: string) => void;
  onItemLeave: (itemId: string) => void;
  onClose: (event: MouseEvent | TouchEvent) => void;
}

export const ChartCxtMenuContext =
  createContext<ChartCxtMenuContextProps | null>(null);
