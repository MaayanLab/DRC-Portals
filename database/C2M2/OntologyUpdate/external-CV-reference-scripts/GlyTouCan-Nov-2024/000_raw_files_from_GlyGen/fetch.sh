#!/bin/bash

# 2024/11/27: Mano
# Gpt ssl cert error with curl, can pass -k option or use wget
#curl -O 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_masterlist.csv'
#curl -O 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_pubchem_status.csv'
curl -k -O 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_masterlist.csv'
curl -k -O 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_pubchem_status.csv'
#wget -nc 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_masterlist.csv'
#wget -nc 'https://data.glygen.org/ln2data/releases/data/current/reviewed/glycan_pubchem_status.csv'

ymd=$(date +%Y-%m-%d)
echo "Date in yyyy-mm-dd format:$ymd";
#mv glycan_masterlist.csv glycan_masterlist-2023-05-22.csv
#mv glycan_pubchem_status.csv glycan_pubchem_status-2023-05-22.csv
mv glycan_masterlist.csv glycan_masterlist-${ymd}.csv
mv glycan_pubchem_status.csv glycan_pubchem_status-${ymd}.csv

