# This script is not complete yet, do not run
# Use pg_dump and psql to directly copy all schema and tables from server1/db to server2/db
#`
# Run syntax: ./pg_dump_server1_to_server2.sh logdir server1_name server2_name dbname

if [[ $# -lt 2 ]]; then
        echo -e "Usage: $0 <server_name1> <server_name2> <dbname> <logdir> schema1 schema2 ...";
	echo -e "If more than three arguments, then the 3rd arg should be dbname and 4th should be logdir.";
        exit 1;
fi

server1=$1
server2=$2
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

# list of schemas for pg_dump 
schemas=('public' 'c2m2' '_4DN' 'ERCC' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'KidsFirst' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SPARC');
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

echo "===================== New run ====================" > ${warnf};
echo "===================== New run ====================" > ${errorf};

# Iterate over the elements of the array schemas using a for loop
for sch in "${schemas[@]}"; do
############### EDIT FROM HERE ONWARDS #####################
	pg_dump -h ${server1} -U ${user1} -n ${sch} -Fc ${dbname} | psql -h ${server2} -U ${user2} -d ${dbname} -o ${logf}

	echo "===================== Schema: ${sch} ====================" >> ${warnf};
	egrep -i -e "Warning" ${logf} >> ${warnf}; 

	echo "===================== Schema: ${sch} ====================" >> ${errorf};
	egrep -i -e "Error" ${logf} >> ${errorf};
done

echo -e "\nPlease check the log file: ${logf} and ${errorf} for general pg_dump runtime output.\n";
echo -e "\nPlease check the files ${warnf} and ${errorf} for any warnings and errors, respectively.\n";

echo -e "Using pg_dump and psql, schema and tables in database $dbname have been copied from the server ${server1} to ${server2}.";
echo -e "Do some random checks on row counts, etc., on tables on the target server ${server2}\n";

