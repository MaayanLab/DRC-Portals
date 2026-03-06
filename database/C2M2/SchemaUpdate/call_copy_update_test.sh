#!/bin/bash
#
# First be in folder ${HOME}/CFDE/C2M2_sub (or /mnt/share/CFDE/C2M2_sub) since other needed 
# resources are there.
# Assuming this script will be operated from the folder ~/CFDE/C2M2_sub, it takes the arguments:
# name of the first script to be called
# name of the second script to to be called by the first script
# folder path for schemaupdate_dir
# onlyTest: 0 (copy, update test) or 1 (only test) or 2 (copy, test)
# ingest_c2m2s_parent_folder: if not specified, defaults to: "${schemaupdate_dir}/.."
#
# Call syntax:
#
#./call_copy_update_test.sh ./copy_update_test_dcc_c2m2_package_for_biofluid.sh \
# append_random_biofluid_to_bios_col_biof.sh ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate 0 \
# ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate/..
#
# OR, in one line:
#
# ./call_copy_update_test.sh ./copy_update_test_dcc_c2m2_package_for_biofluid.sh append_random_biofluid_to_bios_col_biof.sh ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate 0 ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate/..
#
# Another example
# For file.tsv access_url update
# mock access_url related data in file.tsv.
#./call_copy_update_test.sh ./copy_update_test_dcc_c2m2_package_for_access_url.sh \
# append_random_access_url_to_file.sh ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate 0
# OR, in one line: 5th argument not specified
#./call_copy_update_test.sh ./copy_update_test_dcc_c2m2_package_for_access_url.sh append_random_access_url_to_file.sh ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate 0
#
# To only test, and not copy and not update any of the files in any of the DCC's C2M2 packages:
#./call_copy_update_test.sh copy_test_dcc_c2m2_package_generic.sh donothing.sh ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate 1

# To only copy and test (no update) the files in the DCC's C2M2 packages:
#./call_copy_update_test.sh copy_test_dcc_c2m2_package_generic.sh donothing.sh ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate 2

# The above command started many copies of the above command, printing:
# /bin/bash: warning: shell level (1000) too high, resetting to 1
#had to kill using
# kill -9 $(ps -ef | grep call_copy_update_test | grep -v grep | awk '{print $2}')

# If needed, copy script to suitable location and chmod, e.g.
#[user@server SchemaUpdate]$ chmod a+x *.sh && cp *.sh ~/CFDE/C2M2_sub/.

# Loop over the list of DCC-named folders inside SchemaUpdate/../ingest/c2m2s, construct the arguments 
# for the script ./copy_update_test_dcc_c2m2_package_for_biofluid.sh or copy_test_dcc_c2m2_package_generic.sh 
# and call it.

# The key task is to find the subfolder that has the actual c2m2 package files such as 
# project.tsv, biosampple.tsv, collection.tsv and file.tsv with total combined row count >= 15

echo "--------------------- Script $0: Started   ---------------------"

f1=project.tsv
f2=biosample.tsv
f3=collection.tsv
f4=file.tsv

scriptfile_for_copy_update_test="$1"
scriptfile_for_update="$2" # script to run to make changes in the seelect tsv files: e.g., append_random_biofluid_to_bios_col_biof.sh
schemaupdate_dir="$3" # ....../DRC-Portals/database/C2M2/SchemaUpdate
onlyTest=0
schema_json_file=C2M2_datapackage.json

# Set below, onlyTest to 0 if want to copy and update the C2M2 files, 1 if already updated
# Usually, 1 if only testing prepare_C2M2_submission.py (with updated master ontology files) and frictionless
if [[ $# -ge 4 ]]; then
	onlyTest=$4
fi

if [[ $# -ge 5 ]]; then
	schema_json_file=$5
fi

# use "${schemaupdate_dir}/.." so that no need to make another copy of the C2M2 files from DCCs (and related files in ingest)
ingest_c2m2s_parent_folder="${schemaupdate_dir}/.."
if [[ $# -ge 6 ]]; then
	ingest_c2m2s_parent_folder=$6
fi


curdir="$PWD"
#ingest_c2m2s="${schemaupdate_dir}/ingest/c2m2s"
ingest_c2m2s="${ingest_c2m2s_parent_folder}/ingest/c2m2s"

echo "scriptfile_for_copy_update_test: $scriptfile_for_copy_update_test";
echo "scriptfile_for_update: $scriptfile_for_update";
echo "schemaupdate_dir: $schemaupdate_dir";
echo "onlyTest: ${onlyTest}";
echo "ingest_c2m2s: $ingest_c2m2s";
echo "curdir: $curdir";
echo "schema_json_file: $schema_json_file";

source_dirs=()

# ChatGPT question that generated part of this code; modifications done
# In linux folders and subfolderes find the one containing files project.tsv, biosample.tsv and collection.tsv with combined rows more than 10
# Search for directories containing all key files
row_count_min=15
echo "--------- Finding folders that contain key tsv files ---------"
all_folderlist=$(find "$ingest_c2m2s" -type f \( -name "${f1}" -o -name "${f2}" -o -name "${f3}" -o -name "${f4}" \) -printf '"%h"\n' | sort | uniq)
echo "--- List of all folders without any row count check ---" 
echo "${all_folderlist[@]}" 

echo "--- The loop for row count check started ---" 
##for dir in $(find "$ingest_c2m2s" -type f \( -name "${f1}" -o -name "${f2}" -o -name "${f3}" -o -name "${f4}" \) -printf '"%h"\n' | sort | uniq); do
## find "$ingest_c2m2s" -type d | while IFS= read -r dir; do
# The above didn't handle spaces in folder paths
while IFS= read -r dirx; do # See at the end of this while loop: <(find "$ingest_c2m2s" -type d)
  # Check if the directory contains all the key files
  #echo "$dir"
  if [[ -f "$dirx/${f1}" && -f "$dirx/${f2}" && -f "$dirx/${f3}" && -f "$dirx/${f4}" ]]; then
    # Count the combined rows
    combined_rows=$(wc -l "$dirx/${f1}" "$dirx/${f2}" "$dirx/${f3}" "$dirx/${f4}" | grep total | awk '{print $1}')
    
    # Print the directory if combined rows are greater than 10
    if (( combined_rows > row_count_min )); then
      source_dirs+=("$dirx")
      #echo -e "\n${source_dirs[@]}\n"
      echo "Directory: $dirx (Combined rows: $combined_rows)"
    fi
  fi
done < <(find "$ingest_c2m2s" -type d) # This should run in the same subshell

echo "--- List of folders ---" 
echo "${source_dirs[@]}" 
echo "--------------------------------------------------------------"

# Loop over source_dirs, extract the first part of folder path as the dcc_name
#echo "--- Going to loop over the relevant folders ---"
#for sdir in "${source_dirs[@]}"; do
#  echo "--- Folder: $sdir ---"
#done
run_older_for_loop=0
echo "--- Going to loop over the relevant folders using index in a for loop ---"
if [[ "${run_older_for_loop}" -eq 1 ]]; then
  for (( i = 0; i < ${#source_dirs[@]}; i++ ))
  do
    date
    dirx="${source_dirs[$i]}"
    echo -e "\n\n--- Folder: ${dirx} ---\n"
    dirx_after_c2m2s=${dirx#${ingest_c2m2s}/} # no beginning /
    echo "dirx_after_c2m2s: ${dirx_after_c2m2s}"
    dcc_name=$(echo "${dirx_after_c2m2s}"|cut -d'/' -f1) # -f1 works since no beginning /
    echo "dcc_name: ${dcc_name}"
    sdir="${dirx}"
    tdir="${dcc_name}"
    vlogf="${tdir}/validation-logs"/validation_result-${dcc_name}.log
    echo "vlogf: ${vlogf}"
    # Execute the command
    ${scriptfile_for_copy_update_test} "${dirx}" "${tdir}" "${vlogf}" "${scriptfile_for_update}" \
    "${schemaupdate_dir}" "${onlyTest}" "${schema_json_file}"
  done
fi


# Control flag: 1 to check size limit, 0 to process all directories.
test_only_small_packages=1
# Size limit in Megabytes.
package_size_max_in_MB=200

# --- Loop Logic ---
for (( i = 0; i < ${#source_dirs[@]}; i++ ))
do
  # Print the current date at the start of the iteration
  date
  
  dirx="${source_dirs[$i]}"
  
  echo -e "\n\n--- Checking Folder: ${dirx} ---"

  # 1. Directory Existence Check
  if [[ ! -d "${dirx}" ]]; then
    echo "Status: SKIPPED. Directory not found or is inaccessible: ${dirx}"
    continue
  fi

  # 2. Conditional Size Check
  if [[ "${test_only_small_packages}" -eq 1 ]]; then
    
    # Get the directory size in Megabytes (du -sm) and extract the number with awk.
    DIR_SIZE_MB=$(du -sm "${dirx}" 2>/dev/null | awk '{print $1}')

    # Check if size is NOT less than the limit (i.e., size >= limit)
    if (( DIR_SIZE_MB >= package_size_max_in_MB )); then
      echo "Status: SKIPPED. Size (${DIR_SIZE_MB}MB) is ${package_size_max_in_MB}MB or greater. Check limit is enabled."
      continue # Skip the rest of the loop for this directory
    fi
    
    # If the check passed, print confirmation status
    echo "Status: PASSED (Size: ${DIR_SIZE_MB}MB). Limit: ${package_size_max_in_MB}MB."
  else
    # Check limit is disabled
    echo "Status: PASSED. Size check is disabled (test_only_small_packages=0)."
  fi
  
  # --- Commands to operate on dirx (Executed only if not skipped) ---
  
  # The original echo block
  echo -e "\n--- Processing Folder: ${dirx} ---\n"
  
  # Directory manipulation logic
  dirx_after_c2m2s=${dirx#${ingest_c2m2s}/} # no beginning /
  echo "dirx_after_c2m2s: ${dirx_after_c2m2s}"
  
  dcc_name=$(echo "${dirx_after_c2m2s}"|cut -d'/' -f1) # -f1 works since no beginning /
  echo "dcc_name: ${dcc_name}"
  
  sdir="${dirx}"
  tdir="${dcc_name}"
  # Do not use tdir here in vlogf since that relevant code is run from tdir itself
  #vlogf="${tdir}/validation-logs"/validation_result-${dcc_name}.log
  vlogf="validation-logs"/validation_result-${dcc_name}.log
  echo "vlogf: ${vlogf}"
  
  # Execute the command
  ${scriptfile_for_copy_update_test} "${dirx}" "${tdir}" "${vlogf}" "${scriptfile_for_update}" \
  "${schemaupdate_dir}" "${onlyTest}" "${schema_json_file}"
  
done

# An example of the command run in the for loop above
#./copy_update_test_dcc_c2m2_package_for_biofluid.sh \
# ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate/ingest/c2m2s/KidsFirst/20240821_frictionless/frictionless_validation \
# KidsFirst \
# validation-logs/202412/validation_result-KidsFirst.log \
# append_random_biofluid_to_bios_col_biof.sh \
# ~/DRC/DRC-Portals/database/C2M2/SchemaUpdate

echo "--------------------- Script $0: Completed, last dcc_name: ${dcc_name} ---------------------"
