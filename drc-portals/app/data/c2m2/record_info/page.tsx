import prisma from "@/lib/prisma";
import { format_description, pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import { getDCCIcon, pruneAndRetrieveColumnNames, generateFilterQueryString } from "@/app/data/c2m2/utils"
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { Description } from "@/app/data/c2m2/SearchablePagedTable";
import LandingPageLayout from "@/app/data/c2m2/LandingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { string } from "zod";
import Link from "next/link";
import { cache } from "react";



type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }









export default async function Page(props: PageProps) {
  console.log(props)
  const searchParams = useSanitizedSearchParams(props)
  console.log(searchParams.q)
  const offset = (searchParams.p - 1) * searchParams.r
  const limit = searchParams.r

  // Generate the query clause for filters

  const filterConditionStr = generateFilterQueryString(searchParams, "c2m2", "ffl_biosample");
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
      project_persistent_id: string,
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
      subject_id_namespace: string,
      subject_local_id: string,
      subject_race_name: string,
      subject_granularity_name: string,
      subject_sex_name: string,
      subject_ethnicity_name: string,
      subject_role_name: string,
      subject_age_at_enrollment: string
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
    SELECT DISTINCT
      allres_full.dcc_name AS dcc_name,
      allres_full.dcc_abbreviation AS dcc_abbreviation,
      SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
      CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name,
      CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name,
      CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name,
      allres_full.project_name AS project_name,
      c2m2.project.persistent_id AS project_persistent_id,
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
    GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name,  project_name, project_persistent_id, project_description, anatomy_description, disease_description
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
  ),
  subjects_table AS (
    SELECT DISTINCT
      allres_full.subject_id_namespace,
      allres_full.subject_local_id,
      allres_full.subject_race_name,
      allres_full.subject_granularity_name,
      allres_full.subject_sex_name,
      allres_full.subject_ethnicity_name,
      allres_full.subject_role_name,
      allres_full.subject_age_at_enrollment
    FROM allres_full
  ),
  subjects_table_limited as (
    SELECT * 
    FROM subjects_table
    OFFSET ${offset}
    LIMIT ${limit}

  ),
  count_sub AS (
    select count(*)::int as count
      from subjects_table
  )
  
  SELECT
  (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres), 
  (SELECT count FROM count_bios) as count_bios,
  (SELECT COALESCE(jsonb_agg(biosamples_table_limited.*), '[]'::jsonb) FROM biosamples_table_limited) AS biosamples_table,
  (SELECT count FROM count_sub) as count_sub,
  (SELECT COALESCE(jsonb_agg(subjects_table_limited.*), '[]'::jsonb) FROM subjects_table_limited) AS subjects_table
  
  
  
  ;
` : [undefined];

  const { prunedData: biosamplePrunedData, columnNames: bioSampleColNames } = pruneAndRetrieveColumnNames(results?.biosamples_table);
  const { prunedData: subjectPrunedData, columnNames: subjectColNames } = pruneAndRetrieveColumnNames(results?.subjects_table);

  const dynamicBiosampleColumns = Object.keys(biosamplePrunedData[0]).filter(column => {
    const uniqueValues = new Set(biosamplePrunedData.map(row => row[column]));
    return uniqueValues.size > 1;
}).sort((a, b) => {
    const uniqueValuesA = new Set(biosamplePrunedData.map(row => row[a]));
    const uniqueValuesB = new Set(biosamplePrunedData.map(row => row[b]));
    return uniqueValuesB.size - uniqueValuesA.size;
});

  const dynamicSubjectColumns = Object.keys(subjectPrunedData[0]).filter(column => {
    const uniqueValues = new Set(subjectPrunedData.map(row => row[column]));
    return uniqueValues.size > 1;
  });

  const projectLocalId = biosamplePrunedData[0]?.project_local_id; // Assuming it's the same for all rows
  const projectIdNamespace = biosamplePrunedData[0]?.project_id_namespace; // Assuming it's the same for all rows


  //console.log('Pruned Data:', biosamplePrunedData);
  //console.log('Retained Column Names:', bioSampleColNames);
  console.log("$%$%$%$%")
  console.log(results?.records[0].project_persistent_id);
  return (
    <LandingPageLayout
      icon={{
        href: results?.records[0].dcc_short_label ? `/info/dcc/${results.records[0].dcc_short_label}` : "",
        src: getDCCIcon(results ? results.records[0].dcc_short_label : ""),
        alt: results?.records[0].dcc_short_label ? results.records[0].dcc_short_label : ""
      }}
      title={results?.records[0].project_name ?? ""}
      subtitle={""}
      description={format_description(results?.records[0].project_description ?? "")}
      metadata={[
        results?.records[0].project_persistent_id ? { label: 'Project URL', value: <Link href={`${results?.records[0].project_persistent_id}`} className="underline cursor-pointer text-blue-600">{results?.records[0].project_name}</Link> } : null,
        results?.records[0].anatomy_name ? { label: 'Anatomy', value: results?.records[0].anatomy_name } : null,
        results?.records[0].anatomy_description ? { label: 'Anatomy Description', value: results?.records[0].anatomy_description } : null,
        results?.records[0].disease_name ? { label: 'Disease', value: results?.records[0].disease_name } : null,
        results?.records[0].disease_description ? { label: 'Disease Description', value: results?.records[0].disease_description } : null,

        { label: 'Biosamples', value: results ? results.records[0].count_bios?.toLocaleString() : undefined },
        { label: 'Collections', value: results ? results.records[0].count_col?.toLocaleString() : undefined },
        { label: 'Subjects', value: results ? results.records[0].count_sub?.toLocaleString() : undefined } // Assuming this is the correct property name
      ]}
    >

      {/* <SearchablePagedTable
        label={`Biosample Table: Results found ${results?.count_bios}`}
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
      /> */}

      {/* <SearchablePagedTable
  label={`Project ID: ${projectLocalId} | ${projectIdNamespace} | Results found: ${results?.count_bios}`}
  q={searchParams.q ?? ''}
  p={searchParams.p}
  r={searchParams.r}
  count={results?.count_bios}
  columns={['Biosample ID', 'Subject ID']} // Adjusted columns prop
  rows={biosamplePrunedData.map(row => (
    [
      <Description description={row['biosample_local_id']} />, // Display biosample_local_id
      <Description description={row['subject_local_id']} />,    // Display subject_local_id
    ]
  ))}
/> */}


      <SearchablePagedTable
        label={`Project ID: ${projectLocalId} | Biosamples found: ${results?.count_bios}`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results?.count_bios}
        columns={dynamicBiosampleColumns} // 
        rows={biosamplePrunedData.map(row => (
          dynamicBiosampleColumns.map(column => (
            <Description description={row[column]} key={column} />
          ))
        ))}
      />



      <SearchablePagedTable
        label={`Project ID: ${projectLocalId} | Subjects found: ${results?.count_sub}`}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results?.count_sub}
        columns={dynamicSubjectColumns} // 
        rows={subjectPrunedData.map(row => (
          dynamicSubjectColumns.map(column => (
            <Description description={row[column]} key={column} />
          ))
        ))}
      />
    </LandingPageLayout>
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
