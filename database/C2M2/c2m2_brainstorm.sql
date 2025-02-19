
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
