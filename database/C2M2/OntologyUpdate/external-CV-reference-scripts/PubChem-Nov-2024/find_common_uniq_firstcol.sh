#!/bin/bash
#
# Script to find the common and unique elements from the first columns of two compressed tsv files x and y
# Call syntax: ./find_common_uniq_firstcol.sh x.tsv.gz y.tsv.gz xy
# The 3rd argument, if passed is the prefix for the outfiles.
# Each argument could include path else current folder is used for the output file.

# examples:
# For compound and substance prepared using PubChem-Nov-2024
#To compare the first columns of the older and new versions of the files, use dates in the file names and then compare using the script:
#example, assumning that the input files exist, else specify suitable names, after copying or renaming, etc.
#e.g,
#cd 001_stupidly_large_reference_tables
#mv compound.tsv.gz compound.2024-11-12.tsv.gz && mv substance.tsv.gz substance.2024-11-12.tsv.gz
#./find_common_uniq_firstcol.sh compound.2023-05-24.tsv.gz compound.2024-11-12.tsv.gz compound_2023-05-24_2024-11-12
#./find_common_uniq_firstcol.sh substance.2023-05-24.tsv.gz substance.2024-11-12.tsv.gz substance_2023-05-24_2024-11-12
#
#OR if the older files are at: /tscc/lustre/ddn/scratch/mano/external_CV_reference_files
#then use
#oldf=/tscc/lustre/ddn/scratch/mano/external_CV_reference_files
#newf=./001_stupidly_large_reference_tables
#./find_common_uniq_firstcol.sh ${oldf}/compound.tsv.gz ${newf}/compound.2024-11-12.tsv.gz compare_old_new/compound_2023-05-24_2024-11-12
#./find_common_uniq_firstcol.sh ${oldf}/substance.tsv.gz ${newf}/substance.2024-11-12.tsv.gz compare_old_new/substance_2023-05-24_2024-11-12
#
# Example of ensembl_gene.tsv
#oldf=/mnt/share/cfdeworkbench/C2M2/ontology/external_CV_reference_files
#newf=./Ensembl-Nov-2024/002_all
#./find_common_uniq_firstcol.sh ${oldf}/ensembl_genes.tsv ${newf}/ensembl_genes.2024-11-18.tsv compare_old_new/ensembl_gene_2023-05-24_2024-11-18


userid=$(whoami)
x="$1"
y="$2"

# Ensure both files are provided
if [[ -z "$x" || -z "$y" ]]; then
  echo "Usage: $0 <file1> <file2> <output-dir-file-prefix>"
  exit 1
fi

if [[ $# -lt 3 ]]; then
	z=
else
	z="$3"
fi


# if x and y have paths, find basenames
bx=$(basename "${x}")
by=$(basename "${y}")

curdir=${PWD}
# Extract and sort the first column from both files
cd /tmp
mkdir -p ${userid}
cd "${curdir}"
tmpf="/tmp/${userid}"
tmpx="${tmpf}/${bx}_fc.txt"
tmpy="${tmpf}/${by}_fc.txt"

# One can also use the mktemp command to create temp dir/file
#temp1=$(mktemp) && temp2=$(mktemp)
date
echo "defined bx, by, curdir, tmpf, tmpx, tmpy. Created folder ${userid} inside /tmp";
date

# Handle compressed or uncompressed files
echo "extracting the first column from the 1st file";
if [[ "$x" == *.gz ]]; then
	zcat "$x" | cut -f1 | sort > "${tmpx}"
else
	cut -f1 "$x" | sort > "${tmpx}"
fi

echo "extracting the first column from the 2nd file";
if [[ "$y" == *.gz ]]; then
	zcat "$y" | cut -f1 | sort > "${tmpy}"
else
	cut -f1 "$y" | sort > "${tmpy}"
fi
date

# Find common and unique elements
#comm x_first_col.txt y_first_col.txt > comparison_results.txt

# Extract common and unique elements into separate files
fcom="${z}_common_elements.txt"
fx="${z}_unique_to_x.txt"
fy="${z}_unique_to_y.txt"
echo "defined fcom, fx and fy";
date

if [[ ! -f "${fcom}" && ! -f "${fx}" && ! -f "${fy}" ]]; then
	echo "Finding the common elements"
	comm -12 "${tmpx}" "${tmpy}" > "${fcom}"  # Common
	date
	echo "Finding the elements unique to the 1st file"
	comm -23 "${tmpx}" "${tmpy}" > "${fx}"      # Unique to x.tsv.gz
	date
	echo "Finding the elements unique to the 2nd file"
	comm -13 "${tmpx}" "${tmpy}" > "${fy}"      # Unique to y.tsv.gz
	date
else
	echo -e "At least one the files: ${fcom}, \n${fx} and \n${fy} \nexists, so, will not run the comm command to avoid overwriting.";
fi
#cleanup
rm "${tmpx}" "${tmpy}"

echo "Please see the files:";
echo "${fcom}";
echo "${fx}";
echo "${fy}";

