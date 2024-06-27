import { CSSProperties, ReactElement } from "react";

import { Direction } from "../enums/schema-search";

export type NodeElementFactory = (
  name: string,
  style?: CSSProperties
) => ReactElement;

export type RelationshipElementFactory = (
  name: string,
  direction: Direction,
  style?: CSSProperties
) => ReactElement;
