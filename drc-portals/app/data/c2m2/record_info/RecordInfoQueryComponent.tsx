import prisma from "@/lib/prisma/c2m2";
import { format_description, pluralize, type_to_string } from "@/app/data/processed/utils"
import { MetadataItem, getDCCIcon, pruneAndRetrieveColumnNames, generateFilterQueryStringForRecordInfo, getNameFromBiosampleTable, getNameFromSubjectTable, getNameFromCollectionTable, getNameFromFileProjTable, Category, addCategoryColumns, generateMD5Hash } from "@/app/data/c2m2/utils"
import LandingPageLayout from "@/app/data/c2m2/LandingPageLayout";
import Link from "next/link";
import ExpandableTable from "../ExpandableTable";
import { capitalizeFirstLetter, isURL, reorderStaticCols, useSanitizedSearchParams, get_partial_list_string, sanitizeFilename } from "@/app/data/c2m2/utils"
import SQL from "@/lib/prisma/raw";
import BiosamplesTableComponent  from "./BiosamplesTableComponent";
import SubjectsTableComponent from "./SubjectstableComponent";
import CollectionsTableComponent from "./CollectionsTableComponent";
import FilesProjTableComponent from "./FileProjTableComponent";
import FilesSubjectTableComponent from "./FilesSubjectTableComponent";
import FilesBiosampleTableComponent from "./FileBiosamplesComponent";
import FilesCollectionTableComponent from "./FilesCollectionComponent";
import React from "react";

const file_count_limit = 200000;
const file_count_limit_proj = file_count_limit; // 500000;
const file_count_limit_sub = file_count_limit; // 500000;
const file_count_limit_bios = file_count_limit; // 500000;
const file_count_limit_col = file_count_limit; // 500000;
const maxTblCount = 200000;

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
      }[],
      sample_prep_method_name_filters: { sample_prep_method_name: string, count: number, }[],
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
              COUNT(*)::INT AS count
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
          ) 
          SELECT
            (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres)
          ;
      `.toPrismaSql()) : [undefined];

    const t1: number = performance.now();

    console.log("Elapsed time for DB queries: ", t1 - t0, "milliseconds");
    

    
    // The following items are present in metadata

    const resultsRec = results?.records[0];
    const projectLocalId = resultsRec?.project_local_id ?? 'NA';// Assuming it's the same for all rows

    

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
      
    ];
    

    const categories: Category[] = []; // dummy, remove it after making this a optional prop in Landing page
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
      <React.Suspense fallback={<>Loading..</>}>
        <BiosamplesTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit}  bioSamplTblOffset={bioSamplTblOffset}/>
      </React.Suspense>

      <React.Suspense fallback={<>Loading..</>}>
        <SubjectsTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit}  subTblOffset={subTblOffset}/>
      </React.Suspense>  

      <React.Suspense fallback={<>Loading..</>}>
        <CollectionsTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit}  colTblOffset={colTblOffset}/>
      </React.Suspense>

      <React.Suspense fallback={<>Loading..</>}>
        <FilesProjTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit}  fileProjTblOffset={fileProjTblOffset} file_count_limit_proj={file_count_limit_proj}/>
      </React.Suspense>

      <React.Suspense fallback={<>Loading..</>}>
        <FilesSubjectTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit}  fileSubTblOffset={fileSubTblOffset} file_count_limit_sub={file_count_limit_sub}/>
      </React.Suspense>

      <React.Suspense fallback={<>Loading..</>}>
        <FilesBiosampleTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit}  fileBiosTblOffset={fileBiosTblOffset} file_count_limit_bios={file_count_limit_bios}/>
      </React.Suspense>
      
      <React.Suspense fallback={<>Loading..</>}>
        <FilesCollectionTableComponent searchParams={searchParams} filterClause={filterClause} limit={limit}  fileColTblOffset={fileBiosTblOffset} file_count_limit_col={file_count_limit_col}/>
      </React.Suspense>
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
