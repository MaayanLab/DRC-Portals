import neo4j, { Driver } from "neo4j-driver";

let driver: Driver;

const NEO4J_URL = process.env.NEO4J_URL || "neo4j://localhost:7687";
const NEO4J_USERNAME =
  process.env.NEO4J_USERNAME ||
  process.env.GRAPH_C2M2_READER_USERNAME ||
  "neo4j";
const NEO4J_PASSWORD =
  process.env.NEO4J_PASSWORD ||
  process.env.GRAPH_C2M2_READER_PASSWORD ||
  "password";

const initDriver = async (uri: string, username: string, password: string) => {
  driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password),
    // See this documentation: https://github.com/neo4j/neo4j-javascript-driver#enabling-native-numbers. It is highly unlikely we will
    // need the lossless integer behavior which is the default out of the box. And, for any queries where we do expect potentially unsafe
    // values, we can handle them explicitly by converting to strings on the Neo4j end.
    { disableLosslessIntegers: true },
  );
};

export const getDriver = () => {
  if (driver === undefined) {
    initDriver(NEO4J_URL, NEO4J_USERNAME, NEO4J_PASSWORD);
  }
  return driver;
};

export const closeDriver = async () => {
  if (driver) {
    await driver.close();
  }
};
