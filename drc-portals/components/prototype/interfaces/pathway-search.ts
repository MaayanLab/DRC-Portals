export interface PathRelationship {
  id: string;
  type: string;
  props?: { [key: string]: any };
}

export interface PathNode {
  id: string;
  label: string;
  children: PathNode[];
  props?: { [key: string]: any };
  relationshipToParent?: PathRelationship;
}
