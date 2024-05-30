import prisma from "@/lib/prisma/c2m2";
import { format_description, pluralize, type_to_string } from "@/app/data/processed/utils"
import { MetadataItem, getDCCIcon, pruneAndRetrieveColumnNames, generateFilterQueryStringForRecordInfo, getNameFromBiosampleTable, getNameFromSubjectTable, getNameFromCollectionTable, getNameFromFileProjTable, Category, addCategoryColumns, generateMD5Hash } from "@/app/data/c2m2/utils"
import LandingPageLayout from "@/app/data/c2m2/LandingPageLayout";
import Link from "next/link";
import ExpandableTable from "../ExpandableTable";
import { capitalizeFirstLetter, isURL, reorderStaticCols, useSanitizedSearchParams, get_partial_list_string, sanitizeFilename } from "@/app/data/c2m2/utils"
import SQL from "@/lib/prisma/raw";
import { ColorLensOutlined } from "@mui/icons-material";

const file_count_limit = 200000;
const file_count_limit_proj = file_count_limit; // 500000;
const file_count_limit_sub = file_count_limit; // 500000;
const file_count_limit_bios = file_count_limit; // 500000;
const file_count_limit_col = file_count_limit; // 500000;

type PageProps = { params: { id: string }, searchParams: Record<string, string | string[] | undefined> }

export async function RecordInfoQueryComponent(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props);
  console.log("In RecordInfoQueryComponent");

  try {
    const results = await fetchRecordInfoQueryResults(searchParams);
    return results;
  } catch (error) {
    console.error('Error fetching search results:', error);
    return undefined;
  }
}

async function fetchRecordInfoQueryResults(searchParams: any) {
  try {
    const offset = (searchParams.p - 1) * searchParams.r;
    const limit = searchParams.r;

    // console.log("In function fetchRecordInfoQueryResuts");




    console.log("******");
    console.log("q = " + searchParams.q + " p = " + searchParams.p + " offset = " + offset + " limit = " + limit);
    // Declare different offsets for all the tables and this is needed to fine grain pagination
    const bioSamplTbl_p = searchParams.bioSamplTbl_p !== undefined ? searchParams.bioSamplTbl_p : searchParams.p;
    const bioSamplTblOffset = (bioSamplTbl_p - 1) * limit;
    // console.log("bioSamplTbl_p = " + bioSamplTbl_p + " bioSamplTblOffset = " + bioSamplTblOffset);
    const colTbl_p = searchParams.colTbl_p !== undefined ? searchParams.colTbl_p : 1;
    const colTblOffset = (colTbl_p - 1) * limit;
    // console.log("colTbl_p = " + colTbl_p + " colTblOffset = " + colTblOffset);
    const subTbl_p = searchParams.colTbl_p !== undefined ? searchParams.subTbl_p : 1;
    const subTblOffset = (subTbl_p - 1) * limit;
    // console.log("subTbl_p = " + subTbl_p + " subTblOffset = " + subTblOffset);
    const fileProjTbl_p = searchParams.fileProjTbl_p !== undefined ? searchParams.fileProjTbl_p : 1;
    const fileProjTblOffset = (fileProjTbl_p - 1) * limit;
    // console.log("fileProjTbl_p = " + fileProjTbl_p + " fileProjTblOffset = " + fileProjTblOffset);
    const fileBiosTbl_p = searchParams.fileProjTbl_p !== undefined ? searchParams.fileBiosTbl_p : 1;
    const fileBiosTblOffset = (fileBiosTbl_p - 1) * limit;
    // console.log("fileBiosTbl_p = " + fileBiosTbl_p + " fileBiosTblOffset = " + fileBiosTblOffset);
    const fileSubTbl_p = searchParams.fileSubTbl_p !== undefined ? searchParams.fileSubTbl_p : 1;
    const fileSubTblOffset = (fileSubTbl_p - 1) * limit;
    // console.log("fileSubTbl_p = " + fileSubTbl_p + " fileSubTblOffset = " + fileSubTblOffset);
    const fileColTbl_p = searchParams.fileColTbl_p !== undefined ? searchParams.fileColTbl_p : 1;
    const fileColTblOffset = (fileColTbl_p - 1) * limit;
    // console.log("fileColTbl_p = " + fileColTbl_p + " fileColTblOffset = " + fileColTblOffset);

   // console.log("*********");



    // Generate the query clause for filters

    const filterConditionStr = generateFilterQueryStringForRecordInfo(searchParams, "c2m2", "ffl_biosample_collection");
    const filterClause = !filterConditionStr.isEmpty() ? SQL.template` AND ${filterConditionStr}` : SQL.empty();

    // To measure time taken by different parts
    const t0: number = performance.now();

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
        gene_name: string,
        gene: string,
        protein_name: string,
        protein: string,
        compound_name: string,
        compound: string,
        data_type_name: string,
        data_type: string,
        project_name: string,
        project_persistent_id: string,
        project_local_id: string,
        project_description: string,
        anatomy_description: string,
        disease_description: string,
        gene_description: string,
        protein_description: string,
        compound_description: string,
        taxonomy_description: string,

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
        access_url: string,
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
        subject_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
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
      }[],
      count_file_bios: number,
      file_bios_table: {
        file_id_namespace: string,
        file_local_id: string,
        biosample_id_namespace: string,
        biosample_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
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
      }[],
      count_file_col: number,
      file_col_table: {
        file_id_namespace: string,
        file_local_id: string,
        collection_id_namespace: string,
        collection_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
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
        access_url: string,
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
        subject_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
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
      }[],
      file_bios_table_full: {
        file_id_namespace: string,
        file_local_id: string,
        biosample_id_namespace: string,
        biosample_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
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
      }[],
      file_col_table_full: {
        file_id_namespace: string,
        file_local_id: string,
        collection_id_namespace: string,
        collection_local_id: string,
        project_id_namespace: string,
        project_local_id: string,
        persistent_id: string,
        access_url: string,
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
      }[],

    }>>(SQL.template`
  WITH allres_full AS (
    SELECT DISTINCT c2m2.ffl_biosample_collection.*,
        ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
      FROM c2m2.ffl_biosample_collection
      WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) ${filterClause}
      ORDER BY rank DESC
  ),
  allres AS (
    SELECT DISTINCT
      allres_full.dcc_name AS dcc_name,
      allres_full.dcc_abbreviation AS dcc_abbreviation,
      SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
      COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
      SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
      COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
      REPLACE(allres_full.disease, ':', '_') AS disease,
      COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
      REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
      COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
      allres_full.gene AS gene,
      COALESCE(allres_full.protein_name, 'Unspecified') AS protein_name,
      allres_full.protein AS protein,
      COALESCE(allres_full.compound_name, 'Unspecified') AS compound_name,
      allres_full.substance_compound AS compound,
      COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
      REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
      /* allres_full.project_name AS project_name, */
      COALESCE(allres_full.project_name, 
        concat_ws('', 'Dummy: Biosample/Collection(s) from ', SPLIT_PART(allres_full.dcc_abbreviation, '_', 1))) AS project_name,
      c2m2.project.persistent_id AS project_persistent_id,
      allres_full.project_local_id AS project_local_id,
      c2m2.project.description AS project_description,
      c2m2.anatomy.description AS anatomy_description,
      c2m2.disease.description AS disease_description,
      c2m2.gene.description AS gene_description,
      c2m2.protein.description AS protein_description,
      c2m2.compound.description AS compound_description,
      c2m2.ncbi_taxonomy.description AS taxonomy_description,
      COUNT(*)::INT AS count,
      COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
      COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
      COUNT(DISTINCT collection_local_id)::INT AS count_col
    FROM allres_full 
    LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
      allres_full.project_local_id = c2m2.project.local_id) 
    LEFT JOIN c2m2.anatomy ON (allres_full.anatomy = c2m2.anatomy.id)
    LEFT JOIN c2m2.disease ON (allres_full.disease = c2m2.disease.id)
    LEFT JOIN c2m2.gene ON (allres_full.gene = c2m2.gene.id)
    LEFT JOIN c2m2.protein ON (allres_full.protein = c2m2.protein.id)
    LEFT JOIN c2m2.compound ON (allres_full.substance_compound = c2m2.compound.id)
    LEFT JOIN c2m2.ncbi_taxonomy ON (allres_full.subject_role_taxonomy_taxonomy_id = c2m2.ncbi_taxonomy.id)
    GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, taxonomy_id, disease_name, disease, 
      anatomy_name,  anatomy, gene_name, gene, protein_name, protein, compound_name, compound, data_type_name, 
      data_type, project_name, c2m2.project.persistent_id, /* project_persistent_id, Mano */
      allres_full.project_local_id, project_description, anatomy_description, disease_description, gene_description, 
      protein_description, compound_description, taxonomy_description
    /*GROUP BY dcc_name, dcc_abbreviation, dcc_short_label, taxonomy_name, disease_name, anatomy_name, project_name, project_description, rank*/
    ORDER BY dcc_short_label, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, 
      protein_name, compound_name, data_type_name /*rank DESC*/
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
    OFFSET ${bioSamplTblOffset}
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
    OFFSET ${subTblOffset}
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
    OFFSET ${colTblOffset}
    LIMIT ${limit}
  ),
  count_col AS (
    select count(*)::int as count
      from collections_table
  ),
unique_info AS ( /* has extra fields, but OK in case needed later*/
    SELECT DISTINCT 
        allres_full.dcc_name,
        allres_full.dcc_abbreviation,
        allres_full.project_local_id, 
        allres_full.project_id_namespace,
        allres_full.ncbi_taxonomy_name as taxonomy_name,
        allres_full.subject_role_taxonomy_taxonomy_id as taxonomy_id,
        allres_full.disease_name,
        allres_full.disease,
        allres_full.anatomy_name,
        allres_full.anatomy,
        allres_full.gene, 
        allres_full.gene_name,
        allres_full.protein, 
        allres_full.protein_name,
        allres_full.substance_compound as compound, 
        allres_full.compound_name,
        allres_full.data_type_id AS data_type, 
        allres_full.data_type_name
    FROM allres_full
),
sub_info AS (
  SELECT DISTINCT 
    allres_full.subject_id_namespace,
    allres_full.subject_local_id
  FROM allres_full
), /* 2024/03/07 */
bios_info AS (
  SELECT DISTINCT 
    allres_full.biosample_id_namespace,
    allres_full.biosample_local_id
  FROM allres_full
), /* 2024/03/07 */
col_info AS (
  SELECT DISTINCT 
    allres_full.collection_id_namespace,
    allres_full.collection_local_id
  FROM allres_full
), /* 2024/03/07 */
/* create file_table_keycol */
file_table_keycol AS (
  SELECT DISTINCT 
      f.id_namespace,
      f.local_id,
      f.project_id_namespace,
      f.project_local_id
  FROM c2m2.file AS f
  INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                            AND f.project_id_namespace = ui.project_id_namespace
                            AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) ) /* 2024/03/07 match data type */
),
file_table AS (
    SELECT DISTINCT 
        f.id_namespace,
        f.local_id,
        f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
        f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
        f.file_format, f.compression_format,  f.mime_type, f.dbgap_study_id,
        dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name
    FROM c2m2.file AS f INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
      AND f.project_id_namespace = ui.project_id_namespace
      AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) )
    LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
    LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
    LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
    limit ${file_count_limit_proj}
)
, /* Mano */
  file_table_limited as (
    SELECT * 
    FROM file_table
    OFFSET ${fileProjTblOffset}
    LIMIT ${limit}
  ), /* Mano */
  count_file AS (
    select count(*)::int as count
      from file_table_keycol
  ), /* Mano */

  /* Mano: 2024/05/03: below using file_table_keycol instead of file_table (since file_count_limit is applied) */
  /* For some DCCs, e.g., hubmap, it may list many many files (> 1M) for some projects */
  file_sub_table_keycol AS (
    SELECT DISTINCT fds.*,
    f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
    f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
    f.file_format, f.compression_format,  f.mime_type, f.dbgap_study_id,
    dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name
  FROM c2m2.file_describes_subject fds
    INNER JOIN file_table_keycol ftk ON 
    (ftk.local_id = fds.file_local_id AND ftk.id_namespace = fds.file_id_namespace)
    INNER JOIN sub_info ON 
    (sub_info.subject_local_id = fds.subject_local_id AND sub_info.subject_id_namespace = fds.subject_id_namespace) /* 2024/03/07 match subject */    /** limit ${file_count_limit_sub}     **/
    /* Mano: even though columns of ftk are from f only, # rows ftk << #rows f */
    INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace)
    INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
      AND f.project_id_namespace = ui.project_id_namespace
      AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) )
    LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
    LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
    LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
    ), /* Mano */
  file_sub_table AS (
    SELECT * from file_sub_table_keycol
    limit ${file_count_limit_sub}    
  ),
  file_sub_table_limited as (
    SELECT * 
    FROM file_sub_table
    OFFSET ${fileSubTblOffset}
    LIMIT ${limit}
  ), /* Mano */
  count_file_sub AS (
    select count(*)::int as count
    from file_sub_table_keycol
  ), /* Mano */

  file_bios_table_keycol AS (
    SELECT DISTINCT fdb.*,
    f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
    f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
    f.file_format, f.compression_format,  f.mime_type, f.dbgap_study_id,
    dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name
  FROM c2m2.file_describes_biosample fdb
    INNER JOIN file_table_keycol ftk ON 
    (ftk.local_id = fdb.file_local_id AND ftk.id_namespace = fdb.file_id_namespace)
    INNER JOIN bios_info ON 
    (bios_info.biosample_local_id = fdb.biosample_local_id AND bios_info.biosample_id_namespace = fdb.biosample_id_namespace) /* 2024/03/07 match biosample */
    INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace)
    INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
      AND f.project_id_namespace = ui.project_id_namespace
      AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) )
    LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
    LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
    LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
    ), /* Mano */
  file_bios_table AS (
    SELECT * from file_bios_table_keycol
    limit ${file_count_limit_bios}    
  ),
  file_bios_table_limited as (
    SELECT * 
    FROM file_bios_table
    OFFSET ${fileBiosTblOffset}
    LIMIT ${limit}
  ), /* Mano */
  count_file_bios AS (
    select count(*)::int as count
      from file_bios_table_keycol
  ), /* Mano */

  file_col_table_keycol AS (
    SELECT DISTINCT fdc.file_id_namespace, fdc.file_local_id, fdc.collection_id_namespace, fdc.collection_local_id,
    f.project_id_namespace, f.project_local_id, f.persistent_id, f.access_url, f.creation_time,
    f.size_in_bytes, f.uncompressed_size_in_bytes, f.sha256, f.md5, f.filename,
    f.file_format, f.compression_format,  f.mime_type, f.dbgap_study_id,
    dt.name AS data_type_name, at.name AS assay_type_name, aty.name AS analysis_type_name
  FROM c2m2.file_describes_in_collection fdc
    INNER JOIN file_table_keycol ftk ON 
    (ftk.local_id = fdc.file_local_id AND ftk.id_namespace = fdc.file_id_namespace)
    INNER JOIN col_info ON 
    (col_info.collection_local_id = fdc.collection_local_id AND col_info.collection_id_namespace = fdc.collection_id_namespace) /* 2024/03/07 match collection */
    INNER JOIN c2m2.file AS f ON (f.local_id = ftk.local_id AND f.id_namespace = ftk.id_namespace)
    INNER JOIN unique_info ui ON (f.project_local_id = ui.project_local_id 
      AND f.project_id_namespace = ui.project_id_namespace
      AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) )
    LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
    LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
    LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
    ), /* Mano */
  file_col_table AS (
    SELECT * from file_col_table_keycol
    limit ${file_count_limit_col}    
  ),
  file_col_table_limited as (
    SELECT * 
    FROM file_col_table
    OFFSET ${fileColTblOffset}
    LIMIT ${limit}
  ), /* Mano */
  count_file_col AS (
    select count(*)::int as count
      from file_col_table_keycol
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
`.toPrismaSql()) : [undefined];

    const t1: number = performance.now();

    // Create download filename for this recordInfo based on md5sum
    // Stringify q and t from searchParams pertaining to this record
    const qString = JSON.stringify(searchParams.q);
    const tString = JSON.stringify(searchParams.t);

    // Concatenate qString and tString into a single string
    const concatenatedString = `${qString}${tString}`;
    const recordInfoHashFileName = generateMD5Hash(concatenatedString);
    const qString_clean = sanitizeFilename(qString, '__');

    // First remove the empty columns and sort columns such that most varying appears first

    const biosample_table_columnsToIgnore: string[] = ['anatomy_name', 'disease_name', 'project_local_id', 'project_id_namespace', 'subject_local_id', 'subject_id_namespace', 'biosample_id_namespace'];
    const { prunedData: biosamplePrunedData, columnNames: bioSampleColNames, dynamicColumns: dynamicBiosampleColumns,
      staticColumns: staticBiosampleColumns } = pruneAndRetrieveColumnNames(results?.biosamples_table ?? [],
        results?.biosamples_table_full ?? [], biosample_table_columnsToIgnore);
    // Add 'id' column with 'row-<index>' format
    const biosamplePrunedDataWithId = biosamplePrunedData.map((row, index) => ({ ...row, id: index }));
    const biosamples_table_full_withId = results?.biosamples_table_full
      ? results.biosamples_table_full.map((row, index) => ({ ...row, id: index }))
      : []; // STOPPED HERE 



    const subject_table_columnsToIgnore: string[] = ['subject_id_namespace'];
    const { prunedData: subjectPrunedData, columnNames: subjectColNames, dynamicColumns: dynamicSubjectColumns,
      staticColumns: staticSubjectColumns } = pruneAndRetrieveColumnNames(results?.subjects_table ?? [],
        results?.subjects_table_full ?? [], subject_table_columnsToIgnore);
    // Add 'id' column with 'row-<index>' format
    const subjectPrunedDataWithId = subjectPrunedData.map((row, index) => ({ ...row, id: index }));
    const subjects_table_full_withId = results?.subjects_table_full
      ? results.subjects_table_full.map((row, index) => ({ ...row, id: index }))
      : [];


    const collections_table_columnsToIgnore: string[] = ['collection_id_namespace']; // don't include 'persistent_id' here
    const { prunedData: collectionPrunedData, columnNames: collectionColNames, dynamicColumns: dynamicCollectionColumns,
      staticColumns: staticCollectionColumns } = pruneAndRetrieveColumnNames(results?.collections_table ?? [],
        results?.collections_table_full ?? [], collections_table_columnsToIgnore);
    // Add 'id' column with 'row-<index>' format
    const collectionPrunedDataWithId = collectionPrunedData.map((row, index) => ({ ...row, id: index }));
    const collections_table_full_withId = results?.collections_table_full
      ? results.collections_table_full.map((row, index) => ({ ...row, id: index }))
      : [];

    const priorityFileCols = ['filename', 'local_id', 'assay_type_name', 'analysis_type_name', 'size_in_bytes'];

    const filesProj_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'bundle_collection_id_namespace'];
    const { prunedData: fileProjPrunedData, columnNames: fileProjColNames, dynamicColumns: dynamicFileProjColumns,
      staticColumns: staticFileProjColumns } = pruneAndRetrieveColumnNames(results?.file_table ?? [],
        results?.file_table_full ?? [], filesProj_table_columnsToIgnore);
    // Add 'id' column with 'row-<index>' format
    const fileProjPrunedDataWithId = fileProjPrunedData.map((row, index) => ({ ...row, id: index }));
    //console.log("fileProjPrundedDataWithId = "+fileProjPrunedDataWithId);
    const filesProj_table_full_withId = results?.file_table_full
      ? results.file_table_full.map((row, index) => ({ ...row, id: index }))
      : [];
    
    // console.log(">>>>>>>>>>>>>>>>>>>>>>>DYNAMIC",dynamicFileProjColumns)

    const newFileProjColumns = priorityFileCols.concat(dynamicFileProjColumns.filter(item => !priorityFileCols.includes(item)));
    const reorderedFileProjStaticCols = reorderStaticCols(staticFileProjColumns, priorityFileCols);

    const filesSub_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'subject_id_namespace'];
    const { prunedData: fileSubPrunedData, columnNames: fileSubColNames, dynamicColumns: dynamicFileSubColumns,
      staticColumns: staticFileSubColumns } = pruneAndRetrieveColumnNames(results?.file_sub_table ?? [],
        results?.file_sub_table_full ?? [], filesSub_table_columnsToIgnore);
    // Add 'id' column with 'row-<index>' format
    const fileSubPrunedDataWithId = fileSubPrunedData.map((row, index) => ({ ...row, id: index }));
    const fileSub_table_full_withId = results?.file_sub_table_full
      ? results.file_sub_table_full.map((row, index) => ({ ...row, id: index }))
      : [];

    const newFileSubColumns = priorityFileCols.concat(dynamicFileSubColumns.filter(item => !priorityFileCols.includes(item)));
    const reorderedFileSubStaticCols = reorderStaticCols(staticFileSubColumns, priorityFileCols);

    const filesBios_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'biosample_id_namespace'];
    const { prunedData: fileBiosPrunedData, columnNames: fileBiosColNames, dynamicColumns: dynamicFileBiosColumns,
      staticColumns: staticFileBiosColumns } = pruneAndRetrieveColumnNames(results?.file_bios_table ?? [],
        results?.file_bios_table_full ?? [], filesBios_table_columnsToIgnore);
    // Add 'id' column with 'row-<index>' format
    const fileBiosPrunedDataWithId = fileBiosPrunedData.map((row, index) => ({ ...row, id: index }));
    const fileBios_table_full_withId = results?.file_bios_table_full
      ? results.file_bios_table_full.map((row, index) => ({ ...row, id: index }))
      : [];


    const newFileBiosColumns = priorityFileCols.concat(dynamicFileBiosColumns.filter(item => !priorityFileCols.includes(item)));
    const reorderedFileBiosStaticCols = reorderStaticCols(staticFileBiosColumns, priorityFileCols);

    const filesCol_table_columnsToIgnore: string[] = ['id_namespace', 'project_id_namespace', 'file_id_namespace', 'collection_id_namespace', 'collection_local_id'];
    const { prunedData: fileColPrunedData, columnNames: fileColColNames, dynamicColumns: dynamicFileColColumns,
      staticColumns: staticFileColColumns } = pruneAndRetrieveColumnNames(results?.file_col_table ?? [],
        results?.file_col_table_full ?? [], filesCol_table_columnsToIgnore);
    // Add 'id' column with 'row-<index>' format
    const fileColPrunedDataWithId = fileColPrunedData.map((row, index) => ({ ...row, id: index }));
    const fileCol_table_full_withId = results?.file_col_table_full
      ? results.file_col_table_full.map((row, index) => ({ ...row, id: index }))
      : [];

    // Mano: modify dataToSend so that size_in_bytes and compressed_size_in_bytes don't have .0 at the end
    // data = data.map(row => ({...row, size_in_bytes: (row.size_in_bytes !=== null) ? row.size_in_bytes.replace(/\.0$/, '') : null   }));

    const newFileColColumns = priorityFileCols.concat(dynamicFileColColumns.filter(item => !priorityFileCols.includes(item)));
    const reorderedFileColStaticCols = reorderStaticCols(staticFileColColumns, priorityFileCols);

    const t2: number = performance.now();

    // console.log("Files related to biosample");
    // console.log(results?.file_bios_table.slice(1, 5));
    // console.log("Dynamic columns in files related to biosample");
    // console.log(dynamicFileBiosColumns);
    // console.log("Static columns in files related to biosample");
    // console.log(staticFileBiosColumns);
    // console.log(`count_file: ${results?.count_file}`);

    // The following items are present in metadata

    const resultsRec = results?.records[0];
    const projectLocalId = resultsRec?.project_local_id ?? 'NA';// Assuming it's the same for all rows

    const fileProj_table_label_base = "Project associated files with specified data type";
    const fileSub_table_label_base = "Files that describe subject";
    const fileBios_table_label_base = "Files that describe biosample";
    const fileCol_table_label_base = "Files that describe OR are in collection";

    const metadata: (MetadataItem | null)[] = [
      { label: 'Project ID', value: projectLocalId },
      resultsRec?.project_persistent_id && isURL(resultsRec?.project_persistent_id) 
        ? { label: 'Project URL', value: <Link href={`${resultsRec?.project_persistent_id}`} className="underline cursor-pointer text-blue-600" target="_blank">{resultsRec?.project_name}</Link> } 
        : resultsRec?.project_persistent_id ? { label: 'Project URL', value: resultsRec?.project_persistent_id } : null,
      {
        label: 'Taxonomy', 
        value: resultsRec?.taxonomy_name && resultsRec?.taxonomy_name !== "Unspecified" 
          ? <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${resultsRec?.taxonomy_id}`} className="underline cursor-pointer text-blue-600" target="_blank">
              {resultsRec?.taxonomy_name}
            </Link>
          : resultsRec?.taxonomy_name || ''
      },
      resultsRec?.taxonomy_description ? { label: 'Taxonomy/Species Description', value: capitalizeFirstLetter(resultsRec?.taxonomy_description) } : null,
      {
        label: 'Sample Source', 
        value: resultsRec?.anatomy_name && resultsRec?.anatomy_name !== "Unspecified" 
          ? <Link href={`http://purl.obolibrary.org/obo/${resultsRec?.anatomy}`} className="underline cursor-pointer text-blue-600" target="_blank">
              {capitalizeFirstLetter(resultsRec?.anatomy_name)}
            </Link>
          : resultsRec?.anatomy_name || ''
      },
      resultsRec?.anatomy_description ? { label: 'Sample Source Description', value: resultsRec?.anatomy_description } : null,
      {
        label: 'Disease', 
        value: resultsRec?.disease_name && resultsRec?.disease_name !== "Unspecified" 
          ? <Link href={`http://purl.obolibrary.org/obo/${resultsRec?.disease}`} className="underline cursor-pointer text-blue-600" target="_blank">
              {capitalizeFirstLetter(resultsRec?.disease_name)}
            </Link>
          : resultsRec?.disease_name || ''
      },
      resultsRec?.disease_description ? { label: 'Disease Description', value: resultsRec?.disease_description } : null,
      {
        label: 'Gene', 
        value: resultsRec?.gene_name && resultsRec?.gene_name !== "Unspecified" 
          ? <Link href={`http://www.ensembl.org/id/${resultsRec?.gene}`} className="underline cursor-pointer text-blue-600" target="_blank">
              {resultsRec?.gene_name}
            </Link>
          : resultsRec?.gene_name || ''
      },
      resultsRec?.gene_description ? { label: 'Gene Description', value: capitalizeFirstLetter(resultsRec?.gene_description) } : null,
      {
        label: 'Protein', 
        value: resultsRec?.protein_name && resultsRec?.protein_name !== "Unspecified" 
          ? <Link href={`https://www.uniprot.org/uniprotkb/${resultsRec?.protein}`} className="underline cursor-pointer text-blue-600" target="_blank">
              {resultsRec?.protein_name}
            </Link>
          : resultsRec?.protein_name || ''
      },
      resultsRec?.protein_description ? { label: 'Protein Description', value: capitalizeFirstLetter(resultsRec?.protein_description) } : null,
      {
        label: 'Compound', 
        value: resultsRec?.compound_name && resultsRec?.compound_name !== "Unspecified" 
          ? <Link href={`http://www.ensembl.org/id/${resultsRec?.compound}`} className="underline cursor-pointer text-blue-600" target="_blank">
              {resultsRec?.compound_name}
            </Link>
          : resultsRec?.compound_name || ''
      },
      resultsRec?.compound_description ? { label: 'Compound Description', value: capitalizeFirstLetter(resultsRec?.compound_description) } : null,
      {
        label: 'Data type', 
        value: resultsRec?.data_type_name && resultsRec?.data_type_name !== "Unspecified" 
          ? <Link href={`http://edamontology.org/${resultsRec?.data_type}`} className="underline cursor-pointer text-blue-600" target="_blank">
              {capitalizeFirstLetter(resultsRec?.data_type_name)}
            </Link>
          : resultsRec?.data_type_name || ''
      },
      { label: 'Biosamples', value: results ? resultsRec?.count_bios?.toLocaleString() : undefined },
      { label: 'Subjects', value: results ? resultsRec?.count_sub?.toLocaleString() : undefined },
      { label: 'Collections', value: results ? resultsRec?.count_col?.toLocaleString() : undefined },
      { label: fileProj_table_label_base, value: results ? results.count_file?.toLocaleString() : undefined },
      { label: fileSub_table_label_base, value: results ? results.count_file_sub?.toLocaleString() : undefined },
      { label: fileBios_table_label_base, value: results ? results.count_file_bios?.toLocaleString() : undefined },
      { label: fileCol_table_label_base, value: results ? results.count_file_col?.toLocaleString() : undefined },
    ];
    
    const t3: number = performance.now();

    const categories: Category[] = [];
    // console.log("Static columns in  biosample");
    // console.log(staticBiosampleColumns);

    addCategoryColumns(staticBiosampleColumns, getNameFromBiosampleTable, "Biosamples", categories);
    //addCategoryColumns(staticBiosampleColumns, getNameFromBiosampleTable, "Biosamples", categories);
    addCategoryColumns(staticSubjectColumns, getNameFromSubjectTable, "Subjects", categories);
    addCategoryColumns(staticCollectionColumns, getNameFromCollectionTable, "Collections", categories);
    //addCategoryColumns(staticFileProjColumns, getNameFromFileProjTable, "Files related to Project", categories);
    addCategoryColumns(reorderedFileProjStaticCols, getNameFromFileProjTable, fileProj_table_label_base, categories);
    addCategoryColumns(reorderedFileSubStaticCols, getNameFromFileProjTable, fileSub_table_label_base, categories);
    addCategoryColumns(reorderedFileBiosStaticCols, getNameFromFileProjTable, fileBios_table_label_base, categories);
    addCategoryColumns(reorderedFileColStaticCols, getNameFromFileProjTable, fileCol_table_label_base, categories);

    // Define the actual count of records in table displayed here and use at two or more places
    const count_file_table_withlimit = results?.file_table_full.length ?? 0;
    const count_file_sub_table_withlimit = results?.file_sub_table_full.length ?? 0;
    const count_file_bios_table_withlimit = results?.file_bios_table_full.length ?? 0;
    const count_file_col_table_withlimit = results?.file_col_table_full.length ?? 0;

    const biosampleTableTitle = "Biosamples: " + results?.count_bios;
    const subjectTableTitle = "Subjects: " + results?.count_sub;
    const collectionTableTitle = "Collections: " + results?.count_col;
    ////const fileProjTableTitle = fileProj_table_label_base + ": " + results?.count_file + " (" + count_file_table_withlimit + " listed)";
    ////const fileSubTableTitle = fileSub_table_label_base + ": " + results?.count_file_sub + " (" + count_file_sub_table_withlimit + " listed)";
    ////const fileBiosTableTitle = fileBios_table_label_base + ": " + results?.count_file_bios + " (" + count_file_bios_table_withlimit + " listed)";
    ////const fileColTableTitle = fileCol_table_label_base + ": " + results?.count_file_col + " (" + count_file_col_table_withlimit + " listed)";

    // get_partial_list_string(count_file_table_withlimit, results?.count_file, file_count_limit_proj)
    const fileProjTableTitle = fileProj_table_label_base + ": " + get_partial_list_string(results?.count_file ?? 0, count_file_table_withlimit, file_count_limit_proj);
    const fileSubTableTitle = fileSub_table_label_base + ": " + get_partial_list_string(results?.count_file_sub ?? 0, count_file_sub_table_withlimit, file_count_limit_sub);
    const fileBiosTableTitle = fileBios_table_label_base + ": " + get_partial_list_string(results?.count_file_bios ?? 0, count_file_bios_table_withlimit, file_count_limit_bios);
    const fileColTableTitle = fileCol_table_label_base + ": " + get_partial_list_string(results?.count_file_col ?? 0, count_file_col_table_withlimit, file_count_limit_col);

    const t4: number = performance.now();

    console.log("Elapsed time for DB queries: ", t1 - t0, "milliseconds");
    console.log("Elapsed time for creating PrunedData: ", t2 - t1, "milliseconds");
    console.log("Elapsed time for displaying basic information (before cards and tables): ", t3 - t2, "milliseconds");
    console.log("Elapsed time for displaying cards and displaying counts: ", t4 - t3, "milliseconds");
    //console.log("newFileColColumns: ", newFileColColumns);
    //console.log(" One row of file col table: ", results?.file_col_table[0]);

    return (
      <LandingPageLayout
        icon={{
          href: resultsRec?.dcc_short_label ? `/info/dcc/${resultsRec?.dcc_short_label}` : "",
          //src: getDCCIcon(results ? resultsRec?.dcc_short_label : ""), // Till 2024/05/30 9:50AM PST
          src: getDCCIcon(resultsRec ? resultsRec?.dcc_short_label : ""),
          alt: resultsRec?.dcc_short_label ? resultsRec?.dcc_short_label : ""
        }}
        title={resultsRec?.project_name ?? ""}
        subtitle={""}
        description={format_description(resultsRec?.project_description ?? "")}
        metadata={metadata}
        categories={categories}
      >

        <ExpandableTable
          data={biosamplePrunedDataWithId}
          full_data={biosamples_table_full_withId}
          downloadFileName= {"BiosamplesTable_" + qString_clean + "_" + recordInfoHashFileName + ".json"} //{recordInfoHashFileName + "_BiosamplesTable.json"}
          tableTitle={biosampleTableTitle}
          searchParams={searchParams}
          count={results?.count_bios ?? 0} // Provide count directly as a prop
          colNames={dynamicBiosampleColumns}
          dynamicColumns={dynamicBiosampleColumns}
          tablePrefix="bioSamplTbl"
        //getNameFromTable={getNameFromBiosampleTable}
        />

        <ExpandableTable
          data={subjectPrunedDataWithId}
          full_data={subjects_table_full_withId}
          downloadFileName= {"SubjectsTable_" + qString_clean + "_" + recordInfoHashFileName + ".json"} // {recordInfoHashFileName + "_SubjectsTable.json"}
          tableTitle={subjectTableTitle}
          searchParams={searchParams}
          count={results?.count_sub ?? 0} // Provide count directly as a prop
          colNames={dynamicSubjectColumns}
          dynamicColumns={dynamicSubjectColumns}
          tablePrefix="subTbl"
        //getNameFromTable={getNameFromSubjectTable}
        />

        <ExpandableTable
          data={collectionPrunedDataWithId}
          full_data={collections_table_full_withId}
          downloadFileName= {"CollectionsTable_" + qString_clean + "_" + recordInfoHashFileName + ".json"} // {recordInfoHashFileName + "_CollectionsTable.json"}
          tableTitle={collectionTableTitle}
          searchParams={searchParams}
          count={results?.count_col ?? 0} // Provide count directly as a prop
          colNames={dynamicCollectionColumns}
          dynamicColumns={dynamicCollectionColumns}
          tablePrefix="colTbl"
        //getNameFromTable={getNameFromCollectionTable}
        />

        {(count_file_table_withlimit > 0 && results?.count_file_bios == 0 && results?.count_file_sub == 0) && (
          <ExpandableTable
            data={fileProjPrunedDataWithId}
            full_data={filesProj_table_full_withId}
            downloadFileName= {"FilesProjTable_" + qString_clean + "_" + recordInfoHashFileName + ".json"} // {recordInfoHashFileName + "_FilesProjTable.json"}
            drsBundle
            tableTitle={fileProjTableTitle}
            searchParams={searchParams}
            //count={results?.count_file ?? 0} // Provide count directly as a prop
            //count={results?.file_table_full.length ?? 0} // Provide count directly as a prop
            count={count_file_table_withlimit} // Provide count directly as a prop
            colNames={newFileProjColumns}
            dynamicColumns={newFileProjColumns}
            tablePrefix="fileProjTbl"
          //getNameFromTable={getNameFromFileProjTable}
          />
        )}

        {/* (results?.count_file_bios > 0) ? "" : */}
        {(count_file_sub_table_withlimit > 0 && results?.count_file_bios == 0) && (
          <ExpandableTable
            data={fileSubPrunedDataWithId}
            full_data={fileSub_table_full_withId}
            downloadFileName= {"FilesSubTable_" + qString_clean + "_" + recordInfoHashFileName + ".json"} // {recordInfoHashFileName + "_FilesSubTable.json"}
            drsBundle
            tableTitle={fileSubTableTitle}
            searchParams={searchParams}
            //count={results?.count_file_sub ?? 0} // Provide count directly as a prop
            //count={results?.file_sub_table_full.length ?? 0} // Provide count directly as a prop
            count={count_file_sub_table_withlimit} // Provide count directly as a prop
            colNames={newFileSubColumns}
            dynamicColumns={newFileSubColumns}
            tablePrefix="fileSubTbl"
          //getNameFromTable={getNameFromFileProjTable}
          />
        )}

        {count_file_bios_table_withlimit > 0 && (
          <ExpandableTable
            data={fileBiosPrunedDataWithId}
            full_data={fileBios_table_full_withId}
            downloadFileName= {"FilesBiosTable_" + qString_clean + "_" + recordInfoHashFileName + ".json"} // {recordInfoHashFileName + "_FilesBiosTable.json"}
            drsBundle
            tableTitle={fileBiosTableTitle}
            searchParams={searchParams}
            //count={results?.count_file_bios ?? 0} // Provide count directly as a prop
            //count={results?.file_bios_table_full.length ?? 0} // Provide count directly as a prop
            count={count_file_bios_table_withlimit} // Provide count directly as a prop
            colNames={newFileBiosColumns}
            dynamicColumns={newFileBiosColumns}
            tablePrefix="fileBiosTbl"
          //getNameFromTable={getNameFromFileProjTable}
          />
        )}

        {count_file_col_table_withlimit > 0 && (
          <ExpandableTable
            data={fileColPrunedDataWithId}
            full_data={fileCol_table_full_withId}
            downloadFileName= {"FilesCollTable_" + qString_clean + "_" + recordInfoHashFileName + ".json"} // {recordInfoHashFileName + "_FilesCollTable.json"}
            drsBundle
            tableTitle={fileColTableTitle}
            searchParams={searchParams}
            //count={results?.count_file_col ?? 0} // Provide count directly as a prop
            //count={results?.file_col_table_full.length ?? 0} // Provide count directly as a prop
            count={count_file_col_table_withlimit} // Provide count directly as a prop
            colNames={newFileColColumns}
            dynamicColumns={newFileColColumns}
            tablePrefix="fileColTbl"
          //getNameFromTable={getNameFromFileProjTable}
          />
        )}

      </LandingPageLayout>
    )
  } catch (error) {
    console.error('Error fetching record info query results:', error);
    return <div>Error fetching record info query results</div>;
  }
}

// Keep these comments to remind of a trial I already did to improve speed
// Using some code string twice, so, listing it here
// This string doesn't involve anything that the user inputs or something 
// based on that, so, there is no risk of SQL injection here.
// Conclusion based on observing the time taken:
// Since nearly the same query gets executed twice (+ the limit added in the 
// first execution) in this approach of using ${Prisma.sql([file_sub_table_query_code_part2])},
// it actually ends up taking more time for "LINCS 2021" project: 83 vs 96 seconds.
// Thus, we will not use this approach.
/**Mano
const file_sub_table_query_code_part2 = `FROM c2m2.file_describes_subject
INNER JOIN file_table_keycol ON 
(file_table_keycol.local_id = c2m2.file_describes_subject.file_local_id AND 
  file_table_keycol.id_namespace = c2m2.file_describes_subject.file_id_namespace)
INNER JOIN sub_info ON 
(sub_info.subject_local_id = c2m2.file_describes_subject.subject_local_id AND 
  sub_info.subject_id_namespace = c2m2.file_describes_subject.subject_id_namespace)`;

  // Part of code in query:
    file_sub_table_keycol AS (
    SELECT DISTINCT c2m2.file_describes_subject.*
    ** ${Prisma.sql([file_sub_table_query_code_part2])} **
  
  // and
    count_file_sub AS (
    select count(*)::int as count
    ** from (SELECT DISTINCT c2m2.file_describes_subject.* ${Prisma.sql([file_sub_table_query_code_part2])}) **
    from file_sub_table_keycol
  ),

**/

/* Mano: 2024/04/19: will it be much faster to do: ui INNER JOIN f LEFT JOIN dt LEFT JOIN at LEFT JOIN aty */
/* FROM c2m2.file AS f
LEFT JOIN c2m2.data_type AS dt ON f.data_type = dt.id
LEFT JOIN c2m2.assay_type AS at ON f.assay_type = at.id
LEFT JOIN c2m2.analysis_type AS aty ON f.analysis_type = aty.id
INNER JOIN unique_info AS ui ON (f.project_local_id = ui.project_local_id 
                          AND f.project_id_namespace = ui.project_id_namespace
                          AND ((f.data_type = ui.data_type) OR (f.data_type IS NULL AND ui.data_type IS NULL)) ) */
