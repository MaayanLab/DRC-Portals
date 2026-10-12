#!/bin/bash

# Set PERLD to suitable path where these modules are installed following: http://useast.ensembl.org/info/docs/api/api_git.html
#PERLD=/local/projects/CFDE/C2M2/phenotype-March-2023/perl
PERLD=/mnt/share/cfdeworkbench/C2M2/ontology/perl
PERL5LIB=${PERL5LIB}:${PERLD}/bioperl-1.6.924
PERL5LIB=${PERL5LIB}:${PERLD}/ensembl/modules
PERL5LIB=${PERL5LIB}:${PERLD}/ensembl-compara/modules
PERL5LIB=${PERL5LIB}:${PERLD}/ensembl-variation/modules
PERL5LIB=${PERL5LIB}:${PERLD}/ensembl-funcgen/modules
export PERL5LIB

script=zz00_map_Entrez_to_EnsEMBL.pl

outFile=zz00_map_Entrez_to_EnsEMBL.pl.out

errFile=zz00_map_Entrez_to_EnsEMBL.pl.err

nohup ./$script < /dev/null > $outFile 2> $errFile &
