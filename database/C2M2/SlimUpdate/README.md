## Setting up C2M2 SlimUpdate

```bash
# README.md file for Slimpdate 

# Be in the folder database/C2M2/SlimUpdate

env_file_name=.env

# logdir should not have any spaces
logdir=log
mkdir -p ${logdir}

# Use this file to record the commands that need to be executed for updating one or more schema-related files
# Some generic syntax examples
python_cmd=python3;ymd=$(date +%y%m%d); logf=${logdir}/SOMEFILE_${ymd}.log; ${python_cmd} SomePyScript.py 2>&1 | tee ${logf}
# Check for any warning or errors
egrep -i -e "Warning" ${logf} > ${logdir}/warning_in_SOMEFILE_${ymd}.log; 
egrep -i -e "Error" ${logf} > ${logdir}/error_in_SOMEFILE_${ymd}.log;

# Example of calling a sql script
# This script can be run as (upon starting psql shell, or equivalent command):
# \i create_id_namespace_dcc_id.sql
# OR, directly specify the sql file name in psql command:
# psql -h localhost -U drc -d drc -p [5432|5433] -a -f SomeSQLScript.sql
psql "$(python3 ../dburl.py)" -a -f SomeSQLScript.sql -o ${logdir}/log_SomeSQLScript.log

# Example of bash/shell script
python_cmd=python3; logf=${logdir}/SOMEFILEforShellScript_${ymd}.log; ./SomeShellScript.sh OTHER-ARGS 2>&1 | tee ${logf}

# .. and other scripts above
```
