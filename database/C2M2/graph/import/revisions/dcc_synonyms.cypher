MATCH (dcc:DCC)
CALL {
    WITH dcc
    WITH dcc, dcc.name AS name, dcc.abbreviation AS abbrev, split(dcc.id, ":")[1] AS idAbbrev
    // name synonym
    MERGE (s1:Synonym {name: toLower(name)})
    MERGE (s1)<-[:HAS_SYNONYM]-(dcc)
    // abbrev synonym
    MERGE (s2:Synonym {name: toLower(abbrev)})
    MERGE (s2)<-[:HAS_SYNONYM]-(dcc)
    // idAbbrev synonym
    MERGE (s3:Synonym {name: toLower(idAbbrev)})
    MERGE (s3)<-[:HAS_SYNONYM]-(dcc)
} IN TRANSACTIONS OF 10000 ROWS;
