#!/usr/bin/bash

# Use pigz using upto 4 threads
#qsub -V -b y -q all.q -l mem_free=5G -P owhite-startup -N gzip_compound -e `pwd` -o `pwd` -cwd gzip compound.tsv
pigz -p 4 compound.tsv

#qsub -V -b y -q all.q -l mem_free=5G -P owhite-startup -N gzip_substance -e `pwd` -o `pwd` -cwd gzip substance.tsv
pigz -p 4 substance.tsv

