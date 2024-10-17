import { PathwayNode, PathwayRelationship } from "@/lib/neo4j/types";
import {
  PathwaySearchEdge,
  PathwaySearchNode,
} from "../interfaces/pathway-search";

// TODO: This needs to be a little smarter about what it adds to the tree, we don't need to include children
export function traverseTree(
  root: PathwayNode
): (PathwayNode | PathwayRelationship)[][] {
  const paths: (PathwayNode | PathwayRelationship)[][] = [];

  function dfs(
    node: PathwayNode,
    currentPath: (PathwayNode | PathwayRelationship)[]
  ) {
    // Add the current node's relationship back to its parent to the path
    if (node.relationshipToParent !== undefined) {
      currentPath.push(node.relationshipToParent);
    }

    // Add the current node to the path
    currentPath.push(node); // TODO: Make a copy of the node?

    // If the current node has no children, we've reached a leaf node
    if (node.children.length === 0) {
      paths.push([...currentPath]); // Push a copy of the current path
    } else {
      // Otherwise, keep traversing the children
      for (const child of node.children) {
        dfs(child, currentPath);
      }
    }

    // Backtrack: remove the current node and the relationship to its parent from the path
    currentPath.pop(); // Pop node
    currentPath.pop(); // Pop relationship
  }

  // Start DFS from the root node with an empty path
  dfs(root, []);
  return paths;
}

export function findNode(
  id: string,
  root: PathwayNode
): PathwayNode | undefined {
  function dfs(node: PathwayNode): PathwayNode | undefined {
    if (node.id === id) {
      return node;
    }

    // keep traversing the children
    if (node.children.length > 0) {
      for (const child of node.children) {
        const found = dfs(child);

        if (found !== undefined) {
          return found;
        }
      }
    }
  }

  // Start DFS from the root node
  return dfs(root);
}

export const isPathwaySearchEdgeElement = (
  element: PathwaySearchNode | PathwaySearchEdge
): element is PathwaySearchEdge => {
  return (element as PathwaySearchEdge).data.type !== undefined;
};
