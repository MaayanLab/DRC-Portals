-- parallel queries require too much memory, disable them
alter database drc set max_parallel_workers to 0;
-- time out statements which take too long
alter database drc set statement_timeout = '120s';