#!/bin/bash
# Call syntax: ./add_missing_uniprot_wo_C2M2_sub.sh <file_base> <kw>
# Example:
# ./add_missing_uniprot_wo_C2M2_sub.sh protein__v2026.02_r2026-06-10 protein
#

# This file is generally in a Uniprot processing folder such as: ......../external-CV-reference-scripts/UniProt-Aug-2026
# If elsewhere, likely, it is there for a back up, e.g., in ............../DRC-Portals/database/C2M2/SchemaUpdate

# This script appends missing UniProt entries to the master TSV file, then compresses it.
# 2024/11/26 Mano, revised 2025/08/15 for safety & clarity

#List of files:
#
#-rw-rw-r--.  1 mano drc        4296 Nov 27  2024 missing_proteins.tsv
#-rw-r--r--.  1 mano drc 17964115675 Aug 15 13:55 protein_v2025.03_r2025-06-18--0.tsv
#-rw-r--r--.  1 mano drc 17964115675 Aug 15 12:34 protein_v2025.03_r2025-06-18.tsv
#-rw-rw-r--.  1 mano drc        1947 Aug 15 13:56 README.20250815
#drwxrwsr-x.  2 mano drc          55 Nov 25  2024 sample_uniprot_reference_data

#protein_v2025.03_r2025-06-18--0.tsv & tsv.gz: (file name may have been just protein.tsv)
#Prepared by Srini using the scripts (on TSCC).

#Upon testing in prepare_C2M2_submission.py, for GlyGen, there were some IDs missing from this. 
#Mano extracted their info from the current psql DB using the command:

set -euo pipefail


#--------- INPUTS

curdir="$PWD"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
utils_path="${SCRIPT_DIR}"
extract_missing_scriptname="${utils_path}/extract_missing_terms_by_inDBbutnotinMaster.sh"

file_base="protein_v2026.02_r2026-06-10"
if [[ $# -ge 1 ]]; then
	file_base=$1
fi

kw=protein
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

echo "Appended and zipped";
date
echo "done";



