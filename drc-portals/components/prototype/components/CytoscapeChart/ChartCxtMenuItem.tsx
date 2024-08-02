import { MenuItem } from "@mui/material";
import { EventObject } from "cytoscape";
import { ReactNode, useContext } from "react";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartCxtMenuItemProps {
  renderContent: (event: EventObject) => ReactNode;
  action: (event: EventObject) => void;
  showFn?: (event: EventObject) => boolean;
}

export default function ChartCxtMenuItem(cmpProps: ChartCxtMenuItemProps) {
  const { renderContent, action, showFn } = cmpProps;
  const context = useContext(ChartCxtMenuContext);
  const renderThis = !(
    context === null ||
    (showFn !== undefined && !showFn(context.event))
  );

  const handleOnClick = () => {
    if (context !== null) {
      action(context.event);
      context.onClose();
    }
  };

  return renderThis ? (
    <MenuItem onClick={handleOnClick}>{renderContent(context.event)}</MenuItem>
  ) : null;
}
