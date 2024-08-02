import { MenuItem } from "@mui/material";
import { EventObject } from "cytoscape";
import { ReactNode, useContext } from "react";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartCxtMenuItemProps {
  children: ReactNode;
  action: (event: EventObject) => void;
}

export default function ChartCxtMenuItem(cmpProps: ChartCxtMenuItemProps) {
  const { children, action } = cmpProps;
  const context = useContext(ChartCxtMenuContext);

  const handleOnClick = () => {
    if (context !== null) {
      action(context.event);
      context.onClose();
    }
  };

  return context === null ? null : (
    <MenuItem onClick={handleOnClick}>{children}</MenuItem>
  );
}
