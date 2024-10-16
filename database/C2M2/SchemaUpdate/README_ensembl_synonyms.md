
### ENSEMBL synonyms population
1. conflict_ensembl.py - make sure synonyms are in the same format ```["Syn1", "Syn2"]```
2. Extract all empty synonyms's ENSEMBL ids and store it somewhere
3. Use ```resolveSynonymsBoth.py``` which takes ENSEMBL IDs -> and outputs ENSEMBL IDs and synonyms from ensembl.org and bdcw
3. Use ```update_synonyms_output.py``` which updates all ENSEMBL IDs with no synonyms and populates with synonyms from the previous step