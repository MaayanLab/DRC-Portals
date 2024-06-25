import { CSSProperties, ReactElement } from "react";

import { Direction } from "../enums/query-builder";

export type NodeElementFactory = (
  name: string,
  style?: CSSProperties
) => ReactElement;

export type RelationshipElementFactory = (
  name: string,
  direction: Direction,
  style?: CSSProperties
) => ReactElement;
