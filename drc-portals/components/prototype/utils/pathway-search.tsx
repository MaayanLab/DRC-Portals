import { PathNode, PathRelationship } from "../interfaces/pathway-search";

export function traverseTree(
  root: PathNode
): (PathNode | PathRelationship)[][] {
  const paths: (PathNode | PathRelationship)[][] = [];

  function dfs(node: PathNode, currentPath: (PathNode | PathRelationship)[]) {
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

    // Backtrack: remove the current node from the path
    currentPath.pop();
  }

  // Start DFS from the root node with an empty path
  dfs(root, []);
  return paths;
}

export function findNode(id: string, root: PathNode): PathNode | undefined {
  function dfs(node: PathNode): PathNode | undefined {
    if (node.id === id) {
      return node;
    }

    // keep traversing the children
    if (node.children.length > 0) {
      for (const child of node.children) {
        return dfs(child);
      }
    }
  }

  // Start DFS from the root node
  return dfs(root);
}
