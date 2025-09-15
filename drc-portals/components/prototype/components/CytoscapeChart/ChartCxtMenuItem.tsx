"use client";

import { MenuItem } from "@mui/material";
import { EventObject } from "cytoscape";
import { ReactNode, useContext, useRef } from "react";

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

    const showItem = useRef(
      // Capture the initial value `showFn`, this prevents the menu from prematurely re-rendering elements if the upstream state changed as a
      // result of, for example, closing the menu
      (showFn === undefined || showFn(context.event))
    );

    const handleOnClick = () => {
      if (context !== null) {
        action(context.event);
        context.onClose();
      }
    };

    return showItem.current ? (
      <MenuItem
        onMouseEnter={() => context.onItemEnter(id)}
        onClick={handleOnClick}
      >
        {renderContent(context.event)}
      </MenuItem>
    ) : null;
  }
}
