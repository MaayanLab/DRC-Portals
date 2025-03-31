import { defineConfig } from 'kysely-ctl'
import { db } from './lib/kysely'

export default defineConfig({
	kysely: db,
	migrations: {
		migrationFolder: "kysely/migrations",
	},
})
