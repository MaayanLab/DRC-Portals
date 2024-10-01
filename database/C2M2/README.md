## Setting up C2M2 Database

```bash
# I did: [mano@sc-cfdewebdev prisma]$ git clone https://github.com/MaayanLab/DRC-Portals.git DRC-Portals
# while being in /home/mano/DRC/DRC-Portals-20240404 then copied
#[mano@sc-cfdewebdev migrations]$ pwd
#/home/mano/DRC/DRC-Portals-20240404/DRC-Portals/drc-portals/prisma/migrations
#[mano@sc-cfdewebdev migrations]$ #cp -R * ../../../../../DRC-Portals/drc-portals/prisma/migrations/.
#[mano@sc-cfdewebdev migrations]$ cd ..
#[mano@sc-cfdewebdev prisma]$ pwd
#/home/mano/DRC/DRC-Portals-20240404/DRC-Portals/drc-portals/prisma
#[mano@sc-cfdewebdev prisma]$ #cp schema.prisma ../../../../DRC-Portals/drc-portals/prisma/.
#[mano@sc-cfdewebdev prisma]$ 

# Be in the folder database/C2M2

# If ingesting to the dedicated DB server DB, set server_label to dbserver_ (e.g.: server_label=dbserver_), else to null/empty
server_label=
#server_label=_dbserver

# Uncomment one from below for env_file_name; not utilizing actively since .py files other than dburl.py have not been edited for this
env_file_name=.env
#env_file_name=.env_pgcontainer

# logdir should not have any spaces
logdir=log${server_label}
mkdir -p ${logdir}

# id_namespace_dcc_id should be created after the core c2m2 tables have been created, because the py script to ingest into c2m2 deletes and recreates the c2m2 schema.
#NOT here: # psql "$(python3 dburl.py)" -a -f create_id_namespace_dcc_id.sql -o ${logdir}/log_create_id_namespace_dcc_id.log

# Before ingesting, do a quick check to see from how many DCCs, c2m2 files will be ingested, by checking for current and deleted
# linux bash command after downloding DccAssets.tsv to some folder:
#grep C2M2 DccAssets.tsv |egrep -e "https.*zip.*202.*True.*-.*-.*-.*-"|awk '/False\t202/'

# To ingest the c2m2 tables from files submitted by DCCs
mkdir -p ${logdir}
python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/C2M2_ingestion_${ymd}.log; ${python_cmd} populateC2M2FromS3.py 2>&1 | tee ${logf}
# Check for any warning or errors
egrep -i -e "Warning" ${logf} > ${logdir}/warning_in_schemaC2M2_ingestion_${ymd}.log; 
egrep -i -e "Error" ${logf} > ${logdir}/error_in_schemaC2M2_ingestion_${ymd}.log;

# Script to add a table called id_namespace_dcc_id with two columns id_namespace_id and dcc_id to link the tables id_namespace and dcc. This script needs to updated when a new DCC joins or an existing DCC adds a new id_namespace. It will be better to alter the existing table id_namespace.tsv to add a column called dcc_id (add/adjust foreign constraint too). This script can be run as (upon starting psql shell, or equivalent command):
# \i create_id_namespace_dcc_id.sql
# OR, directly specify the sql file name in psql command:
psql "$(python3 dburl.py)" -a -f create_id_namespace_dcc_id.sql -o ${logdir}/log_create_id_namespace_dcc_id.log

# To ingest controlled vocabulary files into c2m2 schema
# on psql prompt while being in database folder: \i ingest_CV.sql
# on bash prompt : psql -h localhost -U drc -d drc -a -f ingest_CV.sql # this may prompt for DB password if not stored in ~/.pgpass file (permission 600)
#psql -h localhost -U drc -d drc -p [5432|5433] -a -f ingest_CV.sql
#psql -h sc-cfdedbdev.sdsc.edu -v ON_ERROR_STOP=1 -U drcadmin -d drc -p 5432 -a -f ingest_CV.sql -o ${logdir}/log_ingest_CV.log
psql "$(python3 dburl.py)" -a -f ingest_CV.sql -o ${logdir}/log_ingest_CV.log
# To be added if needed: using python script: I am using \COPY inside the sql file, so
# with self.connection as cursor: cursor.executescript(open("ingest_CV.sql", "r").read())
# will not work unless absolute path for the source tsv file is used.

# If ingesting files from only one DCC (e.g., into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
dcc_short=Metabolomics; python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/C2M2_ingestion_${dcc_short}_${ymd}.log; ${python_cmd} populateC2M2FromS3.py ${dcc_short} ${logdir} 2>&1 | tee ${logf}
egrep -i -e "Warning" ${logf} ; egrep -i -e "Error" ${logf} ;
# To run it for all DCCs in one go (i.e., put tables from respectives DCCs into a schema by that DCC's name), run the linux shell script:
chmod ug+x call_populateC2M2FromS3_DCCnameASschema.sh
python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir}
# For 1 DCC or a few DCCs, call syntax is, as an example:
DCC1=Metabolomics
DCC2=4DN
python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir} ${DCC1} ${DCC2}
# Example: For June 2024
python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir} 4DN GlyGen HuBMAP KidsFirst Metabolomics SPARC
# The above run provides additional instructions at the end for more crosschecks 
# between data in tables in the c2m2 schema and the tables in the DCC-name-specific schema.

# If there is a need to to remove .0 from columns size_in_bytes and uncompressed_size_in_bytes 
# of file tables of various schema: the script populateC2M2FromS3.py has been updated to address this.
# However, to do it in psql, run the script rem_decimal_file_size_in_bytes_column.sql after editing suitably, using
# on psql prompt: \i rem_decimal_file_size_in_bytes_column.sql
# OR, directly specify the sql file name in psql command:
# psql -h localhost -U drc -d drc -p [5432|5433] -a -f rem_decimal_file_size_in_bytes_column.sql

# Other c2m2 related sql scripts
psql "$(python3 dburl.py)" -a -f c2m2_other_tables.sql -o ${logdir}/log_c2m2_other_tables.log
#psql "$(python3 dburl.py ${env_file_name})" -a -f c2m2_other_tables.sql -o ${logdir}/log_c2m2_other_tables.log

# After ingesting c2m2 files, create the table ffl_biosample by running (be in the database/C2M2 folder)
# ffl_biosample needs project_data_type, so, run c2m2_other_tables.sql first
psql "$(python3 dburl.py)" -a -f biosample_fully_flattened_allin1.sql;
# A version without biosample ID and related, in an effort to lower the number of rows in the main table being searched
# *.sql and *_cmp.sql can be run in parallel
psql "$(python3 dburl.py)" -a -f biosample_fully_flattened_allin1_cmp.sql;

# Also generate c2m2.ffl_collection [can be run in parallel to generatingc2m2.ffl_biosample]
psql "$(python3 dburl.py)" -a -f collection_fully_flattened_allin1.sql;
psql "$(python3 dburl.py)" -f collection_fully_flattened_allin1_cmp.sql;

# Combine c2m2.ffl_biosample and c2m2.ffl_collection to create c2m2.ffl_biosample_collection
psql "$(python3 dburl.py)" -a -f c2m2_combine_biosample_collection.sql -o ${logdir}/log_c2m2_combine_bios_col.log
psql "$(python3 dburl.py)" -a -f c2m2_combine_biosample_collection_cmp.sql -o ${logdir}/log_c2m2_combine_bios_col_cmp.log

# If the tables look good, one can delete the intermediate tables using psql (if write acesss):
#DROP TABLE IF EXISTS c2m2.ffl_biosample; DROP TABLE IF EXISTS c2m2.ffl_biosample_cmp; DROP TABLE IF EXISTS c2m2.ffl_collection; DROP TABLE IF EXISTS c2m2.ffl_collection_cmp;

# Ingest slim (and associated ontology) tables into a schema called 'slim', because c2m2 also has tables like anatomy, disease etc., which is likely to be a much smaller subset of the corresponding tables in the slim schema.
# The sql file is ingest_slim.sql, autogenerated by the shell script gen_ingest_slim_script.sh
# There is also the table dbgap_study_id.tsv ; for now, it will be in slim schema, if needed later, can be put in a schema called dbgap.
./gen_ingest_slim_script.sh ingest_slim.sql
psql "$(python3 dburl.py)" -a -f ingest_slim.sql -o ${logdir}/log_ingest_slim.log

# In the table c2m2.file, add the column access_url
psql "$(python3 dburl.py)" -a -f create_access_urls.sql -o ${logdir}/log_create_access_urls.log

#-------------------------------------------------------------------------------------------------------
# *ONLY* After the tables c2m2.ffl_biosample_collection and c2m2.ffl_biosample_collection_cmp are generated and well tested, the intermediate ffl tables can be dropped.
#psql "$(python3 dburl.py)" -a -f drop_intermediate_ffl_tables.sql

#-------------------------------------------------------------------------------------------------------
# *ONLY* to copy the updated tables (e.g. after new ingest) to another server
# As of now, user1 and user2 on the two hosts, respectively are hard-coded as drcadmin and drc or drcadmin and drcadmin, so only intended for use by Mano. Others can run after altering these values suitably.
# Also, these will work only if ~/.pgpass has suitable lines for psql auth added.
host1=sc-cfdedb.sdsc.edu; host2=localhost; dbname=drc; sch=Metabolomics;
# Example of 
ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh ${host1} ${host2} ${dbname} ${logdir} ${sch} > \
main_pg_dump_log_${ymd}.log 2>&1
#-------------------------------------------------------------------------------------------------------


# .. and other scripts above
```