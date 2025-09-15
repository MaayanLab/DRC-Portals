import { CxtMenuTree } from "../interfaces/cxt-menu";

export const getCxtMenuItemOpenState = (tree: CxtMenuTree, searchId: string): boolean => {
  const ts = (t: CxtMenuTree, id: string): boolean => {
    if (t.id === id) {
      return t.open;
    }

    if (t.children.length > 0) {
      return t.children.some(child => ts(child, searchId))
    }

    return false;
  }
  return ts(tree, searchId);
}