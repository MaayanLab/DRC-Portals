import neo4j, { Driver } from "neo4j-driver";
import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USERNAME } from "./constants/app";

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
    initDriver(NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD);
  }
  return driver;
};

export const closeDriver = async () => {
  if (driver) {
    await driver.close();
  }
};
