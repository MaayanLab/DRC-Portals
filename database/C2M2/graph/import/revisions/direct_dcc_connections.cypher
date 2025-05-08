MATCH (dcc:DCC)-[:REGISTERED]->(:IDNamespace)-[:CONTAINS]->(n)
CALL {
    WITH dcc, n
    MERGE (dcc)-[:CONTAINS {_uuid: randomUUID()}]->(n)
} IN TRANSACTIONS OF 10000 ROWS