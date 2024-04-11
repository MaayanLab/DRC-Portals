import neo4j, { Driver } from "neo4j-driver";

let driver: Driver;

export const initDriver = async (
  uri: string,
  username: string,
  password: string
) => {
  driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
};

export const getDriver = () => {
  return driver;
};

export const closeDriver = async () => {
  if (driver) {
    await driver.close();
  }
};
