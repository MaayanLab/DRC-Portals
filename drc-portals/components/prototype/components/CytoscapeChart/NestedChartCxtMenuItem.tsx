import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { EventObject } from "cytoscape";
import { NestedMenuItem } from "mui-nested-menu";
import { ReactNode, useContext } from "react";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartNestedCxtMenuItemProps {
  renderContent: (event: EventObject) => ReactNode;
  renderChildren: (event: EventObject) => ReactNode;
  showFn?: (event: EventObject) => boolean;
}

export default function ChartNestedCxtMenuItem(
  cmpProps: ChartNestedCxtMenuItemProps
) {
  const { renderContent, renderChildren, showFn } = cmpProps;
  const context = useContext(ChartCxtMenuContext);
  const renderThis = !(
    context === null ||
    (showFn !== undefined && !showFn(context.event))
  );

  return renderThis ? (
    <NestedMenuItem
      rightIcon={<KeyboardArrowRightIcon />}
      renderLabel={() => renderContent(context.event)}
      parentMenuOpen={true}
      sx={{ paddingX: "16px" }}
    >
      {renderChildren(context.event)}
    </NestedMenuItem>
  ) : null;
}
