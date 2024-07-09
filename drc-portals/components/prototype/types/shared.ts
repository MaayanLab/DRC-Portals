import { CSSProperties, ReactElement } from "react";

import { Direction } from "../enums/schema-search";

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
