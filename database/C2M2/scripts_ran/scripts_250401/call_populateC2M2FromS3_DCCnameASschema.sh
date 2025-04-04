# Run syntax: python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} DCC1 DCC1 DCC3 ...

# If ingesting files from only one DCC (into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
#dcc_short=Metabolomics; ymd=$(date +%y%m%d); logf=log/C2M2_ingestion_${dcc_short}_${ymd}.log; python populateC2M2FromS3.py ${dcc_short} 2>&1 | tee ${logf}
#egrep -i -e "Warning" ${logf} ; egrep -i -e "Error" ${logf} ;

if [[ $# -lt 2 ]]; then
        echo -e "Usage: $0 <python_cmd> <logdir> DCC1 DCC2 ...";
        exit 1;
fi

# list of dcc_short_label from ingesting from all DCCs
#dcc_short_labels=('4DN' 'ERCC' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'Kids%20First' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SPARC');
# KidsFirst name changed no %20 during June 2024 submission
# 2024/12/18: SenNet added
#dcc_short_labels=('4DN' 'ERCC' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'KidsFirst' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SPARC' 'SenNet');
# 2025/01/06: ERCC is now labelled as ExRNA in ingest/DccAssets.tsv
dcc_short_labels=('4DN' 'ExRNA' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'KidsFirst' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SPARC' 'SenNet');
#dcc_short_labels=('Metabolomics');

# define python command
python_cmd=$1
logdir=$2

if [[ $# -lt 3 ]]; then
        echo -e "The program will loop over all DCCs:";
		echo "${dcc_short_labels[@]}";
else
		shift; shift;
		dcc_short_labels=("$@")
        echo -e "The program will loop over the specified DCCs:";
		echo "${dcc_short_labels[@]}";
fi

ymd=$(date +%y%m%d); 

#logdir=log;# now an argument
warnf=${logdir}/warning_in_C2M2_ingestion_${ymd}.log
errorf=${logdir}/error_in_C2M2_ingestion_${ymd}.log

echo "===================== New run ====================" > ${warnf};
echo "===================== New run ====================" > ${errorf};

# Iterate over the elements of the array dcc_short_labels using a for loop
for dcc_short in "${dcc_short_labels[@]}"; do
	logf=${logdir}/C2M2_ingestion_${dcc_short}_${ymd}.log; 
	${python_cmd} populateC2M2FromS3.py ${dcc_short} ${logdir} 2>&1 | tee ${logf}

	echo "===================== DCC: ${dcc_short} ====================" >> ${warnf};
	egrep -i -e "Warning" ${logf} >> ${warnf}; 

	echo "===================== DCC: ${dcc_short} ====================" >> ${errorf};
	egrep -i -e "Error" ${logf} >> ${errorf};
done

echo -e "\nPlease check the files ${warnf} and ${errorf} for any warnings and errors, respectively.\n";

echo -e "Wrote sql files for crosscheck. Their name is like ${logdir}/CountQuery_Crosscheck_Metabolomics.sql.";
echo -e "After data is ingested in schema c2m2, and also in dcc-name-based schema, you can run the following command to execute the sql query from linux prommt and then look for the pattern 'do not match' to identify any mismatch in counts.\n";

# Note to developer: some file names such as ${logdir}/CountQuery_Crosscheck_Metabolomics.sql are used in the script populateC2M2FromS3.py as well. If you make change here, make a corresponding change there too.

count_sql_allf=${logdir}/CountQuery_Crosscheck_ALL.sql
count_sql_of=${logdir}/CountQuery_Crosscheck_output.log
mismatchf=${logdir}/CountQuery_Crosscheck_mismatch.log

if [ -f "${count_sql_allf}" ]; then
    # Remove the file
    rm -f "${count_sql_allf}"
fi

cat ${logdir}/CountQuery_Crosscheck_*.sql > ${count_sql_allf}

# See that not using -a below (else too many sql lines printed)
#exec_sql_codestr="psql -h localhost -U drc -d drc -p [5432|5433] -f ${count_sql_allf} -o ${count_sql_of}"
dburlstr='"$(python3 dburl.py)"'
exec_sql_codestr="psql ${dburlstr} -f ${count_sql_allf} -o ${count_sql_of}"
mismatch_cmdstr="egrep -i -e 'do not match' ${count_sql_of} > ${mismatchf};"

echo -e "${exec_sql_codestr}\n${mismatch_cmdstr}";

echo -e "# Next, you can check the file ${mismatchf} by opening it, or by running:\n";
echo -e "wc -l ${mismatchf} #Count of lines in the file\n";
echo -e "cat ${mismatchf} |more\n";

# Tentative commands to further cross-check file counts
#[mano@sc-cfdewebdev log_dbserver]$ egrep -e "Lines in file.*file.tsv" C2M2_ingestion_240920.log|cut -d':' -f2|awk '{sum += $1} END {print sum}'
#[mano@sc-cfdewebdev log_dbserver]$ egrep -e "*.file:" CountQuery_Crosscheck_output.log|cut -d'|' -f1|awk '{sum += $1} END {print sum}'
# The difference should be equal to the number of DCCs (one header row in each)
