#!/bin/bash
set -e

files=(
    "synonym_constraints.cypher"
    "synonym_indexes.cypher"
    "synonyms.cypher"
)

# Iterate over the array of filenames
for filename in "${files[@]}"; do
    # Check if it's a file
    if [ -f "/import/revisions/$filename" ]; then
        echo Loading file $filename...
        cypher-shell -p $NEO4J_PASSWORD -u $NEO4J_USERNAME -f "/import/revisions/$filename"
    fi
done
