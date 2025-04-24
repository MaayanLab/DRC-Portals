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
CREATE TABLE c2m2.id_namespace_dcc_id (id_namespace_id varchar NOT NULL, dcc_id varchar NOT NULL, 
    dcc_short_label varchar NOT NULL, PRIMARY KEY(id_namespace_id));

INSERT INTO c2m2.id_namespace_dcc_id (id_namespace_id, dcc_id, dcc_short_label)
VALUES 
 ('https://data.4dnucleome.org', 'cfde_registry_dcc:4dn', '4DN'),
 ('ERCC-exRNA', 'cfde_registry_dcc:exrna', 'ExRNA'),
 ('adult_gtex', 'cfde_registry_dcc:gtex', 'GTEx'),
 ('egtex', 'cfde_registry_dcc:gtex', 'GTEx'),
 ('gtex', 'cfde_registry_dcc:gtex', 'GTEx'),
 ('https://www.data.glygen.org/', 'cfde_registry_dcc:glygen', 'GlyGen'),
 ('tag:hmpdacc.org,2022-04-04:', 'cfde_registry_dcc:hmp', 'HMP'),
 --- ('tag:hubmapconsortium.org,2023:', 'cfde_registry_dcc:hubmap', 'HuBMAP'),
 ('tag:hubmapconsortium.org,2024:', 'cfde_registry_dcc:hubmap', 'HuBMAP'),
 ('https://druggablegenome.net/cfde_idg_drugcentral_drugs', 'cfde_registry_dcc:idg', 'IDG'),
 ('https://druggablegenome.net/cfde_idg_tcrd_diseases', 'cfde_registry_dcc:idg', 'IDG'),
 ('https://druggablegenome.net/cfde_idg_tcrd_targets', 'cfde_registry_dcc:idg', 'IDG'),
 ('https://www.druggablegenome.net/', 'cfde_registry_dcc:idg', 'IDG'),
 ('kidsfirst:', 'cfde_registry_dcc:kidsfirst', 'KidsFirst'),
 ('https://www.lincsproject.org/', 'cfde_registry_dcc:lincs', 'LINCS'),
 ('https://www.metabolomicsworkbench.org/', 'cfde_registry_dcc:metabolomics', 'Metabolomics'),
 ('tag:motrpac-data.org,2023:', 'cfde_registry_dcc:motrpac', 'MoTrPAC'),
 ('SPARC.collection:', 'cfde_registry_dcc:sparc', 'SPARC'),
 ('SPARC.file:', 'cfde_registry_dcc:sparc', 'SPARC'),
 ('SPARC.project:', 'cfde_registry_dcc:sparc', 'SPARC'),
 ('SPARC.sample:', 'cfde_registry_dcc:sparc', 'SPARC'),
 ('SPARC.subject:', 'cfde_registry_dcc:sparc', 'SPARC'),
 ('SPARC:', 'cfde_registry_dcc:sparc', 'SPARC'),
--- ('tag:sennetconsortium.org,2024:', 'cfde_registry_dcc:sennet', 'SenNet')
 ('tag:sennetconsortium.org,2025:', 'cfde_registry_dcc:sennet', 'SenNet')
;

/* add the constraint */
/* ALTER TABLE table_name DROP CONSTRAINT IF EXISTS constraint_name;*/
ALTER TABLE c2m2.id_namespace_dcc_id DROP CONSTRAINT IF EXISTS fk_id_namespace_dcc_id_id_namespace_1;
ALTER TABLE c2m2.id_namespace_dcc_id ADD CONSTRAINT  fk_id_namespace_dcc_id_id_namespace_1 FOREIGN KEY (id_namespace_id) REFERENCES c2m2.id_namespace (id);
ALTER TABLE c2m2.id_namespace_dcc_id DROP CONSTRAINT IF EXISTS fk_id_namespace_dcc_id_dcc_1;
ALTER TABLE c2m2.id_namespace_dcc_id ADD CONSTRAINT  fk_id_namespace_dcc_id_dcc_1 FOREIGN KEY (dcc_id) REFERENCES c2m2.dcc (id);
--- Added after adding column dcc_short_label. Based on: 
--- select id,label,short_label,cf_site from public.dccs;
--- select id,dcc_name,dcc_abbreviation,project_local_id from c2m2.dcc;
--- This gives error: there is no unique constraint matching given keys for referenced table "dccs"
--- Solution: ALTER TABLE public.dccs ADD CONSTRAINT unique_short_label UNIQUE (short_label);
--- Do not impose for now.
/* ALTER TABLE c2m2.id_namespace_dcc_id DROP CONSTRAINT IF EXISTS fk_id_namespace_dcc_id_short_label_1;
ALTER TABLE c2m2.id_namespace_dcc_id ADD CONSTRAINT  fk_id_namespace_dcc_id_short_label_1 FOREIGN KEY (dcc_short_label) REFERENCES public.dccs (short_label);
*/

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
