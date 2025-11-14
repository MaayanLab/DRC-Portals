#!/bin/bash
#
# Call syntax: be in the correct folder: ....../database/C2M2/SchemaUpdate or another
# ./append_random_biofluid_to_biosample.sh <foldername_without_ending_slash>
# The folder indicated by the argument should exist with the suitable files

echo "                            --------------------- Script $0: Started   ---------------------"

folder="$1"

curdir="$PWD"

#----------------------------------------------
add_colname=protein

# --- Configuration ---
INPUT_FILE="${folder}"/"biosample.tsv"
OUTPUT_FILE="${folder}"/"biosample_protein.tsv"
# The array of protein IDs to be appended to the three data rows
col_protein=("A0A023PZB3" "A0A023PZF2" "A0A0B4KFD8")

# --- Temporary Files ---
TEMP_COLS_1_2=$(mktemp)
TEMP_PROTEIN_COL=$(mktemp)
TEMP_PROTEIN_COL_TRUNCATED=$(mktemp)

# --- Cleanup function to run on exit ---
function cleanup {
  rm -f "$TEMP_COLS_1_2" "$TEMP_PROTEIN_COL" "$TEMP_PROTEIN_COL_TRUNCATED"
}
#trap cleanup EXIT

# --- Main Logic ---

# 2. Extract the first 4 rows (header + 3 data rows) and the first two columns.
#    The result (Cols 1 and 2) is saved to a temporary file.
#    - head -4: Gets the first 4 rows.
#    - cut -f 1,2: Selects the first and second fields (columns), using the default tab delimiter.
echo "-> Extracting first 2 columns of first 4 rows into a temp file..."
head -4 "$INPUT_FILE" | cut -f 1,2 > "$TEMP_COLS_1_2"

# Get the actual number of lines extracted (header + available data rows)
TOTAL_LINES=$(wc -l < "$TEMP_COLS_1_2")
echo "-> Found $TOTAL_LINES rows in the input extract."

# 3. Create the third column data for 'protein' in a second temporary file.
#    The first line must be the header 'protein'.
echo "-> Preparing 'protein' column data..."
echo "${add_colname}" > "$TEMP_PROTEIN_COL"
# Use printf to output the array elements, each followed by a newline.
printf '%s\n' "${col_protein[@]}" >> "$TEMP_PROTEIN_COL"

# 3.5 TRUNCATE the protein column data to match the number of lines found in the input.
# This is the safety fix. It ensures both files have the exact same line count for 'paste'.
echo "-> Truncating protein data to match $TOTAL_LINES rows..."
head -n "$TOTAL_LINES" "$TEMP_PROTEIN_COL" > "$TEMP_PROTEIN_COL_TRUNCATED"

# 4. Use 'paste' to merge the two temporary files column-wise.
echo "-> Combining columns using paste to create $OUTPUT_FILE..."
paste "$TEMP_COLS_1_2" "$TEMP_PROTEIN_COL_TRUNCATED" > "$OUTPUT_FILE"

# --- Output and Verification ---
echo "--------------------------------------------------------"
echo "SUCCESS! The new file '$OUTPUT_FILE' has been created:"
cat "$OUTPUT_FILE"

# The cleanup function will automatically remove temporary files on exit.
rm -f "$TEMP_COLS_1_2" "$TEMP_PROTEIN_COL" "$TEMP_PROTEIN_COL_TRUNCATED"

echo "                            --------------------- Script $0: Completed ---------------------"

#----------------------------------------------
