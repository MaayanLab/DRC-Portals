#!/bin/bash

# Mano: 2025-08-11
# Different folders such as PubChem-Nov-2024 related to processing of respective ontology or term types.
# In some case, links to folders were used, but they are generally not actively utilized now. To update 
# for the next cycle or whenever update is done, copy existing folder (possibly after deleting any 
# intermediate large files, log files, etc) to a new folder, e.g.,

#[mano@sc-cfdewebdev external-CV-reference-scripts]$ mkdir UniProt-Aug-2025
#[mano@sc-cfdewebdev external-CV-reference-scripts]$ cp --preserve=mode,ownership,timestamps -R UniProt-Nov-2024/* UniProt-Aug-2025/.

# Go to the new folder, e.g., UniProt-Aug-2025, and go through the README file there, if any, else review the code and run appropriate scripts.
#

# Similarly, for GlyTouCan-Aug-2025 and PubChem-Aug-2025
#
#  Finally, to combine PubChem and GlyTouCan
#mano@sc-cfdewebdev external-CV-reference-scripts]$ mkdir zz99_merge_GlyTouCan_and_PubChem_data-Aug-2025
#[mano@sc-cfdewebdev external-CV-reference-scripts]$ cp --preserve=mode,ownership,timestamps -R zz99_merge_GlyTouCan_and_PubChem_data-Nov-2024/* zz99_merge_GlyTouCan_and_PubChem_data-Aug-2025/.

# and modify and run the scripts there as needed

# By default it will exit to avoid accidental run: uncomment to actually run and then comment again
actually_run=1
if [[ "$actually_run" == "0" ]]; then
	echo "This script will exit, set actually_run=1 to actually run";
	exit 0
fi

# Automating the above commands even further:
mon_str=Aug
mon_str_num=08
yr_str=2026

mon_str_prev=Aug
mon_str_num_prev=08
yr_str_prev=2025

mon_yr_str=${mon_str}-${yr_str}
mon_yr_str_num=${mon_str_num}-${yr_str}

mon_yr_str_prev=${mon_str_prev}-${yr_str_prev}
mon_yr_str_num_prev=${mon_str_num_prev}-${yr_str_prev}

#for fbase in UniProt PubChem GlyTouCan zz99_merge_GlyTouCan_and_PubChem_data Ensembl; do
#for fbase in zz99_merge_GlyTouCan_and_PubChem_data; do
for fbase in Ensembl; do
	sf=${fbase}-${mon_yr_str_prev}
	tf=${fbase}-${mon_yr_str}
	echo "------- Source folder: $sf          | Target folder: $tf -------"
	mkdir ${tf}
	echo "------- Created target folder"
	cp --preserve=mode,ownership,timestamps -R ${sf}/* ${tf}/.
	echo "------- Copied files from source folder to target folder"
done

# Mano: 2026/07/27
# Later, to further copy specific folders to TSCC if the older files may have been deleted on TSCC after a while
# Server:login.tscc.sdsc.edu
# Main folder: /tscc/lustre/ddn/scratch/mano/external-CV-reference-scripts (can be different for someone else depending upon where they keep it)
# Example of copying PubChem-Aug-2026
# scp -r PubChem-Aug-2026 mano@login.tscc.sdsc.edu:/tscc/lustre/ddn/scratch/mano/external-CV-reference-scripts/.

