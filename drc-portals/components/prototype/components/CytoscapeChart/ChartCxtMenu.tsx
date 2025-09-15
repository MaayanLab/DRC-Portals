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
    if (event === undefined) {
      // Don't try to display the context menu if we don't know what the event was
      return null;
    } else {
      const treeRef = useRef({
        id: "root",
        children: items.map(item => item.tree),
        open
      });
      const [tree, setTree] = useState<CxtMenuTree>(treeRef.current);

      const onItemEnter = debounce((itemId: string) => {
        const refreshTree = (t: CxtMenuTree, searchId: string): CxtMenuTree => {
          const foundId = t.id === searchId;
          if (t.children.length > 0) {
            const children = t.children.map(child => refreshTree(child, searchId))
            return {
              id: t.id,
              children,
              open: foundId || children.some(child => child.open)
            }
          } else {
            return {
              id: t.id,
              children: [],
              open: foundId
            }
          }
        }

        const newTree = refreshTree(treeRef.current, itemId)
        treeRef.current = newTree;
        setTree(newTree);
      }, 250)

      const closeAllItems = (t: CxtMenuTree) => {
        const closeTree = (n: CxtMenuTree): CxtMenuTree => {
          if (n.children.length > 0) {
            const children = n.children.map(child => closeTree(child))
            return {
              id: n.id,
              children,
              open: false
            }
          } else {
            return {
              id: n.id,
              children: [],
              open: false
            }
          }
        }

        return closeTree(t);
      }

      const onItemLeave = () => {
        const newTree = closeAllItems(treeRef.current)
        treeRef.current = newTree;
        setTree(newTree);
      }

      const onCloseWrapper = useCallback(() => {
        const newTree = closeAllItems(treeRef.current)
        treeRef.current = newTree;
        setTree(newTree);
        onClose();
      }, [onClose]);

      const updateTreeItem = (item: CxtMenuTree) => {
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

        const newTree = nts(treeRef.current, item);
        treeRef.current = newTree;
        setTree(newTree);
      }

      const context = { open, event, treeRef, suppressLeaveItem: false, onClose: onCloseWrapper, onItemEnter, onItemLeave, updateTreeItem }

      const menu = useMemo(() => {
        return <Paper>
          <MenuList>
            <ChartCxtMenuContext.Provider value={context}>
              {items.map(item => item.content)}
            </ChartCxtMenuContext.Provider>
          </MenuList>
        </Paper>
      }, [tree, items])


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
                {menu}
              </Grow>
            )}
          </Popper>
        </ClickAwayListener>
      );
    }
  }
);
