#!/bin/bash
#
# Script to copy json schema with minor update, i.e., <updated_json.json> 
# (optonal argument) to the folders with C2m2 tsv files and perform validation
# using frictionless validate as well as cfde-c2m2 validate.
#
# Please note that if new columns or tables are added to the schema then that 
# will require cfde-c2m2 init and possibly, cfde-c2m2 prepare separately on 
# respective packages before trying this script.
#
# Call syntax: ./run_validations_with_minorupdated_schema.sh 2>&1 | tee ${logf} "master_validation_log_$(date +%y%m%d).log"
# Call syntax: ./run_validations_with_minorupdated_schema.sh <updated_json.json> 2>&1 | tee ${logf} "master_validation_log_$(date +%y%m%d).log"
#
# Requirements:
# cfde-c2m2 should be already installed. If not, visit https://github.com/MaayanLab/cfde-c2m2
# and follow instructions for installation and usage.

# Define base search directory
base_dir="./ingest/c2m2s"

# Define path to C2M2 base directory
C2M2path=~/DRC/DRC-Portals/database/C2M2

# Define JSON filenames
if [[ $# -lt 1 ]]; then
    fixed_json="${C2M2path}/SchemaUpdate/C2M2_datapackage_fix_enum.json"
else
	fixed_json=$1
fi

datapackage_json="C2M2_datapackage.json"
datapackage_backup_json="C2M2_datapackage_dnld.json"

# Required TSV files to check
required_files=(file.tsv file_format.tsv subject.tsv biosample.tsv collection.tsv)

# Store valid directories
matching_dirs=()

echo "Searching for valid data folders in $base_dir..."

# Find all directories recursively, excluding __MACOSX
while IFS= read -r -d '' dir; do
    [[ "$dir" == *"__MACOSX"* ]] && continue  # Skip __MACOSX folders

    all_present=true
    for fname in "${required_files[@]}"; do
        if [[ ! -f "$dir/$fname" ]]; then
            all_present=false
            break
        fi
    done

    $all_present && matching_dirs+=("$dir")
done < <(find "$base_dir" -type d -print0)

echo "Found ${#matching_dirs[@]} valid data folders."

# Loop through each valid directory
for dir in "${matching_dirs[@]}"; do
    echo ""
    echo "Processing directory: $dir"
    cd "$dir" || { echo "Failed to enter $dir"; continue; }

    echo "Using C2M2path: $C2M2path"
    echo "Using datapackage JSON: $datapackage_json"
    echo "Backup JSON (if needed): $datapackage_backup_json"
    echo "FixedJSON source: $fixed_json"

    # Backup existing datapackage JSON
    if [[ -f "$datapackage_json" ]]; then
        echo "Backing up $datapackage_json → $datapackage_backup_json"
        cp "$datapackage_json" "$datapackage_backup_json"
    fi

    # Replace datapackage JSON with fixed version
    echo "Applying fixed JSON schema from $fixed_json"
    cp "$fixed_json" "$datapackage_json"

    # Run frictionless validation in background
    echo "Running: frictionless validate $datapackage_json > validation_result1.log &"
    frictionless validate "$datapackage_json" > validation_result1.log &

    # Run cfde-c2m2 validation in foreground
    echo "Running: cfde-c2m2 validate > validation_result2.log"
    cfde-c2m2 validate > validation_result2.log

    # Print invalid results if found
    echo "Searching for 'invalid' in log files..."
    grep -i invalid validation_result*.log

    # Show path to log files
    echo "Validation complete for: $dir"
    echo " → Logs: $dir/validation_result1.log, $dir/validation_result2.log"

    # Return to previous directory
    cd - > /dev/null
done

echo ""
echo "All validations completed."
