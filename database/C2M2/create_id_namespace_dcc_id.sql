set statement_timeout = 0;
/*
Script to add a table called id_namespace_dcc_id with two columns id_namespace_id and dcc_id to link the tables id_namespace and dcc.
This script needs to updated when a new DCC joins or an existing DCC adds a new id_namespace. It will be better to alter the existing 
table id_namespace.tsv to add a column called dcc_id (add/adjust foreign constraint too).
This script can be run as (upon starting psql shell, or equivalent command):
\i create_id_namespace_dcc_id.sql
OR, directly specify the sql file name in psql command:
psql -h localhost -U drc -d drc -p [5432|5433] -a -f create_id_namespace_dcc_id.sql
psql -h localhost -U drc -d drc -p [5432|5433] -a -f create_id_namespace_dcc_id.sql -o log/log_create_id_namespace_dcc_id.log

*/

DROP TABLE IF EXISTS c2m2.id_namespace_dcc_id RESTRICT;
CREATE TABLE c2m2.id_namespace_dcc_id (id_namespace_id varchar NOT NULL, dcc_id varchar NOT NULL, PRIMARY KEY(id_namespace_id));

INSERT INTO c2m2.id_namespace_dcc_id (id_namespace_id, dcc_id)
VALUES 
 ('https://data.4dnucleome.org', 'cfde_registry_dcc:4dn'),
 ('ERCC-exRNA', 'cfde_registry_dcc:exrna'),
 ('adult_gtex', 'cfde_registry_dcc:gtex'),
 ('egtex', 'cfde_registry_dcc:gtex'),
 ('gtex', 'cfde_registry_dcc:gtex'),
 ('https://www.data.glygen.org/', 'cfde_registry_dcc:glygen'),
 ('tag:hmpdacc.org,2022-04-04:', 'cfde_registry_dcc:hmp'),
 ('tag:hubmapconsortium.org,2023:', 'cfde_registry_dcc:hubmap'),
 ('https://druggablegenome.net/cfde_idg_drugcentral_drugs', 'cfde_registry_dcc:idg'),
 ('https://druggablegenome.net/cfde_idg_tcrd_diseases', 'cfde_registry_dcc:idg'),
 ('https://druggablegenome.net/cfde_idg_tcrd_targets', 'cfde_registry_dcc:idg'),
 ('https://www.druggablegenome.net/', 'cfde_registry_dcc:idg'),
 ('kidsfirst:', 'cfde_registry_dcc:kidsfirst'),
 ('https://www.lincsproject.org/', 'cfde_registry_dcc:lincs'),
 ('https://www.metabolomicsworkbench.org/', 'cfde_registry_dcc:metabolomics'),
 ('tag:motrpac-data.org,2023:', 'cfde_registry_dcc:motrpac'),
 ('SPARC.collection:', 'cfde_registry_dcc:sparc'),
 ('SPARC.file:', 'cfde_registry_dcc:sparc'),
 ('SPARC.project:', 'cfde_registry_dcc:sparc'),
 ('SPARC.sample:', 'cfde_registry_dcc:sparc'),
 ('SPARC.subject:', 'cfde_registry_dcc:sparc'),
 ('SPARC:', 'cfde_registry_dcc:sparc')
;

/* add the constraint */
/* ALTER TABLE table_name DROP CONSTRAINT IF EXISTS constraint_name;*/
ALTER TABLE c2m2.id_namespace_dcc_id DROP CONSTRAINT IF EXISTS fk_id_namespace_dcc_id_id_namespace_1;
ALTER TABLE c2m2.id_namespace_dcc_id ADD CONSTRAINT  fk_id_namespace_dcc_id_id_namespace_1 FOREIGN KEY (id_namespace_id) REFERENCES c2m2.id_namespace (id);
ALTER TABLE c2m2.id_namespace_dcc_id DROP CONSTRAINT IF EXISTS fk_id_namespace_dcc_id_dcc_1;
ALTER TABLE c2m2.id_namespace_dcc_id ADD CONSTRAINT  fk_id_namespace_dcc_id_dcc_1 FOREIGN KEY (dcc_id) REFERENCES c2m2.dcc (id);


/*  select id from c2m2.dcc;
 cfde_registry_dcc:4dn
 cfde_registry_dcc:exrna
 cfde_registry_dcc:gtex
 cfde_registry_dcc:glygen
 cfde_registry_dcc:hmp
 cfde_registry_dcc:hubmap
 cfde_registry_dcc:idg
 cfde_registry_dcc:kidsfirst
 cfde_registry_dcc:lincs
 cfde_registry_dcc:metabolomics
 cfde_registry_dcc:motrpac
 cfde_registry_dcc:sparc
*/

/* Part of the above code, e.g., id_namespace_id values related texts were generated using:
select concat_ws('', '(''', id, ''', ' , '''''),') from c2m2.id_namespace ;
*/
