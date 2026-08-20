#!/bin/bash
#
# check_foreign_key.sh
#
# Verify that every value in child_file.child_column exists in
# parent_file.parent_column.
#
# Usage:
#   ./check_foreign_key.sh compound.tsv id substance.tsv compound
#   ./check_foreign_key.sh gene.tsv id protein.tsv gene
#   ./check_foreign_key.sh disease.tsv id phenotype.tsv disease
#
# Exit status:
#   0 = All references are valid.
#   1 = Missing references found.
#   2 = Invalid command-line arguments or other error.

set -euo pipefail

###############################################################################
# Return the 1-based column number of a named column in a TSV file.
###############################################################################
get_column_number() {
    local file="$1"
    local column="$2"

    head -n1 -- "$file" \
        | tr '\t' '\n' \
        | nl -v1 \
        | awk -v col="$column" '$2==col {print $1}'
}

###############################################################################
# Validate a foreign-key relationship between two TSV files.
###############################################################################
check_foreign_key() {
    local parent_file="$1"
    local parent_column="$2"
    local child_file="$3"
    local child_column="$4"

    local parent_col child_col
    local parent_values child_values
    local output_file
    local -a missing

    [[ -f "$parent_file" ]] || {
        echo "ERROR: Cannot find file: $parent_file" >&2
        return 2
    }

    [[ -f "$child_file" ]] || {
        echo "ERROR: Cannot find file: $child_file" >&2
        return 2
    }

    parent_col=$(get_column_number "$parent_file" "$parent_column")
    child_col=$(get_column_number "$child_file" "$child_column")

    [[ -n "$parent_col" ]] || {
        echo "ERROR: Column '$parent_column' not found in $parent_file." >&2
        return 2
    }

    [[ -n "$child_col" ]] || {
        echo "ERROR: Column '$child_column' not found in $child_file." >&2
        return 2
    }

    parent_values=$(mktemp)
    child_values=$(mktemp)

    tail -n +2 -- "$parent_file" \
        | cut -f"$parent_col" \
        | grep -v '^$' \
        | sort -u > "$parent_values"

    tail -n +2 -- "$child_file" \
        | cut -f"$child_col" \
        | grep -v '^$' \
        | sort -u > "$child_values"

    mapfile -t missing < <(comm -23 "$child_values" "$parent_values")

    rm -f "$parent_values" "$child_values"

    output_file="${child_file%.tsv}_missing_${child_column}.txt"

    echo
    echo "Checking foreign key:"
    echo "  ${child_file}:${child_column} --> ${parent_file}:${parent_column}"
    echo

    if ((${#missing[@]} == 0)); then
        : > "$output_file"
        echo "PASS: All references are valid."
        echo "Created empty file: $output_file"
        return 0
    fi

    printf '%s\n' "${missing[@]}" > "$output_file"

    echo "FAIL: Found ${#missing[@]} missing reference(s)."
    echo "Missing IDs written to: $output_file"
    echo
    echo "Missing IDs:"
    printf '  %s\n' "${missing[@]}"

    return 1
}

###############################################################################
# Main
###############################################################################

if [[ $# -ne 4 ]]; then
    cat <<EOF
Usage:
    $0 <parent_file.tsv> <parent_column> <child_file.tsv> <child_column>

Example:
    $0 compound.tsv id substance.tsv compound
    $0 gene.tsv id protein.tsv gene
EOF
    exit 2
fi

echo "[$(date '+%F %T')] Checking foreign-key relationship:check_foreign_key.sh $*"
echo "    $2 in $1 <-- $4 in $3"

check_foreign_key "$@"
exit $?

