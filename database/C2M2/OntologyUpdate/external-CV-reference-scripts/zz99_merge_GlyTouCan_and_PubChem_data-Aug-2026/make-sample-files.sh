#!/bin/bash
# Call syntax: ./make-sample-files.sh <cpd_file_base> <subs_file_base>

cpd_file_base="compound"
if [[ $# -ge 1 ]]; then
        cpd_file_base=$1
fi

subs_file_base="substance"
if [[ $# -ge 2 ]]; then
        subs_file_base=$2
fi

C2M2_sub_folder="/mnt/share/mano/CFDE/C2M2_sub"

cpd="${cpd_file_base}.tsv.gz"
subs="${subs_file_base}.tsv.gz"
cpd_5k="${cpd_file_base}.first_5000_records.tsv"
subs_5k="${subs_file_base}.first_5000_records.tsv"

echo "cpd:$cpd"
echo "subs:$subs"
echo "cpd_5k:$cpd_5k"
echo "subs_5k:$subs_5k"

#zcat compound.tsv.gz | head -5001 > compound.first_5000_records.tsv
#zcat substance.tsv.gz | head -5001 > substance.first_5000_records.tsv

# If warning: gzip: stdout : broken pipe, use gzip -dc instead of zcat: gzip -dc compound.tsv.gz | head -5001 > compound.first_5000_records.tsv
zcat "${cpd}" | head -5001 > "${cpd_5k}"
zcat "${subs}" | head -5001 > "${subs_5k}"

ls -al "${cpd_5k}" "${subs_5k}"

gzip -kf "${cpd_5k}"
gzip -kf "${subs_5k}"

echo "gzipped ${cpd_5k} and ${subs_5k}"

# Mano: why truncate to 100
#./truncate_to_first_X_synonyms.pl 100 compound.first_5000_records.tsv
#./truncate_to_first_X_synonyms.pl 100 substance.first_5000_records.tsv

#cp compound.first_5000_records.max_100_synonyms_per_term.tsv substance.first_5000_records.max_100_synonyms_per_term.tsv ../external_CV_reference_files-2023-05-16/sample_pubchem_reference_data/
