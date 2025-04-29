import { Explainable, Expression, sql } from "kysely";
import { db } from ".";

/**
 * This is a much faster select distinct
 * https://wiki.postgresql.org/wiki/Loose_indexscan
 */
export async function select_distinct_loose_indexscan<T>(expr: Expression<{ value: T }>) {
  return await db
    .withRecursive('t', qb => qb
      .selectNoFrom(s => s
        .selectFrom(sql<{ value: string }>`${expr}`.as('tbl'))
        .select('value')
        .orderBy('value')
        .limit(1)
        .as('value')
      )
      .unionAll(qb => qb
        .selectFrom('t')
        .select(s => s
          .selectFrom(sql<{ value: string }>`${expr}`.as('tbl_r'))
          .select('value')
          .where('tbl_r.value', '>', 't.value')
          .orderBy('value')
          .limit(1)
          .as('value')
        )
        .where('t.value', 'is not', null)
      )
    )
    .selectFrom('t')
    .select('t.value')
    .where('t.value', 'is not', null)
    .execute()
}

export async function estimate_count(e: Explainable) {
  const explained = await e.explain('json')
  return explained[0]['QUERY PLAN'][0]['Plan']['Plan Rows']
}

export async function count<O extends {}>(expr: Expression<O>) {
  const { count } = await db
    .selectFrom(sql`${expr}`.as('items'))
    .select(s => s.fn.countAll().as('count'))
    .executeTakeFirstOrThrow()
  return count
}
