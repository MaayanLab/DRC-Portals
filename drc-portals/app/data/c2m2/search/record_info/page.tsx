import { RecordInfoQueryComponent} from './RecordInfoQueryComponent';

import React, { Suspense } from 'react';

type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }

export default async function Page(props: PageProps) {
  console.log(props)
  return(
    <Suspense fallback={<div>Loading...</div>}>
      <RecordInfoQueryComponent {...props} />
    </Suspense>
  )
}

/* (SELECT COALESCE(jsonb_agg(sample_prep_method_name_count.*), '[]'::jsonb) FROM sample_prep_method_name_count) AS sample_prep_method_name_filters,
  (SELECT count FROM count_col) as count_col,
  (SELECT COALESCE(jsonb_agg(collections_table.*), '[]'::jsonb) FROM collections_table) AS collections_table,
  (SELECT count FROM count_sub) as count_sub,
  (SELECT COALESCE(jsonb_agg(subjects_table.*), '[]'::jsonb) FROM subjects_table) AS subjects_table */

/*sample_prep_method_name_count AS (
  SELECT CASE WHEN sample_prep_method_name IS NULL THEN 'Unspecified' ELSE sample_prep_method_name END AS sample_prep_method_name, COUNT(*) AS count
  FROM  biosamples_table
  GROUP BY sample_prep_method_name ORDER BY sample_prep_method_name
), 
collections_table as (
  SELECT DISTINCT
    allres_full.biosample_id_namespace,
    allres_full.biosample_local_id,      
    c2m2.collection.*

    FROM allres_full 

    LEFT JOIN c2m2.collection ON (allres_full.collection_id_namespace = c2m2.collection.id_namespace AND allres_full.collection_local_id = c2m2.collection.local_id)

    WHERE allres_full.collection_local_id is not null
),
count_col as (
  select count(*)::int as count
    from collections_table
),*/
/* Mano - We can also add the columns persistent_id and creation_time*/
/*
subjects_table as (
  
  SELECT DISTINCT
    allres_full.biosample_id_namespace,
    allres_full.biosample_local_id,
    allres_full.subject_id_namespace,
    allres_full.subject_local_id,
    allres_full.subject_race_name,
    allres_full.subject_granularity_name,
    allres_full.subject_sex_name,
    allres_full.subject_ethnicity_name,
    allres_full.subject_role_name,
    allres_full.age_at_enrollment

  FROM allres_full
),
count_sub as (
  select count(*)::int as count
    from subjects_table
)

select count(*) from (select distinct c2m2.file.local_id from c2m2.file WHERE file.project_local_id = 'LINCS-2021');

select count(*) from (select distinct c2m2.file_describes_subject.subject_local_id from c2m2.file inner join c2m2.file_describes_subject ON 
(file.local_id = c2m2.file_describes_subject.file_local_id AND 
  file.id_namespace = c2m2.file_describes_subject.file_id_namespace)
WHERE file.project_local_id = 'LINCS phase 1');

select count(*) from (select distinct c2m2.file_describes_subject.* from c2m2.file inner join c2m2.file_describes_subject ON 
(file.local_id = c2m2.file_describes_subject.file_local_id AND 
  file.id_namespace = c2m2.file_describes_subject.file_id_namespace)
WHERE file.project_local_id = 'LINCS-2021');

/* Example queries:
Parkinsons: LINCS, view one of them

select count(*) from (select distinct * from c2m2.ffl_biosample where searchable @@ websearch_to_tsquery('english', 'parkinson') and 
project_id_namespace ilike '%lincs%' and project_local_id = 'LINCS-2021' and disease_name = 'breast carcinoma' and
ncbi_taxonomy_name = 'Homo sapiens' and anatomy_name = 'breast' and gene_name = 'PARK7' AND 
data_type_name = 'Gene expression profile');

*/

/*

Cases with too many files, etc
Hubmap: 1 project had 6M+ files
http://localhost:3000/data/c2m2/record_info?q=blood&t=dcc_name:HuBMAP|project_local_id:Stanford%20TMC|disease_name:Unspecified|ncbi_taxonomy_name:Unspecified|anatomy_name:blood|gene_name:Unspecified|data_type_name:Unspecified

*/
