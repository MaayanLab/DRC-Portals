/* run in psql as \i file_expanded.sql */

--- This script takes the file table and joins with file_describes_* tables

/* For some local_id, we have ~1000 biosamples and subjects, so, if consider all pairs, that makes it 1M rows per local_id 
 making this table useless.
 drc=# select count(*) from (select distinct local_id, biosample_local_id, subject_local_id, collection_local_id from 
c2m2.file_expanded  where local_id = 'EDS-1003');
 1071225
*/

DROP TABLE IF EXISTS c2m2.file_expanded;
CREATE TABLE c2m2.file_expanded as (
select distinct
    c2m2.file.*, 
    c2m2.file_describes_biosample.biosample_id_namespace, c2m2.file_describes_biosample.biosample_local_id,
    c2m2.file_describes_subject.subject_id_namespace, c2m2.file_describes_subject.subject_local_id,
    c2m2.file_describes_collection.collection_id_namespace, c2m2.file_describes_collection.collection_local_id

from ---c2m2.fl_biosample --- Now, doing FULL JOIN of five key biosample-related tables here instead of in generating fl_biosample

    c2m2.file 
    LEFT JOIN c2m2.file_describes_biosample ON
    (c2m2.file.local_id = c2m2.file_describes_biosample.file_local_id AND 
      c2m2.file.id_namespace = c2m2.file_describes_biosample.file_id_namespace)
    LEFT JOIN c2m2.file_describes_subject ON
    (c2m2.file.local_id = c2m2.file_describes_subject.file_local_id AND 
      c2m2.file.id_namespace = c2m2.file_describes_subject.file_id_namespace)
    LEFT JOIN c2m2.file_describes_collection ON
    (c2m2.file.local_id = c2m2.file_describes_collection.file_local_id AND 
      c2m2.file.id_namespace = c2m2.file_describes_collection.file_id_namespace)
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'c2m2' AND tablename = 'file_expanded' AND indexname = 'file_expanded_idx') THEN
        CREATE INDEX file_expanded_idx ON c2m2.file_expanded USING btree(id_namespace, local_id, project_id_namespace, project_local_id);
    END IF;
END $$;

/*
Example queries:
drc=# select count(*) from c2m2.file where id_namespace ilike '%lincs%';
 1495871

drc=# select count(*) from c2m2.file_expanded where id_namespace ilike '%lincs%';
 11486862
**************** The same file may describe many biosamples, so, # rows in fle_expanded > > # rows in file ***************

drc=# select count(*) from c2m2.file where id_namespace ilike '%kids%';
 281223

drc=# select count(*) from c2m2.file_expanded where id_namespace ilike '%kids%';
 389887

drc=# select distinct biosample_id_namespace from c2m2.file_expanded where biosample_id_namespace is not null;
    biosample_id_namespace     
-------------------------------
 ERCC-exRNA
 https://www.lincsproject.org/
 kidsfirst:
 SPARC.sample:
 tag:hmpdacc.org,2022-04-04:

drc=# select distinct subject_id_namespace from c2m2.file_expanded where subject_id_namespace is not null;
     subject_id_namespace      
-------------------------------
 ERCC-exRNA
 https://www.lincsproject.org/
 SPARC.subject:
 tag:hmpdacc.org,2022-04-04:

drc=# select distinct collection_id_namespace from c2m2.file_expanded where collection_id_namespace is not null;
    collection_id_namespace     
--------------------------------
 https://www.data.glygen.org/
 tag:hubmapconsortium.org,2023:

drc=# select distinct local_id, biosample_local_id, subject_local_id, collection_local_id from c2m2.file_expanded where id_namespace ilike '%sparc%';

select distinct local_id, count(distinct biosample_local_id), count(distinct subject_local_id), 
count(distinct collection_local_id) from c2m2.file_expanded where id_namespace ilike '%sparc%' group by local_id;

select * from (select distinct local_id, count(distinct biosample_local_id) as count_bios, 
count(distinct subject_local_id) as count_sub, count(distinct collection_local_id) as count_col 
from c2m2.file_expanded where id_namespace ilike '%sparc%' group by local_id) where (count_bios > 1 OR count_sub > 1 OR
 count_col > 1) LIMIT 10;
0 rows
select count(*) from (select distinct local_id, count(distinct biosample_local_id) as count_bios, 
count(distinct subject_local_id) as count_sub, count(distinct collection_local_id) as count_col 
from c2m2.file_expanded where id_namespace ilike '%sparc%' group by local_id) where (count_bios > 1 OR count_sub > 1 OR
 count_col > 1);

select count(*) from (select distinct local_id, count(distinct biosample_local_id) as count_bios, 
count(distinct subject_local_id) as count_sub, count(distinct collection_local_id) as count_col 
from c2m2.file_expanded where id_namespace ilike '%lincs%' group by local_id) where (count_bios > 1 OR count_sub > 1 OR
 count_col > 1);
146
select * from (select distinct local_id, count(distinct biosample_local_id) as count_bios, 
count(distinct subject_local_id) as count_sub, count(distinct collection_local_id) as count_col 
from c2m2.file_expanded where id_namespace ilike '%lincs%' group by local_id) where (count_bios > 1 OR count_sub > 1 OR
 count_col > 1);
Some have ~1000 biosamples and subjects, if consider all pairs htat makes it 1M rows per local_id for such cases, bloats very fast.

select distinct local_id, biosample_local_id, subject_local_id, collection_local_id from c2m2.file_expanded  
where local_id = 'EDS-1003';

drc=# select count(*) from (select distinct local_id, biosample_local_id, subject_local_id, collection_local_id from 
c2m2.file_expanded  where local_id = 'EDS-1003');
 1071225

drc=# select count(*) from c2m2.file_describes_biosample ;
 2399395
drc=# select count(*) from c2m2.file_describes_subject ;
 1964998
drc=# select count(*) from c2m2.file_describes_collection ;
 161080

select count(*) from (select distinct c2m2.file_describes_subject.* from c2m2.file inner join 
c2m2.file_describes_subject on (c2m2.file.local_id = c2m2.file_describes_subject.file_local_id AND 
      c2m2.file.id_namespace = c2m2.file_describes_subject.file_id_namespace) 
      where c2m2.file.project_local_id = 'EXR-KJENS1aSAHPR-ST');

select count(*) from (select distinct c2m2.file_describes_biosample.* from c2m2.file inner join 
c2m2.file_describes_biosample on (c2m2.file.local_id = c2m2.file_describes_biosample.file_local_id AND 
      c2m2.file.id_namespace = c2m2.file_describes_biosample.file_id_namespace) 
      where c2m2.file.project_local_id = 'EXR-KJENS1aSAHPR-ST');

select distinct c2m2.file_describes_biosample.* from c2m2.file inner join 
c2m2.file_describes_biosample on (c2m2.file.local_id = c2m2.file_describes_biosample.file_local_id AND 
      c2m2.file.id_namespace = c2m2.file_describes_biosample.file_id_namespace) 
      where c2m2.file.project_local_id = 'EXR-KJENS1aSAHPR-ST';

select * from (select subject_id_namespace, subject_local_id, count(distinct file_local_id) as 
    count_file from c2m2.file_describes_subject group by subject_id_namespace, subject_local_id) where count_file > 1;

select * from c2m2.file_describes_subject where subject_local_id = 'EXR-AKRIC1AKGBM001-DO' limit 5;

select * from (select file_id_namespace, file_local_id, count(distinct subject_local_id) as 
    count_sub from c2m2.file_describes_subject group by file_id_namespace, file_local_id) where count_sub > 1;

select * from c2m2.file_describes_subject where file_local_id = 'EDS-1003' limit 5;

*/
