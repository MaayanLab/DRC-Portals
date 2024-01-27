--- Mano: Better to write the queries here first for ease of edting, etc.
/*
    allres: {
    dcc_name: string,
    dcc_abbreviation: string,
    taxonomy_name: string,
    disease_name: string,
    anatomy_name: string,
    project_name: string,
    project_description: string,
    count: number,
  }[],
*/

with allres as (SELECT 
  c2m2.ffl_biosample.dcc_name AS dcc_name,
  c2m2.ffl_biosample.dcc_abbreviation AS dcc_abbreviation,
  c2m2.ffl_biosample.ncbi_taxonomy_name AS taxonomy_name,
  c2m2.ffl_biosample.disease_name AS disease_name,
  c2m2.ffl_biosample.anatomy_name AS anatomy_name, 
  c2m2.ffl_biosample.project_name AS project_name,
  c2m2.project.description as project_description,
  count (*)::int AS count
FROM c2m2.ffl_biosample
LEFT JOIN c2m2.project ON c2m2.ffl_biosample.project_local_id = c2m2.project.local_id
  /* WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) */
 WHERE searchable @@ websearch_to_tsquery('english', 'liver & cancer') 
GROUP BY dcc_name, dcc_abbreviation, taxonomy_name, disease_name, anatomy_name, project_name, project_description
),
dcc_name_count as (select distinct dcc_name, dcc_abbreviation, count(*) as count from allres group by dcc_name, dcc_abbreviation),
taxonomy_name_count as (select distinct taxonomy_name, count(*) as count from allres group by taxonomy_name),
disease_name_count as (select distinct disease_name, count(*) as count from allres group by disease_name),
anatomy_name_count as (select distinct anatomy_name, count(*) as count from allres group by anatomy_name)
select
(select coalesce(jsonb_agg(allres.*), '[]'::jsonb) from allres) as records, 
(select coalesce(jsonb_agg(dcc_name_count.*), '[]'::jsonb) from dcc_name_count) as dcc_filters,
(select coalesce(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) from taxonomy_name_count) as taxonomy_filters,
(select coalesce(jsonb_agg(disease_name_count.*), '[]'::jsonb) from disease_name_count) as disease_filters,
(select coalesce(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) from anatomy_name_count) as anatomy_filters
;

