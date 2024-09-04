import { PathElement } from "@/lib/neo4j/types";

export interface SelectedPathElement {
  element: PathElement;
  pathIdx: number;
  elementIdx: number;
}
