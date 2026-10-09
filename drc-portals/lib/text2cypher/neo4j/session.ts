import { Session } from "neo4j-driver";

import { getDriver } from "./driver";

const NEO4J_DBNAME =
  process.env.NEO4J_DBNAME || process.env.GRAPH_C2M2_DBNAME || "neo4j";

export const getSession = () => getDriver().session({ database: NEO4J_DBNAME });

export const closeSession = async (session: Session) => await session.close();
