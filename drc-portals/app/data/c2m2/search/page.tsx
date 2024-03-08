import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import SearchFilter from "./SearchFilter";
import FilterSet from "./FilterSet"
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, PreviewButton, LinkedTypedNode, Description } from "@/app/data/c2m2/SearchablePagedTable";
import ListingPageLayout from "../ListingPageLayout";
import TruncatedText from "../TruncatedText"
import { Accordion, Box, Button, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";
import { relayout } from "plotly.js";
import { getDCCIcon, getFilterVals } from "@/app/data/c2m2/utils"
import DownloadButton from "../DownloadButton";

type PageProps = { searchParams: Record<string, string> }

type FilterObject = {
  id: string;
  name: string;
  count: number;
};

interface HashTable {
  [key: string]: string;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}

// Mano: Not sure if use of this function is sql-injection safe
//export function generateFilterQueryString(searchParams: Record<string, string>, tablename: string) {
export function generateFilterQueryString(searchParams: any, tablename: string) {
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
          typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = '${t.entity_type.replace(/'/g, "''")}'`);
        } else {
          //typeFilters[t.type].push(`"${tablename}"."${t.type}_name" is null`);
          typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = 'Unspecified'`);
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

export default async function Page(props: PageProps) {
  console.log(props)
  const searchParams = useSanitizedSearchParams(props)
  console.log(searchParams.q)
  const offset = (searchParams.p - 1) * searchParams.r
  const limit = searchParams.r

  // Mano: Please do not delete the comments.
  // Do not delete commented lines as they may have related code to another/related task/item

  const filterConditionStr = generateFilterQueryString(searchParams, "allres"); // Mano: using a function now
  const filterClause = filterConditionStr.length ? `WHERE ${filterConditionStr}` : '';

  /*  USAGE: SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres ${Prisma.sql([filterClause])} LIMIT 10 */



  // searchParamsT which will helpa pply both and (across filter types) and or operator (within same filter type) 
  // for this URL: http://localhost:3000/data/c2m2/search?q=blood&t=dcc%3AUCSD+Metabolomics+Workbench%7Cdcc%3AThe+Human+Microbiome+Project%7Cspecies%3AHomo+sapiens&p=1
  // searchParams.t is [{type: 'dcc', enttity_type: 'UCSD+Metabolomics+Workbench'}, 
  // {type: 'dcc', enttity_type: 'The+Human+Microbiome+Project'}, {type: 'species', enttity_type: 'Homo+sapiens'}]
  // searchParamsT should be:
  // {dcc: ['UCSD+Metabolomics+Workbench', 'The+Human+Microbiome+Project'], species: ['Homo+sapiens'], disease: [] }

  // Mano: In the queries below, please note that GROUP BY automatically means as if DISTINCT was applied
  // When filter values are selected, only the table displayed on the right (records) is updated; 
  // the list of distinct items in the filter is not updated.



  const cascading: boolean = true;
  const cascading_tablename = cascading ? "allres_filtered" : "allres";
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
      data_type_name: string,
      data_type: string,
      project_name: string,
      project_description: string,
      count: number, // this is based on across all-columns of ffl_biosample
      count_bios: number,
      count_sub: number,
      count_col: number,
      record_info_url: string,
    }[],
    count: number,
    // Mano: The count in filters below id w.r.t. rows in allres on which DISTINCT 
    // is already applied (indirectly via GROUP BY), so, these counts are much much lower than the count in allres
    dcc_filters: { dcc_name: string, dcc_short_label: string, count: number, }[],
    taxonomy_filters: { taxonomy_name: string, count: number, }[],
    disease_filters: { disease_name: string, count: number, }[],
    anatomy_filters: { anatomy_name: string, count: number, }[],
    project_filters: { project_name: string, count: number, }[],
    gene_filters: { gene_name: string, count: number, }[],
    data_type_filters: { data_type_name: string, count: number, }[],
  }>>`
WITH allres_full AS (
  SELECT DISTINCT c2m2.ffl_biosample.*,
    ts_rank_cd(searchable, websearch_to_tsquery('english', ${searchParams.q})) as "rank"
    FROM c2m2.ffl_biosample
    WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) 
    /*ORDER BY rank DESC , dcc_abbreviation, project_name, disease_name, ncbi_taxonomy_name, anatomy_name */

),
allres AS (
  SELECT 
    allres_full.rank AS rank,
    allres_full.dcc_name AS dcc_name,
    allres_full.dcc_abbreviation AS dcc_abbreviation,
    SPLIT_PART(allres_full.dcc_abbreviation, '_', 1) AS dcc_short_label,
    allres_full.project_local_id AS project_local_id,
    /* CASE WHEN allres_full.ncbi_taxonomy_name IS NULL THEN 'Unspecified' ELSE allres_full.ncbi_taxonomy_name END AS taxonomy_name, */
    COALESCE(allres_full.ncbi_taxonomy_name, 'Unspecified') AS taxonomy_name,
    SPLIT_PART(allres_full.subject_role_taxonomy_taxonomy_id, ':', 2) as taxonomy_id,
    /* CASE WHEN allres_full.disease_name IS NULL THEN 'Unspecified' ELSE allres_full.disease_name END AS disease_name, */
    COALESCE(allres_full.disease_name, 'Unspecified') AS disease_name,
    REPLACE(allres_full.disease, ':', '_') AS disease,
    /* CASE WHEN allres_full.anatomy_name IS NULL THEN 'Unspecified' ELSE allres_full.anatomy_name END AS anatomy_name, */
    COALESCE(allres_full.anatomy_name, 'Unspecified') AS anatomy_name,
    REPLACE(allres_full.anatomy, ':', '_') AS anatomy,
    /* CASE WHEN allres_full.gene_name IS NULL THEN 'Unspecified' ELSE allres_full.gene_name END AS gene_name, */
    COALESCE(allres_full.gene_name, 'Unspecified') AS gene_name,
    allres_full.gene AS gene,
    COALESCE(allres_full.data_type_name, 'Unspecified') AS data_type_name,
    REPLACE(allres_full.data_type_id, ':', '_') AS data_type,
    allres_full.project_name AS project_name,
    c2m2.project.description AS project_description,
    COUNT(*)::INT AS count,
    COUNT(DISTINCT biosample_local_id)::INT AS count_bios, 
    COUNT(DISTINCT subject_local_id)::INT AS count_sub, 
    COUNT(DISTINCT collection_local_id)::INT AS count_col
  FROM allres_full 
  LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
    allres_full.project_local_id = c2m2.project.local_id) 
  /* LEFT JOIN c2m2.project_data_type ON (allres_full.project_id_namespace = c2m2.project_data_type.project_id_namespace AND 
    allres_full.project_local_id = c2m2.project_data_type.project_local_id) keep for some time */
  GROUP BY rank, dcc_name, dcc_abbreviation, dcc_short_label, project_local_id, taxonomy_name, taxonomy_id, 
    disease_name, disease, anatomy_name, anatomy, gene_name, gene, data_type_name, data_type, 
    project_name, project_description 
  ORDER BY rank DESC, project_name, disease_name, taxonomy_name, anatomy_name, gene_name, data_type_name, dcc_short_label
),
allres_filtered AS (
  SELECT allres.*, 
  concat_ws('', '/data/c2m2/record_info?q=', ${searchParams.q}, '&t=', 'dcc_name:', allres.dcc_name, 
  '|', 'project_local_id:', allres.project_local_id, '|', 'disease_name:', allres.disease_name, 
  '|', 'ncbi_taxonomy_name:', allres.taxonomy_name, '|', 'anatomy_name:', allres.anatomy_name, 
  '|', 'gene_name:', allres.gene_name, '|', 'data_type_name:', allres.data_type_name) AS record_info_url
  FROM allres
  ${Prisma.sql([filterClause])}

),
allres_limited AS (
  SELECT *
  FROM allres_filtered
  OFFSET ${offset}
  LIMIT ${limit}   
),
total_count as (
  select count(*)::int as count
  from allres_filtered
),
dcc_name_count AS (
  SELECT dcc_name, dcc_short_label, COUNT(*) AS count 
  FROM ${Prisma.sql([cascading_tablename])}
  GROUP BY dcc_name, dcc_short_label ORDER BY dcc_short_label, dcc_name
),
taxonomy_name_count AS (
  SELECT taxonomy_name, COUNT(*) AS count
  /* SELECT CASE WHEN taxonomy_name IS NULL THEN 'Unspecified' ELSE taxonomy_name END AS taxonomy_name, COUNT(*) AS count */
  FROM ${Prisma.sql([cascading_tablename])}
  GROUP BY taxonomy_name ORDER BY taxonomy_name
),
disease_name_count AS (
  SELECT disease_name, COUNT(*) AS count
  /* SELECT CASE WHEN disease_name IS NULL THEN 'Unspecified' ELSE disease_name END AS disease_name, COUNT(*) AS count */
  FROM ${Prisma.sql([cascading_tablename])}
  GROUP BY disease_name ORDER BY disease_name
),
anatomy_name_count AS (
  SELECT anatomy_name, COUNT(*) AS count
  /* SELECT CASE WHEN anatomy_name IS NULL THEN 'Unspecified' ELSE anatomy_name END AS anatomy_name, COUNT(*) AS count */
  FROM ${Prisma.sql([cascading_tablename])} 
  GROUP BY anatomy_name ORDER BY anatomy_name
),
project_name_count AS (
  SELECT project_name, COUNT(*) AS count 
  FROM ${Prisma.sql([cascading_tablename])}
  GROUP BY project_name ORDER BY project_name
),
gene_name_count AS (
  SELECT gene_name, COUNT(*) AS count 
  FROM ${Prisma.sql([cascading_tablename])}
  GROUP BY gene_name ORDER BY gene_name
),
data_type_name_count AS (
  SELECT data_type_name, COUNT(*) AS count 
  FROM ${Prisma.sql([cascading_tablename])}
  GROUP BY data_type_name ORDER BY data_type_name
)

SELECT
(SELECT COALESCE(jsonb_agg(allres_limited.*), '[]'::jsonb) AS records FROM allres_limited ), 
  (SELECT count FROM total_count) as count,
  (SELECT COALESCE(jsonb_agg(dcc_name_count.*), '[]'::jsonb) FROM dcc_name_count) AS dcc_filters,
  (SELECT COALESCE(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) FROM taxonomy_name_count) AS taxonomy_filters,
  (SELECT COALESCE(jsonb_agg(disease_name_count.*), '[]'::jsonb) FROM disease_name_count) AS disease_filters,
  (SELECT COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) FROM anatomy_name_count) AS anatomy_filters,
  (SELECT COALESCE(jsonb_agg(project_name_count.*), '[]'::jsonb) FROM project_name_count) AS project_filters,
  (SELECT COALESCE(jsonb_agg(gene_name_count.*), '[]'::jsonb) FROM gene_name_count) AS gene_filters,
  (SELECT COALESCE(jsonb_agg(data_type_name_count.*), '[]'::jsonb) FROM data_type_name_count) AS data_type_filters
  
  ` : [undefined];
  if (!results) redirect('/data')
  //  console.log(results)
  console.log(results.records[0]); console.log(results.records[1]); console.log(results.records[2]);
  console.log(results.records.map(res => res.count))
  console.log(results.dcc_filters)
  console.log(results.taxonomy_filters)

  const total_matches = results?.records.map((res) => res.count).reduce((a, b) => Number(a) + Number(b), 0); // need to sum
  //else if (results.count === 0) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
  const DccFilters: FilterObject[] = results?.dcc_filters.map((dccFilter) => ({
    id: dccFilter.dcc_short_label,
    name: dccFilter.dcc_name, // Use dcc_abbreviation as the name
    count: dccFilter.count,
  }));
  const TaxonomyFilters: FilterObject[] = results?.taxonomy_filters.map((taxFilter) => ({
    id: taxFilter.taxonomy_name, // Use taxonomy_name as id
    name: taxFilter.taxonomy_name,
    count: taxFilter.count,
  }));
  const DiseaseFilters: FilterObject[] = results?.disease_filters.map((disFilter) => ({
    id: disFilter.disease_name, // Use disease_name as id
    name: disFilter.disease_name,
    count: disFilter.count,
  }));
  const AnatomyFilters: FilterObject[] = results?.anatomy_filters.map((anaFilter) => ({
    id: anaFilter.anatomy_name, // Use anatomy_name as id
    name: anaFilter.anatomy_name,
    count: anaFilter.count,
  }));
  const ProjectFilters: FilterObject[] = results?.project_filters.map((projFilter) => ({
    id: projFilter.project_name, // Use anatomy_name as id
    name: projFilter.project_name,
    count: projFilter.count,
  }));
  const GeneFilters: FilterObject[] = results?.gene_filters.map((geneFilter) => ({
    id: geneFilter.gene_name, // Use gene_name as id
    name: geneFilter.gene_name,
    count: geneFilter.count,
  }));
  const DataTypeFilters: FilterObject[] = results?.data_type_filters.map((data_typeFilter) => ({
    id: data_typeFilter.data_type_name, // Use gene_name as id
    name: data_typeFilter.data_type_name,
    count: data_typeFilter.count,
  }));
  console.log("Length of DCC Filters")
  console.log(DccFilters.length);
  console.log(searchParams.q);
  const selectedFilters = getFilterVals(searchParams.t, searchParams.q);
  
  console.log(selectedFilters)

  //const file_icon_path = "/img/icons/searching-magnifying-glass.png";
  const file_icon_path = "/img/icons/file-magnifiying-glass.png";

  return (
    <ListingPageLayout
      count={results?.count} // This matches with #records in the table on the right (without filters applied)
      searchText={searchParams.q}
      filters={
        <>
          {DiseaseFilters.length > 0 && (
            <>
              {/* <Typography className="subtitle1">Disease</Typography> */}
              <FilterSet key={`ID:$disease`} id={`disease`} filterList={DiseaseFilters} filter_title="Disease" />
              <hr className="m-2" />
            </>
          )}
          {TaxonomyFilters.length > 0 && (
            <>
              {/* <Typography className="subtitle1">Taxonomy</Typography> */}
              <FilterSet key={`ID:$taxonomy`} id={`taxonomy`} filterList={TaxonomyFilters} filter_title="Species" />
              <hr className="m-2" />
            </>
          )}
          {AnatomyFilters.length > 0 && (
            <>
              {/* <Typography className="subtitle1">Anatomy</Typography> */}
              <FilterSet key={`ID:$anatomy`} id={`anatomy`} filterList={AnatomyFilters} filter_title="Anatomy" />
              <hr className="m-2" />
            </>
          )}

          {/* Conditionally render FilterSet for GeneFilters */}
          {GeneFilters.length > 0 && (
            <>
              {/* <Typography className="subtitle1">Gene</Typography> */}
              <FilterSet key={`ID:$gene`} id={`gene`} filterList={GeneFilters} filter_title="Gene" />
              <hr className="m-2" />
            </>
          )}
          {DataTypeFilters.length > 0 && (
            <>
              {/* <Typography className="subtitle1">Anatomy</Typography> */}
              <FilterSet key={`ID:$data_type`} id={`data_type`} filterList={DataTypeFilters} filter_title="Data type" />
              <hr className="m-2" />
            </>
          )}
          {/* <Typography variant="h5">Core filters</Typography> */}
          {/* <hr className="m-2" /> */}
          {/* <Typography className="subtitle1">CF Program/DCC</Typography> */}
          <FilterSet key={`ID:$dcc`} id={`dcc`} filterList={DccFilters} filter_title="Common Fund Program" />
          <hr className="m-2" />
          {/* <Typography className="subtitle1">Project</Typography> */}
          {/* <FilterSet key={`ID:$project`} id={`project`} filterList={ProjectFilters} filter_title="Project" /> */}
          {/* results?.project_filters.map((res) =>
            <SearchFilter key={`ID:${res.project_name}`} id={`anatomy:${res.project_name}`} count={res.count} label={`${res.project_name}`} />
      ) */}
        </>
      }
      footer={
        <Link href="/data">
          <Button
            sx={{ textTransform: "uppercase" }}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiArrowLeft} size={1} />}>
            BACK TO SEARCH
          </Button>
        </Link>
      }
      data={results?.records}
      downloadFileName="CFDEC2M2MainSearchTable.json"
    >
      {/* Total matching records across C2M2: {total_matches}. 
      Download fully expanded table allres_full. Download compact table allres.<br></br>
      LIST THE FILTERS APPLIED [IF POSSIBLE, ALLOW THE FILTERS TO BE DESELECTED FROM HERE.] */}
      <SearchablePagedTable
        label={searchParams.q ?? ''}
        filternames={selectedFilters}
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={results?.count}
        columns={[
          <>View</>,
          <>DCC</>,
          <>Project Name</>,
          //<>Description</>,
          <>Attributes</>,
          <>Assets</>
          //<>Rank</>
        ]}
        rows={results ? results?.records.map(res => [
          //<SearchablePagedTableCellIcon href={res.record_info_url} src={file_icon_path} alt="More details about this result" />,
          <PreviewButton href={res.record_info_url} alt="More details about this result" />,
          // [
          //<>{res.dcc_abbreviation}</>,
          //<SearchablePagedTableCellIcon href={`/info/dcc/${res.dcc_abbreviation.split("_")[0]}}`} src={dccIconTable[res.dcc_abbreviation.split("_")[0]]} alt={res.dcc_abbreviation.split("_")[0]} />,
          <SearchablePagedTableCellIcon href={`/info/dcc/${res.dcc_short_label}`} src={getDCCIcon(res.dcc_short_label)} alt={res.dcc_short_label} />,
          //<Description description={res.dcc_abbreviation.split("_")[0]} />,
          <Description description={res.project_name} />,
          
          
          //<TruncatedText text={res.project_description} maxLength={80} />,
          
          <>Taxonomy: <Link href={`https://www.ncbi.nlm.nih.gov/taxonomy/?term=${res.taxonomy_id}`}><i><u>{res.taxonomy_name}</u></i></Link><br></br>
            Disease: <Link href={`http://purl.obolibrary.org/obo/${res.disease}`}><i><u>{res.disease_name}</u></i></Link><br></br>
            Anatomy: <Link href={`http://purl.obolibrary.org/obo/${res.anatomy}`}><i><u>{res.anatomy_name}</u></i></Link><br></br>
            {/* Gene: <i>{res.gene_name}</i> */}
            Gene: {res.gene_name !== "Unspecified" ? (
                    <Link href={`http://www.ensembl.org/id/${res.gene}`}><i><u>{res.gene_name}</u></i></Link>
                    ) : (
                    <span><i>Unspecified</i></span>
            )}<br></br>
            Data type: <Link href={`http://edamontology.org/${res.data_type}`}><i><u>{res.data_type_name}</u></i></Link>
          </>,
          <>Subjects: {res.count_sub}<br></br>
            Biosamples: {res.count_bios}<br></br>
            Collections: {res.count_col}<br></br>
            { /* #Matches: {res.count} */}
          </>
          
        ]) : []}
      />
    </ListingPageLayout>
    
  )
}

