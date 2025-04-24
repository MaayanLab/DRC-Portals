import { db } from '@/lib/kysely'
import { QueryCreator, Selectable, sql } from 'kysely'
import { DB } from 'kysely-codegen'

/**
 * estimate how many results the fts search yields
 */
export async function search_entity_instant_estimate(search: string) {
  const { rows } = await sql<{ 'QUERY PLAN': { Plan: { 'Plan Rows': number } }[] }>`EXPLAIN (FORMAT JSON) select * from pdp.entity where searchable @@ websearch_to_tsquery('english', ${search})`.execute(db)
  return rows[0]['QUERY PLAN'][0]['Plan']['Plan Rows']
}

export async function search_entity_partial_exact(search: string, limit: number, cursor?: { pagerank: string, slug: string }) {
  const { count } = await db.
    with('items', qb => qb.
      selectFrom('pdp.entity')
      .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
      .select('id')
      .$if(cursor !== undefined, qb => {
        if (!cursor) return qb
        return qb.where('pagerank', '<', cursor.pagerank).where('slug', '>', cursor.slug)
      })
      .limit(limit)
    )
    .selectFrom('items')
    .select(s => s.fn.countAll().as('count'))
    .executeTakeFirstOrThrow()
  return Number(count)
}

/**
 * When the fts index does not sufficiently reduce the results, we should use the order by index and filter by fts
 */
function search_entity_v1(db: QueryCreator<DB>, search: string) {
  return db
    .selectFrom('pdp.entity as search_entity')
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
      .selectFrom('pdp.entity')
      .selectAll()
      .where('searchable', '@@', sql<string>`websearch_to_tsquery('english', ${search})`)
      .offset(0)
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
    return search_entity_v2(db, search)
  } else {
    return search_entity_v1(db, search)
  }
}

export async function search_entity_filters(db: QueryCreator<DB>, search: string, estimate: number) {
  return await db
    .with('predicate_counts', w => w
      .selectFrom('pdp.edge as e')
      .where('e.source_id', 'in', s =>
        search_entity(s as any, search, estimate)
          .select('id')
          .clearOrderBy()
      )
      .groupBy(['e.predicate', 'target_id'])
      .select(['e.predicate', 'target_id', s => s.fn.count('e.source_id').as('count')])
      .orderBy('count desc')
      .having(s=>s.fn.count('e.source_id'), '>', 1)
    )
    .selectFrom('predicate_counts as pc')
    .innerJoin('pdp.entity as target', 'target.id', 'pc.target_id')
    .select('pc.predicate')
    .select('pc.count')
    .select('target.type')
    .select(sql<string>`target.attributes->>'name'`.as('name'))
    .execute()
}

/**
 * fast select distinct predicate where source_id = entity
 */
async function entity_target_predicates(entity: string) {
  return await sql<{ 'predicate': Selectable<DB['pdp.edge']>['predicate'] }>`
    WITH RECURSIVE t AS (
      (SELECT edge.predicate FROM
        pdp.edge
        where edge.source_id = ${entity}
        ORDER BY predicate LIMIT 1)
    UNION ALL
      SELECT (SELECT edge.predicate FROM
              pdp.edge
              where edge.source_id = ${entity}
              and edge.predicate > t.predicate ORDER BY predicate LIMIT 1)
      FROM t
      WHERE t.predicate IS NOT NULL
    )
    SELECT predicate
    FROM t
    WHERE predicate IS NOT NULL
  `.execute(db)
}

/**
 * fast select distinct predicate where target_id = entity
 */
async function entity_source_predicates(entity: string) {
  // like select distinct edge.predicate from 
  return await sql<{ 'predicate': Selectable<DB['pdp.edge']>['predicate'] }>`
    WITH RECURSIVE t AS (
      (SELECT edge.predicate FROM
        pdp.edge
        where edge.target_id = ${entity}
        ORDER BY predicate LIMIT 1)
    UNION ALL
      SELECT (SELECT edge.predicate FROM
              pdp.edge
              where edge.target_id = ${entity}
              and edge.predicate > t.predicate ORDER BY predicate LIMIT 1)
      FROM t
      WHERE t.predicate IS NOT NULL
    )
    SELECT predicate
    FROM t
    WHERE predicate IS NOT NULL
  `.execute(db)
}

function entity_target(entity: string, predicate: string) {
  return db
    .selectFrom('pdp.edge')
    .innerJoin('pdp.entity', j => j.onRef('pdp.edge.target_id', '=', 'pdp.entity.id'))
    .where('pdp.edge.predicate', '=', predicate)
    .where('pdp.edge.source_id', '=', entity)
}

function entity_source(entity: string, predicate: string) {
  return db
    .selectFrom('pdp.edge')
    .innerJoin('pdp.entity', j => j.onRef('pdp.edge.source_id', '=', 'pdp.entity.id'))
    .where('pdp.edge.predicate', '=', predicate)
    .where('pdp.edge.target_id', '=', entity)
}
