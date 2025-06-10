import { db } from '@/lib/kysely'
import { count, estimate_count, select_distinct_loose_indexscan } from '@/lib/kysely/utils'
import { QueryCreator, sql } from 'kysely'
import { DB } from 'kysely-codegen'

/**
 * estimate how many results the fts search yields
 */
export async function search_entity_instant_estimate(search: string) {
  return await estimate_count(db
    .selectFrom('pdp.entity_complete')
    .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
  )
}

export async function search_entity_partial_exact(search: string, limit: number, cursor?: { pagerank: string, slug: string }) {
  return Number(await count(db
    .selectFrom('pdp.entity_complete')
    .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
    .select('id')
    .$if(cursor !== undefined, qb => {
      if (!cursor) return qb
      return qb.where('pagerank', '<', cursor.pagerank).where('slug', '>', cursor.slug)
    })
    .limit(limit)
  ))
}

/**
 * When the fts index does not sufficiently reduce the results, we should use the order by index and filter by fts
 */
function search_entity_v1(db: QueryCreator<DB>, search: string) {
  return db
    .selectFrom('pdp._entity as search_entity')
    .where('search_entity.searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
    .orderBy('search_entity.pagerank desc')
    .orderBy('search_entity.slug asc')
}

/**
 * When the fts index does not sufficiently reduce the results, we should use the order by index and filter by fts
 */
function search_entity_complete_v1(db: QueryCreator<DB>, search: string) {
  return db
    .selectFrom('pdp.entity_complete as search_entity')
    .where('search_entity.searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
    .orderBy('search_entity.pagerank desc')
    .orderBy('search_entity.slug asc')
}

/**
 * When the fts index can sufficiently reduce the results, we should use it and order by in memory
 */
function search_entity_v2(db: QueryCreator<DB>, search: string) {
  return db
    .with('search_entity_filtered', q => q
      .selectFrom('pdp._entity')
      .select(['id', 'pagerank', 'slug'])
      .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
      .offset(sql`0`)
    )
    .selectFrom('search_entity_filtered as search_entity')
    .orderBy('search_entity.pagerank desc')
    .orderBy('search_entity.slug asc')
}

/**
 * When the fts index can sufficiently reduce the results, we should use it and order by in memory
 */
function search_entity_complete_v2(db: QueryCreator<DB>, search: string) {
  return db
    .with('search_entity_filtered', q => q
      .selectFrom('pdp.entity_complete')
      .selectAll()
      .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
      .offset(sql`0`)
    )
    .selectFrom('search_entity_filtered as search_entity')
    .orderBy('search_entity.pagerank desc')
    .orderBy('search_entity.slug asc')
}

/**
 * choose the search method based on count estimate
 */
export function search_entity(db: QueryCreator<DB>, search: string, estimate: number) {
  if (estimate < 1000) {
    return search_entity_complete_v2(db, search)
  } else {
    return search_entity_complete_v1(db, search)
  }
}

export function search_entity_complete(db: QueryCreator<DB>, search: string, estimate: number) {
  if (estimate < 1000) {
    return search_entity_complete_v2(db, search)
  } else {
    return search_entity_complete_v1(db, search)
  }
}
export async function search_entity_filters(db: QueryCreator<DB>, search: string, estimate: number) {
  const predicate_types = [
    // { predicate: 'disease', parent_type: 'disease' },
    // { predicate: 'species', parent_type: 'species' },
    // { predicate: 'anatomy', parent_type: 'anatomy' },
    // { predicate: 'gene', parent_type: 'gene' },
    // { predicate: 'protein', parent_type: 'protein' },
    // { predicate: 'compound', parent_type: 'compound' },
    { predicate: 'data_type', parent_type: 'data_type' },
    { predicate: 'assay_type', parent_type: 'assay_type' },
    { predicate: 'id_namespace', parent_type: 'id_namespace' },
  ]
  const searchPredicates = await Promise.all(
    predicate_types
      .map(async ({ predicate, parent_type }) => {
        const parents = await db.selectFrom('pdp.entity')
          .where('type', '=', parent_type)
          .select('slug')
          .select('attributes')
          .execute()
        const filters = await Promise.all(parents.map(async (parent) => {
          const q = search_entity_complete(db, search, estimate)
            .clearOrderBy()
            .select('search_entity.id')
            .where('entity', '@>', {[predicate]: { '@type': parent_type, '@id': parent.slug }})
          return {
            entity: {
              '@type': parent_type,
              '@id': parent.slug,
              ...parent.attributes as object,
            },
            count: await count(q.limit(sql`100`)),
            estimate: await estimate_count(q),
          }
        }))
        filters.sort((a, b) => Math.max(b.estimate, Number(b.count)) - Math.max(a.estimate, Number(a.count)))
        return {
          predicate,
          parent_type,
          filters
        }
      })
  )
  return searchPredicates.map(({ filters, ...rest }) => ({ ...rest, filters: filters.filter(({ count }) => Number(count) > 0) }))
  // return await db
  //   .with('predicate_counts', w => w
  //     .selectFrom('pdp.edge as e')
  //     .where('e.source_id', 'in', s =>
  //       search_entity(s as any, search, estimate)
  //         .select('id')
  //         .clearOrderBy()
  //     )
  //     .groupBy(['e.predicate', 'target_id'])
  //     .select(['e.predicate', 'target_id', s => s.fn.count('e.source_id').as('count')])
  //     .orderBy('count desc')
  //     .having(s=>s.fn.count('e.source_id'), '>', 1)
  //   )
  //   .selectFrom('predicate_counts as pc')
  //   .innerJoin('pdp.entity as target', 'target.id', 'pc.target_id')
  //   .select('pc.predicate')
  //   .select('pc.count')
  //   .select('target.type')
  //   .select(sql<string>`target.attributes->>'name'`.as('name'))
  //   .execute()
}

export async function getParentTypeCounts(source_id: string) {
  const parentPredicates = await select_distinct_loose_indexscan(db
    .selectFrom('pdp._edge as e')
    .select('e.predicate as value')
    .where('e.source_id', '=', source_id)
    .orderBy('e.predicate')
  )
  return await Promise.all(parentPredicates.map(async ({ value: predicate }) => {
    const q = db
      .selectFrom('pdp.edge as e')
      .where('e.source_id','=',source_id)
      .where('e.predicate', '=', predicate)
      .select('e.target_id')
    return {
      predicate,
      count: await count(q.limit(sql`100`)),
      estimate: await estimate_count(q),
    }
  }))
}

export async function getChildTypeCounts(target_id: string) {
  const childPredicates = await select_distinct_loose_indexscan(db
    .selectFrom('pdp._edge as e')
    .select('e.predicate as value')
    .where('e.target_id', '=', target_id)
    .orderBy('e.predicate')
  )
  return await Promise.all(childPredicates.map(async ({ value: predicate }) => {
    const q = db
      .selectFrom('pdp.edge as e')
      .where('e.target_id','=',target_id)
      .where('e.predicate', '=', predicate)
      .select('e.source_id')
    return {
      predicate,
      count: await count(q.limit(sql`100`)),
      estimate: await estimate_count(q),
    }
  }))
}
