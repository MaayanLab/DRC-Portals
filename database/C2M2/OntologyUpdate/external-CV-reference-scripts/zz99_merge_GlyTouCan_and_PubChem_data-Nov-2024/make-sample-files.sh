#!/bin/bash

zcat compound.tsv.gz | head -5001 > compound.first_5000_records.tsv
zcat substance.tsv.gz | head -5001 > substance.first_5000_records.tsv

./truncate_to_first_X_synonyms.pl 100 compound.first_5000_records.tsv
./truncate_to_first_X_synonyms.pl 100 substance.first_5000_records.tsv

#cp compound.first_5000_records.max_100_synonyms_per_term.tsv substance.first_5000_records.max_100_synonyms_per_term.tsv ../external_CV_reference_files-2023-05-16/sample_pubchem_reference_data/
