import { CxtMenuTree } from "../interfaces/cxt-menu";

export const getCxtMenuItemOpenState = (tree: CxtMenuTree, hoveredItemId: string | null, searchId: string): boolean => {
  // If no submenu tree is being hovered, nothing is open
  if (hoveredItemId === null) {
    return false;
  }

  if (hoveredItemId === searchId) {
    return true;
  }

  const ts = (t: CxtMenuTree, id: string): CxtMenuTree | undefined => {
    if (t.id === id) {
      return t;
    }

    if (t.children.length > 0) {
      return t.children.find((child) => ts(child, id) !== undefined)
    } else {
      return undefined
    }
  }

  const searchItem = ts(tree, searchId);

  return searchItem !== undefined && ts(searchItem, hoveredItemId) !== undefined;
}