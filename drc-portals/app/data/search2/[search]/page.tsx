import { search_entity, search_entity_instant_estimate, search_entity_partial_exact } from "../utils";
import ListingPageLayout from "@/app/data/processed/ListingPageLayout";
import SearchablePagedTable, { SearchablePagedTableCellIcon, LinkedTypedNode, Description } from "@/app/data/processed/SearchablePagedTable";
import Link from "@/utils/link";
import { Button } from "@mui/material";
import Icon from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { type_to_string, useSanitizedSearchParams } from "@/app/data/processed/utils"
import KGNode from '@/public/img/icons/KGNode.png'
import { db } from "@/lib/kysely";

function itemLabel (item: { type: string | null, attributes: any, pagerank: number | null }) {
  if (item.type === 'file') return item.attributes.filename
  return item.attributes.name
}
function itemDescription (item: { type: string | null, attributes: any | null, pagerank: number | null }) {
  if (item.type === 'file') return `A ${item.attributes.mime_type} file from ${item.attributes.project_local_id}`
  if (item.attributes.description.length > 100) return `${item.attributes.description.slice(0, 100)}...`
  return `${item.attributes.description}`
}

export default async function Page(props: { params: { search: string }, searchParams: Record<string, string> }) {
  const searchParams = useSanitizedSearchParams({ searchParams: {...props.searchParams, q: decodeURIComponent(props.params.search) } })
  const [page,pagerank,slug] = 'c' in props.searchParams ? props.searchParams['c'].split(':') : [0, 0, '']
  const offset = (searchParams.p - 1 - Number(page))*searchParams.r
  const limit = searchParams.r
  let cursor: { pagerank: string, slug: string } | undefined
  const instantEstimatedCount = await search_entity_instant_estimate(searchParams.q as string)
  const partialExactCount = await search_entity_partial_exact(searchParams.q as string, 100, cursor)
  const items = await search_entity(db, searchParams.q || '', instantEstimatedCount)
    .$if(cursor !== undefined, qb => {
      if (!cursor) return qb
      return qb.where('pagerank', '<', cursor.pagerank).where('slug', '>', cursor.slug)
    })
    .limit(limit)
    .selectAll()
    .execute()
  // const filters = await search_entity_filters(db, searchParams.q as string, instantEstimatedCount)
  return <>{/*JSON.stringify(filters)*/}
      <ListingPageLayout
        count={partialExactCount < 100 ? partialExactCount : instantEstimatedCount}
        maxCount={100}
        filters={
          <>
            {/* <span className="has-[.not-empty:empty]:hidden">
              <Typography className="subtitle1">Program</Typography>
              <span className="not-empty flex flex-col">
                <React.Suspense fallback={null}>
                  <ProgramFilters q={searchParams.q ??''} />
                </React.Suspense>
              </span>
              <hr className="m-2" />
            </span> */}
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
          count={partialExactCount??0}
          columns={[
            <>&nbsp;</>,
            <>Label</>,
            <>Description</>,
          ]}
          rows={items.map(item => {
            const href = `/data/processed/${item.type}/${item.slug}`
            return [
              <SearchablePagedTableCellIcon href={href} src={KGNode} alt={type_to_string('entity', item.type)} />,
              <LinkedTypedNode type={'entity'} entity_type={item.type} id={item.id} label={itemLabel(item)} search={searchParams.q ?? ''} />,
              <Description description={itemDescription(item)} search={searchParams.q ?? ''} />,
            ]
          }) ?? []}
        />
      </ListingPageLayout>
  </>
}
