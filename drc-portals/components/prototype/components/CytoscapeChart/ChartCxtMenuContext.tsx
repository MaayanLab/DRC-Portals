import { EventObject } from "cytoscape";
import { createContext, MutableRefObject } from "react";

import { CxtMenuTree } from "../../interfaces/cxt-menu";

export interface ChartCxtMenuContextProps {
  open: boolean;
  event: EventObject;
  treeRef: MutableRefObject<CxtMenuTree>;
  suppressLeaveItem: boolean;
  updateTreeItem: (item: CxtMenuTree) => void;
  onItemEnter: (itemId: string) => void;
  onItemLeave: (itemId: string) => void;
  onClose: () => void;
}

export const ChartCxtMenuContext =
  createContext<ChartCxtMenuContextProps | null>(null);
