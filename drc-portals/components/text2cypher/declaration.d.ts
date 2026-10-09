import "cytoscape";
import type { CytoscapeLayoutOptions } from "@/lib/text2cypher/cytoscape/types";

declare module "cytoscape-cola";

declare module "cytoscape" {
  interface Core {
    layout(layout: CytoscapeLayoutOptions): Layouts;
  }

  interface CollectionLayout {
    layout(options: CytoscapeLayoutOptions): Layouts;
    makeLayout(options: CytoscapeLayoutOptions): Layouts;
    createLayout(options: CytoscapeLayoutOptions): Layouts;
  }
}
