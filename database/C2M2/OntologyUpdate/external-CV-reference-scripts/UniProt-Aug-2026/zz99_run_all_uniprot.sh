#!/usr/bin/bash
# call: ./zz99_run_all_uniprot.sh <monthyear> <file_base>
# call: ./zz99_run_all_uniprot.sh Aug-2026 protein_v2026.02_r2026-06-10

#2024/11/26: Mano
# This is extracted from README file to run as a bash shell script

monthyear=Aug-2026
file_base=protein_v2026.02_r2026-06-10
submission_yyyymm=202609
copy_files_initially=0
clean_initially=0

# If arguments passed, used those
if [[ $# -ge 1 ]]; then
	monthyear="$1"
fi

if [[ $# -ge 2 ]]; then
	file_base="$2"
fi

kw=protein

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
utils_path="${SCRIPT_DIR}/../utils"
add_missing_scriptname="${utils_path}/add_missing_uniprot_wo_C2M2_sub.sh"

kw_file="${SCRIPT_DIR}/${file_base}.tsv"

if [[ "$clean_initially" == "1" ]]; then
	rm -f log_zz99.log missing_*.tsv
fi

if [[ "$copy_files_initially" == "1" ]]; then
	#Copied compound/substance*.tsv.gz from elsewhere:
	echo "--------------------------------------------------------------";
	echo -e "---- Copy files from external_CV_reference_files_updated_${submission_yyyymm}/fromSrini to current folder";
	date
	cp ../../external_CV_reference_files_updated_${submission_yyyymm}/fromSrini/*.tsv* .
	echo -e "\tCopied files from 001_stupidly_large_reference_tables to current folder";
fi

curwd="${PWD}"

#---------------------- This step to adding missing terms is highly recommended not but not strictly required ------------------
# Rest of the processing, i.e., adding missing compounds is done in add_missing_compound.sh
# Note that the above scripts zz01* zz02* etc generate the files compound.tsv and substance.tsv
# Run the script below after the log file from testing the prepare_C2M2_submission.py script on all DCC's C2M2 packages is ready
#add_missing_scriptname=./add_missing_compound_wo_C2M2_sub.sh
#./add_missing_compound.sh compound compound schema_update_test_other_changes "${C2M2_sub_folder}"

echo "--------------------------------------------------------------";
echo "---- Going to run ${add_missing_scriptname} on ${kw}";
date
${add_missing_scriptname} "${SCRIPT_DIR}/${file_base}" ${kw}
echo -e "\tRan ${add_missing_scriptname} on ${kw}";

#gzip
gzip -k "${kw_file}" #  Done in the calling script

# If desired, run to extract the first 5000 records as a small sample set; include only the first 100 synonyms
# Did not run for Nov-2024/Aug-2025; instead just extracted the first 5001 rows from substance and compound files before adding GlyTouCans.
##./make-sample-files.sh 
# Copy the sample files to suitable folder.

#tf_pre="${C2M2_sub_folder}/scripts/"
pf="${kw_file}.gz"
tf_pre="../../"
tf_main="external_CV_reference_files"
#tf_post=""
tf_post="_${submission_yyyymm}"
#tf="${C2M2_sub_folder}/scripts/external_CV_reference_files"
tf="${tf_pre}${tf_main}${tf_post}"
cmdstr1="cp \"${pf}\" \"${tf}/.\""
echo "--------------------------------------------------------------";
echo -e "--------\nYou can execute the commands below to copy to ${tf} folder for testing:\n";
echo -e "${cmdstr1}\n";


pf_5k="${SCRIPT_DIR}/protein.first_5000_records.tsv"

echo "pf:$pf"
echo "pf_5k:$pf_5k"

# If warning: gzip: stdout : broken pipe, use gzip -dc instead of zcat: gzip -dc compound.tsv.gz | head -5001 > compound.first_5000_records.tsv
zcat "${pf}" | head -5001 > "${pf_5k}"

ls -al "${pf_5k}"

gzip -k "${pf_5k}"

echo "gzipped ${pf_5k}"


#tf="${C2M2_sub_folder}/scripts/external_CV_reference_files/sample_pubchem_reference_data"
tf_sf="${tf}/sample_uniprot_reference_data"
mkdir -p ${tf_sf}
cmdstr3="cp \"${pf_5k}\" \"${pf_5k}.gz\" \"${tf_sf}/.\""
echo -e "--------\nYou can execute the commands below to copy to ${tf_sf} folder for testing:\n";
echo -e "${cmdstr3}\n";
echo "--------------------------------------------------------------";

