"use client";

import { MenuItem } from "@mui/material";
import { EventObject } from "cytoscape";
import { ReactNode, useContext, useRef } from "react";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartCxtMenuItemProps {
  renderContent: (event: EventObject) => ReactNode;
  action: (event: EventObject) => void;
  showFn?: (event: EventObject) => boolean;
}

export default function ChartCxtMenuItem(cmpProps: ChartCxtMenuItemProps) {
  const { renderContent, action, showFn } = cmpProps;
  const context = useContext(ChartCxtMenuContext);
  const showItem = useRef(
    // Capture the initial value `showFn`, this prevents the menu from prematurely re-rendering elements if the upstream state changed as a
    // result of, for example, closing the menu
    context !== null && (showFn === undefined || showFn(context.event))
  );

  const handleOnClick = () => {
    if (context !== null) {
      action(context.event);
      context.onClose();
    }
  };

  return context !== null && showItem.current ? (
    <MenuItem onClick={handleOnClick}>{renderContent(context.event)}</MenuItem>
  ) : null;
}
