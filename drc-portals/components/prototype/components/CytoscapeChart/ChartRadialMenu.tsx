import React, { forwardRef, ReactNode } from "react";

import { ClickAwayListener, Popper } from "@mui/material";
import { Menu } from "@spaceymonk/react-radial-menu";

import { ChartRadialMenuPosition } from "../../interfaces/cy";

import "./ChartRadialMenu.css";

interface ChartRadialMenuProps {
  open: boolean;
  position: ChartRadialMenuPosition;
  menuItems: ReactNode[];
  onMenuClick: () => void;
  onClickAway: () => void;
}

export const ChartRadialMenu = forwardRef<HTMLDivElement, ChartRadialMenuProps>(
  (cmpProps: ChartRadialMenuProps, ref) => {
    const { open, position, menuItems, onMenuClick, onClickAway } = cmpProps;

    return (
      <Popper
        transition
        ref={ref}
        open={open}
        disablePortal={true}
        style={{ position: "absolute", zIndex: 0 }}
      >
        {() => (
          <ClickAwayListener onClickAway={onClickAway}>
            <div className="radial-menu">
              <Menu
                show
                centerX={position.x}
                centerY={position.y}
                innerRadius={position.r}
                outerRadius={position.r * 2}
                animation={["fade", "scale"]}
                animationTimeout={150}
                drawBackground
                onClick={onMenuClick}
              >
                {...menuItems}
              </Menu>
            </div>
          </ClickAwayListener>
        )}
      </Popper>
    );
  }
);
