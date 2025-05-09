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

# To do a quick check if each DCC has only one valid C2M2 package listed in the file ingest/DccAssets.tsv
 ./get_current_notdeleted_C2M2_list.sh ingest/DccAssets.tsv

# If ingesting to the dedicated DB server DB, set server_label to dbserver_ (e.g.: server_label=dbserver_), else to null/empty
server_label=
#server_label=_dbserver

# Uncomment one from below for env_file_name; not utilizing actively since .py files other than dburl.py have not been edited for this
env_file_name=.env
#env_file_name=.env_pgcontainer

# Take a back up of the scripts and a few other key files
# logdir should not have any spaces
logdir=log${server_label}
mkdir -p ${logdir}
ymd=$(date +%y%m%d); 
date_div=$(echo "============= `date` =============");
scripts_ran_dir=scripts_ran/scripts_${ymd}; mkdir -p ${scripts_ran_dir}; mkdir -p ${scripts_ran_dir}/ingest
cp --preserve=mode,ownership,timestamps *.sql *.py *.sh *.md ${scripts_ran_dir}/.
cp --preserve=mode,ownership,timestamps ingest/*.tsv ${scripts_ran_dir}/ingest/.

###########################
# To get the list of files and lines with specific keywords 
./extract_keyword_phrases.sh lines_from_dcc_files_with_keywords.txt lines_from_dcc_files_with_phrase_around_keywords.txt

#To replace any specific words with another words in the tsv files directly, before ingesting
logf=${logdir}/log_replace_gender_sex_women_female_in_tsvfiles.log
./replace_gender_sex_women_female_in_tsvfiles.sh ingest/c2m2s 2>&1 | tee ${logf};
echo ${date_div} >> ${logf};
./extract_keyword_phrases.sh cleaned_lines_from_dcc_files_with_keywords.txt cleaned_lines_from_dcc_files_with_phrase_around_keywords.txt
#for file in $(find ingest/c2m2s -type f -name "*.tsv"); do egrep -i -e "sex" ${file}|wc -l; done
#for file in $(find ingest/c2m2s -type f -name "*.tsv"); do egrep -i -e "gender" ${file}; done

# IMPORTANT:  See also the file CV/subject_sex*.tsv* in this regard for a deleted line in CV/subject_sex.tsv
###########################

# id_namespace_dcc_id should be created after the core c2m2 tables have been created, because the py script to ingest into c2m2 deletes and recreates the c2m2 schema.
#NOT here: # psql "$(python3 dburl.py)" -a -f create_id_namespace_dcc_id.sql -o ${logdir}/log_create_id_namespace_dcc_id.log

# Before ingesting, do a quick check to see from how many DCCs, c2m2 files will be ingested, by checking for current and deleted
# linux bash command after downloding DccAssets.tsv to some folder:
#grep C2M2 DccAssets.tsv |egrep -e "https.*zip.*202.*True.*-.*-.*-.*-"|awk '/False\t202/'

# To ingest the c2m2 tables from files submitted by DCCs
# PLEASE NOTE: During schema update, to ingest tables (some of which may have mock data),
# run a similar command while being in the SchemaUpdate folder. Ensure that the value of
# inside_C2M2_SchemaUpdate (in the file set_inside_C2M2_SchemaUpdate.py) is set 0 if in the C2M2 folder
# and to 1 if in the SchemaUpdate folder.
mkdir -p ${logdir}
date_div=$(echo "============= `date` =============");
python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/C2M2_ingestion_${ymd}.log; ${python_cmd} populateC2M2FromS3.py 2>&1 | tee ${logf} ; echo ${date_div} >> ${logf}; 
# Check for any warning or errors
egrep -i -e "Warning" ${logf} > ${logdir}/warning_in_schemaC2M2_ingestion_${ymd}.log; 
egrep -i -e "Error" ${logf} > ${logdir}/error_in_schemaC2M2_ingestion_${ymd}.log;

# If onew wanted to print the sql statements to find records or their counts with matching keywords,
# one could use the linux command: this is generally for information purposes only unless the delete 
# statements are also printed.
./gen_sql_select_count_delete_statements.sh fk_referenced_tables.txt sql_select_count_delete_keywords_statements.sql

# To sanitize the C2M2 tables by deleting records with matching keywords
date_div=$(echo "============= `date` =============");
#logf=${logdir}/log_sanitize_C2M2_tables_for_keywords_C2M2_2.log
logf=${logdir}/log_sanitize_C2M2_tables_for_keywords_ALL.log
# psql "$(python3 dburl.py)" -a -f sanitize_C2M2_tables_for_keywords.sql -L ${logf};
psql "$(python3 dburl.py)" -a -f sanitize_C2M2_tables_for_keywords.sql 2>&1 | tee ${logf};
#psql "$(python3 dburl.py)" -a -f sanitize_C2M2_tables_for_keywords.sql;
echo ${date_div} >> ${logf};

# Script to add a table called id_namespace_dcc_id with two columns id_namespace_id and dcc_id to link the tables id_namespace and dcc. This script needs to updated when a new DCC joins or an existing DCC adds a new id_namespace. It will be better to alter the existing table id_namespace.tsv to add a column called dcc_id (add/adjust foreign constraint too). This script can be run as (upon starting psql shell, or equivalent command):
# \i create_id_namespace_dcc_id.sql
# OR, directly specify the sql file name in psql command:
logf=${logdir}/log_create_id_namespace_dcc_id.log
psql "$(python3 dburl.py)" -a -f create_id_namespace_dcc_id.sql -o ${logf}
echo ${date_div} >> ${logf};

# To ingest controlled vocabulary files into c2m2 schema
# on psql prompt while being in database folder: \i ingest_CV.sql
# on bash prompt : psql -h localhost -U drc -d drc -a -f ingest_CV.sql # this may prompt for DB password if not stored in ~/.pgpass file (permission 600)
#psql -h localhost -U drc -d drc -p [5432|5433] -a -f ingest_CV.sql
#psql -h sc-cfdedbdev.sdsc.edu -v ON_ERROR_STOP=1 -U drcadmin -d drc -p 5432 -a -f ingest_CV.sql -o ${logdir}/log_ingest_CV.log
logf=${logdir}/log_ingest_CV.log
psql "$(python3 dburl.py)" -a -f ingest_CV.sql -o ${logf}
echo ${date_div} >> ${logf};
# To be added if needed: using python script: I am using \COPY inside the sql file, so
# with self.connection as cursor: cursor.executescript(open("ingest_CV.sql", "r").read())
# will not work unless absolute path for the source tsv file is used.

#------------------------------------
# This block, that deals with ingestion into Dcc-specific schema, is largely indepedent of ingests into the c2m2 schema
# If ingesting files from only one DCC (e.g., into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
dcc_short=Metabolomics; python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/C2M2_ingestion_${dcc_short}_${ymd}.log; ${python_cmd} populateC2M2FromS3.py ${dcc_short} ${logdir} 2>&1 | tee ${logf} ; echo ${date_div} >> ${logf}; 
egrep -i -e "Warning" ${logf} ; egrep -i -e "Error" ${logf} ;
# To run it for all DCCs in one go (i.e., put tables from respectives DCCs into a schema by that DCC's name), run the linux shell script:
chmod ug+x call_populateC2M2FromS3_DCCnameASschema.sh
python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir}
# For 1 DCC or a few DCCs, call syntax is, as an example:
DCC1=Metabolomics
DCC2=4DN
python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir} ${DCC1} ${DCC2}
python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir} MoTrPAC
# Example: For June 2024
#python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir} 4DN GlyGen HuBMAP KidsFirst Metabolomics SPARC
# Example: For December 2024
#python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir} SPARC GlyGen
#python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} ${logdir} GlyGen
# The above run provides additional instructions at the end for more crosschecks 
# between data in tables in the c2m2 schema and the tables in the DCC-name-specific schema.

# If there is a need to to remove .0 from columns size_in_bytes and uncompressed_size_in_bytes 
# of file tables of various schema: the script populateC2M2FromS3.py has been updated to address this.
# However, to do it in psql, run the script rem_decimal_file_size_in_bytes_column.sql after editing suitably, using
# on psql prompt: \i rem_decimal_file_size_in_bytes_column.sql
# OR, directly specify the sql file name in psql command:
# psql -h localhost -U drc -d drc -p [5432|5433] -a -f rem_decimal_file_size_in_bytes_column.sql
#------------------------------------

# Other c2m2 related sql scripts
logf=${logdir}/log_c2m2_other_tables.log
psql "$(python3 dburl.py)" -a -f c2m2_other_tables.sql -o ${logf}
echo ${date_div} >> ${logf};
#psql "$(python3 dburl.py ${env_file_name})" -a -f c2m2_other_tables.sql -o ${logdir}/log_c2m2_other_tables.log

# After ingesting c2m2 files, create the table ffl_biosample by running (be in the database/C2M2 folder)
# ffl_biosample needs project_data_type, so, run c2m2_other_tables.sql first
logf=${logdir}/log_bios_ffl.log
psql "$(python3 dburl.py)" -a -f biosample_fully_flattened_allin1.sql -L ${logf};
echo ${date_div} >> ${logf};
# Also generate c2m2.ffl_collection [can be run in parallel to generating c2m2.ffl_biosample]
logf=${logdir}/log_col_ffl.log
psql "$(python3 dburl.py)" -a -f collection_fully_flattened_allin1.sql -L ${logf};
echo ${date_div} >> ${logf};

# Combine c2m2.ffl_biosample and c2m2.ffl_collection to create c2m2.ffl_biosample_collection
logf=${logdir}/log_c2m2_combine_bios_col.log
psql "$(python3 dburl.py)" -a -f c2m2_combine_biosample_collection.sql -L ${logf}
echo ${date_div} >> ${logf};
# To save space, delete intermediate non-cmp ffl tables after c2m2.ffl_biosample_collection is ready and tested
psql "$(python3 dburl.py)" -a -f drop_intermediate_ffl_tables.sql

# A version without biosample ID and related, in an effort to lower the number of rows in the main table being searched
# *.sql and *_cmp.sql can be run in parallel
logf=${logdir}/log_bios_ffl_cmp.log
psql "$(python3 dburl.py)" -a -f biosample_fully_flattened_allin1_cmp.sql -L ${logf}
echo ${date_div} >> ${logf};
#
logf=${logdir}/log_col_ffl_cmp.log
psql "$(python3 dburl.py)" -a -f collection_fully_flattened_allin1_cmp.sql -L ${logf};
echo ${date_div} >> ${logf};

# Combine c2m2.ffl_biosample_cmp and c2m2.ffl_collection_cmp to create c2m2.ffl_biosample_collection_cmp
logf=${logdir}/log_c2m2_combine_bios_col_cmp.log
psql "$(python3 dburl.py)" -a -f c2m2_combine_biosample_collection_cmp.sql -L ${logf}
echo ${date_div} >> ${logf};
# To save space, delete intermediate cmp ffl tables after c2m2.ffl_biosample_collection_cmp is ready and tested
psql "$(python3 dburl.py)" -a -f drop_intermediate_ffl_cmp_tables.sql

# If the tables look good, one can delete the intermediate tables using psql (if write acesss):
#DROP TABLE IF EXISTS c2m2.ffl_biosample; DROP TABLE IF EXISTS c2m2.ffl_biosample_cmp; DROP TABLE IF EXISTS c2m2.ffl_collection; DROP TABLE IF EXISTS c2m2.ffl_collection_cmp;
# This is now done through sql scripts

############################################
# Had to remove one more record manually
#drc=# select count(*) from c2m2.ffl_biosample_collection where searchable @@ websearch_to_tsquery('english', 'sex incongru');
#drc=# delete from c2m2.ffl_biosample_collection where searchable @@ websearch_to_tsquery('english', 'sex incongru');     
#DELETE 1
#drc=# delete from c2m2.ffl_biosample_collection_cmp where searchable @@ websearch_to_tsquery('english', 'sex incongru');             
############################################

# Ingest slim (and associated ontology) tables into a schema called 'slim', because c2m2 also has tables like anatomy, disease etc., which is likely to be a much smaller subset of the corresponding tables in the slim schema.
# The sql file is ingest_slim.sql, autogenerated by the shell script gen_ingest_slim_script.sh
# There is also the table dbgap_study_id.tsv ; for now, it will be in slim schema, if needed later, can be put in a schema called dbgap.
./gen_ingest_slim_script.sh ingest_slim.sql
logf=${logdir}/log_ingest_slim.log
psql "$(python3 dburl.py)" -a -f ingest_slim.sql -o ${logf}
echo ${date_div} >> ${logf};

## In the table c2m2.file, add the column access_url
## Now this is already added in the C2M2 schema, so, do not run these lines. To check prefixes usied in 
## persistent_id and access_url:
## drc=# select distinct id_namespace, SPLIT_PART(persistent_id, ':', 1) as persistent_id_prefix, SPLIT_PART (access_url, ':', 1) as access_url_prefix from c2m2.file where persistent_id like '%:%' OR access_url like '%:%' limit 100;
#logf=${logdir}/log_create_access_urls.log
#psql "$(python3 dburl.py)" -a -f create_access_urls.sql -o ${logf}
#echo ${date_div} >> ${logf};

# To create additional indexes on some tables for faster query
logf=${logdir}/log_c2m2_other_indexes.log
psql "$(python3 dburl.py)" -a -f c2m2_other_indexes.sql -o ${logf}
echo ${date_div} >> ${logf};

#-------------------------------------------------------------------------------------------------------
# *ONLY* to copy the updated tables (e.g. after new ingest) to another server
# As of now, user1 and user2 on the two hosts, respectively are hard-coded as drcadmin and drc or drcadmin and drcadmin, so only intended for use by Mano. Others can run after altering these values suitably.
# Also, these will work only if ~/.pgpass has suitable lines for psql auth added.
# It is better to do direct ingent into the public schema, but others such as _4dn, metabolomics, etc. (DCC-name specific schema which have metadata only from that DCC) and c2m2 (which has metadata from all the DCCs) can be copied over to the other DB.
#host1=sc-cfdedb.sdsc.edu; host2=localhost; dbname=drc; sch=Metabolomics;
host1=localhost; host2=sc-cfdedb.sdsc.edu; dbname=drc; sch=c2m2;
# Example of 
ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh ${host1} ${host2} ${dbname} ${logdir} ${sch} > \
${logdir}/main_pg_dump_log_${ymd}.log 2>&1
#-------------------------------------------------------------------------------------------------------
```
---
# Prisma Setup for C2M2 Database

This guide walks you through the steps to set up Prisma with your PostgreSQL database for the C2M2 schema.

## Prerequisites

Ensure you have the following installed before proceeding:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Prisma CLI](https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch) installed globally or use `npx`
- PostgreSQL database with the C2M2 schema

## Steps

### 1. Pull the Schema from the Database
To fetch the current database schema and update your Prisma schema, use the following command:

```bash
npx prisma db pull --schema=prisma/c2m2/schema.prisma --url "postgresql://drc:drcpass@localhost:5434/drc?schema=c2m2"
```
This command will:
	•	Fetch the database schema from the PostgreSQL database.
	•	Update the prisma/c2m2/schema.prisma file with the current schema of your database.

Make sure to replace the connection string with your own credentials if necessary.

2. Generate Prisma Client

After pulling the schema, you need to generate the Prisma client to interact with your database. Run the following command:
```bash
npx prisma generate --schema=prisma/c2m2/schema.prisma
```

This command will:
	•	Generate the Prisma client based on the schema defined in prisma/c2m2/schema.prisma.
	•	The generated Prisma client will be used to query the database in your application.

### 3. Update Database URL to Use Environment Variable

To avoid hardcoding the database URL in your Prisma schema, update the datasource block in your prisma/c2m2/schema.prisma file to use an environment variable. Replace the URL section with:
```json
datasource db {
  provider = "postgresql"
  url      = env("C2M2_DATABASE_URL")
}
```

This change ensures that the database URL is stored securely in an environment variable (C2M2_DATABASE_URL).

### 4. Set the Environment Variable

To set the C2M2_DATABASE_URL environment variable, add it to your .env file in the root of your project. The .env file should contain:
```bash
C2M2_DATABASE_URL=postgresql://drc:drcpass@localhost:5434/drc?schema=c2m2
```
Make sure to replace the value of C2M2_DATABASE_URL with the correct connection string for your PostgreSQL database.



# .. and other scripts above
