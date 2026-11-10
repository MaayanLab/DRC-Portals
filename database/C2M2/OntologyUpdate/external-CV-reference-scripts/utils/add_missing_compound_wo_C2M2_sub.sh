#!/bin/bash
# Call syntax: ./add_missing_compound_wo_C2M2_sub.sh <file_base> <kw>
# Example:
# ./add_missing_compound_wo_C2M2_sub.sh compound.2026-07-27 compound
# file_base can be a relative path or absolute path, excluding the ending .tsv
#
#
# This file is generally in a Uniprot or PubChem processing folder such as: ......../external-CV-reference-scripts/zz99_merge_GlyTouCan_and_PubChem_data-Aug-2026
# If elsewhere, likely, it is there for a back up, e.g., in ............../DRC-Portals/database/C2M2/SchemaUpdate

# This script appends missing compound entries to the master TSV file, then compresses it.
# 2024/11/26 Mano, revised 2025/08/18 for safety & clarity, further edit on 2026/08/04

#List of files:

#compound.2026-07-27.tsv.gz & tsv.gz: (file name may have been just protein.tsv)
#Prepared by Mano using the scripts (on TSCC) and then combined with GlyTouCan.

#Mano extracted their info from the current psql DB using suitable command in another script

set -euo pipefail


#--------- INPUTS

curdir="$PWD"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
utils_path="${SCRIPT_DIR}"
extract_missing_scriptname="${utils_path}/extract_missing_terms_by_inDBbutnotinMaster.sh"

file_base="compound.2026-07-27"
if [[ $# -ge 1 ]]; then
	file_base=$1
fi

kw=compound
if [[ $# -ge 2 ]]; then
	kw=$2
fi


date
echo "Current folder: ${curdir}";

echo "file_base: ${file_base}";
echo "kw: ${kw}";

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

echo "Current folder: ${PWD}";

#pwd
#./extract_missing_terms_by_inDBbutnotinMaster.sh "${kw}"
"${extract_missing_scriptname}" "${kw_file}" "${kw}"
echo "Extracted missing terms for term type: ${kw}";

#Copied the file missing_proteins.tsv to this folder, and appended (excluding header) to main ontology file:
missing_fname="missing_${kw}s.tsv"

# if the file missing_proteins.tsv has searchable column, exclude it: now done in extract_missing_terms.sh itself

# Below, cp and cd are not needed anymore since we did not go to another folder
#cp "${missing_fname}" "${curdir}"/.
#cd "${curdir}"

echo "Going to append the missing terms to the master ontology file for: ${kw}, output filename: ${kw_file}";

sed '1d' "${missing_fname}" >> "${kw_file}"
#gzip -k "${kw_file}" #  Done in the calling script

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

