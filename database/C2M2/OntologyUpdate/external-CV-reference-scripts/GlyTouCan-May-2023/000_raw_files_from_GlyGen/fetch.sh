#!/bin/tcsh

curl -O 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_masterlist.csv'
curl -O 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_pubchem_status.csv'

mv glycan_masterlist.csv glycan_masterlist-2023-05-22.csv
mv glycan_pubchem_status.csv glycan_pubchem_status-2023-05-22.csv
