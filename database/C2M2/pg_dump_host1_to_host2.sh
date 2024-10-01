# This script is generally to be run by Mano only after understanding its contents.
# Use pg_dump and psql to directly copy all schema and tables from host1/db to host2/db
# assuming suitable write acsess is already granted.
# Run syntax: ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh <host1> <host2> <dbname> <logdir> schema1 schema2 ... >> main_pg_dump_log_${ymd}.log 2>&1
# Examples: ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh sc-cfdedb.sdsc.edu localhost drc log_dbserver Metabolomics >> main_pg_dump_log_${ymd}.log 2>&1
# Examples: ymd=$(date +%y%m%d); ./pg_dump_host1_to_host2.sh sc-cfdedb.sdsc.edu sc-cfdedbdev.sdsc.edu drc log_dbserver Metabolomics >> main_pg_dump_log_${ymd}.log 2>&1

echo -e "----------- $0 script started: Current date and time: $(date)";

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

# list of schemas for pg_dump: do not include 'public' since tables in there are init by prisma migration commands
# and pg_dump doesn't work well on that.
#schemas=('c2m2' 'slim' '_4DN' 'ERCC' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'KidsFirst' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SPARC');
schemas=('_4DN' 'ERCC' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'KidsFirst' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SPARC');
#schemas=('Metabolomics');

if [[ $# -lt 5 ]]; then
        echo -e "The program will loop over all schemas:";
	echo "${schemas[@]}";
else
	shift; shift; shift; shift;
	schemas=("$@")
        echo -e "The program will loop over the specified schemas:";
	echo "${schemas[@]}";
fi

ymd=$(date +%y%m%d); 

#logdir=log;# now an argument
warnf=${logdir}/warning_in_pg_dump_log_${ymd}.log
errorf=${logdir}/error_in_pg_dump_log_${ymd}.log
cntdifff=${logdir}/counts_differ_in_db1_db2_${ymd}.log

#echo "===================== New run ====================" > ${logf};
echo "===================== New run ====================" > ${warnf};
echo "===================== New run ====================" > ${errorf};
echo "===================== New run ====================" > ${cntdifff};

# Iterate over the elements of the array schemas using a for loop
for sch in "${schemas[@]}"; do
        logf=${logdir}/pg_dump_log_${sch}_${ymd}.log
        cntf=${logdir}/counts_in_db1_db2_${sch}_${ymd}.log
        
        curdt=$(date);
        # Use the --clean --if-exists option so that in the target database, existing tables of same name 
        # will be dropped first. Use the --no-owner so that owner will not be set. 
        # Try --no-acl as well if the desired role/user has the needed permissions already
	#pg_dump --clean --if-exists --no-owner --no-acl -v -h ${host1} -p ${port1} -U ${user1} -d ${dbname} -n ${sch} \
        #        -Fp | psql -b -v ON_ERROR_STOP=1 -h ${host2} -p ${port2} -U ${user2} -d ${dbname} -o ${logf}
        # For dropping tables but not schema, specify like -t schemaname.*
	pg_dump --clean --if-exists --no-owner --no-acl -v -h ${host1} -p ${port1} -U ${user1} -d ${dbname} -t ${sch}.* \
                -Fp | psql -b -v ON_ERROR_STOP=1 -h ${host2} -p ${port2} -U ${user2} -d ${dbname} -o ${logf}
	#pg_dump --clean --if-exists --no-owner --no-acl -v -h ${host1} -p ${port1} -U ${user1} -d ${dbname} -n ${sch} \
        #-t "${sch}.dcc" -t "${sch}.anatomy" -Fp -f pg_dump_${dbname}_from_cfdedb_${ymd}.sql

	echo "===================== Schema: ${sch} : $curdt ====================" >> ${warnf};
	egrep -i -e "Warning" ${logf} >> ${warnf}; 

	echo "===================== Schema: ${sch} : $curdt ====================" >> ${errorf};
	egrep -i -e "Error" ${logf} >> ${errorf};

        # Compare counts
        ./compare_counts_on_two_hosts.sh ${host1} ${port1} ${user1} ${dbname} ${sch} ${host2} ${port2} ${user2} ${dbname} ${sch} ${logdir} > ${cntf}
	echo "===================== Schema: ${sch} : $curdt ====================" >> ${cntdifff};
        egrep -i -e "Count differs" ${cntf} >> ${cntdifff};        
done

echo -e "\nPlease check the log files like ${logf} (one file per schema) for general pg_dump runtime output.\n";
echo -e "\nPlease check the files ${warnf} and ${errorf} for any warnings and errors, respectively.\n";
echo -e "\nPlease check the files like ${cntf} (one file per schema) and ${cntdifff} for any differences in the counts in the source and target databases.\n";

echo -e "Using pg_dump and psql, schema and tables in database $dbname have been copied from the host ${host1} to ${host2}.";
echo -e "Do some random checks on row counts, etc., on tables on the target host ${host2}\n";

echo -e "----------- $0 script ended: Current date and time: $(date)\n";

# Example query code to cross-check row counts
# select count(*) from public.c2m2_file_node; select count(*) from public.c2m2_datapackage; 
# select count(*) from public.dcc_assets; select count(*) from public.dcc_asset_node; 
# select count(*) from public.entity_node; select count(*) from public.kg_assertion; select count(*) from public.node;
