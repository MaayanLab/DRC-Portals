#!/bin/bash
set -e

files=(
    "curated_synonyms.cypher"
    "synonym_constraints.cypher"
    "synonym_indexes.cypher"
    "synonyms.cypher"
    "direct_dcc_connections.cypher"
    "add_unique_rels.cypher"
    "add_biosample_collection_pids.cypher"
    "add_biosample_file_pids.cypher"
    "add_biosample_project_pid.cypher"
    "add_file_collection_pids.cypher"
    "add_file_project_pid.cypher"
    "add_subject_collection_pids.cypher"
    "add_subject_file_pids.cypher"
    "add_subject_project_pid.cypher"
)

# Iterate over the array of filenames
for filename in "${files[@]}"; do
    # Check if it's a file
    if [ -f "/import/revisions/$filename" ]; then
        printf '%s\n' "[$(date)] Loading file $filename..."
        cypher-shell -p $PASSWORD -u $USERNAME -d $GRAPH_C2M2_DBNAME -a $DB_ADDRESS -f "/import/revisions/$filename"
    fi
done
