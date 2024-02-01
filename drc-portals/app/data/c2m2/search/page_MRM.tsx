import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import SearchFilter from "./SearchFilter";
import FilterSet from "./FilterSet"
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Button, Typography } from "@mui/material";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";
import { relayout } from "plotly.js";

type PageProps = { searchParams: Record<string, string> }

type FilterObject = {
  id: string;
  name: string;
  count: number;
};

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
        if(t.entity_type !== "Unspecified"){ // was using "null"
          typeFilters[t.type].push(`"${tablename}"."${t.type}_name" = '${t.entity_type}'`);
        } else{
          typeFilters[t.type].push(`"${tablename}"."${t.type}_name" is null`);
        }
      }
    });

    for (const type in typeFilters) {
      if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
        filters.push(`(${typeFilters[type].join(' OR ')})`);
      }
    }
  }
  const filterClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  return filterClause;
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  console.log(searchParams.q)
  const searchStr = searchParams.q
  const offset = (searchParams.p - 1) * searchParams.r
  const limit = searchParams.r

  // Mano: Please do not delete the comments.
  // Do not delete commented lines as they may have related code to another/related task/item

  const filters: string[] = [];

  const tablename = "allres";
  if (searchParams.t) {
    const typeFilters: { [key: string]: string[] } = {};

    searchParams.t.forEach(t => {
      if (!typeFilters[t.type]) {
        typeFilters[t.type] = [];
      }
      if (t.entity_type) {
        //typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);
        if (t.entity_type !== "null") { 
          typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);
        } else {
          typeFilters[t.type].push(`"allres"."${t.type}_name" is null`);
        }
      }
      // if (t.entity_type) {
      //   typeFilters[t.type].push(`"allres"."${t.type}_name" = '${t.entity_type}'`);
      // }
    });

    for (const type in typeFilters) {
      if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
        filters.push(`(${typeFilters[type].join(' OR ')})`);
      }
    }
  }
  //const filterClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const filterClause = generateFilterQueryString(searchParams, "allres"); // Mano: using a function now

  /*  USAGE: SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres ${Prisma.sql([filterClause])} LIMIT 10 */


  /* const filters: string[] = [];

  if (searchParams.t) {
    const typeFilters: { [key: string]: string[] } = {};

    searchParams.t.forEach(t => {
      if (!typeFilters[t.type]) {
        typeFilters[t.type] = [];
      }
      if (t.entity_type) {
        typeFilters[t.type].push(`"allres"."${t.type}_name" = ${Prisma.sql`'${t.entity_type}'`}`);
      }
    });

    for (const type in typeFilters) {
      if (Object.prototype.hasOwnProperty.call(typeFilters, type)) {
        filters.push(`(${Prisma.join(typeFilters[type], ' OR ')})`);
      }
    }
  }

  const filterClause = filters.length ? Prisma.sql`WHERE ${Prisma.join(filters, ' AND ')}` : Prisma.empty; */

  console.log("#####")
  console.log(filterClause)
  console.log("###")
  const query = `SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) FROM allres AS records ${Prisma.sql([filterClause])} LIMIT 10 `;
  console.log("----")
  console.log(query);
  console.log("----")
  // searchParamsT which will helpa pply both and (across filter types) and or operator (within same filter type) 
  // for this URL: http://localhost:3000/data/c2m2/search?q=blood&t=dcc%3AUCSD+Metabolomics+Workbench%7Cdcc%3AThe+Human+Microbiome+Project%7Cspecies%3AHomo+sapiens&p=1
  // searchParams.t is [{type: 'dcc', enttity_type: 'UCSD+Metabolomics+Workbench'}, 
  // {type: 'dcc', enttity_type: 'The+Human+Microbiome+Project'}, {type: 'species', enttity_type: 'Homo+sapiens'}]
  // searchParamsT should be:
  // {dcc: ['UCSD+Metabolomics+Workbench', 'The+Human+Microbiome+Project'], species: ['Homo+sapiens'], disease: [] }

  // Mano: In the queries below, please note that GROUP BY automatically means as if DISTINCT was applied
  // When filter values are selected, only the table displayed on the right (records) is updated; 
  // the list of distinct items in the filter is not updated.
  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
  records: {
    dcc_name: string,
    dcc_abbreviation: string,
    taxonomy_name: string,
    disease_name: string,
    anatomy_name: string,
    project_name: string,
    project_description: string,
    count: number, // this is based on across all-columns of ffl_biosample
  }[],
  // Mano: The count in filters below id w.r.t. rows in allres on which DISTINCT 
  // is already applied (indirectly via GROUP BY), so, these counts are much much lower than the count in allres
  dcc_filters:{dcc_name: string, dcc_abbreviation: string, count: number,}[],
  taxonomy_filters:{taxonomy_name: string, count: number,}[],
  disease_filters:{disease_name: string, count: number,}[],
  anatomy_filters:{anatomy_name: string, count: number,}[],
  project_filters:{project_name: string, count: number,}[],
}>>`
WITH allres_full AS (
  SELECT c2m2.ffl2_biosample.* FROM c2m2.ffl2_biosample
    WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) 
),
allres AS (
  SELECT 
    allres_full.dcc_name AS dcc_name,
    allres_full.dcc_abbreviation AS dcc_abbreviation,
    allres_full.ncbi_taxonomy_name AS taxonomy_name,
    allres_full.disease_name AS disease_name,
    allres_full.anatomy_name AS anatomy_name, 
    allres_full.project_name AS project_name,
    c2m2.project.description AS project_description,
    COUNT(*)::INT AS count
  FROM allres_full
  LEFT JOIN c2m2.project ON (allres_full.project_id_namespace = c2m2.project.id_namespace AND 
    allres_full.project_local_id = c2m2.project.local_id)
  GROUP BY dcc_name, dcc_abbreviation, taxonomy_name, disease_name, anatomy_name, project_name, project_description
),
dcc_name_count AS (
  SELECT dcc_name, SPLIT_PART(dcc_abbreviation, '_', 1) as dcc_abbreviation, COUNT(*) AS count 
  FROM allres 
  GROUP BY dcc_name, dcc_abbreviation ORDER BY dcc_abbreviation, dcc_name
),
taxonomy_name_count AS (
  /* SELECT taxonomy_name, COUNT(*) AS count */
  SELECT CASE WHEN taxonomy_name IS NULL THEN 'Unspecified' ELSE taxonomy_name END AS taxonomy_name, COUNT(*) AS count
  FROM allres 
  GROUP BY taxonomy_name ORDER BY taxonomy_name
),
disease_name_count AS (
  /* SELECT disease_name, COUNT(*) AS count */
  SELECT CASE WHEN disease_name IS NULL THEN 'Unspecified' ELSE disease_name END AS disease_name, COUNT(*) AS count
  FROM allres 
  GROUP BY disease_name ORDER BY disease_name
),
anatomy_name_count AS (
  /* SELECT anatomy_name, COUNT(*) AS count  */
  SELECT CASE WHEN anatomy_name IS NULL THEN 'Unspecified' ELSE anatomy_name END AS anatomy_name, COUNT(*) AS count
  FROM allres 
  GROUP BY anatomy_name ORDER BY anatomy_name
),
project_name_count AS (
  SELECT project_name, COUNT(*) AS count 
  FROM allres 
  GROUP BY project_name ORDER BY project_name
)

SELECT
(SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) AS records FROM allres ${Prisma.sql([filterClause])} LIMIT 10), 
  (SELECT COALESCE(jsonb_agg(dcc_name_count.*), '[]'::jsonb) FROM dcc_name_count) AS dcc_filters,
  (SELECT COALESCE(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) FROM taxonomy_name_count) AS taxonomy_filters,
  (SELECT COALESCE(jsonb_agg(disease_name_count.*), '[]'::jsonb) FROM disease_name_count) AS disease_filters,
  (SELECT COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) FROM anatomy_name_count) AS anatomy_filters,
  (SELECT COALESCE(jsonb_agg(project_name_count.*), '[]'::jsonb) FROM project_name_count) AS project_filters
  
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
    id: dccFilter.dcc_abbreviation,
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
  console.log("Length of DCC Filters")
  console.log(DccFilters.length)
  return (
    <ListingPageLayout
      count={results?.records.length} // This matches with #records in the table on the right (without filters applied)
      filters={
        <>
          {/* <Typography className="subtitle1">CF Program/DCC</Typography> */}
          <FilterSet key={`ID:$dcc`} id={`dcc`} filterList={DccFilters} filter_title="DCC" />
          <hr className="m-2" />
          {/* <Typography className="subtitle1">Taxonomy</Typography> */}
          <FilterSet key={`ID:$taxonomy`} id={`taxonomy`} filterList={TaxonomyFilters} filter_title="Taxonomy" />
          <hr className="m-2" />
          {/* <Typography className="subtitle1">Disease</Typography> */}
          <FilterSet key={`ID:$disease`} id={`disease`} filterList={DiseaseFilters} filter_title="Disease" />
          <hr className="m-2" />
          {/* <Typography className="subtitle1">Anatomy</Typography> */}
          <FilterSet key={`ID:$anatomy`} id={`anatomy`} filterList={AnatomyFilters} filter_title="Anatomy" />
          <hr className="m-2" />
          <Typography variant="h5">Core filters</Typography>
          <hr className="m-2" />
          {/* <Typography className="subtitle1">Project</Typography> */}
          <FilterSet key={`ID:$project`} id={`project`} filterList={ProjectFilters} filter_title="Project" />
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
    >
      {/* Total matching records across C2M2: {total_matches}. 
      Download fully expanded table allres_full. Download compact table allres.<br></br>
      LIST THE FILTERS APPLIED [IF POSSIBLE, ALLOW THE FILTERS TO BE DESELECTED FROM HERE.] */}
      <SearchablePagedTable
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={0}
        columns={[
          <>DCC</>,
          <>Project Description</>,
          //<>Taxonomy</>,
          //<>Disease</>,
          //<>Anatomy</>,
          <>Attributes</>,
          <>Assets</>,
        ]}
        rows={results ? results?.records.map(res => [
          // [
          //<>{res.dcc_abbreviation}</>,
          <Description description={res.dcc_abbreviation.split("_")[0]} />,
          <Description description={res.project_name} />,
          //<LinkedTypedNode type={'entity'} entity_type={'Anatomy'} id={res.anatomy_name} label={res.anatomy_name} />,
          //<Description description={res.taxonomy_name} />,
          //<Description description={res.disease_name} />,
          //<Description description={res.anatomy_name} />,
          <>Taxonomy: {res.taxonomy_name},<br></br>
            Disease: {res.disease_name},<br></br>
            Anatomy: {res.anatomy_name}</>,
          <>Subjects: 10<br></br>
            Biosamples: 20<br></br>
            Collections: 40<br></br>
            { /* #Matches: {res.count} */}
          </>,
          //]
        ]) : []}
      />
    </ListingPageLayout>
  )
}
// //
// rows={results?.items.map(item => [
//   item.dcc?.icon ? <SearchablePagedTableCellIcon href={`/info/dcc/${item.dcc.short_label}`} src={item.dcc.icon} alt={item.dcc.label} />
//     : item.type === 'entity' ?
//       item.entity_type === 'gene' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${item.entity_type}`} src={GeneIcon} alt="Gene" />
//         : item.entity_type === 'Drug' ? <SearchablePagedTableCellIcon href={`/data/processed/${item.type}/${item.entity_type}`} src={DrugIcon} alt="Drug" />
//           : null
//       : null,
//   <LinkedTypedNode type={item.type} entity_type={item.entity_type} id={item.id} label={item.label} />,
//   <Description description={item.description} />,
// ]) ?? []}
