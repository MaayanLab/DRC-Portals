import { CSSProperties, ReactElement } from "react";

import { Direction } from "@/lib/neo4j/enums";

export type NodeElementFactory = (
  label: string,
  text?: string,
  style?: CSSProperties
) => ReactElement;

export type RelationshipElementFactory = (
  type: string,
  direction: Direction,
  text?: string,
  style?: CSSProperties
) => ReactElement;
