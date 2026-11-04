MATCH (n:NCBITaxonomy {id: 'NCBI:txid9606'}) SET n.synonyms = coalesce(n.synonyms, []) + ['human', 'humans', 'homo sapiens'];
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9615'}) SET n.synonyms = coalesce(n.synonyms, []) + ['dog', 'canine', 'canines'];
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9685'}) SET n.synonyms = coalesce(n.synonyms, []) + ['cat', 'feline'];
MATCH (n:Disease {id: 'DOID:9452'}) SET n.synonyms = coalesce(n.synonyms, []) + ['MAFLD', 'MASLD', 'metabolic dysfunction-associated fatty liver disease', 'metabolic dysfunction-related steatotic liver disease', 'metabolic-associated fatty liver disease', 'NAFLD', 'non-alcoholic fatty liver disease', 'nonalcoholic fatty liver disease'];
