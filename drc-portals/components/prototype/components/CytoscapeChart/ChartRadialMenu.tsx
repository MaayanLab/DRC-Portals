import { ClickAwayListener, Popper } from "@mui/material";
import { Menu, MenuItem } from "@spaceymonk/react-radial-menu";
import { NodeSingular } from "cytoscape";
import React, { forwardRef, useCallback } from "react";

import {
  ChartRadialMenuItemProps,
  ChartRadialMenuPosition,
} from "../../interfaces/cy";

import "./ChartRadialMenu.css";

interface ChartRadialMenuProps {
  open: boolean;
  node: NodeSingular;
  position: ChartRadialMenuPosition;
  menuItems: ChartRadialMenuItemProps[];
  onMenuClick: () => void;
  onMenuItemClick: () => void;
  onClickAway: () => void;
}

export const ChartRadialMenu = forwardRef<HTMLDivElement, ChartRadialMenuProps>(
  (cmpProps: ChartRadialMenuProps, ref) => {
    const {
      open,
      node,
      position,
      menuItems,
      onMenuClick,
      onMenuItemClick,
      onClickAway,
    } = cmpProps;

    const handleMenuItemClick = useCallback(
      (onClick: (node: NodeSingular) => void) => {
        onClick(node);
        onMenuItemClick();
      },
      [onMenuItemClick]
    );

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
                animation={["scale"]}
                animationTimeout={100}
                drawBackground
                onClick={onMenuClick}
              >
                {menuItems.map((item) => (
                  <MenuItem
                    key={item.key}
                    onItemClick={() => handleMenuItemClick(item.onClick)}
                  >
                    {item.content}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </ClickAwayListener>
        )}
      </Popper>
    );
  }
);
