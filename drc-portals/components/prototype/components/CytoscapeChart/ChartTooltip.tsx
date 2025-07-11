import { Tooltip, TooltipProps, styled, tooltipClasses } from "@mui/material";
import { Instance } from "@popperjs/core";
import { RefObject, forwardRef } from "react";

type ChartTooltipProps = {
  position: { x: number; y: number };
  popperRef: RefObject<Instance>;
} & TooltipProps;

// See the MUI docs for a detailed example: https://mui.com/material-ui/react-tooltip/#customization
export const ChartTooltip = styled(
  forwardRef<HTMLDivElement, ChartTooltipProps>(
    ({ className, position, popperRef, ...props }, ref) => (
      <Tooltip
        ref={ref}
        {...props}
        placement="right-start"
        classes={{ popper: className }}
        TransitionProps={{ exit: false }} // Immediately close the tooltip, don't transition
        PopperProps={{
          popperRef,
          anchorEl: {
            getBoundingClientRect: () => {
              return new DOMRect(position.x, position.y, 0, 0);
            },
          },
        }}
        slotProps={{
          popper: {
            modifiers: [
              {
                name: "offset",
                options: {
                  offset: [0, 10],
                },
              },
            ],
            sx: {
              [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
                {
                  marginTop: "0px",
                },
              [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
                {
                  marginBottom: "0px",
                },
              [`&.${tooltipClasses.popper}[data-popper-placement*="right"] .${tooltipClasses.tooltip}`]:
                {
                  marginLeft: "0px",
                },
              [`&.${tooltipClasses.popper}[data-popper-placement*="left"] .${tooltipClasses.tooltip}`]:
                {
                  marginRight: "0px",
                },
            },
          },
        }}
      />
    )
  )
)(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "transparent",
    padding: 0,
  },
}));
