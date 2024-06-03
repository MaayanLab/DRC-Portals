MATCH (n)
WHERE n.synonyms IS NOT NULL
CALL {
    WITH n
    MERGE (syn:Synonym {name: n.name}) // Add the node's name as a synonym
    MERGE (syn)<-[:HAS_SYNONYM]-(n)
    WITH n
    UNWIND n.synonyms AS s // If the node has a synonyms list, then add them too
    MERGE (syn2:Synonym {name: s})
    MERGE (syn2)<-[:HAS_SYNONYM]-(n)
} IN TRANSACTIONS OF 10000 ROWS