--- Mano: Better to write the queries here first for ease of editing, etc.

--- Some basic queries
SELECT DISTINCT dcc_abbreviation, project_name, collection_local_id, ncbi_taxonomy_name,
disease_name, anatomy_name, gene_name, protein_name, substance_name, compound_name,
ts_rank_cd(searchable, websearch_to_tsquery('english', 'NFKB')) as "rank"
FROM c2m2.ffl_biosample
WHERE searchable @@ websearch_to_tsquery('english', 'NFKB');

SELECT DISTINCT dcc_abbreviation, project_name, collection_local_id, ncbi_taxonomy_name,
disease_name, anatomy_name, gene_name, protein_name, substance_name, compound_name,
ts_rank_cd(searchable, websearch_to_tsquery('english', 'Atorvastatin')) as "rank"
FROM c2m2.ffl_biosample
WHERE searchable @@ websearch_to_tsquery('english', 'Atorvastatin');

select dcc_abbreviation, project_local_id, substance_name, compound_name from 
c2m2.ffl_collection where project_id_namespace ilike '%drug%' and compound_name is not null;

SELECT DISTINCT dcc_abbreviation, project_name, collection_local_id, ncbi_taxonomy_name,
disease_name, anatomy_name, gene_name, protein_name, substance_name, compound_name,
ts_rank_cd(searchable, websearch_to_tsquery('english', 'Penicillin')) as "rank"
FROM c2m2.ffl_biosample
WHERE searchable @@ websearch_to_tsquery('english', 'Penicillin');

SELECT DISTINCT dcc_abbreviation, project_name, collection_local_id, ncbi_taxonomy_name,
disease_name, anatomy_name, gene_name, protein_name, substance_name, compound_name,
ts_rank_cd(searchable, websearch_to_tsquery('english', 'aspirin')) as "rank"
FROM c2m2.ffl_biosample
WHERE searchable @@ websearch_to_tsquery('english', 'aspirin');

SELECT DISTINCT dcc_abbreviation, project_name, collection_local_id, ncbi_taxonomy_name,
disease_name, anatomy_name, gene_name, protein_name, substance_name, compound_name,
ts_rank_cd(searchable, websearch_to_tsquery('english', 'dexamethasone')) as "rank"
FROM c2m2.ffl_biosample
WHERE searchable @@ websearch_to_tsquery('english', 'dexamethasone');

