import { Selectable, sql } from "kysely";
import { DB } from "kysely-codegen";

/**
 * This is a much faster select distinct
 * https://wiki.postgresql.org/wiki/Loose_indexscan
 */
export function select_distinct_loose_indexscan<TB extends keyof DB, CB extends keyof Selectable<DB[TB]>>(table: TB, column: CB) {
  return sql<{ [k in CB]: Selectable<DB[TB]>[CB] }>`
    WITH RECURSIVE t AS (
      (SELECT ${sql.raw(column as string)} as "value" FROM ${sql.table(table)} ORDER BY value LIMIT 1)
    UNION ALL
      SELECT (SELECT ${sql.raw(column as string)} as "value" FROM ${sql.table(table)} WHERE ${sql.raw(column as string)} > t.value ORDER BY value LIMIT 1)
      FROM t
      WHERE t.value IS NOT NULL
    )
    SELECT value as ${sql.raw(column as string)}
    FROM t
    WHERE value IS NOT NULL;
  `
}
