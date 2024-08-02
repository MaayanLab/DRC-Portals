import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { NestedMenuItem } from "mui-nested-menu";
import { ReactNode, useContext } from "react";

import { CxtMenuItem } from "../../interfaces/cy";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";
import ChartCxtMenuItem from "./ChartCxtMenuItem";

interface ChartNestedCxtMenuItemProps {
  label: ReactNode;
  items: CxtMenuItem[];
}

export default function ChartNestedCxtMenuItem(
  cmpProps: ChartNestedCxtMenuItemProps
) {
  const { label, items } = cmpProps;
  const context = useContext(ChartCxtMenuContext);

  return context === null ? null : (
    <NestedMenuItem
      rightIcon={<KeyboardArrowRightIcon />}
      renderLabel={() => label}
      parentMenuOpen={true}
      sx={{ paddingX: "16px" }}
    >
      {items.map((item) =>
        item.children === undefined ? (
          <ChartCxtMenuItem key={item.key} action={item.action}>
            {item.renderContent(context.event)}
          </ChartCxtMenuItem>
        ) : (
          <ChartNestedCxtMenuItem
            key={item.key}
            label={item.renderContent(context.event)}
            items={item.children(context.event)}
          ></ChartNestedCxtMenuItem>
        )
      )}
    </NestedMenuItem>
  );
}
