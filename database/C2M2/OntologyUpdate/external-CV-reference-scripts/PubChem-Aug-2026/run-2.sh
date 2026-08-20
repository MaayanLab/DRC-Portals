#!/bin/tcsh

qsub -b y -l mem_free=100G -P owhite-startup /local/projects/CFDE/C2M2/PubChem-May-2023/zz99_run_2.bash
