MATCH (dcc:DCC)-[:REGISTERED]->(:IDNamespace)-[:CONTAINS]->(n)
CALL {
    WITH dcc, n
    MERGE (dcc)-[:CONTAINS]->(n)
} IN TRANSACTIONS OF 10000 ROWS