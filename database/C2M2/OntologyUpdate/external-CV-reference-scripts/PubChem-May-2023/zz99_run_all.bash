#!/bin/bash

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

cd /local/projects/CFDE/C2M2/PubChem-May-2023

 ( ./zz00_seed_compound_TSV.pl < /dev/null > zz00_seed_compound_TSV.pl.out 2> zz00_seed_compound_TSV.pl.err ) && \
   ( ./zz01_add_compound_synonyms.pl < /dev/null > zz01_add_compound_synonyms.pl.out 2> zz01_add_compound_synonyms.pl.err ) && \
   ( ./zz02_seed_substance_TSV.pl < /dev/null > zz02_seed_substance_TSV.pl.out 2> zz02_seed_substance_TSV.pl.err ) && \
   ( ./zz03_split_substance_TSV.pl < /dev/null > zz03_split_substance_TSV.pl.out 2> zz03_split_substance_TSV.pl.err ) && \
   ( ./zz04_sort_substance_TSV.pl < /dev/null > zz04_sort_substance_TSV.pl.out 2> zz04_sort_substance_TSV.pl.err ) && \
   ( ./zz05_interleave_final_stub_set.pl < /dev/null > zz05_interleave_final_stub_set.pl.out 2> zz05_interleave_final_stub_set.pl.err ) && \
   ( ./zz06_add_substance_synonyms.GRID.pl < /dev/null > zz06_add_substance_synonyms.GRID.pl.out 2> zz06_add_substance_synonyms.GRID.pl.err ) && \
   wait_for_grid "synSub_" && \
   ( ./zz07_concatenate_substance_TSV.pl < /dev/null > zz07_concatenate_substance_TSV.pl.out 2> zz07_concatenate_substance_TSV.pl.err )
