import { db } from "@/lib/kysely";
import { estimate_count } from "@/lib/kysely/utils";

export default async function EntityListPage({ params }: { params: { type: string } }) {
  const q = db
  .selectFrom('pdp.entity')
  .select(['slug', 'type', 'attributes'])
  .where('type', '=', params.type)
  const preciseCount = await estimate_count(q.limit(100))
  const approxCount = await estimate_count(q)
  const items = await q
    .orderBy('pagerank desc')
    .limit(10)
    .execute()
  return <div className="flex flex-col gap-2">
    {JSON.stringify({ preciseCount, approxCount })}
    {items.map(item =>
      <a key={item.slug} href={`/data/search2/entity/${item.type}/${item.slug}`}>{JSON.stringify({ '@type': item.type, ...item.attributes as object })}</a>
    )}
  </div>
}
