set statement_timeout = 0;
set max_parallel_workers to 4;

-- Connect to DB as a user with write permissions

/*
To sanitize the C2M2 tables by deleting records with matching keywords

\i sanitize_C2M2_ffl_tables_for_keywords.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f sanitize_C2M2_ffl_tables_for_keywords.sql
OR,
date_div() { echo "============= $(date) =============";}
logf=${logdir}/log_sanitize_C2M2_ffl_tables_for_keywords.log
psql "$(python3 dburl.py)" -a -f sanitize_C2M2_ffl_tables_for_keywords.sql -L ${logf};
date_div >> ${logf};
*/

---/*

DO $$
DECLARE
    drop_specific_rows_from_c2M2_tables INT := 1;
BEGIN
    IF drop_specific_rows_from_c2M2_tables > 0 THEN
        --- BEGIN; --- Use only if running directly on psql prompt
        --- SELECT count(*) FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'sex incongru');
        DELETE FROM c2m2.ffl_biosample_collection WHERE searchable @@ websearch_to_tsquery('english', 'sex incongru');     
        DELETE FROM c2m2.ffl_biosample_collection_cmp WHERE searchable @@ websearch_to_tsquery('english', 'sex incongru');             

        --- ROLLBACK;
        --- COMMIT; --- Use only if running directly on psql prompt
    END IF;
END $$;

---*/

set max_parallel_workers to 0;
