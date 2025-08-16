#!/bin/bash
# Call syntax: ./add_missing_uniprot.sh <file_base> <kw> <logf_base> <C2M2_sub_folder>
# Example:
# ./add_missing_uniprot.sh protein_v2025.03_r2025-06-18 protein schema_update_test_other_changes.log /mnt/share/mano/CFDE/C2M2_sub
#

# This file is generally in a Uniprot processing folder such as: ......../external-CV-reference-scripts/UniProt-Aug-2025
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

file_base="protein_v2025.03_r2025-06-18"
if [[ $# -ge 1 ]]; then
	file_base=$1
fi

kw=protein
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
gzip -k "${kw_file}"

echo "Appended and zipped";
date
echo "done";

#Test the new file protein.2024-11-22.tsv.gz with prepare_C2M2_submision.py (by copying to 
#/home/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files
#or
#/mnt/share/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files
#)
#cp protein.2024-11-22.tsv.gz /mnt/share/mano/CFDE/C2M2_sub/scripts/external_CV_reference_files/.

cmdstr="cp \"${kw_file}.gz\" \"${C2M2_sub_folder}/scripts/external_CV_reference_files/.\""
echo -e "--------\nYou can execute the command below to copy to external_CV_reference_files folder for testing:\n";
echo "${cmdstr}"

