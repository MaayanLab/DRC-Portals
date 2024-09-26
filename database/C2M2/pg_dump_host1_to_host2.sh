# This script is not complete yet, do not run
# Use pg_dump and psql to directly copy all schema and tables from host1/db to host2/db
# assuming suitable write acsess is already granted.
# Run syntax: ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh <host1> <host2> <dbname> <logdir> schema1 schema2 ... >> main_pg_dump_log_${ymd}.log 2>&1
# Examples: ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh sc-cfdedb.sdsc.edu localhost drc log_dbserver Metabolomics >> main_pg_dump_log_${ymd}.log 2>&1
# Examples: ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh sc-cfdedb.sdsc.edu sc-cfdedbdev.sdsc.edu drc log_dbserver Metabolomics >> main_pg_dump_log_${ymd}.log 2>&1

if [[ $# -lt 2 ]]; then
        echo -e "Usage: $0 <host1> <host2> <dbname> <logdir> schema1 schema2 ...";
	echo -e "If more than three arguments, then the 3rd arg should be dbname and 4th should be logdir.";
        exit 1;
fi

host1=$1
host2=$2
port1=5432
port2=5433
user1=drcadmin
user2=drc

#dbname=drc
if [[ $# -lt 3 ]]; then
        echo -e "No dbname specified, so it will assume drc database.";
        dbname=drc
else
        dbname=$3
fi

if [[ $# -lt 4 ]]; then
        echo -e "No logdir specified, so it will assume log.";
        logdir=log
else
        logdir=$4
fi

echo -e "host1:port1:user1: ${host1}:${port1}:${user1}";
echo -e "host2:port2:user2: ${host2}:${port2}:${user2}";
echo -e "dname:${dbname}";
echo -e "logdir:${logdir}";

# list of schemas for pg_dump 
schemas=('public' 'c2m2' 'slim' '_4DN' 'ERCC' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'KidsFirst' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SPARC');
#schemas=('Metabolomics');


if [[ $# -lt 5 ]]; then
        echo -e "The program will loop over all schemas:";
		echo "${schemas[@]}";
else
		shift; shift; shift; shift;
		schemas=("$@")
        echo -e "The program will loop over the specified DCCs:";
		echo "${schemas[@]}";
fi

ymd=$(date +%y%m%d); 

#logdir=log;# now an argument
logf=${logdir}/pg_dump_log_${ymd}.log
warnf=${logdir}/warning_in_pg_dump_log_${ymd}.log
errorf=${logdir}/error_in_pg_dump_log_${ymd}.log

#echo "===================== New run ====================" > ${logf};
echo "===================== New run ====================" > ${warnf};
echo "===================== New run ====================" > ${errorf};

# Iterate over the elements of the array schemas using a for loop
for sch in "${schemas[@]}"; do
############### EDIT FROM HERE ONWARDS #####################
	#pg_dump -v -h ${host1} -p ${port1} -U ${user1} -d ${dbname} -n ${sch} -Fc | \
        #       psql -b -v ON_ERROR_STOP=1 -h ${host2} -p ${port2} -U ${user2} -d ${dbname} -o ${logf}
	#pg_dump -v -h ${host1} -p ${port1} -U ${user1} -d ${dbname} -n ${sch} -Fp | 
        #       psql -b -v ON_ERROR_STOP=1 -h ${host2} -p ${port2} -U ${user2} -d ${dbname} -o ${logf}
	pg_dump -v -h ${host1} -p ${port1} -U ${user1} -d ${dbname} -n ${sch} \
        -t "${sch}.biosample" -t "${sch}.dcc" -t "${sch}.anatomy" -Fp -f drc_from_cfdedb_${ymd}.pgdump

	echo "===================== Schema: ${sch} ====================" >> ${warnf};
	egrep -i -e "Warning" ${logf} >> ${warnf}; 

	echo "===================== Schema: ${sch} ====================" >> ${errorf};
	egrep -i -e "Error" ${logf} >> ${errorf};
done

echo -e "\nPlease check the log file ${logf} for general pg_dump runtime output.\n";
echo -e "\nPlease check the files ${warnf} and ${errorf} for any warnings and errors, respectively.\n";

echo -e "Using pg_dump and psql, schema and tables in database $dbname have been copied from the host ${host1} to ${host2}.";
echo -e "Do some random checks on row counts, etc., on tables on the target host ${host2}\n";
