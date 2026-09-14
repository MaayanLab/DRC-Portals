import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";

export type CytoscapeLayoutOptions =
  | cytoscape.LayoutOptions
  | fcose.FcoseLayoutOptions;

export function isFcoseLayoutOptions(
  layout: CytoscapeLayoutOptions,
): layout is fcose.FcoseLayoutOptions {
  return layout.name === "fcose";
}
