CREATE CONSTRAINT constraint_Synonym_name IF NOT EXISTS FOR (n:Synonym) REQUIRE n.name IS UNIQUE;