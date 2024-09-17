#!/bin/bash
set -e

files=(
    "curated_synonyms.cypher"
    "synonym_constraints.cypher"
    "synonym_indexes.cypher"
    "synonyms.cypher"
)

# Iterate over the array of filenames
for filename in "${files[@]}"; do
    # Check if it's a file
    if [ -f "/import/revisions/$filename" ]; then
        printf '%s\n' "[$(date)] Loading file $filename..."
        cypher-shell -p $PASSWORD -u $USERNAME -d $GRAPH_C2M2_DBNAME -a $DB_ADDRESS -f "/import/revisions/$filename"
    fi
done
