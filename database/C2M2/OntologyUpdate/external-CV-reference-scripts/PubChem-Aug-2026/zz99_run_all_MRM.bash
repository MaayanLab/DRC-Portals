#!/bin/bash
#
# Mano: We don't run this as a script. Instead, we run the commands below (after the cd line) individually. 
# In case where batch submission can be done, we submit that batch script, usually named as run_on_TSCC_*.sh

userID=`whoami`

echo "userID=$userID"

sleep_seconds=20

wait_after_completion=60

wait_for_grid() {
   
   local grep_string=$1

   local doneFlag=0

   while [ "$doneFlag" == "0" ]
   do
      local qCount=999

      while [ "$qCount" != "0" ]
      do
	 sleep $sleep_seconds

         qCount=`( ./zz98_qstat_extended.pl | grep $userID | grep $grep_string | wc -l ) 2>&1`

	 echo "       "[`date`] waiting... [$qCount]
      done

      if [ "$qCount" == "0" ]
      then
         sleep $wait_after_completion
         doneFlag=1
      fi
   done
}

cd /local/projects/CFDE/C2M2/PubChem-Aug-2026

# Consider running these commands individually (including, zz02*.pl and zz06_*multijob.pl on terminal or through batch submit to cluster) in sequence
 ( ./zz00_seed_compound_TSV.pl < /dev/null > log/zz00_seed_compound_TSV.pl.out 2> log/zz00_seed_compound_TSV.pl.err ) && \
   ( ./zz01_add_compound_synonyms.pl < /dev/null > log/zz01_add_compound_synonyms.pl.out 2> log/zz01_add_compound_synonyms.pl.err ) && \
   ( ./zz02_seed_substance_TSV.pl < /dev/null > log/zz02_seed_substance_TSV.pl.out 2> log/zz02_seed_substance_TSV.pl.err ) && \
   ( ./zz03_split_substance_TSV.pl < /dev/null > log/zz03_split_substance_TSV.pl.out 2> log/zz03_split_substance_TSV.pl.err ) && \
   ( ./zz04_sort_substance_TSV.pl < /dev/null > log/zz04_sort_substance_TSV.pl.out 2> log/zz04_sort_substance_TSV.pl.err ) && \
   ( ./zz05_interleave_final_stub_set.pl < /dev/null > log/zz05_interleave_final_stub_set.pl.out 2> log/zz05_interleave_final_stub_set.pl.err ) && \
#   ( ./zz06_add_substance_synonyms.GRID.pl < /dev/null > log/zz06_add_substance_synonyms.GRID.pl.out 2> log/zz06_add_substance_synonyms.GRID.pl.err ) && \
   ( ./zz06_add_substance_synonyms.multijob.pl < /dev/null > log/zz06_add_substance_synonyms.multijob.pl.out 2> log/zz06_add_substance_synonyms.multijob.pl.err && \
   wait_for_grid "synSub_" && \
   ( ./zz07_concatenate_substance_TSV.pl < /dev/null > log/zz07_concatenate_substance_TSV.pl.out 2> log/zz07_concatenate_substance_TSV.pl.err ) && \
   ( ./zz51_extract_first_5000.sh 2025-08-11 ) # Change the date argument suitably or pass no arguments

# for zz006 local version:
# ./zz06_add_substance_synonyms.LOCAL.pl < /dev/null > log/zz06_add_substance_synonyms.LOCAL.pl.out 2> log/zz06_add_substance_synonyms.LOCAL.pl.err
# For running GRID version on TSCC, renamed it to *multijob*, this line will be in the Slurm batch script file
# ./zz06_add_substance_synonyms.multijob.pl < /dev/null > log/zz06_add_substance_synonyms.multijob.pl.out 2> log/zz06_add_substance_synonyms.multijob.pl.err

