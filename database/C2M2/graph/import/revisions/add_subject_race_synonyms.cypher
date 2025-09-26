MATCH (n:SubjectRace)
CALL {
    WITH n
    MERGE (syn:Synonym {name: toLower(n.name)}) // Add the node's name as a synonym
    MERGE (syn)<-[:HAS_SYNONYM]-(n)
} IN TRANSACTIONS OF 10000 ROWS