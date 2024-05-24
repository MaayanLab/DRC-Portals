MATCH (n)
WHERE n.synonyms IS NOT NULL
UNWIND n.synonyms AS s
CALL {
    WITH n, s
    MERGE (syn:Synonym {name: s})
    MERGE (syn2:Synonym {name: n.name})
    MERGE (syn)<-[:HAS_SYNONYM]-(n)
    MERGE (syn2)<-[:HAS_SYNONYM]-(n)
} IN TRANSACTIONS OF 10000 ROWS