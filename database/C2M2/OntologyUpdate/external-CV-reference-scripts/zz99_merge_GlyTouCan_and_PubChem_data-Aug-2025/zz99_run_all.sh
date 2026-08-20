#!/usr/bin/bash

#2024/11/26: Mano
# This is extracted from README file to run as a bash shell script

monthyear=Aug-2025
ymd=2025-08-11

file_base="compound"
kw=compound
logf_base=schema_update_test_other_changes
C2M2_sub_folder="/mnt/share/mano/CFDE/C2M2_sub"

if [[ -n "$ymd" ]]; then
    dot_ymd=".${ymd}"
else
    dot_ymd=""
fi

#Copied compound/substance*.tsv.gz from elsewhere:
echo "---- Copy files from 001_stupidly_large_reference_tables to current folder";

cp ../PubChem-${monthyear}/001_stupidly_large_reference_tables/*.* .

echo -e "\tCopied files from 001_stupidly_large_reference_tables to current folder";

#List of files: may be after running one or more scripts:

#[mano@sc-cfdewebdev zz99_merge_GlyTouCan_and_PubChem_data-Aug-2025]$ ls -al

#Run the perl scripts first, after setting any input files paths in them (in the top part) depending upon where they are actually located.

#Mano modifed ./zz02_append_new_compound_entries.bash extensively.

# Decide to use the call with or without arguments (then specify in the pl files)
#./zz00_make_new_compound_file.pl 
#./zz00_make_new_compound_file.pl <compoundSynList_file> <pubchemCompoundFile>
echo "---- Going to run zz00*.pl";
./zz00_make_new_compound_file.pl "../GlyTouCan-${monthyear}/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_compound_synonyms.tsv" "../PubChem-${monthyear}/001_stupidly_large_reference_tables/compound${dot_ymd}.tsv.gz"
echo -e "\tRan zz00*.pl";

#./zz01_make_new_substance_file.pl
#./zz01_make_new_substance_file.pl <substanceSynList_file> <pubchemSubstanceFile>
echo "---- Going to run zz01*.pl";
./zz01_make_new_substance_file.pl "../GlyTouCan-${monthyear}/002_GlyTouCan_IDs_to_add_to_pubchem_records_as_synonyms/add_substance_synonyms.tsv" "../PubChem-${monthyear}/001_stupidly_large_reference_tables/substance${dot_ymd}.tsv.gz"
echo -e "\tRan zz01*.pl";

#./zz02_append_new_compound_entries.bash
#./zz02_append_new_compound_entries.bash <GlyTouCan_file>
echo "---- Going to run zz02*.pl";
./zz02_append_new_compound_entries.bash "../GlyTouCan-${monthyear}/003_compound_appendix_for_non-PubChem_GlyTouCan_ACs/compound.GlyTouCan_appendix.tsv"
echo -e "\tRan zz02*.pl";
#./zz03_qsub_gzip_commands.bash 

#Upon testing in prepare_C2M2_submission.py, for GlyGen, there were some IDs missing from this.
#Mano extracted their info from the current psql DB using the command:
curwd="${PWD}"

# Rest of the processing, i.e., adding missing compounds is done in add_missing_compound.sh
# Note that the above scripts zz01* zz02* etc generate the files compound.tsv and substance.tsv
# Run the script below after the log file from testing the prepare_C2M2_submission.py script on all DCC's C2m2 packages is ready
#./add_missing_compound.sh compound compound schema_update_test_other_changes "${C2M2_sub_folder}"
echo "---- Going to run add_missing_compound.sh";
./add_missing_compound.sh ${file_base} ${kw} ${logf_base} ${C2M2_sub_folder}
echo -e "\tRan add_missing_compound.sh";

#Then run zz03_qsub_gzip_commands.bash
echo "---- Going to run zz03*.pl";
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
tf="${C2M2_sub_folder}/scripts/external_CV_reference_files"
cmdstr1="cp \"${cpd_ymd}.tsv.gz\" \"${tf}/.\""
cmdstr2="cp \"${subs_ymd}.tsv.gz\" \"${tf}/.\""
echo "---------------------------------";
echo -e "--------\nYou can execute the commands below to copy to external_CV_reference_files folder for testing:\n";
echo -e "${cmdstr1}\n";
echo -e "${cmdstr2}\n";

# Create sample files
./make-sample-files.sh "${cpd_ymd}" "${subs_ymd}"
cpd_sf="${cpd_ymd}.first_5000_records.tsv"
subs_sf="${subs_ymd}.first_5000_records.tsv"

tf="${C2M2_sub_folder}/scripts/external_CV_reference_files/sample_pubchem_reference_data"
cmdstr3="cp \"${cpd_sf}\" \"${cpd_sf}.gz\" \"${subs_sf}\" \"${subs_sf}.gz\" \"${tf}/.\""
echo -e "--------\nYou can execute the commands below to copy to external_CV_reference_files/sample_pubchem_reference_data folder for testing:\n";
echo -e "${cmdstr3}\n";
echo "---------------------------------";

