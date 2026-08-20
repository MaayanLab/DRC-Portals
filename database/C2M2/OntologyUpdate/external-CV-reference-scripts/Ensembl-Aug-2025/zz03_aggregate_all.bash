#!/bin/bash

#cat 001_processed_by_species/*/*.tsv > 002_all/ensembl_genes.tsv

# The above also includes *.coords.tsv, don't want that
find 001_processed_by_species/* -type f -name "*.tsv" ! -name "*.coords.tsv" -exec cat {} + > 002_all/ensembl_genes.tsv



