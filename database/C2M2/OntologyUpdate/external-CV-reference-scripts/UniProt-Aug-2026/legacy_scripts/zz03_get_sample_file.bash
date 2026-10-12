#!/usr/bin/bash

zcat protein.tsv.gz | head -q -n5001 > protein.first_5000_records.tsv

gzip protein.first_5000_records.tsv


