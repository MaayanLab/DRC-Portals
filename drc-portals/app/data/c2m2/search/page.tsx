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
  console.log(searchParams.q)
  const searchStr = searchParams.q
  const offset = (searchParams.p - 1) * searchParams.r
  const limit = searchParams.r

  const [results] = searchParams.q ? await prisma.$queryRaw<Array<{
    anatomy_name: string,
    anatomy_desc: string,
    dcc_name: string,
    dcc_abbreviation: string,
    disease_name: string,
    disease_desc: string,
  }
  >>`
  SELECT  
       anatomy.name AS anatomy_name, 
       anatomy.description AS anatomy_desc,
       dcc.dcc_name,
       dcc.dcc_abbreviation,
       disease.name AS disease_name,
       disease.description AS disease_desc
  FROM c2m2.fl2_biosample
  LEFT JOIN c2m2.anatomy ON c2m2.fl2_biosample.anatomy = c2m2.anatomy.id
  LEFT JOIN c2m2.dcc ON c2m2.fl2_biosample.project_id_namespace = c2m2.dcc.project_id_namespace
  LEFT JOIN c2m2.disease ON c2m2.fl2_biosample.disease = c2m2.disease.id
  WHERE searchable @@ websearch_to_tsquery('english', '${searchParams.q}')
  LIMIT 5;
  
  ` : [undefined];
  if (!results) redirect('/data')
  console.log(results)
  //else if (results.count === 0) redirect(`/data?error=${encodeURIComponent(`No results for '${searchParams.q ?? ''}'`)}`)
  return (
    <ListingPageLayout
      count={5}
      filters={
        <>
          {/* <Typography className="caption">DCC</Typography> */}
          {
            <SearchFilter key={`dcc-2`} id={`dcc:3`} count={5} label={'MW'} />
          }

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
          <>Anatomy Name</>,
          <>Anatomy Description</>,
        ]}
        rows={results ? [
          [
            <Description description={results.anatomy_name} />,
            <Description description={results.anatomy_desc} />,
          ]
        ] : []}
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