#!/bin/bash
set -e

files=(
    "remove_constraints.cypher"
    "remove_indexes.cypher"
    "remove_relationships.cypher"
    "remove_nodes.cypher"
)

# Load env vars
source .env

# Iterate over the array of filenames
for filename in "${files[@]}"; do
    # Check if it's a file
    if [ -f "./reset_database/$filename" ]; then
        printf '%s\n' "[$(date)] Loading file $filename..."
        cypher-shell -p $PASSWORD -u $USERNAME -d $GRAPH_C2M2_DBNAME -a $DB_ADDRESS -f "./reset_database/$filename"
    fi
done
