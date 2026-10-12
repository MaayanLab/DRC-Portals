#!/bin/bash

./zz00_seed_compound_TSV.pl < /dev/null > zz00_seed_compound_TSV.pl.out 2> zz00_seed_compound_TSV.pl.err
./zz01_add_compound_synonyms.pl < /dev/null > zz01_add_compound_synonyms.pl.out 2> zz01_add_compound_synonyms.pl.err
