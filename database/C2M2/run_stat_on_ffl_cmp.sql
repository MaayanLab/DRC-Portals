set statement_timeout = 0;

/*

\i run_stat_on_ffl_cmp.sql

OR, directly specify the sql file name in psql command:

psql -h localhost -U drc -d drc -p [5432|5433] -a -f run_stat_on_ffl_cmp.sql

OR, as in README.md

logf=${logdir}/log_run_stat_on_ffl_cmp.log
date_div >> ${logf};
psql "$(python3 dburl.py)" -a -f run_stat_on_ffl_cmp.sql -o ${logf}
date_div >> ${logf};

*/

/* To find out which words appar the most if searched using websearch_to_tsquery */

-- 1. Drop the table if it already exists to ensure a clean run.
DROP TABLE IF EXISTS c2m2.ts_stat_ffl_cmp;

-- 2. Create the standard table (c2m2.ts_stat_ffl_cmp) and populate it
-- with the results of the slow ts_stat query.
-- NOTE: This step is synchronous and will be slow (several minutes) on 6M rows.
CREATE TABLE c2m2.ts_stat_ffl_cmp AS
SELECT
    word,
    ndoc,
    -- Calculate the percentage of the total table rows that contain this word.
    ndoc * 100.0 / (SELECT COUNT(*) FROM c2m2.ffl_biosample_collection_cmp) AS percentage_of_rows
FROM
    -- Run ts_stat over the 'searchable' column of your full-text search table.
    ts_stat('SELECT searchable FROM c2m2.ffl_biosample_collection_cmp')
ORDER BY
    ndoc DESC;

-- 3. Add a unique index (primary key) on the new table for fast querying.
-- This ensures that querying the table by 'word' or 'ndoc' is fast after creation.
ALTER TABLE c2m2.ts_stat_ffl_cmp
    ADD CONSTRAINT ts_stat_ffl_cmp_pkey PRIMARY KEY (word);


-- 4. Print header and query the new table for the top 50 slow terms (INSTANTANEOUS)
-- Use this SELECT statement for your ongoing analysis.
\echo '--- ANALYSIS COMPLETE: TOP 50 MOST FREQUENT SEARCH TERMS ---'

SELECT
    word,
    ndoc,
    percentage_of_rows
FROM
    c2m2.ts_stat_ffl_cmp
ORDER BY
    ndoc DESC
LIMIT 100;

-- TO REFRESH THE DATA:
-- To update the statistics in this table, you will need to manually
-- delete all existing rows and re-run the CREATE TABLE AS SELECT
-- (or use an INSERT INTO ... SELECT if the table structure is pre-defined).
