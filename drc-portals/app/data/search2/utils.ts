import { db } from '@/lib/kysely'
import { CommonTableExpressionNode, QueryCreator, Selectable, sql } from 'kysely'
import { DB } from 'kysely-codegen'

/**
 * estimate how many results the fts search yields
 */
async function search_entity_instant_estimate(search: string) {
  const { rows } = await sql<{ 'QUERY PLAN': { Plan: { 'Plan Rows': number } }[] }>`EXPLAIN (FORMAT JSON) select * from pdp.entity where searchable @@ websearch_to_tsquery('english', ${search})`.execute(db)
  return rows[0]['QUERY PLAN'][0]['Plan']['Plan Rows']
}

async function search_entity_quick_estimate(search: string) {
  const { rows: [{count}] } = await sql<{ count: string | number }>`select count(id) from pdp.entity where searchable @@ websearch_to_tsquery('english', ${search}) limit 100`.execute(db)
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

export async function search_entity_filters(search: string) {
  sql`
    explain analyze
    select source_predicate_target_count.predicate, sum(source_predicate_target_count.source_count)
    from (
      select target.id
      from pdp.entity target
      where target.searchable @@ websearch_to_tsquery('english', 'project')
    ) target inner join (
      select e.target_id, e.predicate, count(e.source_id) as source_count
      from pdp.edge e
      group by e.target_id, e.predicate
    ) source_predicate_target_count on source_predicate_target_count.target_id = target.id
    group by source_predicate_target_count.predicate
  `.execute(db)
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
