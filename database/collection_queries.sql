--- Do not run it in one go as a script. Instead, copy/paste individual statements to run as needed to explore.
--- Some example collection queries

select * from c2m2.collection_defined_by_project limit 5;

select distinct project_id_namespace from c2m2.collection_defined_by_project;

select project_id_namespace, count(project_local_id) from c2m2.collection_defined_by_project group by project_id_namespace;

select collection_id_namespace, project_id_namespace, count(project_local_id) from c2m2.collection_defined_by_project group by collection_id_namespace, project_id_namespace;

/* most collections also have an associated project */

select count(*) from (select distinct local_id, id_namespace from c2m2.collection);
 262805

select count(*) from (select distinct collection_local_id, collection_id_namespace from c2m2.collection_defined_by_project);
 262734

 /* Find if there are some biosamples with matching (or not) anatomy listed in both biosample and 
  biosample_in_collection <-> collection_anatomy;
  This could happen just because all the biosamples related to a collection may not have the same anatomy.
  */

select * from c2m2.biosample 
left join c2m2.biosample_in_collection 
    on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and 
    c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
left join c2m2.collection_anatomy
    on (c2m2.collection_anatomy.collection_local_id = c2m2.biosample_in_collection.collection_local_id and 
    c2m2.collection_anatomy.collection_id_namespace = c2m2.biosample_in_collection.collection_id_namespace)
where c2m2.biosample.anatomy != c2m2.collection_anatomy.anatomy
limit 10;

select biosample_id_namespace, biosample_local_id,
c2m2.biosample.anatomy as biosample_anatomy, c2m2.collection_anatomy.collection_local_id,
c2m2.collection_anatomy.anatomy as collection_anatomy
from c2m2.biosample 
left join c2m2.biosample_in_collection 
    on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and 
    c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
left join c2m2.collection_anatomy
    on (c2m2.collection_anatomy.collection_local_id = c2m2.biosample_in_collection.collection_local_id and 
    c2m2.collection_anatomy.collection_id_namespace = c2m2.biosample_in_collection.collection_id_namespace)
where c2m2.biosample_in_collection.collection_local_id = 'EXR-MANSE1oCqMmF-AN' and
c2m2.biosample_in_collection.biosample_local_id = 'EXR-MANSE1ALLERAIR10-BS';
/*
 biosample_id_namespace |   biosample_local_id    | biosample_anatomy | collection_local_id | collection_anatomy 
------------------------+-------------------------+-------------------+---------------------+--------------------
 ERCC-exRNA             | EXR-MANSE1ALLERAIR10-BS | UBERON:0002048    | EXR-MANSE1oCqMmF-AN | UBERON:0002048
 ERCC-exRNA             | EXR-MANSE1ALLERAIR10-BS | UBERON:0002048    | EXR-MANSE1oCqMmF-AN | UBERON:0004535

 See that UBERON:0004535 got added artificially due to linking through collection_anatomy.
*/

select * from c2m2.collection_anatomy where collection_local_id = 'EXR-MANSE1oCqMmF-AN';
select * from c2m2.biosample_in_collection where collection_local_id = 'EXR-MANSE1oCqMmF-AN';

select * from c2m2.biosample 
left join c2m2.biosample_in_collection 
    on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
    c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
where c2m2.biosample_in_collection.collection_local_id = 'EXR-MANSE1oCqMmF-AN';

/* Conclusion: collection_anatomy provides a summary of anatomy for all biosamples that are part of that collection.
So, it is best to let the table biosample_in_collection be used in ffl_biosample and not in ffl_collection. Including
it in ffl_collection will bloat the table quite a bit, and it will be just duplcating what is already in ffl_biosample. 
It may also potentially yield spurious results in search.
*/

drc=# select count(*) from c2m2.biosample_in_collection ;
 97887

drc=# select count(distinct biosample_local_id) from c2m2.biosample_in_collection ;
 41449

drc=# select count(*) from (select distinct biosample_id_namespace, biosample_local_id from c2m2.biosample_in_collection);
 41449

/* This means, some biosamples are associated with more than one collection. Hence, it is better not to include 
content from these two tables in ffl_collection. */
/* Same is true for subject_in_collection */

drc=# select count(*) from c2m2.subject_in_collection ;
 47663

drc=# select count(distinct subject_local_id) from c2m2.subject_in_collection ;
 12784

drc=# select count(*) from (select distinct subject_id_namespace, subject_local_id from c2m2.subject_in_collection);
 12784

/* Check if join of biosample, biosample_in_collection gives the same table as collection_anatomy */
select count(*) from (
select distinct collection_id_namespace, collection_local_id, anatomy 
from c2m2.biosample 
left join c2m2.biosample_in_collection 
    on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
    c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
order by collection_id_namespace, collection_local_id, anatomy
--- limit 50;
);

select count(*) from (
select distinct collection_id_namespace, collection_local_id, anatomy 
from c2m2.collection_anatomy
order by collection_id_namespace, collection_local_id, anatomy
--- limit 50;
);

drc=# select distinct collection_id_namespace from c2m2.collection_anatomy ;
    collection_id_namespace    
-------------------------------
 https://www.lincsproject.org/
 https://www.data.glygen.org/
 ERCC-exRNA
(3 rows)

drc=# select distinct collection_id_namespace from c2m2.biosample_in_collection ;
    collection_id_namespace     
--------------------------------
 https://www.lincsproject.org/
 SPARC.collection:
 tag:motrpac-data.org,2023:
 ERCC-exRNA
 https://data.4dnucleome.org
 tag:hubmapconsortium.org,2023:
 tag:hmpdacc.org,2022-04-04:
(7 rows)

/* GlyGen doesn't have data in biosample_in_collection. So, need to keep collection_anatomy 
as well, unless they create biosample_in_collection based on dummy biosamples.
*/

/* Content from (join of biosample and biosample_in_collection (JBBC)) not in collection_anatomy (CA)  */
select count(*) from (
    select * from (
    (select distinct collection_id_namespace, collection_local_id, anatomy 
    from c2m2.biosample 
    left join c2m2.biosample_in_collection 
        on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
    order by collection_id_namespace, collection_local_id, anatomy) 

    except

    (select distinct collection_id_namespace, collection_local_id, anatomy 
    from c2m2.collection_anatomy
    order by collection_id_namespace, collection_local_id, anatomy)
    ) 
    where collection_id_namespace = 'https://www.lincsproject.org/'
);
/* count 
-------
Across all DCCs, 28022
 out of 28291 rows in (3 columns from join of biosample & bipsample_in_collection)
*/

/* Reverse of the above: i.e., content from (join of biosample and biosample_in_collection) not in collection_anatomy  */
select count(*) from (
    select * from (
    (select distinct collection_id_namespace, collection_local_id, anatomy 
    from c2m2.collection_anatomy
    order by collection_id_namespace, collection_local_id, anatomy)

    except

    (select distinct collection_id_namespace, collection_local_id, anatomy 
    from c2m2.biosample 
    left join c2m2.biosample_in_collection 
        on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
    order by collection_id_namespace, collection_local_id, anatomy)
    ) 
    where collection_id_namespace = 'https://www.lincsproject.org/'
);
/*  count 
-------
  3520
  out of 3789 rows in collection_anatomy;

So, they are quite distinct.
*/

--- Compare for specific DCCs, e.g., ERCC-exRNA which are in both
--- Complete for for ERCC, i.e., 0 rows in the difference
--- for https://www.lincsproject.org/ :  711 rows in JBBC except CA

/* interplay of project and collection */
drc=# select count(*) from (select distinct project_local_id, collection_local_id from c2m2.ffl_collection);
-[ RECORD 1 ]-
count | 262805

drc=# select count(*) from (select distinct project_local_id from c2m2.ffl_collection);
-[ RECORD 1 ]
count | 1159

drc=# select count(*) from (select distinct collection_local_id from c2m2.ffl_collection);
-[ RECORD 1 ]-
count | 262805

/* Examples of collections with proteins */
drc=# select collection_local_id,protein,protein_name from c2m2.ffl_collection where protein is not null limit 5;
collection_local_id | COL_A0N4X2-1_GLY_000001
protein             | A0N4X2
protein_name        | A0N4X2_HUMAN


--- substance_compound is compound id
select distinct substance_compound,substance_name,compound_name from c2m2.ffl_collection limit 5;

--- gtex has some collections without project
select * from c2m2.ffl_collection where collection_id_namespace ilike '%gtex%'  limit 50;
select distinct project_name from c2m2.ffl_collection where collection_id_namespace ilike '%gtex%'  limit 50;
select distinct collection_id_namespace from c2m2.ffl_collection where project_local_id is null limit 50;

select distinct dcc_name, collection_id_namespace,collection_local_id from c2m2.ffl_collection where collection_id_namespace ilike '%gtex%';

select distinct dcc_name,dcc_abbreviation,collection_id_namespace from c2m2.ffl_collection where project_local_id is null limit 50;
select distinct dcc_name, dcc_abbreviation, collection_id_namespace, project_id_namespace from c2m2.ffl_collection where project_local_id is null limit 50;
select distinct dcc_name, dcc_abbreviation, collection_id_namespace, project_id_namespace from c2m2.ffl_collection limit 50;

--- which id_namespace has collection
 select * from c2m2.id_namespace where description ilike '%collection%';

--- Need to add dcc_id column to c2m2.id_namespace table;
select id,name,abbreviation from c2m2.id_namespace ;
select id, dcc_name, dcc_abbreviation, project_id_namespace, project_local_id from c2m2.dcc;

select id, dcc_name, dcc_abbreviation, project_id_namespace, project_local_id from c2m2.dcc where project_id_namespace ilike '%gtex%';
select distinct id_namespace from c2m2.collection where id_namespace ilike '%gtex%';

select distinct c2m2.dcc.dcc_name, c2m2.collection.id_namespace from
    c2m2.collection
    left join c2m2.id_namespace_dcc_id
        on (c2m2.collection.id_namespace = c2m2.id_namespace_dcc_id.id_namespace_id)
    left join c2m2.dcc
        on (c2m2.id_namespace_dcc_id.dcc_id = c2m2.dcc.id);


 select distinct collection_id_namespace, count(distinct collection_local_id) from c2m2.collection_defined_by_project group by collection_id_namespace;
 select distinct id_namespace, count(distinct local_id) from c2m2.collection group by id_namespace;
 --- Most collections have a project associated with them; gtex has some without.
drc=# select count(*) from c2m2.collection;
 262805

drc=# select count(*) from c2m2.collection_defined_by_project;
 262734

--- Collections without project_local_id
select * from (
    select * from (
    (select distinct local_id as collection_local_id from c2m2.collection)
    
    except

    (select distinct collection_local_id from c2m2.collection_defined_by_project)
    ) 
);

select * from c2m2.collection where local_id ilike '%gs://adult-gtex/annotations/v8/%';

--- ================================================================================
--- Mano: 2024/04/30: the numbers below can change if run in future
--- c2m2.biosample_in_collection vs c2m2.subject_in_collection
select count(*) from (
    select * from (
    (select distinct collection_local_id from c2m2.biosample_in_collection)    
    except
    (select distinct collection_local_id from c2m2.subject_in_collection)
    )
);
--- 11182

select count(*) from (
    select * from (
    (select distinct collection_local_id from c2m2.subject_in_collection)
    except
    (select distinct collection_local_id from c2m2.biosample_in_collection)    
    )
);
--- 2207
select count(*) from (
    select * from (
    (select distinct collection_local_id from c2m2.subject_in_collection)
    union
    (select distinct collection_local_id from c2m2.biosample_in_collection)    
    )
);
---  29396
select count(*) from (select distinct collection_local_id from c2m2.subject_in_collection);
--- 18214
select count(*) from (select distinct collection_local_id from c2m2.biosample_in_collection);
--- 27189

--- Find biosamples associated with subjects with collection_id not in biosample_in_collection
    select count(*) from 
    (select distinct c2m2.biosample_from_subject.biosample_local_id from 
    (c2m2.biosample_from_subject INNER JOIN
    c2m2.subject_in_collection ON (c2m2.biosample_from_subject.subject_local_id = c2m2.subject_in_collection.subject_local_id)
    INNER JOIN (
    (select distinct collection_local_id from c2m2.subject_in_collection)
    except
    (select distinct collection_local_id from c2m2.biosample_in_collection)    
    ) tmp on (tmp.collection_local_id = c2m2.subject_in_collection.collection_local_id)
    ));
--- 2961: not a huge increase

drc=# select count(*) from (select distinct subject_local_id from c2m2.biosample_from_subject);
drc=# select count(*) from (select distinct subject_local_id from c2m2.subject_in_collection);

--- But adding c2m2.subject_in_collection makes it bloat, not clear why
select count(*) from (
    select * from (
    (select distinct subject_local_id from c2m2.subject_in_collection)    
    except
    --- (select distinct subject_local_id from c2m2.biosample_from_subject) --- 60
    (select distinct local_id as subject_local_id from c2m2.subject) --- 0
    )
);

select count(*) from c2m2.ffl_collection where collection_local_id is null;

--- ================================================================================

--- Error scenario: search for 77320cd3-7c4d-596f-b97d-ce68888eb718
--- https://ucsd-sslab.ngrok.app/data/c2m2/record_info_col?q=77320cd3-7c4d-596f-b97d-ce68888eb718&t=dcc_name:Genotype-Tissue%20Expression%20Project|project_local_id:|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:Unspecified|gene_name:Unspecified|protein_name:Unspecified|compound_name:Unspecified|data_type_name:Unspecified
--- This is because, in utils.ts, in line 144: export function generateFilterQueryStringForRecordInfo(searchParams: any, schemaname: string, tablename: string) {
--- Line 158: we compare with "Unspecified", but for this example (collection persistent_id), project_local_id is empty '' or null, so, 
--- it should be compared with null (use: is null).
--- Try to set project_local_id as well Unspecified for this case.
--- File: search_col/Col_SearchQueryComponent.tsx
--- for CTE part allres: see:             COALESCE(allres_full.project_local_id, 'Unspecified') AS project_local_id, /* added Unspecified as needed in record_info_col */
