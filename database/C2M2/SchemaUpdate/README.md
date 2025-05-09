## Setting up C2M2 SchemaUpdate

```bash
# README.md file for SchemaUpdate 

# Be in the folder database/C2M2/SchemaUpdate

env_file_name=.env

# logdir should not have any spaces
logdir=log
mkdir -p ${logdir}

# Use this file to record the commands that need to be executed for updating one or more schema-related files
# Some generic syntax examples
python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/populateC2M2FromS3_${ymd}.log; ${python_cmd} PrepUpdateTSVs_populateC2M2FromS3.py 2>&1 | tee ${logf}
# Check for any warning or errors
egrep -i -e "Warning" ${logf} > ${logdir}/warning_in_populateC2M2FromS3_${ymd}.log; 
egrep -i -e "Error" ${logf} > ${logdir}/error_in_populateC2M2FromS3_${ymd}.log;

# If ingesting files from only one DCC (e.g., into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
dcc_short=Metabolomics; python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/C2M2_populateC2M2FromS3_${dcc_short}_${ymd}.log; ${python_cmd} PrepUpdateTSVs_populateC2M2FromS3.py ${dcc_short} ${logdir} 2>&1 | tee ${logf}
egrep -i -e "Warning" ${logf} ; egrep -i -e "Error" ${logf} ;

# Example of another DCC
dcc_short=KidsFirst; python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/C2M2_populateC2M2FromS3_${dcc_short}_${ymd}.log; ${python_cmd} PrepUpdateTSVs_populateC2M2FromS3.py ${dcc_short} ${logdir} 2>&1 | tee ${logf}
egrep -i -e "Warning" ${logf} ; egrep -i -e "Error" ${logf} ;


# To list the empty files created: example command
#$ pwd
#/SOMEPATH/DRC-Portals/database/C2M2/SchemaUpdate/empty_tsvs
#[USER@SERVER empty_tsvs]$ for f in `ls *.tsv` ; do echo "----$f----";cat $f;done;

# Example of calling a sql script
# This script can be run as (upon starting psql shell, or equivalent command):
# \i create_id_namespace_dcc_id.sql
# OR, directly specify the sql file name in psql command:
# psql -h localhost -U drc -d drc -p [5432|5433] -a -f SomeSQLScript.sql
psql "$(python3 ../dburl.py)" -a -f SomeSQLScript.sql -o ${logdir}/log_SomeSQLScript.log

# Example of bash/shell script
ymd=$(date +%y%m%d); logf=${logdir}/SOMEFILEforShellScript_${ymd}.log; ./SomeShellScript.sh OTHER-ARGS 2>&1 | tee ${logf}

# Scripts to test updated json schema with prepare_C2M2_submission.py and frictionless
# Assuming this script will be operated from the folder ~/CFDE/C2M2_sub, it takes the arguments:
# name of the first script to be called
# name of the second script to to be called by the first script
# folder path for schemaupdate_dir
# onlyTest: 0 or 1
#
# Call syntax: First be in folder ${HOME}/CFDE/C2M2_sub since other needed resources are there.
# Please change SchemaUpdateFolder and C2M2_sub_folder as needed
# The last argiment to ./call_copy_update_test.sh should be 1 if onlyTesting and 0 if adding 

# For biofluid update
# mock biofluid related data to the relevant files.
SchemaUpdateFolder="${HOME}/DRC/DRC-Portals/database/C2M2/SchemaUpdate"
C2M2_sub_folder="${HOME}/CFDE/C2M2_sub"
cd "$SchemaUpdateFolder"
cp *.sh "$C2M2_sub_folder"/.
cd "$C2M2_sub_folder"
./call_copy_update_test.sh ./copy_update_test_dcc_c2m2_package_for_biofluid.sh append_random_biofluid_to_bios_col_biof.sh "$SchemaUpdateFolder" 1 2>&1 | tee schema_update_test_biofluid.log
# To get back to SchemaUpdateFolder
cd "$SchemaUpdateFolder"

#--------- CRITICALLY IMPORTANT: Even for this trivial change, 
# I had to modify prepare_C2M2_submission.py as the columns of file.tsv are explicitly listed on line ~1332.
#
# For file.tsv access_url update
# mock access_url related data in file.tsv.
SchemaUpdateFolder="${HOME}/DRC/DRC-Portals/database/C2M2/SchemaUpdate"
C2M2_sub_folder="${HOME}/CFDE/C2M2_sub"
cd "$SchemaUpdateFolder"
cp *.sh "$C2M2_sub_folder"/.
cd "$C2M2_sub_folder"
./call_copy_update_test.sh ./copy_update_test_dcc_c2m2_package_for_access_url.sh \
append_random_access_url_to_file.sh "$SchemaUpdateFolder" 0 2>&1 | tee schema_update_test_access_url.log
# To get back to SchemaUpdateFolder
cd "$SchemaUpdateFolder"

# .. and other scripts above
```
