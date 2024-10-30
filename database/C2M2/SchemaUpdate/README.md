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
python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/PrepEmpty_UpdateTSVs_${ymd}.log; ${python_cmd} PrepEmptyTSVs_UpdateTSVs.py 2>&1 | tee ${logf}
# Check for any warning or errors
egrep -i -e "Warning" ${logf} > ${logdir}/warning_in_PrepEmpty_UpdateTSVs_${ymd}.log; 
egrep -i -e "Error" ${logf} > ${logdir}/error_in_PrepEmpty_UpdateTSVs_${ymd}.log;

# If ingesting files from only one DCC (e.g., into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
dcc_short=Metabolomics; python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/C2M2_PrepEmpty_UpdateTSVs_${dcc_short}_${ymd}.log; ${python_cmd} PrepEmptyTSVs_UpdateTSVs.py ${dcc_short} ${logdir} 2>&1 | tee ${logf}
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

# .. and other scripts above
```
