import { ClickAwayListener, debounce, Grow, MenuList, Paper, Popper } from "@mui/material";
import { EventObject } from "cytoscape";
import { forwardRef, useCallback, useMemo, useRef, useState } from "react";

import { CxtMenuItem, CxtMenuTree } from "../../interfaces/cxt-menu";

import { ChartCxtMenuContext } from "./ChartCxtMenuContext";

interface ChartCxtMenuProps {
  open: boolean;
  items: CxtMenuItem[];
  position: { x: number; y: number };
  event?: EventObject;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export const ChartCxtMenu = forwardRef<HTMLDivElement, ChartCxtMenuProps>(
  (cmpProps: ChartCxtMenuProps, ref) => {
    const {
      open,
      items,
      position,
      event,
      onClose,
      onMouseEnter,
      onMouseLeave,
    } = cmpProps;
    const initialTree = {
      id: "root",
      children: items.map(item => item.tree),
      open
    };

    if (event === undefined) {
      // Don't try to display the context menu if we don't know what the event was
      return null;
    } else {
      const [tree, setTree] = useState<CxtMenuTree>(initialTree);
      const [hoveredItemId, setHoveredItemId] = useState<string | null>(null)

      const onItemEnter = useMemo(() => debounce((itemId: string) => {
        setHoveredItemId(itemId);
      }, 250), []);

      const onItemLeave = useCallback(() => {
        setHoveredItemId(null);
      }, []);

      const onCloseWrapper = useCallback(() => {
        setTree(initialTree);
        setHoveredItemId(null);
        onClose();
      }, [onClose]);

      const updateTreeItem = useCallback((item: CxtMenuTree) => {
        const nts = (n: CxtMenuTree, update: CxtMenuTree): CxtMenuTree => {
          if (n.id === update.id) {
            return update;
          }

          return {
            id: n.id,
            children: n.children.map(child => nts(child, update)),
            open: n.open,
          }
        }

        setTree((prev) => nts(prev, item));
      }, [])

      const context = useMemo(
        () => ({
          open,
          event,
          tree,
          hoveredItemId,
          suppressLeaveItem: false,
          onClose: onCloseWrapper,
          onItemEnter,
          onItemLeave,
          updateTreeItem
        }),
        [open, event, tree, hoveredItemId, onCloseWrapper, onItemEnter, onItemLeave, updateTreeItem]
      )

      return (
        <ClickAwayListener onClickAway={onCloseWrapper}>
          <Popper
            ref={ref}
            open={open}
            placement="right-start"
            transition
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onContextMenu={(e) => {
              // This should prevent the non-Mac OS issue of the context menu appearing after the custom menu appears
              if (Math.abs(e.timeStamp - event.originalEvent.timeStamp) < 50) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            anchorEl={{
              getBoundingClientRect: () => {
                return new DOMRect(position.x, position.y, 0, 0);
              },
            }}
            sx={{ zIndex: 5 }}
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
                      {items.map(item => item.content)}
                    </ChartCxtMenuContext.Provider>
                  </MenuList>
                </Paper>
              </Grow>
            )}
          </Popper>
        </ClickAwayListener>
      );
    }
  }
);
