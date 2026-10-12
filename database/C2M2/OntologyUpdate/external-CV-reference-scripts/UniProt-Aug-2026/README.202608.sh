##!/bin/bash
#
# See and call the script zz99_run_all_uniprot.sh

monthyear=Aug-2026
file_base=protein_v2026.02_r2026-06-10


logf=log_zz99.log
./zz99_run_all_uniprot.sh ${monthyear} ${file_base} 2>&1 | tee ${logf}


