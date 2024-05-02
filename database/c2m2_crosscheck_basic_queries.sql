/* Some basic queries to check if metadata from various DCCs, together in the schema c2m2 
or in respective schema are all good.
1. Check if counts from respective schema match with count from c2m2 schema for tables which have 
id_namespace and local_id columns.
Do not do this for ontology/term tables such as protein.tsv, compound.tsv, etc., since there, 
several DCCs will have overlapiing terms.
*/

select case when ( 2 != 3) then 'metabolomics.file: Number of records do not match' 
        else 'metabolomics.file: Number of records match' 
        end as count_match;


WITH counts AS (SELECT
    (select count(*) from c2m2.file where id_namespace ilike '%metab%') AS count1,
    (select count(*) from metabolomics.file) AS count2
)
SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 
    THEN 'metabolomics.file: Number of records do not match' 
    ELSE 'metabolomics.file: Number of records match'
    END AS count_match
FROM counts;

select count(*) from c2m2.subject where id_namespace IN ('https://data.4dnucleome.org');

--- Use the above code template to generate code in python and write to the file log/CountQuery_Crosscheck_DCCname.sql

--- Before adding c2m2.subject_in_collection to ffl_biosample on 2024/04/30
drc=# \dt+ c2m2.ffl*;
                        List of relations
 Schema |      Name      | Type  | Owner |  Size   | Description 
--------+----------------+-------+-------+---------+-------------
 c2m2   | ffl_biosample  | table | drc   | 9370 MB | 
 c2m2   | ffl_collection | table | drc   | 3866 MB | 
(2 rows)

drc=# select count(*) from c2m2.ffl_biosample ;
--- 2824584

--- After:
\dt+ c2m2.ffl*;
                        List of relations
 Schema |      Name      | Type  | Owner |  Size   | Description 
--------+----------------+-------+-------+---------+-------------
 c2m2   | ffl_biosample  | table | drc   | 9370 MB | 
 c2m2   | ffl_collection | table | drc   | 3866 MB | 
(2 rows)

select count(*) from c2m2.ffl_biosample;
--- 2824637
--- Only ~ 53 new rows

--- with     left join c2m2.project on both biosample and subject --- 4310225
--- with only biosample: 2826139


--- It seems to be hanging after adding c2m2.subject_in_collection; try smaller parts
select count(*) from (select distinct * from 
    c2m2.biosample 
    full join c2m2.biosample_disease
        on (c2m2.biosample.local_id = c2m2.biosample_disease.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_disease.biosample_id_namespace)
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace)
    full join c2m2.biosample_gene 
        on (c2m2.biosample.local_id = c2m2.biosample_gene.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_gene.biosample_id_namespace)
    full join c2m2.biosample_in_collection
        on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace) --- 1942916 not much bloating till here
---);
    full join c2m2.subject_in_collection
        on (c2m2.subject.local_id = c2m2.subject_in_collection.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_in_collection.subject_id_namespace) --- 9884421 bloats a lot
);

select count(*) from (select distinct * from 
    c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace)
---); --- 1872757       
    full join c2m2.subject_in_collection
        on (c2m2.subject.local_id = c2m2.subject_in_collection.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_in_collection.subject_id_namespace)
); --- 3107432 3107432/1872757 = 1.65

select count(*) from (select distinct * from 
    c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
    full join c2m2.subject_in_collection
        on (c2m2.subject.local_id = c2m2.subject_in_collection.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_in_collection.subject_id_namespace)
); --- 89244 89244/54365 = 1.64

select count(*) from c2m2.subject; --- 54365

select count(*) from (select distinct * from 
    c2m2.biosample /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
    full join c2m2.biosample_in_collection
        on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace)
); --- 1927874 1927874/1871436 = 1.03

select count(*) from c2m2.biosample; --- 1871436

select count(*) from (select distinct * from 
    c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace) --- 1872757
---);
    full join c2m2.biosample_in_collection
        on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace) --- 1929195 / same with left join too
---);
    full join c2m2.subject_in_collection /* only if subject not in biosample_from_subject as those already covered by biosample_in_collection */
        on ((c2m2.subject.local_id = c2m2.subject_in_collection.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_in_collection.subject_id_namespace) AND
        NOT(c2m2.subject.local_id = c2m2.biosample_from_subject.subject_local_id and
        c2m2.subject.id_namespace = c2m2.biosample_from_subject.subject_id_namespace)) -- 9870700 bloats a lot / same with left join too
        --- with exclusion (NOT), no bloating; full joins gives 1976858, use full join
        --- left join doesn't get collection_local_id; try a basic query
        --- because 'full join c2m2.subject' condition contradicts 'left join c2m2.subject_in_collection' condition (NOT part)
        --- so, full join is needed
        --- This does exclude some collections related to the subjects
); --- 1976858

--- add project too
select count(*) from (select distinct * from 
    c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace) --- 1872757
---);
    full join c2m2.biosample_in_collection
        on (c2m2.biosample.local_id = c2m2.biosample_in_collection.biosample_local_id and
        c2m2.biosample.id_namespace = c2m2.biosample_in_collection.biosample_id_namespace) --- 1929195 / same with left join too
---);
    /* solution for future: attach only one collection to a subject, then don't need the NOT condition */
    full join c2m2.subject_in_collection /* only if subject not in biosample_from_subject as those already covered by biosample_in_collection */
        on ((c2m2.subject.local_id = c2m2.subject_in_collection.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_in_collection.subject_id_namespace) AND
        NOT(c2m2.subject.local_id = c2m2.biosample_from_subject.subject_local_id and
        c2m2.subject.id_namespace = c2m2.biosample_from_subject.subject_id_namespace)) -- 9870700 bloats a lot / same with left join too
        --- with exclusion (NOT), no bloating; full joins gives 1976858, use full join
        --- left join doesn't get collection_local_id; try a basic query
        --- because 'full join c2m2.subject' condition contradicts 'left join c2m2.subject_in_collection' condition (NOT part)
        --- so, full join is needed
        --- This does exclude some collections related to the subjects
    --- Solution for future: require that project_local_id for subject/biosample pairs be the same. Also, wherever possible, biosample should come from subject, i.e., there should be no biosample without subject. Also, for a biosample/subject pair, if biosample is part of a collection, then the collection for the subject should be the same (if at all), isn’t it?
    left join c2m2.project
        on ((c2m2.biosample.project_local_id = c2m2.project.local_id and
        c2m2.biosample.project_id_namespace = c2m2.project.id_namespace)
        OR (c2m2.subject.project_local_id = c2m2.project.local_id and
        c2m2.subject.project_id_namespace = c2m2.project.id_namespace))         
); --- 3453245

--- projects which are for subject but not for biosample
select count(*) from (
    select * from (
    (select distinct project_local_id from c2m2.subject)
    except
    (select distinct project_local_id from c2m2.biosample)    
    )
); --- 38

select count(*) from (
    select * from (
    (select distinct project_local_id from c2m2.biosample)
    except
    (select distinct project_local_id from c2m2.subject)    
    )
); --- 80

--- are there subject/biosample pairs with different project
/* ERCC-exRNA https://data.4dnucleome.org https://www.lincsproject.org/ tag:hubmapconsortium.org,2023: */
select count(*) from (select distinct c2m2.project.id_namespace, c2m2.biosample.local_id as biosample_local_id,
  c2m2.subject.local_id as subject_local_id, c2m2.biosample.project_local_id as biosample_project_local_id,
  c2m2.subject.project_local_id as subject_project_local_id
--- select distinct c2m2.project.id_namespace
   from 
    c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace) --- 1872757
    left join c2m2.project
        on ((c2m2.biosample.project_local_id = c2m2.project.local_id and
        c2m2.biosample.project_id_namespace = c2m2.project.id_namespace)
        OR (c2m2.subject.project_local_id = c2m2.project.local_id and
        c2m2.subject.project_id_namespace = c2m2.project.id_namespace))
    where (c2m2.biosample.local_id is not null and c2m2.project.local_id is not null 
    and NOT(c2m2.biosample.project_local_id = c2m2.subject.project_local_id) ) 
); --- 1475465

--- This is in sync with 1475465 + 1976858 = 3452323 [see 3453245 above]

id_namespace               | ERCC-exRNA
biosample_local_id         | EXR-AKRIC1AKGBM001-BS
subject_local_id           | EXR-AKRIC1AKGBM001-DO
biosample_project_local_id | EXR-AKRIC1AKGBMexo-ST
subject_project_local_id   | exRNA_Atlas

--- This is because of parent (exRNA_Atlas)-child (EXR-AKRIC1AKGBMexo-ST) project relationship. 
select distinct project_local_id from c2m2.subject where project_id_namespace = 'ERCC-exRNA';
--- exRNA_Atlas

select project_id_namespace, project_local_id, id_namespace, local_id from c2m2.biosample where local_id = 'EXR-AKRIC1AKGBM001-BS';
select project_id_namespace, project_local_id, id_namespace, local_id from c2m2.subject where local_id = 'EXR-AKRIC1AKGBM001-DO';
select * from c2m2.biosample_from_subject where subject_local_id = 'EXR-AKRIC1AKGBM001-DO';

drc=# select project_id_namespace, project_local_id, id_namespace, local_id from c2m2.biosample where local_id = 'EXR-AKRIC1AKGBM001-BS';
 project_id_namespace |   project_local_id    | id_namespace |       local_id        
----------------------+-----------------------+--------------+-----------------------
 ERCC-exRNA           | EXR-AKRIC1AKGBMexo-ST | ERCC-exRNA   | EXR-AKRIC1AKGBM001-BS

drc=# select project_id_namespace, project_local_id, id_namespace, local_id from c2m2.subject where local_id = 'EXR-AKRIC1AKGBM001-DO';
 project_id_namespace | project_local_id | id_namespace |       local_id        
----------------------+------------------+--------------+-----------------------
 ERCC-exRNA           | exRNA_Atlas      | ERCC-exRNA   | EXR-AKRIC1AKGBM001-DO

drc=# select * from c2m2.biosample_from_subject where subject_local_id = 'EXR-AKRIC1AKGBM001-DO';
 biosample_id_namespace |  biosample_local_id   | subject_id_namespace |   subject_local_id    | age_at_sampling 
------------------------+-----------------------+----------------------+-----------------------+-----------------
 ERCC-exRNA             | EXR-AKRIC1AKGBM001-BS | ERCC-exRNA           | EXR-AKRIC1AKGBM001-DO | 0.0

--- So, in the OR part focusing on subject, require that subject's projetc is not parent of biosample's project
select count(*) from (select distinct c2m2.project.id_namespace, c2m2.biosample.local_id as biosample_local_id,
  c2m2.subject.local_id as subject_local_id, c2m2.biosample.project_local_id as biosample_project_local_id,
  c2m2.subject.project_local_id as subject_project_local_id
--- select distinct c2m2.project.id_namespace
select count(*) from (select distinct *
   from 
    c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace) --- 1872757
    left join c2m2.project
        on ((c2m2.biosample.project_local_id = c2m2.project.local_id and
        c2m2.biosample.project_id_namespace = c2m2.project.id_namespace)
        OR (c2m2.subject.project_local_id = c2m2.project.local_id and
        c2m2.subject.project_id_namespace = c2m2.project.id_namespace))
---);
    left join c2m2.project_in_project
        on (c2m2.project_in_project.child_project_local_id = c2m2.project.local_id and
        c2m2.project_in_project.child_project_id_namespace = c2m2.project.id_namespace) 
    where ( NOT((c2m2.subject.project_local_id = c2m2.project_in_project.parent_project_local_id) AND 
            (c2m2.subject.project_id_namespace = c2m2.project_in_project.parent_project_id_namespace)) OR 
            (((c2m2.subject.project_local_id = c2m2.project_in_project.parent_project_local_id) AND 
            (c2m2.subject.project_id_namespace = c2m2.project_in_project.parent_project_id_namespace)) IS NULL)
             )
);--- left join on project/p-in-p with where NOT: 1872757/ with where NOT 391557 -- no increase in # rows due to p-in-p 
--- with where (): 1472571: matches with unmatched project ID for paired biosample/subject
--- with where NOT OR NULL: 1875651 a bit more than 1872757

select count(*) from (select distinct c2m2.project.id_namespace, c2m2.biosample.local_id as biosample_local_id,
  c2m2.subject.local_id as subject_local_id, c2m2.biosample.project_local_id as biosample_project_local_id,
  c2m2.subject.project_local_id as subject_project_local_id
   from 
    c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace) --- 1872757
    left join c2m2.project
        on ((c2m2.biosample.project_local_id = c2m2.project.local_id and
        c2m2.biosample.project_id_namespace = c2m2.project.id_namespace)
        )
); --- left join on project: 1872757; full join on project: 

--- Thus the OR part on subject with NOT in biosample_from_subject has no match at all (makes sense since it contradicts the previous condition).
--- If it was full join, then one can get some more rows from project.

--- basic
select count(*) from (select distinct c2m2.biosample.local_id as biosample_local_id,
  c2m2.subject.local_id as subject_local_id, c2m2.biosample.project_local_id as biosample_project_local_id,
  c2m2.subject.project_local_id as subject_project_local_id
--- select distinct c2m2.project.id_namespace
   from 
    c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace) --- 1872757
); --- 1872757

select count(*) from (
    select distinct c2m2.subject.local_id as subject_local_id, c2m2.subject_in_collection.collection_local_id from 
    (c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace)
    full join c2m2.subject_in_collection /* only if subject not in biosample_from_subject as those already covered by biosample_in_collection */
        on ((c2m2.subject.local_id = c2m2.subject_in_collection.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_in_collection.subject_id_namespace) AND
        NOT(c2m2.subject.local_id = c2m2.biosample_from_subject.subject_local_id and
        c2m2.subject.id_namespace = c2m2.biosample_from_subject.subject_id_namespace)) -- 9870700 bloats a lot / same with left join too
) where c2m2.subject_in_collection.collection_local_id is not null);

--- Try unconditional join with subject --- NO NO: it will become a X join
select count(*) from (
    select distinct c2m2.subject.local_id as subject_local_id, c2m2.subject_in_collection.collection_local_id from 
    (c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (true) --- NO NO: it will become a X join
    left join c2m2.subject_in_collection /* only if subject not in biosample_from_subject as those already covered by biosample_in_collection */
        on ((c2m2.subject.local_id = c2m2.subject_in_collection.subject_local_id and
        c2m2.subject.id_namespace = c2m2.subject_in_collection.subject_id_namespace) AND
        NOT(c2m2.subject.local_id = c2m2.biosample_from_subject.subject_local_id and
        c2m2.subject.id_namespace = c2m2.biosample_from_subject.subject_id_namespace)) -- 9870700 bloats a lot / same with left join too
)); --- where c2m2.subject_in_collection.collection_local_id is not null);

--- even simpler
select count(*) from (
    select distinct * from 
    (c2m2.biosample 
    full join c2m2.biosample_from_subject
        on (c2m2.biosample.local_id = c2m2.biosample_from_subject.biosample_local_id and 
        c2m2.biosample.id_namespace = c2m2.biosample_from_subject.biosample_id_namespace)
    full join c2m2.subject /* Could right-join make more sense here; likely no; yes, trying on 2024/04/30 moved from later part to here */
        on (c2m2.biosample_from_subject.subject_local_id = c2m2.subject.local_id and
        c2m2.biosample_from_subject.subject_id_namespace = c2m2.subject.id_namespace)
)); 


--- part of the reason for bloating: 47663/12784 = 3.7
select count(*) from c2m2.subject_in_collection;
--- 47663
select count(*) from (select distinct subject_local_id from c2m2.subject_in_collection);
--- 12784

--- How many subjects are not part of biosample_from_subject
select count(*) from (
    select * from (
    (select distinct local_id as subject_local_id from c2m2.subject)
    except
    (select distinct subject_local_id from c2m2.biosample_from_subject)    
    )
); --- 1321

--- How many subjects in subject_in_collection that are not part of biosample_from_subject
select count(*) from (
    select * from (
    (select distinct subject_local_id from c2m2.subject_in_collection)
    except
    (select distinct subject_local_id from c2m2.biosample_from_subject)    
    )
); --- 60


--- intersection of 1321 and 60
select count(*) from (
    (
    (select distinct local_id as subject_local_id from c2m2.subject)
    except
    (select distinct subject_local_id from c2m2.biosample_from_subject)    
    )
    intersect
    (
    (select distinct subject_local_id from c2m2.subject_in_collection)
    except
    (select distinct subject_local_id from c2m2.biosample_from_subject)    
    )
); --- 60; all 60 are there

--- Thus, it makes sense that only 53 new rows after adding c2m2.subject_in_collection

--- Do these 60 have lot of collections: no, just one each, all from motrpac
select count(*) from (select distinct * from c2m2.subject_in_collection );

select count(*) from 
    (select distinct c2m2.subject_in_collection.subject_local_id, c2m2.subject_in_collection.collection_local_id  from 
    (c2m2.subject_in_collection
    INNER JOIN (
    (select distinct subject_local_id from c2m2.subject_in_collection)
    except
    (select distinct subject_local_id from c2m2.biosample_from_subject)    
    ) tmp on (tmp.subject_local_id = c2m2.subject_in_collection.subject_local_id)
    ));

--- Check which subjects have no biosample for them but have collection
select project_local_id, subject_local_id, biosample_local_id, collection_local_id 
from c2m2.ffl_biosample where biosample_local_id is null and collection_local_id is not null limit 5;

select count(*) from (select project_local_id, subject_local_id, biosample_local_id, collection_local_id 
from c2m2.ffl_biosample where biosample_local_id is null) limit 5;
select project_local_id, subject_local_id, biosample_local_id, collection_local_id 
from c2m2.ffl_biosample where biosample_local_id is null limit 5;

select dcc_name, project_local_id, subject_local_id, biosample_local_id, collection_local_id 
from c2m2.ffl_biosample where subject_local_id is not null and biosample_local_id is null;

select dcc_name, project_local_id, subject_local_id, biosample_local_id, collection_local_id 
from c2m2.ffl_biosample where collection_local_id = 'eeec002c-fbeb-4d00-98be-44988bc722ab';

select dcc_name, project_local_id, subject_local_id, biosample_local_id, collection_local_id 
from c2m2.ffl_biosample where subject_local_id = '10761160';

select * from c2m2.subject_in_collection where subject_local_id = '10761160';

--- These are all null values, since subject is coming from biosample_from_subject and not from subject?

--- Are there biosamples without a subject
select count(*) from (
    select * from (
    (select distinct local_id as biosample_local_id from c2m2.biosample)
    except
    (select distinct biosample_local_id from c2m2.biosample_from_subject)    
    )
); --- 8569


select * from c2m2.subject where local_id = 'PT_TYYD9PZ2';
select * from c2m2.biosample_from_subject where subject_local_id = 'PT_TYYD9PZ2';

select * from c2m2.subject where local_id = 'SU000182';
select * from c2m2.biosample_from_subject where subject_local_id = 'SU000182';


drc=# select count(*) from c2m2.ffl_biosample where collection_local_id is null;
count | 3722253

drc=# select count(*) from c2m2.ffl_biosample where project_local_id is null;
count | 18214

drc=# select count(*) from c2m2.ffl_biosample where dcc_name is null;
count | 18214

drc=# select count(*) from c2m2.ffl_biosample where subject_local_id is null;
count | 54491

drc=# select count(*) from c2m2.ffl_biosample where biosample_local_id is null;
count | 23901

select count(*) from c2m2.ffl_biosample where biosample_local_id is null AND subject_local_id is null;
0
