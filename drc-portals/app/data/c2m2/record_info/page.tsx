import prisma from "@/lib/prisma";
import { format_description, pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import { getDCCIcon, pruneAndRetrieveColumnNames, generateFilterQueryString, getNameFromBiosampleTable, getNameFromSubjectTable, getNameFromCollectionTable, getNameFromFileProjTable, Category, addCategoryColumns } from "@/app/data/c2m2/utils"
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { Description } from "@/app/data/c2m2/SearchablePagedTable";
import LandingPageLayout from "@/app/data/c2m2/LandingPageLayout";
import { Metadata, ResolvingMetadata } from 'next'
import { string } from "zod";
import Link from "next/link";
import { cache } from "react";
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordionDetails } from '@mui/material';
import Typography from '@mui/material/Typography';
import ExpandableTable from "../ExpandableTable";
import { ConstructionOutlined } from "@mui/icons-material";



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
      taxonomy_id: string,
      disease_name: string,
      disease: string,
      anatomy_name: string,
      anatomy: string,
      project_name: string,
      project_persistent_id: string,
      project_local_id: string,
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
      collection_id_namespace: string,
      collection_local_id: string,
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
    count_file: number,
    file_table: {
      id_namespace: string,
      local_id: string,
      project_id_namespace: string,
      project_local_id: string,
      persistent_id: string,
      creation_time: string,
      size_in_bytes: bigint,
      uncompressed_size_in_bytes: bigint,
      sha256: string,
      md5: string,
      filename: string,
      file_format: string,
      compression_format: string,
      data_type: string,
      assay_type: string,
      analysis_type: string,
      mime_type: string,
      bundle_collection_id_namespace: string,
      bundle_collection_local_id: string,
      dbgap_study_id: string,
      data_type_name: string,
      assay_type_name: string,
      analysis_type_name: string
      //biosample_id_namespace: string,
      //biosample_local_id: string,
      //subject_id_namespace: string,
      //subject_local_id: string,
      //collection_id_namespace: string, 
      //collection_local_id: string
    }[],
    count_file_sub: number,
    file_sub_table: {
      file_id_namespace: string,
      file_local_id: string,
      subject_id_namespace: string,
      subject_local_id: string
    }[],
    count_file_bios: number,
    file_bios_table: {
      file_id_namespace: string,
      file_local_id: string,
      biosample_id_namespace: string,
      biosample_local_id: string
    }[],
    count_file_col: number,
    file_col_table: {
      file_id_namespace: string,
      file_local_id: string,
      collection_id_namespace: string,
      collection_local_id: string
    }[],

    // based on full table

    biosamples_table_full: {
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
    collections_table_full: {
      collection_id_namespace: string,
      collection_local_id: string,
      persistent_id: string,
      creation_time: string,
      abbreviation: string,
      name: string,
      description: string,
      has_time_series_data: string
    }[],
    subjects_table_full: {
      subject_id_namespace: string,
      subject_local_id: string,
      subject_race_name: string,
      subject_granularity_name: string,
      subject_sex_name: string,
      subject_ethnicity_name: string,
      subject_role_name: string,
      subject_age_at_enrollment: string
    }[],
    file_table_full: {
      id_namespace: string,
      local_id: string,
      project_id_namespace: string,
      project_local_id: string,
      persistent_id: string,
      creation_time: string,
      size_in_bytes: bigint,
      uncompressed_size_in_bytes: bigint,
      sha256: string,
      md5: string,
      filename: string,
      file_format: string,
      compression_format: string,
      data_type: string,
      assay_type: string,
      analysis_type: string,
      mime_type: string,
      bundle_collection_id_namespace: string,
      bundle_collection_local_id: string,
      dbgap_study_id: string,
      data_type_name: string,
      assay_type_name: string,
      analysis_type_name: string
      //biosample_id_namespace: string,
      //biosample_local_id: string,
      //subject_id_namespace: string,
      //subject_local_id: string,
      //collection_id_namespace: string, 
      //collection_local_id: string
    }[],
    file_sub_table_full: {
      file_id_namespace: string,
      file_local_id: string,
      subject_id_namespace: string,
      subject_local_id: string
    }[],
    file_bios_table_full: {
      file_id_namespace: string,
      file_local_id: string,
      biosample_id_namespace: string,
      biosample_local_id: string
    }[],
    file_col_table_full: {
      file_id_namespace: string,
      file_local_id: string,
      collection_id_namespace: string,
      collection_local_id: string
    }[],

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
      /* CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name, */
      /* CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name, */
      /* CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name, */
      COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
      SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
      COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
      REPLACE(allres_full.disease, ':', '_') AS disease,
      COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
      REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
      allres_full.project_name AS project_name,
      c2m2.project.persistent_id AS project_persistent_id,
      allres_full.project_local_id AS project_local_id,
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
    GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, taxonomy_id, disease_name, disease, 
    anatomy_name,  anatomy, project_name, project_persistent_id, project_local_id, project_description, anatomy_description, disease_description
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
  ),
  collections_table AS (
    SELECT DISTINCT
      allres_full.collection_id_namespace,
      allres_full.collection_local_id,
      c2m2.collection.persistent_id as persistent_id,
      c2m2.collection.creation_time as creation_time,
      allres_full.collection_abbreviation as abbreviation,
      allres_full.collection_name as name,
      c2m2.collection.description as description,
      allres_full.collection_has_time_series_data as has_time_series_data
    FROM allres_full
    LEFT JOIN c2m2.collection ON (c2m2.collection.local_id = allres_full.collection_local_id)
  ),
  collections_table_limited as (
    SELECT * 
    FROM collections_table
    OFFSET ${offset}
    LIMIT ${limit}
  ),
  count_col AS (
    select count(*)::int as count
      from collections_table
  ),
proj_info AS (
    SELECT DISTINCT 
        allres_full.project_local_id AS project_local_id, 
        allres_full.project_id_namespace AS project_id_namespace
    FROM allres_full
),
file_table AS (
    SELECT DISTINCT 
        f.id_namespace,
        f.local_id,
        f.project_id_namespace,
        f.project_local_id,
        f.persistent_id,
        f.creation_time,
        f.size_in_bytes,
        f.uncompressed_size_in_bytes,
        f.sha256,
        f.md5,
        f.filename,
        f.file_format,
        f.compression_format,
        f.mime_type,
        f.dbgap_study_id,
        dt.name AS data_type_name,
        at.name AS assay_type_name,
        aty.name AS analysis_type_name
    FROM c2m2.file AS f
    LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
    LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
    LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
    INNER JOIN proj_info AS pi ON f.project_local_id = pi.project_local_id 
                              AND f.project_id_namespace = pi.project_id_namespace
)
, /* Mano */
  file_table_limited as (
    SELECT * 
    FROM file_table
    OFFSET ${offset}
    LIMIT ${limit}
  ), /* Mano */
  count_file AS (
    select count(*)::int as count
      from file_table
  ), /* Mano */

  file_sub_table AS (
    SELECT DISTINCT c2m2.file_describes_subject.*
    FROM file_table
    INNER JOIN c2m2.file_describes_subject ON 
    (file_table.local_id = c2m2.file_describes_subject.file_local_id AND 
      file_table.id_namespace = c2m2.file_describes_subject.file_id_namespace)
  ), /* Mano */
  file_sub_table_limited as (
    SELECT * 
    FROM file_sub_table
    OFFSET ${offset}
    LIMIT ${limit}
  ), /* Mano */
  count_file_sub AS (
    select count(*)::int as count
      from file_sub_table
  ), /* Mano */

  file_bios_table AS (
    SELECT DISTINCT c2m2.file_describes_biosample.*
    FROM file_table
    INNER JOIN c2m2.file_describes_biosample ON 
    (file_table.local_id = c2m2.file_describes_biosample.file_local_id AND 
      file_table.id_namespace = c2m2.file_describes_biosample.file_id_namespace)
  ), /* Mano */
  file_bios_table_limited as (
    SELECT * 
    FROM file_bios_table
    OFFSET ${offset}
    LIMIT ${limit}
  ), /* Mano */
  count_file_bios AS (
    select count(*)::int as count
      from file_bios_table
  ), /* Mano */

  file_col_table AS (
    SELECT DISTINCT c2m2.file_describes_collection.*
    FROM file_table
    INNER JOIN c2m2.file_describes_collection ON 
    (file_table.local_id = c2m2.file_describes_collection.file_local_id AND 
      file_table.id_namespace = c2m2.file_describes_collection.file_id_namespace)
  ), /* Mano */
  file_col_table_limited as (
    SELECT * 
    FROM file_col_table
    OFFSET ${offset}
    LIMIT ${limit}
  ), /* Mano */
  count_file_col AS (
    select count(*)::int as count
      from file_col_table
  ) /* Mano */

  SELECT
  (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres), 
  (SELECT count FROM count_bios) as count_bios,
  (SELECT COALESCE(jsonb_agg(biosamples_table_limited.*), '[]'::jsonb) FROM biosamples_table_limited) AS biosamples_table,
  (SELECT count FROM count_sub) as count_sub,
  (SELECT COALESCE(jsonb_agg(subjects_table_limited.*), '[]'::jsonb) FROM subjects_table_limited) AS subjects_table,
  (SELECT count FROM count_col) as count_col,
  (SELECT COALESCE(jsonb_agg(collections_table_limited.*), '[]'::jsonb) FROM collections_table_limited) AS collections_table,
  (SELECT count FROM count_file) as count_file,
  (SELECT COALESCE(jsonb_agg(file_table_limited.*), '[]'::jsonb) FROM file_table_limited) AS file_table,
  (SELECT count FROM count_file_sub) as count_file_sub,
  (SELECT COALESCE(jsonb_agg(file_sub_table_limited.*), '[]'::jsonb) FROM file_sub_table_limited) AS file_sub_table,
  (SELECT count FROM count_file_bios) as count_file_bios,
  (SELECT COALESCE(jsonb_agg(file_bios_table_limited.*), '[]'::jsonb) FROM file_bios_table_limited) AS file_bios_table,
  (SELECT count FROM count_file_col) as count_file_col,
  (SELECT COALESCE(jsonb_agg(file_col_table_limited.*), '[]'::jsonb) FROM file_col_table_limited) AS file_col_table,
  /* full tables based on biosamples_table, subjects_table, etc*/
  (SELECT COALESCE(jsonb_agg(biosamples_table.*), '[]'::jsonb) FROM biosamples_table) AS biosamples_table_full,
  (SELECT COALESCE(jsonb_agg(subjects_table.*), '[]'::jsonb) FROM subjects_table) AS subjects_table_full,
  (SELECT COALESCE(jsonb_agg(collections_table.*), '[]'::jsonb) FROM collections_table) AS collections_table_full,
  (SELECT COALESCE(jsonb_agg(file_table.*), '[]'::jsonb) FROM file_table) AS file_table_full,
  (SELECT COALESCE(jsonb_agg(file_sub_table.*), '[]'::jsonb) FROM file_sub_table) AS file_sub_table_full,
  (SELECT COALESCE(jsonb_agg(file_bios_table.*), '[]'::jsonb) FROM file_bios_table) AS file_bios_table_full,
  (SELECT COALESCE(jsonb_agg(file_col_table.*), '[]'::jsonb) FROM file_col_table) AS file_col_table_full
  ;
` : [undefined];

  // First remove the empty columns and sort columns such that most varying appears first

  const biosample_table_columnsToIgnore: string[] = ['anatomy_name', 'disease_name', 'project_local_id', 'project_id_namespace', 'subject_local_id', 'subject_id_namespace', 'biosample_id_namespace'];
  const { prunedData: biosamplePrunedData, columnNames: bioSampleColNames, dynamicColumns: dynamicBiosampleColumns, 
    staticColumns: staticBiosampleColumns } = pruneAndRetrieveColumnNames(results?.biosamples_table ?? [], 
      results?.biosamples_table_full ?? [], biosample_table_columnsToIgnore);

  const subject_table_columnsToIgnore: string[] = ['subject_id_namespace'];
  const { prunedData: subjectPrunedData, columnNames: subjectColNames, dynamicColumns: dynamicSubjectColumns, 
    staticColumns: staticSubjectColumns } = pruneAndRetrieveColumnNames(results?.subjects_table ?? [], 
      results?.subjects_table_full ?? [], subject_table_columnsToIgnore);

  const collections_table_columnsToIgnore: string[] = ['collection_id_namespace', 'persistent_id'];
  const { prunedData: collectionPrunedData, columnNames: collectionColNames, dynamicColumns: dynamicCollectionColumns, 
    staticColumns: staticCollectionColumns } = pruneAndRetrieveColumnNames(results?.collections_table ?? [], 
      results?.collections_table_full ?? [], collections_table_columnsToIgnore);

  const filesProj_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'bundle_collection_id_namespace'];
  const { prunedData: fileProjPrunedData, columnNames: fileProjColNames, dynamicColumns: dynamicFileProjColumns, 
    staticColumns: staticFileProjColumns } = pruneAndRetrieveColumnNames(results?.file_table ?? [], 
      results?.file_table_full ?? [], filesProj_table_columnsToIgnore);

  const filesSub_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'subject_id_namespace'];
  const { prunedData: fileSubPrunedData, columnNames: fileSubColNames, dynamicColumns: dynamicFileSubColumns, 
    staticColumns: staticFileSubColumns } = pruneAndRetrieveColumnNames(results?.file_sub_table ?? [], 
      results?.file_sub_table_full ?? [], filesSub_table_columnsToIgnore);

  const filesBios_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'biosample_id_namespace'];
  const { prunedData: fileBiosPrunedData, columnNames: fileBiosColNames, dynamicColumns: dynamicFileBiosColumns, 
    staticColumns: staticFileBiosColumns } = pruneAndRetrieveColumnNames(results?.file_bios_table ?? [], 
      results?.file_bios_table_full ?? [], filesBios_table_columnsToIgnore);

  const filesCol_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'collection_id_namespace', 'collection_local_id'];
  const { prunedData: fileCollPrunedData, columnNames: fileCollColNames, dynamicColumns: dynamicFileCollColumns, 
    staticColumns: staticFileCollColumns } = pruneAndRetrieveColumnNames(results?.file_col_table ?? [], 
      results?.file_col_table_full ?? [], filesCol_table_columnsToIgnore);

  console.log("Files related to biosample");
  console.log(results?.file_bios_table.slice(1, 5));
  console.log("Dynamic columns in files related to biosample");
  console.log(dynamicFileBiosColumns);
  console.log("Static columns in files related to biosample");
  console.log(staticFileBiosColumns);

  // The following items are present in metadata

  const projectLocalId = results?.records[0].project_local_id ?? 'NA';// Assuming it's the same for all rows

  const metadata = [
    { label: 'Project ID', value: projectLocalId },
    results?.records[0].project_persistent_id ? { label: 'Project URL', value: <Link href={`${results?.records[0].project_persistent_id}`} className="underline cursor-pointer text-blue-600">{results?.records[0].project_name}</Link> } : null,
    results?.records[0].taxonomy_name ? { label: 'Taxonomy', value: <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${results?.records[0].taxonomy_id}`} className="underline cursor-pointer text-blue-600">{results?.records[0].taxonomy_name}</Link> } : null,
    results?.records[0].anatomy_name ? { label: 'Anatomy', value: <Link href={`http://purl.obolibrary.org/obo/${results?.records[0].anatomy}`} className="underline cursor-pointer text-blue-600">{results?.records[0].anatomy_name}</Link> } : null,
    results?.records[0].anatomy_description ? { label: 'Anatomy Description', value: results?.records[0].anatomy_description } : null,
    results?.records[0].disease_name ? { label: 'Disease', value: <Link href={`http://purl.obolibrary.org/obo/${results?.records[0].disease}`} className="underline cursor-pointer text-blue-600">{results?.records[0].disease_name}</Link> } : null,
    results?.records[0].disease_description ? { label: 'Disease Description', value: results?.records[0].disease_description } : null,
    { label: 'Biosamples', value: results ? results.records[0].count_bios?.toLocaleString() : undefined },
    { label: 'Collections', value: results ? results.records[0].count_col?.toLocaleString() : undefined },
    { label: 'Subjects', value: results ? results.records[0].count_sub?.toLocaleString() : undefined },

  ];

  const categories: Category[] = [];

  addCategoryColumns(staticBiosampleColumns, getNameFromBiosampleTable, "Biosamples", categories);
  addCategoryColumns(staticSubjectColumns, getNameFromSubjectTable, "Subjects", categories);
  addCategoryColumns(staticCollectionColumns, getNameFromCollectionTable, "Collections", categories);
  addCategoryColumns(staticFileProjColumns, getNameFromFileProjTable, "Files related to Project", categories);
  addCategoryColumns(staticFileSubColumns, getNameFromFileProjTable, "Files related to Subject", categories);
  addCategoryColumns(staticFileBiosColumns, getNameFromFileProjTable, "Files related to Biosample", categories);
  addCategoryColumns(staticFileCollColumns, getNameFromFileProjTable, "Files related to Collection", categories);


  const biosampleTableTitle = "Biosamples: " + results?.count_bios;
  const subjectTableTitle = "Subjects: " + results?.count_sub;
  const collectionTableTitle = "Collections: " + results?.count_col;
  const fileProjTableTitle = "Files related to project: " + results?.count_file;
  const fileSubTableTitle = "Files related to subject: " + results?.count_file_sub;
  const fileBiosTableTitle = "Files related to biosample: " + results?.count_file_bios;
  const fileCollTableTitle = "Files related to collection: " + results?.count_file_col;



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
      metadata={metadata}
      categories={categories}
    >
      <ExpandableTable
        data={biosamplePrunedData}
        full_data={results?.biosamples_table}
        tableTitle={biosampleTableTitle}
        searchParams={searchParams}
        count={results?.count_bios ?? 0} // Provide count directly as a prop
        colNames={dynamicBiosampleColumns}
        dynamicColumns={dynamicBiosampleColumns}
        getNameFromTable={getNameFromBiosampleTable}
      />


      <ExpandableTable
        data={subjectPrunedData}
        full_data={results?.subjects_table}
        tableTitle={subjectTableTitle}
        searchParams={searchParams}
        count={results?.count_sub ?? 0} // Provide count directly as a prop
        colNames={dynamicSubjectColumns}
        dynamicColumns={dynamicSubjectColumns}
        getNameFromTable={getNameFromSubjectTable}
      />

      <ExpandableTable
        data={collectionPrunedData}
        full_data={results?.collections_table}
        tableTitle={collectionTableTitle}
        searchParams={searchParams}
        count={results?.count_col ?? 0} // Provide count directly as a prop
        colNames={dynamicCollectionColumns}
        dynamicColumns={dynamicCollectionColumns}
        getNameFromTable={getNameFromCollectionTable}
      />


      <ExpandableTable
        data={fileProjPrunedData}
        full_data={results?.file_table}
        tableTitle={fileProjTableTitle}
        searchParams={searchParams}
        count={results?.count_file ?? 0} // Provide count directly as a prop
        colNames={dynamicFileProjColumns}
        dynamicColumns={dynamicFileProjColumns}
        getNameFromTable={getNameFromFileProjTable}
      />

      <ExpandableTable
        data={fileSubPrunedData}
        full_data={results?.file_sub_table}
        tableTitle={fileSubTableTitle}
        searchParams={searchParams}
        count={results?.count_file_sub ?? 0} // Provide count directly as a prop
        colNames={dynamicFileSubColumns}
        dynamicColumns={dynamicFileSubColumns}
        getNameFromTable={getNameFromFileProjTable}
      />
      <ExpandableTable
        data={fileBiosPrunedData}
        full_data={results?.file_bios_table}
        tableTitle={fileBiosTableTitle}
        searchParams={searchParams}
        count={results?.count_file_bios ?? 0} // Provide count directly as a prop
        colNames={dynamicFileBiosColumns}
        dynamicColumns={dynamicFileBiosColumns}
        getNameFromTable={getNameFromFileProjTable}
      />
      <ExpandableTable
        data={fileCollPrunedData}
        full_data={results?.file_col_table}
        tableTitle={fileCollTableTitle}
        searchParams={searchParams}
        count={results?.count_file_col ?? 0} // Provide count directly as a prop
        colNames={dynamicFileCollColumns}
        dynamicColumns={dynamicFileCollColumns}
        getNameFromTable={getNameFromFileProjTable}
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

select count(*) from (select distinct c2m2.file_describes_subject.* from c2m2.file inner join c2m2.file_describes_subject ON 
(file.local_id = c2m2.file_describes_subject.file_local_id AND 
  file.id_namespace = c2m2.file_describes_subject.file_id_namespace)
WHERE file.project_local_id = 'LINCS phase 1');

*/
