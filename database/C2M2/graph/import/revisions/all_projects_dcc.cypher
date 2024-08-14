CALL {
    MATCH (p)<-[:IS_PARENT_OF*1..]-(root:Project)<-[:PRODUCED]-(dcc:DCC)
    MERGE (dcc)-[:PRODUCED]->(p)
} IN TRANSACTIONS OF 10000 ROWS