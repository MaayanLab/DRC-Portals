import neo4j, { Driver, int, Record, RecordShape, Session } from "neo4j-driver";

let driver: Driver;
const NEO4J_URL = process.env.NEO4J_URL || "neo4j://localhost:7687";
const GRAPH_C2M2_DBNAME = process.env.GRAPH_C2M2_DBNAME || "neo4j";
const GRAPH_C2M2_READER_USERNAME =
  process.env.GRAPH_C2M2_READER_USERNAME || "neo4j";
const GRAPH_C2M2_READER_PASSWORD =
  process.env.GRAPH_C2M2_READER_PASSWORD || "password";

const initDriver = async (uri: string, username: string, password: string) => {
  driver = neo4j.driver(
    uri,
    neo4j.auth.basic(username, password),
    // See this documentation: https://github.com/neo4j/neo4j-javascript-driver#enabling-native-numbers. It is highly unlikely we will
    // need the lossless integer behavior which is the default out of the box. And, for any queries where we do expect potentially unsafe
    // values, we can handle them explicitly by converting to strings on the Neo4j end.
    { disableLosslessIntegers: true }
  );
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

export const getSession = (driver: Driver) =>
  driver.session({ database: GRAPH_C2M2_DBNAME });

export const closeSession = async (session: Session) => await session.close();

export const makeParamsWriteable = (params: { [key: string]: any }) => {
  Object.keys(params).forEach((key) => {
    if (typeof params[key] === "number") {
      params[key] = int(params[key]);
    }
  });
  return params;
};

export const executeRead = async <T extends RecordShape>(
  driver: Driver,
  cypher: string,
  params?: { [key: string]: any }
): Promise<Record<T>[]> => {
  const session = driver.session({ database: GRAPH_C2M2_DBNAME });
  try {
    const res = await session.executeRead((tx) => {
      return tx.run(
        cypher,
        params === undefined ? params : makeParamsWriteable(params)
      );
    });
    await session.close();
    return res.records;
  } catch (e) {
    // There was a problem with the
    // database connection or the query
    await session.close();
    throw e;
  }
};

export const executeReadOne = async <T extends RecordShape>(
  driver: Driver,
  cypher: string,
  params?: { [key: string]: any }
): Promise<Record<T>> => {
  const session = driver.session({ database: GRAPH_C2M2_DBNAME });
  try {
    const res = await session.executeRead((tx) => {
      return tx.run(
        cypher,
        params === undefined ? params : makeParamsWriteable(params)
      );
    });
    await session.close();
    return res.records[0];
  } catch (e) {
    // There was a problem with the
    // database connection or the query
    await session.close();
    throw e;
  }
};

export const sessionExecuteRead = async <T extends RecordShape>(
  session: Session,
  cypher: string,
  params?: { [key: string]: any }
): Promise<Record<T>[]> => {
  try {
    const res = await session.executeRead((tx) => {
      return tx.run(
        cypher,
        params === undefined ? params : makeParamsWriteable(params)
      );
    });
    return res.records;
  } catch (e) {
    // There was a problem with the
    // database connection or the query
    throw e;
  }
};

export const sessionExecuteReadOne = async <T extends RecordShape>(
  session: Session,
  cypher: string,
  params?: { [key: string]: any }
): Promise<Record<T>> => {
  try {
    const res = await session.executeRead((tx) => {
      return tx.run(
        cypher,
        params === undefined ? params : makeParamsWriteable(params)
      );
    });
    return res.records[0];
  } catch (e) {
    // There was a problem with the
    // database connection or the query
    throw e;
  }
};
