import prisma from "@/lib/prisma";
import { pluralize, type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import GeneIcon from '@/public/img/icons/gene.png'
import DrugIcon from '@/public/img/icons/drug.png'
import SearchFilter from "./SearchFilter";
import { NodeType, Prisma } from "@prisma/client";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import { Button } from "@mui/material";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import Link from "next/link";

type PageProps = { searchParams: Record<string, string> }

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    title: `Search ${props.searchParams.q ?? ''}`,
  }
}

export default async function Page(props: PageProps) {
  const searchParams = useSanitizedSearchParams(props)
  console.log(searchParams)
  const offset = (searchParams.p - 1)*searchParams.r
  const limit = searchParams.r
  const results = searchParams.q ? await prisma.$queryRaw<Array<{
    dcc_id: string,
    dcc_name: string,
    dcc_abbreviation: string,
    project_id_namespace: string,
    count: number,
  }>>`
  with t1 as (select id,dcc_name, dcc_abbreviation from c2m2.dcc), 
  t2 as (select id, project_id_namespace from c2m2.dcc) 
  select t1.id as dcc_id, 
    t1.dcc_name as dcc_name, t1.dcc_abbreviation as dcc_abbreviation,
    t2.project_id_namespace as project_id_namespace,
    count(*) as count from 
    (c2m2.project pr inner join (t1 inner join t2 on t1.id = t2.id) on pr.id_namespace = t2.project_id_namespace)
     /* where to_tsvector('english', pr.description) @@ websearch_to_tsquery('english', ${searchParams.q}) */
    group by dcc_id, dcc_name, dcc_abbreviation, project_id_namespace;
  ` : [undefined]
  if (!results) redirect('/data')
  else if (results[0].count === 0) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
  return (
    <ListingPageLayout
      count={results.map((res) => res.count).reduce((a, b) => Number(a) + Number(b), 0)} // need to sum, but OK as a place-holder
      filters={
        <>
          {results.map((res) =>
            <SearchFilter key={`ID:${res.dcc_id}`} id={`DCC:${res.dcc_name}`} count={res.count} label={`Abbreviation:${res.dcc_abbreviation}`} />
          )}
        </>
      }
      footer={
        <Link href="/data">
          <Button
            sx={{textTransform: "uppercase"}}
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
        count={5}
        columns={[
          <>ID</>,
          <>Label</>,
          <>Description</>,
        ]}
        rows={results.map(res => [
          <>{res.dcc_id}</>,
          <LinkedTypedNode type='entity' entity_type='DCC' id={res.dcc_id} label={res.dcc_abbreviation} />,
          <Description description={res.dcc_name}/>,
        ]) ?? []}
      />
    </ListingPageLayout>
  )
}
