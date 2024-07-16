import neo4j, { Driver } from "neo4j-driver";

import {
  GRAPH_C2M2_READER_PASSWORD,
  NEO4J_URL,
  GRAPH_C2M2_READER_USERNAME,
} from "./constants/app";

let driver: Driver;

export const initDriver = async (
  uri: string,
  username: string,
  password: string
) => {
  driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
};

export const getDriver = () => {
  if (driver === undefined) {
    initDriver(
      NEO4J_URL,
      GRAPH_C2M2_READER_USERNAME,
      GRAPH_C2M2_READER_PASSWORD
    );
  }
  return driver;
};

export const closeDriver = async () => {
  if (driver) {
    await driver.close();
  }
};
