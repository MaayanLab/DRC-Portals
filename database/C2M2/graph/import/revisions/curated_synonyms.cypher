MATCH (n:NCBITaxonomy {id: 'NCBI:txid9606'}) SET n.synonyms = coalesce(n.synonyms, []) + 'human';
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9606'}) SET n.synonyms = coalesce(n.synonyms, []) + 'humans';
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9606'}) SET n.synonyms = coalesce(n.synonyms, []) + 'homo sapiens';
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9615'}) SET n.synonyms = coalesce(n.synonyms, []) + 'dog';
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9615'}) SET n.synonyms = coalesce(n.synonyms, []) + 'canine';
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9615'}) SET n.synonyms = coalesce(n.synonyms, []) + 'canines';
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9685'}) SET n.synonyms = coalesce(n.synonyms, []) + 'cat';
MATCH (n:NCBITaxonomy {id: 'NCBI:txid9685'}) SET n.synonyms = coalesce(n.synonyms, []) + 'feline';