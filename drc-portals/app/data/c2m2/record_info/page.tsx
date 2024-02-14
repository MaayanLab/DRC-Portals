import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { LinkedTypedNode, SearchablePagedTableCellIcon, Description } from "@/app/data/c2m2/SearchablePagedTable";
import ListingPageLayout from "@/app/data/c2m2/ListingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { string } from "zod";

type PageProps = { searchParams: Record<string, string | string[] | undefined> }

export async function generateMetadata(props: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  return {
    title: `${(await parent).title?.absolute} | ${pluralize(type_to_string('gene_set', null))}`,
  }
}
// Mano: Not sure if use of this function is sql-injection safe
// This is different from search/Page.tsx because it has specifics for this page.
//export function generateFilterQueryString(searchParams: Record<string, string>, tablename: string) {
export function generateFilterQueryString(searchParams: any, schemaname: string, tablename: string) {
  const filters: string[] = [];

  //const tablename = "allres";
  if (searchParams.t) {
    const typeFilters: { [key: string]: string[] } = {};

    searchParams.t.forEach(t => {
      if (!typeFilters[t.type]) {
        typeFilters[t.type] = [];
      }
      if (t.entity_type) {

        //typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);
        if (t.entity_type !== "Unspecified") { // was using "null"
          //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = '${t.entity_type}'`);
          typeFilters[t.type].push(`"${schemaname}"."${tablename}"."${t.type}" = '${t.entity_type.replace(/'/g, "''")}'`);
        } else {
          typeFilters[t.type].push(`"${schemaname}"."${tablename}"."${t.type}" is null`);
          //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = 'Unspecified'`);
        }
      }
    });

    for (const type in typeFilters) {
      if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
        filters.push(`(${typeFilters[type].join(' OR ')})`);
      }
    }
  }
  //const filterClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const filterConditionStr = filters.length ? `${filters.join(' AND ')}` : '';
  console.log("FILTERS LENGTH =");
  console.log(filters.length)
  return filterConditionStr;
}

// Function to prune and get column names
export function pruneAndRetrieveColumnNames(data) {
  const prunedData = [];
  const columnNames = new Set();

  // Iterate through each row
  data.forEach(row => {
    const prunedRow = {};

    // Iterate through each property in the row
    for (const [columnName, value] of Object.entries(row)) {
      // Check if the value is non-null
      if (value !== null && value !== undefined) {
        prunedRow[columnName] = value;
        columnNames.add(columnName);
      }
    }

    prunedData.push(prunedRow);
  });

  return { prunedData, columnNames: Array.from(columnNames) };
}

export default async function Page(props: PageProps) {
  console.log(props)
  const searchParams = useSanitizedSearchParams(props)
  console.log(searchParams.q)
  const offset = (searchParams.p - 1) * searchParams.r
  const limit = searchParams.r



  // Mano: Please do not delete the comments.
  // Do not delete commented lines as they may have related code to another/related task/item

  const filterConditionStr = generateFilterQueryString(searchParams, "c2m2", "ffl_biosample"); // Mano: using a function now
  const filterClause = filterConditionStr.length ? ` AND ${filterConditionStr}` : '';



  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    records: {
      //rank: number,
      dcc_name: string,
      dcc_abbreviation: string,
      dcc_short_label: string,
      taxonomy_name: string,
      disease_name: string,
      anatomy_name: string,
      project_name: string,
      project_description: string,
      anatomy_description: string,
      disease_description: string,

      count: number, // this is based on across all-columns of ffl_biosample 
      count_bios: number,
      count_sub: number,
      count_col: number,
    }[],
    count_bios: number,
    count_sub: number,
    count_col: number,
    biosamples_table: {
      biosample_id_namespace: string,
      biosample_local_id: string,
      project_id_namespace: string,
      project_local_id: string,
      biosample_persistent_id: string,
      biosample_creation_time: string,
      sample_prep_method_name: string,
      anatomy_name: string,
      disease_name: string,
      disease_association_type_name: string,
      subject_id_namespace: string,
      subject_local_id: string,
      biosample_age_at_sampling: string,
      gene_name: string,
      substance_name: string
    }[],
    collections_table: {
      biosample_id_namespace: string,
      biosample_local_id: string,
      persistent_id: string,
      creation_time: string,
      abbreviation: string,
      name: string,
      description: string,
      has_time_series_data: string
    }[],
    subjects_table: {
      biosample_id_namespace: string,
      biosample_local_id: string,
      subject_id_namespace: string,
      subject_local_id: string,
      subject_race_name: string,
      subject_granularity_name: string,
      subject_sex_name: string,
      subject_ethnicity_name: string,
      subject_role_name: string,
      age_at_enrollment: string
    }[],
    sample_prep_method_name_filters: { sample_prep_method_name: string, count: number, }[],

  }>>`
  WITH allres_full AS (
    SELECT DISTINCT c2m2.ffl_biosample.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
      FROM c2m2.ffl_biosample
      WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) ${Prisma.sql([filterClause])}
      ORDER BY rank DESC
  ),
  allres AS (
    SELECT 
      allres_full.dcc_name AS dcc_name,
      allres_full.dcc_abbreviation AS dcc_abbreviation,
      SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
      CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name,
      CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name,
      CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name,
      allres_full.project_name AS project_name,
      c2m2.project.description AS project_description,
      c2m2.anatomy.description AS anatomy_description,
      c2m2.disease.description AS disease_description,
      COUNT(*)::INT AS count,
      COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
      COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
      COUNT(DISTINCT collection_local_id)::INT AS count_col
    FROM allres_full 
    LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
      allres_full.project_local_id = c2m2.project.local_id) 
    LEFT JOIN c2m2.anatomy ON (allres_full.anatomy = c2m2.anatomy.id)
    LEFT JOIN c2m2.disease ON (allres_full.disease = c2m2.disease.id)
    GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, project_name, project_description, anatomy_description, disease_description
    /*GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, project_name, project_description, rank*/
    ORDER BY  dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name /*rank DESC*/
  ),
  biosamples_table as (
    SELECT DISTINCT
      allres_full.biosample_id_namespace,
      allres_full.biosample_local_id,
      allres_full.project_id_namespace,
      allres_full.project_local_id,
      allres_full.biosample_persistent_id,
      allres_full.biosample_creation_time,
      allres_full.sample_prep_method_name,
      allres_full.anatomy_name,
      allres_full.disease_name,
      allres_full.disease_association_type_name,
      allres_full.subject_id_namespace,
      allres_full.subject_local_id,
      allres_full.biosample_age_at_sampling,
      allres_full.gene_name,
      allres_full.substance_name

    FROM allres_full

  ), biosamples_table_limited as (
    SELECT * 
    FROM biosamples_table
    OFFSET ${offset}
    LIMIT ${limit}

  ),
  count_bios AS (
    select count(*)::int as count
      from biosamples_table
  )
  
  SELECT
  (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres), 
  (SELECT count FROM count_bios) as count_bios,
  (SELECT COALESCE(jsonb_agg(biosamples_table_limited.*), '[]'::jsonb) FROM biosamples_table_limited) AS biosamples_table
  
  
  ;
` : [undefined];
  //console.log("%%%%%%%");
  //console.log(results?.biosamples_table[0]);
  //console.log(results?.biosamples_table[1]); console.log("%%%%%%%");
  // Call the function with your biosamples_table
  const { prunedData, columnNames } = pruneAndRetrieveColumnNames(results?.biosamples_table);
  const biosamplePrunedData = prunedData;
  const bioSampleColNames = columnNames;
  //console.log('Pruned Data:', biosamplePrunedData);
  //console.log('Retained Column Names:', bioSampleColNames);


  return (
    <ListingPageLayout
      count={biosamplePrunedData.length}
    >
      <SearchablePagedTable
        label={`Biosamples Table: Results found ${results?.count_bios}`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results?.count_bios}
        columns={bioSampleColNames.map(columnName => <>{columnName}</>)}
        rows={biosamplePrunedData.map(row => (
          bioSampleColNames.map(columnName => (
            <Description description={row[columnName]} />
          ))
        ))}
      />
    </ListingPageLayout>
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
*/
