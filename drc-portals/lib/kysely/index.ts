import { DB } from 'kysely-codegen'
import { Pool } from 'pg'
import { Kysely, PostgresDialect } from 'kysely'
import Cursor from 'pg-cursor'

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    statement_timeout: 30000,
  }),
  cursor: Cursor,
})

export const db = new Kysely<DB>({
  dialect,
  log(evt) {
    if (process.env.NODE_ENV === 'development') {
      if (evt.queryDurationMillis > 100) {
        console.log(`kysely:query: duration: ${evt.queryDurationMillis} query: ${evt.query.sql}`)
      }
    }
  }
})

