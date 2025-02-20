
--- For HubMAP and LINCS, in file table, for some combinations of assay_type, data_type, analysis_type, too many rows
select id_namespace, assay_type, data_type, analysis_type, count(id_namespace) as count from c2m2.file group by id_namespace, assay_type, data_type, analysis_type order by count desc;
--- Will recommend to add compound and/or gene column to file table for better resolution (lesser count of files after applying all the relevant filters)

--- To be able to use a shorter URL for record_info page, use md5 hash of the t part of the URL
--- e.g., https://dev.cfde.cloud/data/c2m2/search/record_info?q=intestine%20homo%20sapiens&t=dcc_name:4D%20NUCLEOME%20DATA%20COORDINATION%20AND%20INTEGRATION%20CENTER%7Cproject_local_id:12a92962-8265-4fc0-b2f8-cf14f05db58b%7Cdisease_name:Unspecified%7Cncbi_taxonomy_name:Homo%20sapiens%7Canatomy_name:colon%7Cgene_name:Unspecified%7Cprotein_name:Unspecified%7Ccompound_name:Unspecified%7Cdata_type_name:Unspecified%7Cassay_type_name:imaging%20assay
--- and use it as a primary key in an intermediate table to recover the q part
--- To estimate how many rows in such a table, consider unique combinations of all filter values
--- both c2m2.c2m2.ffl_biosample_collection and c2m2.ffl_biosample_collection_cmp give the same count
select count(*) from (select distinct dcc_name, project_local_id, anatomy_name, ncbi_taxonomy_name, disease_name, biofluid_name, 
    gene_name, protein_name, compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample_collection);

select count(*) from (select distinct dcc_name, project_local_id, anatomy_name, ncbi_taxonomy_name, disease_name, biofluid_name, 
    gene_name, protein_name, compound_name, data_type_name, assay_type_name from c2m2.ffl_biosample_collection_cmp);
--- ~ 2M, most from GlyGen (1734K) and LINCS (270K) for distinct combinations of protein, compound, gene
select dcc_name, count(*) from (select distinct dcc_name, project_local_id, anatomy_name, ncbi_taxonomy_name, disease_name, 
    biofluid_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name 
    from c2m2.ffl_biosample_collection_cmp) group by dcc_name;

select dcc_name, count(*) from (select distinct dcc_name, compound_name from c2m2.ffl_biosample_collection_cmp) group by dcc_name;
select dcc_name, count(*) from (select distinct dcc_name, gene_name from c2m2.ffl_biosample_collection_cmp) group by dcc_name;
select dcc_name, count(*) from (select distinct dcc_name, gene_name, compound_name, protein_name from c2m2.ffl_biosample_collection_cmp) group by dcc_name;
select dcc_name, count(*) from (select distinct dcc_name, assay_type_name, gene_name, compound_name, protein_name 
    from c2m2.ffl_biosample_collection_cmp) group by dcc_name;
select dcc_name, count(*) from (select distinct dcc_name, anatomy_name, ncbi_taxonomy_name, disease_name, 
    biofluid_name, gene_name, protein_name, compound_name, data_type_name, assay_type_name 
    from c2m2.ffl_biosample_collection_cmp) group by dcc_name; /*  ~1.2M*/

--- increase in #rows if including file_format
select count(*) from
--- (select id_namespace, count(*) from 
(select distinct 
    id_namespace, project_local_id, file_format, compression_format, data_type, assay_type, analysis_type from c2m2.file
) 
---group by id_namespace)
;

select count(*) from
---(select id_namespace, count(*) from 
(select distinct 
    id_namespace, project_local_id, data_type, assay_type, analysis_type from c2m2.file
) 
---group by id_namespace)
;

--- increase in # rows if attach biosample, subject and collection information to files
select count(*) from c2m2.file;
select count(*) from (select distinct f.id_namespace, f.local_id, f.filename from c2m2.file as f);

select distinct id_namespace, count(*) from c2m2.file group by id_namespace order by id_namespace;
/*
drc=> select distinct id_namespace, count(*) from c2m2.file group by id_namespace order by id_namespace;
                      id_namespace                      |  count  
--------------------------------------------------------+---------
 adult_gtex                                             |     498
 egtex                                                  |      50
 ERCC-exRNA                                             |  192177
 https://data.4dnucleome.org                            |   47066
 https://druggablegenome.net/cfde_idg_drugcentral_drugs |    4673
 https://druggablegenome.net/cfde_idg_tcrd_diseases     |    1899
 https://druggablegenome.net/cfde_idg_tcrd_targets      |   19295
 https://www.data.glygen.org/                           |    1980
 https://www.druggablegenome.net/                       |   50026
 https://www.lincsproject.org/                          | 1495871
 https://www.metabolomicsworkbench.org/                 |    4880
 kidsfirst:                                             |  327791
 SPARC.file:                                            |  109220
 tag:hmpdacc.org,2022-04-04:                            |  251136
 tag:hubmapconsortium.org,2024:                         | 9406614
 tag:motrpac-data.org,2023:                             |   18980
 tag:sennetconsortium.org,2024:                         |     135
(17 rows)
*/

select distinct id_namespace, count(*) from
(select distinct f.id_namespace, f.local_id, f.filename, 
fdb.biosample_local_id, fds.subject_local_id, fdc.collection_local_id
from c2m2.file as f 
left join c2m2.file_describes_biosample as fdb on
(f.local_id = fdb.file_local_id AND f.id_namespace = fdb.file_id_namespace)
left join c2m2.file_describes_subject as fds on
(f.local_id = fds.file_local_id AND f.id_namespace = fds.file_id_namespace)
left join c2m2.file_describes_in_collection as fdc on
(f.local_id = fdc.file_local_id AND f.id_namespace = fdc.file_id_namespace)
) group by id_namespace order by id_namespace;

/*
                      id_namespace                      |  count   
--------------------------------------------------------+----------
 adult_gtex                                             |      498
 egtex                                                  |       50
 ERCC-exRNA                                             |   193461
 https://data.4dnucleome.org                            |    47358
 https://druggablegenome.net/cfde_idg_drugcentral_drugs |     4673
 https://druggablegenome.net/cfde_idg_tcrd_diseases     |     1899
 https://druggablegenome.net/cfde_idg_tcrd_targets      |    19295
 https://www.data.glygen.org/                           |   258334
 https://www.druggablegenome.net/                       |    50026
 https://www.lincsproject.org/                          | 11486862
 https://www.metabolomicsworkbench.org/                 |     4880
 kidsfirst:                                             |   625926
 SPARC.file:                                            |   109220
 tag:hmpdacc.org,2022-04-04:                            |  7097977
 tag:hubmapconsortium.org,2024:                         |  9406614
 tag:motrpac-data.org,2023:                             |    18980
 tag:sennetconsortium.org,2024:                         |      135
(17 rows)
*/

--- Combine by using a CTE
with file_count as (select distinct id_namespace, count(*) from c2m2.file group by id_namespace order by id_namespace),
file_bsc_count as (
select distinct id_namespace, count(*) from
(select distinct f.id_namespace, f.local_id, f.filename, 
fdb.biosample_local_id, fds.subject_local_id, fdc.collection_local_id
from c2m2.file as f 
left join c2m2.file_describes_biosample as fdb on
(f.local_id = fdb.file_local_id AND f.id_namespace = fdb.file_id_namespace)
left join c2m2.file_describes_subject as fds on
(f.local_id = fds.file_local_id AND f.id_namespace = fds.file_id_namespace)
left join c2m2.file_describes_in_collection as fdc on
(f.local_id = fdc.file_local_id AND f.id_namespace = fdc.file_id_namespace)
) group by id_namespace order by id_namespace    
),
file_c1_c2 as(
    select f1.id_namespace, f1.count as f1_count, f2.count as f2_count, f2.count::float / f1.count as ratio
    from file_count as f1
    inner join file_bsc_count as f2 on (f1.id_namespace = f2.id_namespace)
    order by f1.id_namespace
)
select * from file_c1_c2;

/*
                      id_namespace                      | f1_count | f2_count |       ratio        
--------------------------------------------------------+----------+----------+--------------------
 adult_gtex                                             |      498 |      498 |                  1
 egtex                                                  |       50 |       50 |                  1
 ERCC-exRNA                                             |   192177 |   193461 | 1.0066813406390984
 https://data.4dnucleome.org                            |    47066 |    47358 | 1.0062040538817831
 https://druggablegenome.net/cfde_idg_drugcentral_drugs |     4673 |     4673 |                  1
 https://druggablegenome.net/cfde_idg_tcrd_diseases     |     1899 |     1899 |                  1
 https://druggablegenome.net/cfde_idg_tcrd_targets      |    19295 |    19295 |                  1
 https://www.data.glygen.org/                           |     1980 |   258334 | 130.47171717171716
 https://www.druggablegenome.net/                       |    50026 |    50026 |                  1
 https://www.lincsproject.org/                          |  1495871 | 11486862 |   7.67904585355288
 https://www.metabolomicsworkbench.org/                 |     4880 |     4880 |                  1
 kidsfirst:                                             |   327791 |   625926 | 1.9095277173564862
 SPARC.file:                                            |   109220 |   109220 |                  1
 tag:hmpdacc.org,2022-04-04:                            |   251136 |  7097977 |  28.26347875254842
 tag:hubmapconsortium.org,2024:                         |  9406614 |  9406614 |                  1
 tag:motrpac-data.org,2023:                             |    18980 |    18980 |                  1
 tag:sennetconsortium.org,2024:                         |      135 |      135 |                  1
*/

--- For several DCCs, ratio >> 1, so, extensive bloating
--- Other related queries
select distinct file_id_namespace, count(*) from c2m2.file_describes_subject group by file_id_namespace;
select distinct file_id_namespace, count(*) from c2m2.file_describes_biosample group by file_id_namespace;
select distinct file_id_namespace, count(*) from c2m2.file_describes_in_collection group by file_id_namespace;

--- @Sumana Srinivasan
--- We need to debug why this page is not listing files that describe or are in collection: 
--- https://data.cfde.cloud/c2m2/search/record_info?q=GLY_000001&t=dcc_name:GlyGen|proje[…]me:Protein%20glycosylation%20site|assay_type_name:Unspecified 
--- I think FilesCollectionComponent.tsx needs some fixing in this regard.
select * from c2m2.file where id_namespace ilike '%glygen%' and project_local_id = 'Portal' 
and file_format = 'format:3752' and data_type = 'ILX:0793825' limit 500;

select f.id_namespace, f.local_id, f.filename, fdc.collection_local_id from 
c2m2.file f inner join c2m2.file_describes_in_collection fdc
on (f.local_id = fdc.file_local_id AND f.id_namespace = fdc.file_id_namespace) 
where f.id_namespace ilike '%glygen%' and f.project_local_id = 'Portal' and f.file_format = 'format:3752' and 
f.data_type = 'ILX:0793825' and fdc.collection_local_id = 'COL_P31946-1_GLY_000001' limit 500;


--- search for COL_P31946-1_GLY_000001, different data type
select * from c2m2.file where id_namespace ilike '%glygen%' and project_local_id = 'Portal' 
and file_format = 'format:3752' and data_type = 'ILX:0793824' limit 500;

select f.id_namespace, f.local_id, f.filename, fdc.collection_local_id from 
c2m2.file f inner join c2m2.file_describes_in_collection fdc
on (f.local_id = fdc.file_local_id AND f.id_namespace = fdc.file_id_namespace) 
where f.id_namespace ilike '%glygen%' and f.project_local_id = 'Portal' and f.file_format = 'format:3752' and 
f.data_type = 'ILX:0793824' and fdc.collection_local_id = 'COL_P31946-1_GLY_000001' limit 500;

--- All looks good:
--- https://data.cfde.cloud/c2m2/search/record_info?q=COL_P31946-1_GLY_000001&t=dcc_name:GlyGen|project_local_id:Portal|disease_name:Unspecified|ncbi_taxonomy_name:Homo%20sapiens|anatomy_name:Unspecified|biofluid_name:Unspecified|gene_name:Unspecified|protein_name:1433B_HUMAN|compound_name:Unspecified|data_type_name:Protein%20name%20(UniProt)|assay_type_name:Unspecified
--- lists files with collections
