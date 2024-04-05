--- Some example collection queries

select * from c2m2.collection_defined_by_project limit 5;

select distinct project_id_namespace from c2m2.collection_defined_by_project;

select project_id_namespace, count(project_local_id) from c2m2.collection_defined_by_project group by project_id_namespace;

select collection_id_namespace, project_id_namespace, count(project_local_id) from c2m2.collection_defined_by_project group by collection_id_namespace, project_id_namespace;
