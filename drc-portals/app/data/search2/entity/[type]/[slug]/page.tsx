import { db } from "@/lib/kysely";
import { notFound } from "next/navigation";
import { getChildTypeCounts, getParentTypeCounts } from "../../../utils";

async function Parents(props: { id: string, predicate: string }) {
  const items = await db
    .selectFrom('pdp.edge as e')
    .innerJoin('pdp.entity as target', j => j.onRef('target.id', '=', 'e.target_id'))
    .where('e.source_id', '=', props.id)
    .where('e.predicate', '=', props.predicate)
    .select(['target.slug', 'target.type', 'target.attributes'])
    .orderBy('target.pagerank')
    .orderBy('target.slug')
    .limit(10)
    .execute()
  return <div className="flex flex-col overflow-auto">
    {items.map(item =>
      <a key={item.slug} className="ml-2" href={`/data/search2/entity/${item.type}/${item.slug}`}>{JSON.stringify({ '@type': item.type, ...item.attributes as object })}</a>
    )}
  </div>
}

async function Children(props: { id: string, predicate: string }) {
  const items = await db
    // IDEA -- if we have neighbors in the json we can use a gin index to find
    // .selectFrom('pdp.entity_complete as source')
    // .where('source.entity', '<@', JSON.stringify({ [props.predicate]: { '@id': props.id } }))
    .selectFrom('pdp.edge as e')
    .innerJoin('pdp.entity as source', j => j.onRef('source.id', '=', 'e.source_id'))
    .where('e.target_id', '=', props.id)
    .where('e.predicate', '=', props.predicate)
    .select(['source.slug', 'source.type', 'source.attributes'])
    .orderBy('source.pagerank')
    .orderBy('source.slug')
    .limit(10)
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
