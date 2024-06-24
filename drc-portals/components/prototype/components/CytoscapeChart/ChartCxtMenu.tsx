import { Grow, Paper, Popper } from "@mui/material";
import { ReactNode, forwardRef } from "react";

type ChartCxtMenuProps = {
  open: boolean;
  position: { x: number; y: number };
  children: ReactNode;
};

export const ChartCxtMenu = forwardRef<HTMLDivElement, ChartCxtMenuProps>(
  (cmpProps: ChartCxtMenuProps, ref) => {
    const { open, position, children } = cmpProps;

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
            <Paper>{children}</Paper>
          </Grow>
        )}
      </Popper>
    );
  }
);
