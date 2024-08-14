#!/bin/bash
set -e

files=(
    "synonym_constraints.cypher"
    "synonym_indexes.cypher"
    "synonyms.cypher"
    "all_projects_dcc.cypher"
)

# Iterate over the array of filenames
for filename in "${files[@]}"; do
    # Check if it's a file
    if [ -f "/import/revisions/$filename" ]; then
        echo Loading file $filename...
        cypher-shell -p $PASSWORD -u $USERNAME -d $GRAPH_C2M2_DBNAME -f "/import/revisions/$filename"
    fi
done
