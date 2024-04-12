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
