"use client";

import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { EventObject } from "cytoscape";
import { NestedMenuItem } from "mui-nested-menu";
import { ReactNode, useContext, useRef } from "react";

import { getCxtMenuItemOpenState } from "../../utils/cxt-menu";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartNestedCxtMenuItemProps {
  id: string;
  renderContent: (event: EventObject) => ReactNode;
  showFn?: (event: EventObject) => boolean;
  children: ReactNode;
}

export default function ChartNestedCxtMenuItem(
  cmpProps: ChartNestedCxtMenuItemProps
) {
  const context = useContext(ChartCxtMenuContext);
  if (context === null) {
    return null;
  } else {
    const { id, renderContent, showFn, children } = cmpProps;
    const closeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const showItem = useRef(
      // Capture the initial value `showFn`, this prevents the menu from prematurely removing elements if the upstream state changed as a
      // result of, for example, closing the menu
      (showFn === undefined || showFn(context.event))
    );

    const handleMouseEnter = () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }

      context.onItemEnter(id)
    }

    const handleMouseLeave = () => {
      if (!context.suppressLeaveItem) {
        context.suppressLeaveItem = true;
        const timer = setTimeout(() => {
          context.onItemLeave(id);
          context.suppressLeaveItem = false;
        }, 200); // adjust delay as needed
        closeTimerRef.current = timer;
      }
    };

    return showItem.current ? (
      <NestedMenuItem
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        rightIcon={<KeyboardArrowRightIcon />}
        renderLabel={() => renderContent(context.event)}
        parentMenuOpen={context.open}
        MenuProps={{
          onMouseEnter: () => {
            if (closeTimerRef.current) {
              clearTimeout(closeTimerRef.current);
              closeTimerRef.current = null;
            }
          },
          open: getCxtMenuItemOpenState(context.tree, context.hoveredItemId, id),
          transitionDuration: 0
        }}
        sx={{ paddingX: "16px" }}
      >
        {children}
      </NestedMenuItem>
    ) : null;
  }

}
