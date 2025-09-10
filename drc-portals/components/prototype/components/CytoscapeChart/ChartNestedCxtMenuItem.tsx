"use client";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { EventObject } from "cytoscape";
import { NestedMenuItem } from "mui-nested-menu";
import { ReactNode, useContext, useRef } from "react";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartNestedCxtMenuItemProps {
  renderContent: (event: EventObject) => ReactNode;
  showFn?: (event: EventObject) => boolean;
  children: ReactNode;
}

export default function ChartNestedCxtMenuItem(
  cmpProps: ChartNestedCxtMenuItemProps
) {
  const { renderContent, showFn, children } = cmpProps;
  const context = useContext(ChartCxtMenuContext);
  const showItem = useRef(
    // Capture the initial value `showFn`, this prevents the menu from prematurely removing elements if the upstream state changed as a
    // result of, for example, closing the menu
    context !== null && (showFn === undefined || showFn(context.event))
  );

  return context !== null && showItem.current ? (
    <NestedMenuItem
      rightIcon={<KeyboardArrowRightIcon />}
      renderLabel={() => renderContent(context.event)}
      parentMenuOpen={context.open}
      sx={{ paddingX: "16px" }}
    >
      {children}
    </NestedMenuItem>
  ) : null;
}
