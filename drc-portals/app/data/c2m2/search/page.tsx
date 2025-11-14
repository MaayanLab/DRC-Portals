
import { redirect } from 'next/navigation';

export default async function Page() {
  redirect('/data/c2m2')
}

/* 
 Code to compute query time at the DB level
SELECT total_time FROM pg_stat_statements WHERE query = 'SELECT * c2m2.project limit 5';
--- ERROR:  relation "pg_stat_statements" does not exist
--- Will need to include some modules: server restart is needed: https://www.postgresql.org/docs/current/pgstatstatements.html

--- On psql:
EXPLAIN (ANALYZE) SELECT * from c2m2.project limit 5;
--- See example in the file database/example_query_biosample.sql
--- It turns out that in psql, even the full CTE/query is taking only about 3-4 seconds. Why it shows here as ~22 seconds


*/
