#!/usr/bin/bash

#2024/11/26: Mano
# This README file has been written like a bash shell script

#List of files: may be after running one or more scripts:

#[mano@sc-cfdewebdev zz99_merge_GlyTouCan_and_PubChem_data-Nov-2024]$ ls -al
#total 8869116
#drwxrwsr-x.  2 mano drc       4096 Nov 27 09:52 .
#drwxrwsr-x. 15 mano drc       4096 Nov 26 22:05 ..
#-rw-rw-r--.  1 mano drc 2421038132 Nov 26 23:58 compound.2024-11-26.tsv.gz
#-rw-rw-r--.  1 mano drc 2421038132 Nov 26 23:54 compound.tsv.gz
#-rwxrw-r--.  1 mano drc        488 Oct 11 09:26 make-sample-files.sh
#-rw-rw-r--.  1 mano drc       2719 Nov 27 09:50 missing_compounds.tsv
#-rw-rw-r--.  1 mano drc        304 Nov 27 09:49 README
#-rw-rw-r--.  1 mano drc 4231810198 Nov 26 20:29 substance.2024-11-26.tsv.gz
#-rw-rw-r--.  1 mano drc    7697801 Nov 26 23:54 temp1_compound.GlyTouCan_appendix.tsv
#-rwxrwxr-x.  1 mano drc       1543 Oct 11 09:26 truncate_to_first_X_synonyms.pl
#-rw-rw-r--.  1 mano drc          0 Nov 26 23:50 unseen_CIDs.txt
#-rw-rw-r--.  1 mano drc     342800 Nov 26 20:29 unseen_SIDs.txt
#-rwxrwxr-x.  1 mano drc       2758 Nov 26 23:47 zz00_make_new_compound_file.pl
#-rwxrwxr-x.  1 mano drc       2774 Nov 26 20:31 zz01_make_new_substance_file.pl
#-rwxrwxr-x.  1 mano drc        722 Nov 27 09:52 zz02_append_new_compound_entries.bash
#-rwxrwxr-x.  1 mano drc        328 Nov 27 09:52 zz03_qsub_gzip_commands.bash

#Run the perl scripts first, after setting any input files paths in them (in the top part) depending upon where they are actually located.

#Mano modifed ./zz02_append_new_compound_entries.bash extensively.

./zz00_make_new_compound_file.pl 
./zz01_make_new_substance_file.pl
./zz02_append_new_compound_entries.bash
#./zz03_qsub_gzip_commands.bash 

#Upon testing in prepare_C2M2_submission.py, for GlyGen, there were some IDs missing from this.
#Mano extracted their info from the current psql DB using the command:
curwd=${PWD}
cd /home/mano/CFDE/C2M2_sub
pwd
#/home/mano/CFDE/C2M2_sub
./extract_missing_terms.sh schema_update_test.log compound

#Copied the file missing_compounds.tsv to this folder, then used  sed '1d' (to remove header row) and cat:
cp missing_compounds.tsv /mnt/share/cfdeworkbench/C2M2/ontology/external-CV-reference-scripts/zz99_merge_GlyTouCan_and_PubChem_data-Nov-2024/.

cd ${curwd}
# Assuming compound.tsv exists (else, uncompress relevant file and/or rename)
cat sed '1d' missing_compounds.tsv >> compound.tsv

#Then run zz03_qsub_gzip_commands.bash
#./zz03_qsub_gzip_commands.bash
#OR directly,
#gzip compound.tsv
#OR
pigz -k 4 compound.tsv


# If desired, run to extract the first 5000 records as a small sample set; include only the first 100 synonyms
# Did not run for Nov-2024; instead just extracted the first 5001 rows from substance and compound files before adding GlyTouCans.
##./make-sample-files.sh 
# Copy the sample files to suitable folder.

#and then rename compound.tsv.gz to compound.2024-11-26.tsv.gz etc.
mv compound.tsv.gz compound.2024-11-26.tsv.gz
#mv substance.tsv.gz substance.2024-11-26.tsv.gz

#Test the new file compound.2024-11-26.tsv.gz with prepare_C2M2_submision.py (by copying to
# /home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files)
cp compound.2024-11-26.tsv.gz /home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files/.
#cp substance.2024-11-26.tsv.gz /home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files/.

