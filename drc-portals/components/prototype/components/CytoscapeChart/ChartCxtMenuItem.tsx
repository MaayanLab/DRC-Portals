"use client";

import { MenuItem } from "@mui/material";
import { EventObject } from "cytoscape";
import { ReactNode, useContext } from "react";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartCxtMenuItemProps {
  id: string;
  renderContent: (event: EventObject) => ReactNode;
  action: (event: EventObject) => void;
  showFn?: (event: EventObject) => boolean;
}

export default function ChartCxtMenuItem(cmpProps: ChartCxtMenuItemProps) {
  const context = useContext(ChartCxtMenuContext);

  if (context === null) {
    return null;
  } else {
    const { id, renderContent, action, showFn } = cmpProps;

    const showItem = showFn === undefined || showFn(context.event);
    const eventAtRender = context.event;
    const content = renderContent(eventAtRender);

    const handleOnMouseEnter = () => {
      context.onItemEnter(id);
    }

    const handleOnMouseDown = () => {
      action(eventAtRender);
      context.onClose();
    }

    return showItem ? (
      <MenuItem
        onMouseEnter={handleOnMouseEnter}
        onMouseDown={handleOnMouseDown}
      >
        {content}
      </MenuItem>
    ) : null;
  }
}
