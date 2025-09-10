import { PathwayNode } from "@/lib/neo4j/types";
import { createContext } from "react";

export interface PathwaySearchContextProps {
  tree?: PathwayNode;
}

export const PathwaySearchContext = createContext<PathwaySearchContextProps>(
  {}
);
