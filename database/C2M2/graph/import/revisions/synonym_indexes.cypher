CREATE FULLTEXT INDEX synonymIdx FOR (n:Synonym) ON EACH [n.name]