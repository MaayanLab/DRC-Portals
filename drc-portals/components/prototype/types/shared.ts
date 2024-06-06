import { ReactElement } from "react";

import { Direction } from "../enums/query-builder";

export type NodeElementFactory = (name: string) => ReactElement;

export type RelationshipElementFactory = (
  name: string,
  direction: Direction
) => ReactElement;

export type GraphElementFactory =
  | NodeElementFactory
  | RelationshipElementFactory;
