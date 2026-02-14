#!/bin/bash

# Run syntax: python_cmd=python3; ./call_populateC2M2FromS3_DCCnameASschema.sh ${python_cmd} DCC1 DCC1 DCC3 ...

# If ingesting files from only one DCC (into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
#dcc_short=Metabolomics; ymd=$(date +%y%m%d); logf=log/C2M2_ingestion_${dcc_short}_${ymd}.log; python populateC2M2FromS3.py ${dcc_short} 2>&1 | tee ${logf}
#egrep -i -e "Warning" ${logf} ; egrep -i -e "Error" ${logf} ;

if [[ $# -lt 1 ]]; then
        echo -e "Usage: $0 <python_cmd> DCC1 DCC2 ...";
        exit 1;
fi

# list of dcc_short_label from ingesting from all DCCs
dcc_short_labels=('4DN' 'Bridge2AI' 'ERCC' 'GTEx' 'GlyGen' 'HMP' 'HuBMAP' 'IDG' 'Kids%20First' 'LINCS' 'Metabolomics' 'MoTrPAC' 'SCGE' 'SenNet' 'SPARC');
#dcc_short_labels=('Metabolomics');

# define python command
python_cmd=$1

if [[ $# -lt 2 ]]; then
        echo -e "The program will loop over all DCCs:";
		echo "${dcc_short_labels[@]}";
else
		shift;
		dcc_short_labels=("$@")
        echo -e "The program will loop over the specified DCCs:";
		echo "${dcc_short_labels[@]}";
fi

# Iterate over the elements of the array dcc_short_labels using a for loop
for dcc_short in "${dcc_short_labels[@]}"; do
	echo "==== dcc_short: ${dcc_short} ====";
done
