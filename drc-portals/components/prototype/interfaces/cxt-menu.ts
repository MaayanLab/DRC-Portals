import { ReactNode } from "react";

export interface CxtMenuTree {
  id: string;
  open: boolean;
  children: CxtMenuTree[];
}

export interface CxtMenuItem {
  content: ReactNode;
  tree: CxtMenuTree;
}
