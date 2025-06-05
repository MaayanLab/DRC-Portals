import { db } from "@/lib/kysely";
import { notFound } from "next/navigation";
import { getChildTypeCounts, getParentTypeCounts } from "../../../utils";

async function Parents(props: { id: string, predicate: string }) {
  const items = await db
    .with('targets', cte => cte
      .selectFrom('pdp._edge as e')
      .where('e.source_id', '=', props.id)
      .where('e.predicate', '=', props.predicate)
      .orderBy('e.target_pagerank', 'desc')
      .orderBy('e.target_slug', 'asc')
      .select('e.target_id')
      .limit(10)
    )
    .selectFrom('targets as t')
    .innerJoin('pdp.entity as e', j => j.onRef('t.target_id', '=', 'e.id'))
    .select(['e.slug', 'e.type', 'e.attributes'])
    .execute()
  return <div className="flex flex-col overflow-auto">
    {items.map(item =>
      <a key={item.slug} className="ml-2" href={`/data/search2/entity/${item.type}/${item.slug}`}>{JSON.stringify({ '@type': item.type, ...item.attributes as object })}</a>
    )}
  </div>
}

async function Children(props: { id: string, predicate: string }) {
    // IDEA -- if we have neighbors in the json we can use a gin index to find
    // .selectFrom('pdp.entity_complete as source')
    // .where('source.entity', '<@', JSON.stringify({ [props.predicate]: { '@id': props.id } }))
  const items = await db
    .with('sources', cte => cte
      .selectFrom('pdp._edge as e')
      .where('e.target_id', '=', props.id)
      .where('e.predicate', '=', props.predicate)
      .orderBy('e.source_pagerank', 'desc')
      .orderBy('e.source_slug', 'asc')
      .select('e.source_id')
      .limit(10)
    )
    .selectFrom('sources as s')
    .innerJoin('pdp.entity as e', j => j.onRef('s.source_id', '=', 'e.id'))
    .select(['e.slug', 'e.type', 'e.attributes'])
    .execute()
  return <div className="flex flex-col overflow-auto">
    {items.map(item =>
      <a key={item.slug} className="ml-2" href={`/data/search2/entity/${item.type}/${item.slug}`}>{JSON.stringify({ '@type': item.type, ...item.attributes as object })}</a>
    )}
  </div>
}

export default async function EntityPage({ params }: { params: { type: string, slug: string } }) {
  const item = await db
    .selectFrom('pdp.entity')
    .select(['id', 'slug', 'type', 'attributes'])
    .where('type', '=', params.type)
    .where('slug', '=', params.slug)
    .executeTakeFirst()
  if (!item) notFound()
  const parentTypes = await getParentTypeCounts(item.id as string)
  const childTypes = await getChildTypeCounts(item.id as string)
  return <div className="flex flex-col">
    {JSON.stringify({ '@type': item.type, ...item.attributes as object })}
    {parentTypes.map(parentType =>
      <div key={parentType.predicate} className="flex flex-col">
        {parentType.predicate} {Number(parentType.count) > 1 && <>({Number(parentType.count) >= 100 ? `~${parentType.estimate}` : `${parentType.count}`})</>}
        <Parents id={item.id as string} predicate={parentType.predicate as string} />
      </div>
    )}
    {childTypes.map(childType =>
      <div key={childType.predicate} className="flex flex-col">
        {childType.predicate} of {Number(childType.count) > 1 && <>({Number(childType.count) >= 100 ? `~${childType.estimate}` : `${childType.count}`})</>}
        <Children id={item.id as string} predicate={childType.predicate as string} />
      </div>
    )}
  </div>
}
