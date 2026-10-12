#!/bin/bash
# Call syntax: ./add_missing_compound.sh <file_base> <kw> <logf_base> <C2M2_sub_folder>
# Example:
# ./add_missing_compound.sh compound.2025-08-11 compound schema_update_test_other_changes /mnt/share/mano/CFDE/C2M2_sub
#

# This file is generally in a Uniprot processing folder such as: ......../external-CV-reference-scripts/zz99_merge_GlyTouCan_and_PubChem_data-Aug-2025
# If elsewhere, likely, it is there for a back up, e.g., in ............../DRC-Portals/database/C2M2/SchemaUpdate

# This script appends missing compound entries to the master TSV file, then compresses it.
# 2024/11/26 Mano, revised 2025/08/18 for safety & clarity

#List of files:

#compound.2025-08-11.tsv.gz & tsv.gz: (file name may have been just protein.tsv)
#Prepared by Mano using the scripts (on TSCC).

#Upon testing in prepare_C2M2_submission.py, for GlyGen, there were some IDs missing from this. 
#Mano extracted their info from the current psql DB using the command:

set -euo pipefail


#--------- INPUTS

curdir="$PWD"

file_base="compound.2025-08-11"
if [[ $# -ge 1 ]]; then
	file_base=$1
fi

kw=compound
if [[ $# -ge 2 ]]; then
	kw=$2
fi

logf_base=schema_update_test
if [[ $# -ge 3 ]]; then
	logf_base=$3
fi

C2M2_sub_folder="/mnt/share/mano/CFDE/C2M2_sub"
if [[ $# -ge 4 ]]; then
	C2M2_sub_folder=$4
fi

date
echo "Current folder: ${curdir}";

echo "file_base: ${file_base}";
echo "kw: ${kw}";
echo "logf_base: ${logf_base}";
echo "C2M2_sub_folder: ${C2M2_sub_folder}";

#---------  PROCESSING

echo "Started processing";

#kw_0_file="${file_base}--0.tsv"
kw_file="${file_base}.tsv"
kw_file_gz="${file_base}.tsv.gz"

# Check for compound.tsv or compound.tsv.gz
if [[ -f "$kw_file" ]]; then
    echo "$kw_file already exists — nothing to do."
elif [[ -f "$kw_file_gz" ]]; then
    echo "$kw_file not found, but $kw_file_gz exists — unzipping..."
    gunzip -k "$kw_file_gz"   # -k keeps the .gz; drop -k to remove it
    echo "Unzipped to $kw_file"
else
    echo "ERROR: Neither $kw_file nor $kw_file_gz exist." >&2
    exit 1
fi

#cp "${kw_file}" "${kw_0_file}"

if [[ ! -d "$C2M2_sub_folder" ]]; then
    echo "Error: folder $C2M2_sub_folder does not exist." >&2
    exit 1
fi

cd "$C2M2_sub_folder"

echo "Current folder: ${PWD}";

logf="${logf_base}".log

#pwd
#/home/mano/CFDE/C2M2_sub
./extract_missing_terms.sh "${logf}" "${kw}"

echo "Extracted missing terms for term type: ${kw}";

#Copied the file missing_proteins.tsv to this folder, and appended (excluding header) to main ontology file:
missing_fname="missing_${kw}s.tsv"

# if the file missing_proteins.tsv has searchable column, exclude it: now done in extract_missing_terms.sh itself

cp "${missing_fname}" "${curdir}"/.
cd "${curdir}"

echo "Going to append the missing terms to the master ontology file for: ${kw}, output filename: ${kw_file}";

sed '1d' "${missing_fname}" >> "${kw_file}"
#gzip -k "${kw_file}" #  Done in a different script

#echo "Appended and zipped";
echo "Appended";
date
echo "done";

#Test the new file compound.2025-08-11.tsv.gz with prepare_C2M2_submision.py (by copying to 
#/home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files
#or
#/mnt/share/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files
#)
#cp compound.2025-08-11.tsv.gz /mnt/share/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files/.

# This step done in a different file that also calls this script
#cmdstr="cp \"${kw_file}.gz\" \"${C2M2_sub_folder}/scripts/external_CV_reference_files/.\""
#echo -e "--------\nYou can execute the command below to copy to external_CV_reference_files folder for testing:\n";
#echo "${cmdstr}"

