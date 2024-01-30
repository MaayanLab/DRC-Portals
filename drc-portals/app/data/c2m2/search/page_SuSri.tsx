import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import SearchFilter from "./SearchFilter";
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

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}




export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  console.log(searchParams.q)
  const searchStr = searchParams.q
  const offset = (searchParams.p - 1) * searchParams.r
  const limit = searchParams.r


  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
  records: {
    dcc_name: string,
    dcc_abbreviation: string,
    taxonomy_name: string,
    disease_name: string,
    anatomy_name: string,
    project_name: string,
    project_description: string,
    count: number,
  }[],
  dcc_filters:{dcc_name: string, dcc_abbreviation: string, count: number,}[],
  taxonomy_filters:{taxonomy_name: string, count: number,}[],
  disease_filters:{disease_name: string, count: number,}[],
  anatomy_filters:{anatomy_name: string, count: number,}[],
}>>`
WITH allres AS (
  SELECT 
      c2m2.ffl_biosample.dcc_name AS dcc_name,
      c2m2.ffl_biosample.dcc_abbreviation AS dcc_abbreviation,
      c2m2.ffl_biosample.ncbi_taxonomy_name AS taxonomy_name,
      c2m2.ffl_biosample.disease_name AS disease_name,
      c2m2.ffl_biosample.anatomy_name AS anatomy_name, 
      c2m2.ffl_biosample.project_name AS project_name,
      c2m2.project.description AS project_description,
      COUNT(*)::INT AS count
  FROM c2m2.ffl_biosample
  LEFT JOIN c2m2.project ON c2m2.ffl_biosample.project_local_id = c2m2.project.local_id
  WHERE searchable @@ websearch_to_tsquery('english', ${searchParams.q}) 
  GROUP BY dcc_name, dcc_abbreviation, taxonomy_name, disease_name, anatomy_name, project_name, project_description
),
dcc_name_count AS (
  SELECT DISTINCT dcc_name, dcc_abbreviation, COUNT(*) AS count 
  FROM allres 
  GROUP BY dcc_name, dcc_abbreviation
),
taxonomy_name_count AS (
  SELECT DISTINCT taxonomy_name, COUNT(*) AS count 
  FROM allres 
  GROUP BY taxonomy_name
),
disease_name_count AS (
  SELECT DISTINCT disease_name, COUNT(*) AS count 
  FROM allres 
  GROUP BY disease_name
),
anatomy_name_count AS (
  SELECT DISTINCT anatomy_name, COUNT(*) AS count 
  FROM allres 
  GROUP BY anatomy_name
)
SELECT
  (SELECT COALESCE(jsonb_agg(allres.*), '[]'::jsonb) FROM allres ${searchParams.t ? Prisma.sql`
  WHERE ${Prisma.join(searchParams.t.map(t => {
    switch (t.type) {
        case 'dcc':
            return Prisma.sql`"allres"."dcc_name" = ${t.entity_type}`;
        case 'species':
            return Prisma.sql`"allres"."taxonomy_name" = ${t.entity_type}`;
        case 'disease':
            return Prisma.sql`"allres"."disease_name" = ${t.entity_type}`;
        case 'anatomy':
            return Prisma.sql`"allres"."anatomy_name" = ${t.entity_type}`;
        default:
            return Prisma.empty;
    }
  }), ' or ')}
  ` : Prisma.empty} LIMIT 10) AS records, 
  (SELECT COALESCE(jsonb_agg(dcc_name_count.*), '[]'::jsonb) FROM dcc_name_count) AS dcc_filters,
  (SELECT COALESCE(jsonb_agg(taxonomy_name_count.*), '[]'::jsonb) FROM taxonomy_name_count) AS taxonomy_filters,
  (SELECT COALESCE(jsonb_agg(disease_name_count.*), '[]'::jsonb) FROM disease_name_count) AS disease_filters,
  (SELECT COALESCE(jsonb_agg(anatomy_name_count.*), '[]'::jsonb) FROM anatomy_name_count) AS anatomy_filters
  
  ` : [undefined];
  if (!results) redirect('/data')
//  console.log(results)
console.log(results.records[0]); console.log(results.records[1]); console.log(results.records[2]);
console.log(results.records.map(res => res.count))
  //else if (results.count === 0) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
  return (
    <ListingPageLayout
      count={results?.records.map((res) => res.count).reduce((a, b) => Number(a) + Number(b), 0)} // need to sum, but OK as a place-holder
      filters={
        <>
          <Typography className="subtitle1">CF Program/DCC</Typography>
          {results?.dcc_filters.map((res) =>
            <SearchFilter key={`ID:${res.dcc_name}`} id={`dcc:${res.dcc_name}`} count={res.count} label={`${res.dcc_abbreviation}`} />
          )}
          <hr className="m-2" />
          <Typography className="subtitle1">Taxonomy</Typography>
          {results?.taxonomy_filters.map((res) =>
            <SearchFilter key={`ID:${res.taxonomy_name}`} id={`species:${res.taxonomy_name}`} count={res.count} label={`${res.taxonomy_name}`} />
          )}
          <hr className="m-2" />
          <Typography className="subtitle1">Disease</Typography>
          {results?.disease_filters.map((res) =>
            <SearchFilter key={`ID:${res.disease_name}`} id={`disease:${res.disease_name}`} count={res.count} label={`${res.disease_name}`} />
          )}
          <hr className="m-2" />
          <Typography className="subtitle1">Anatomy</Typography>
          {results?.anatomy_filters.map((res) =>
            <SearchFilter key={`ID:${res.anatomy_name}`} id={`anatomy:${res.anatomy_name}`} count={res.count} label={`${res.anatomy_name}`} />
          )}

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
      <SearchablePagedTable
        q={searchParams.q ?? ''}
        p={searchParams.p}
        r={searchParams.r}
        count={0}
        columns={[
          <>View</>,
          <>DCC</>,
          <>Taxonomy</>,
          <>Disease</>,
          <>Anatomy</>,
          <>Project Description</>,
        ]}
        rows={results ? results?.records.map(res => [
          // [
          <>"Subjects: 10"
          "Biosamples: 20" 
          "Collections: 40" 
          </>,
          //<>{res.dcc_abbreviation}</>,
          <Description description={res.dcc_abbreviation} />,
          //<LinkedTypedNode type={'entity'} entity_type={'Anatomy'} id={res.anatomy_name} label={res.anatomy_name} />,
          <Description description={res.taxonomy_name} />,
          <Description description={res.disease_name} />,
          <Description description={res.anatomy_name} />,
          <Description description={res.project_name} />,
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
