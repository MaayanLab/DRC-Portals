#!/usr/bin/bash

#2024/11/26: Mano
# This is extracted from README file to run as a bash shell script

monthyear=Aug-2026
pubchem_ymd=2026-07-27
submission_yyyymm=202609
also_add_missing_substance=1
copy_files_initially=0
clean_initially=1

# If arguments passed, used those
if [[ $# -ge 1 ]]; then
	monthyear="$1"
fi

if [[ $# -ge 2 ]]; then
	pubchem_ymd="$2"
fi

file_base="compound"
kw=compound
logf_base=schema_update_test_other_changes
C2M2_sub_folder="/mnt/share/mano/CFDE/C2M2_sub"
# Mano: as of 2026/08/04, logf_base and C2M2_sub_folder are not used as to get missing IDs, we just check in the latest DB

if [[ -n "$pubchem_ymd" ]]; then
    dot_ymd=".${pubchem_ymd}"
else
    dot_ymd=""
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
utils_path="${SCRIPT_DIR}/../utils"
add_missing_scriptname="${utils_path}/add_missing_compound_wo_C2M2_sub.sh"

if [[ "$clean_initially" == "1" ]]; then
	rm -f compound*${pubchem_ymd}*.tsv* substance*${pubchem_ymd}*.tsv* log_zz99.log missing_*.tsv substance_missing_compound.txt temp1_compound.GlyTouCan_appendix.tsv unready_SIDs.tsv unseen_*
fi

if [[ "$copy_files_initially" == "1" ]]; then
	#Copied compound/substance*.tsv.gz from elsewhere:
	echo "--------------------------------------------------------------";
	echo "---- Copy files from 001_stupidly_large_reference_tables to current folder";
	date
	cp ../PubChem-${monthyear}/001_stupidly_large_reference_tables/*.* .
	echo -e "\tCopied files from 001_stupidly_large_reference_tables to current folder";
fi

#List of files: may be after running one or more scripts:

#[mano@sc-cfdewebdev zz99_merge_GlyTouCan_and_PubChem_data-Aug-2025]$ ls -al

#Run the perl scripts first, after setting any input files paths in them (in the top part) depending upon where they are actually located.

#Mano modifed ./zz02_append_new_compound_entries.bash extensively.

# Decide to use the call with or without arguments (then specify in the pl files)
#./zz00_make_new_compound_file.pl 
#./zz00_make_new_compound_file.pl <compoundSynList_file> <pubchemCompoundFile>
echo "--------------------------------------------------------------";
echo "---- Going to run zz00*.pl";
date
./zz00_make_new_compound_file.pl "../GlyTouCan-${monthyear}/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv" "../PubChem-${monthyear}/001_stupidly_large_reference_tables/compound${dot_ymd}.tsv.gz"
echo -e "\tRan zz00*.pl";

#./zz01_make_new_substance_file.pl
#./zz01_make_new_substance_file.pl <substanceSynList_file> <pubchemSubstanceFile>
echo "--------------------------------------------------------------";
echo "---- Going to run zz01*.pl";
date
./zz01_make_new_substance_file.pl "../GlyTouCan-${monthyear}/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_substance_synonyms.tsv" "../PubChem-${monthyear}/001_stupidly_large_reference_tables/substance${dot_ymd}.tsv.gz"
echo -e "\tRan zz01*.pl";

#./zz02_append_new_compound_entries.bash
#./zz02_append_new_compound_entries.bash <GlyTouCan_file>
echo "--------------------------------------------------------------";
echo "---- Going to run zz02*.pl";
date
./zz02_append_new_compound_entries.bash "../GlyTouCan-${monthyear}/003_compound_appendix_for_non-PubChem_GlyTouCan_ACs/compound.GlyTouCan_appendix.tsv"
echo -e "\tRan zz02*.pl";
#./zz03_qsub_gzip_commands.bash 

#Upon testing in prepare_C2M2_submission.py, for GlyGen, there were some IDs missing from this.
#Mano extracted their info from the current psql DB using the command:
curwd="${PWD}"

#---------------------- This step to adding missing terms is highly recommended not but not strictly required ------------------
# Rest of the processing, i.e., adding missing compounds is done in add_missing_compound.sh
# Note that the above scripts zz01* zz02* etc generate the files compound.tsv and substance.tsv
# Run the script below after the log file from testing the prepare_C2M2_submission.py script on all DCC's C2M2 packages is ready
#add_missing_scriptname=./add_missing_compound_wo_C2M2_sub.sh
#./add_missing_compound.sh compound compound schema_update_test_other_changes "${C2M2_sub_folder}"

#also_add_missing_substance=1
# substance table has column compound; do substance first if do check missing in substance; 
# compound ref should be fine after concat since all foreign key from c2m2.substance.compound 
# to c2m2.compound.id is satisfied in the DB; it is satisfied in the master ontology tables 
# substance.tsv and compound.tsv prepared so far above.
if [[ "$also_add_missing_substance" == "1" ]]; then
	file_base_subs=substance
	kw_subs=substance
	echo "--------------------------------------------------------------";
	echo "---- Going to run ${add_missing_scriptname} on ${kw_subs}";
	date
	${add_missing_scriptname} "${SCRIPT_DIR}/${file_base_subs}" ${kw_subs}
	echo -e "\tRan ${add_missing_scriptname} on ${kw_subs}";
fi

echo "--------------------------------------------------------------";
echo "---- Going to run ${add_missing_scriptname} on ${kw}";
date
#./add_missing_compound.sh ${file_base} ${kw} ${logf_base} ${C2M2_sub_folder}
${add_missing_scriptname} "${SCRIPT_DIR}/${file_base}" ${kw}
echo -e "\tRan ${add_missing_scriptname} on ${kw}";
#-------------------------------------------------------------------------------------------------------------------------------

# Cross check that each substance.tsv.compound is in compound.tsv.id (file.column notation used here)
#./check_foreign_key.sh compound.tsv id substance.tsv compound
"${utils_path}/check_foreign_key.sh" "${SCRIPT_DIR}/compound.tsv" id "${SCRIPT_DIR}/substance.tsv" compound

#Then run zz03_qsub_gzip_commands.bash
echo "--------------------------------------------------------------";
echo "---- Going to run zz03*.pl";
date
./zz03_qsub_gzip_commands.bash
echo -e "\tRan zz03*.pl";
#OR directly,
#gzip compound.tsv
#OR
#pigz -k 4 compound.tsv


# If desired, run to extract the first 5000 records as a small sample set; include only the first 100 synonyms
# Did not run for Nov-2024/Aug-2025; instead just extracted the first 5001 rows from substance and compound files before adding GlyTouCans.
##./make-sample-files.sh 
# Copy the sample files to suitable folder.

#and then rename compound.tsv.gz to compound.2024-11-26.tsv.gz etc.
cpd_ymd="compound${dot_ymd}"
subs_ymd="substance${dot_ymd}"
mv compound.tsv.gz ${cpd_ymd}.tsv.gz
mv substance.tsv.gz ${subs_ymd}.tsv.gz
echo "Moved compound.tsv.gz to ${cpd_ymd}.tsv.gz and substance.tsv.gz to ${subs_ymd}.tsv.gz";

#Test the new file compound.2024-11-26.tsv.gz with prepare_C2M2_submision.py (by copying to
# /home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files)
#cp compound.2024-11-26.tsv.gz /home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files/.
#cp substance.2024-11-26.tsv.gz /home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files/.

#tf_pre="${C2M2_sub_folder}/scripts/"
tf_pre="../../"
tf_main="external_CV_reference_files"
#tf_post=""
tf_post="_${submission_yyyymm}"
#tf="${C2M2_sub_folder}/scripts/external_CV_reference_files"
tf="${tf_pre}${tf_main}${tf_post}"
cmdstr1="cp \"${cpd_ymd}.tsv.gz\" \"${tf}/.\""
cmdstr2="cp \"${subs_ymd}.tsv.gz\" \"${tf}/.\""
echo "--------------------------------------------------------------";
echo -e "--------\nYou can execute the commands below to copy to ${tf} folder for testing:\n";
echo -e "${cmdstr1}\n";
echo -e "${cmdstr2}\n";

# Create sample files
./make-sample-files.sh "${cpd_ymd}" "${subs_ymd}"
cpd_sf="${cpd_ymd}.first_5000_records.tsv"
subs_sf="${subs_ymd}.first_5000_records.tsv"

#tf="${C2M2_sub_folder}/scripts/external_CV_reference_files/sample_pubchem_reference_data"
tf_sf="${tf}/sample_pubchem_reference_data"
mkdir -p ${tf_sf}
cmdstr3="cp \"${cpd_sf}\" \"${cpd_sf}.gz\" \"${subs_sf}\" \"${subs_sf}.gz\" \"${tf_sf}/.\""
echo -e "--------\nYou can execute the commands below to copy to ${tf_sf} folder for testing:\n";
echo -e "${cmdstr3}\n";
echo "--------------------------------------------------------------";

