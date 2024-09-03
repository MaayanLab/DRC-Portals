import { Driver, Record, RecordShape } from "neo4j-driver";

import { GRAPH_C2M2_DBNAME } from "../constants/app";

// TODO: Remove this! Once all the frontend driver code is refactored to the backend, this entire file becomes irrelevant
import { makeParamsWriteable } from "@/lib/neo4j/driver";

export default class Neo4jService {
  driver: Driver;

  constructor(driver: Driver) {
    this.driver = driver;
  }

  async executeRead<T extends RecordShape>(
    cypher: string,
    params?: { [key: string]: any }
  ): Promise<Record<T>[]> {
    const session = this.driver.session({ database: GRAPH_C2M2_DBNAME });
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
  }
}
