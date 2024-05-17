alter table c2m2.file add access_url varchar default '';
update c2m2.file set access_url = (
  case
    when persistent_id ~* '^(s3|gs|ftp|gsiftp|globus|htsget|drs)://' then persistent_id
    when persistent_id ~* '^https?://([^/]+)/(.+?)\.([^\./]+)$' then persistent_id
    else ''
  end
);

/*

Note: These cases give examples where persistent_id is like URL but not that of a file with some extension, 
so access_url is ''. This is correct behavior. May be in some OWG meeting, we can mention about it in the 
context of distinction between persistent_id and access_url.

drc=# select local_id,persistent_id, access_url from c2m2.file where persistent_id != access_url and id_namespace ilike '%lincs%' limit 10;
-[ RECORD 1 ]-+----------------------------------------------
local_id      | MDD_RPPA_Level3
persistent_id | https://www.synapse.org/#!Synapse:syn12555331
access_url    | 

drc=# select local_id,persistent_id, access_url from c2m2.file where persistent_id ilike 'http%' and id_namespace ilike 'SPARC.file:' limit 2;
-[ RECORD 1 ]-+-------------------------------------------------------------------------------------
local_id      | package:67ef4497-a969-41e4-b8df-43325fbf51cb
persistent_id | https://discover.pennsieve.io/package/N:package:67ef4497-a969-41e4-b8df-43325fbf51cb
access_url    | 
-[ RECORD 2 ]-+-------------------------------------------------------------------------------------
local_id      | package:67f65835-8e87-4b42-8cc2-8b7ba91d08c2
persistent_id | https://discover.pennsieve.io/package/N:package:67f65835-8e87-4b42-8cc2-8b7ba91d08c2
access_url    | 

Some other queries:
drc=# select id_namespace,count(*) from c2m2.file where persistent_id ilike 'drs://%' group by id_namespace;
drc=# select id_namespace,count(*) from c2m2.file where access_url ilike 'drs://%' group by id_namespace;
drc=# select id_namespace,count(*) from c2m2.file where access_url ilike 'http%://%' group by id_namespace;
drc=# select id_namespace,count(*) from c2m2.file where persistent_id ilike 'http%://%' group by id_namespace;

This is how I noticed the difference in the counts.
*/
