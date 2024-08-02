import { Grow, MenuList, Paper, Popper } from "@mui/material";
import { EventObject } from "cytoscape";
import { ReactNode, forwardRef } from "react";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

type ChartCxtMenuProps = {
  open: boolean;
  position: { x: number; y: number };
  event?: EventObject;
  onClose: () => void;
  children: ReactNode;
};

export const ChartCxtMenu = forwardRef<HTMLDivElement, ChartCxtMenuProps>(
  (cmpProps: ChartCxtMenuProps, ref) => {
    const { open, position, event, onClose, children } = cmpProps;

    if (event === undefined) {
      // Don't try to display the context menu if we don't know what the event was
      return null;
    } else {
      const context = { event, onClose };

      return (
        <Popper
          ref={ref}
          open={open}
          placement="right-start"
          transition
          anchorEl={{
            getBoundingClientRect: () => {
              return new DOMRect(position.x, position.y, 0, 0);
            },
          }}
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: "0 0 0" }}
              timeout="auto"
            >
              <Paper>
                <MenuList>
                  <ChartCxtMenuContext.Provider value={context}>
                    {children}
                  </ChartCxtMenuContext.Provider>
                </MenuList>
              </Paper>
            </Grow>
          )}
        </Popper>
      );
    }
  }
);
