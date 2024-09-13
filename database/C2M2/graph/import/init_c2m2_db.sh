#!/bin/bash
set -e

# Drop the database if it exists
cypher-shell -p $PASSWORD -u $USERNAME -a $DB_ADDRESS "DROP DATABASE $GRAPH_C2M2_DBNAME IF EXISTS"

# Recreate the database if it does not exist (which it should not)
cypher-shell -p $PASSWORD -u $USERNAME -a $DB_ADDRESS "CREATE DATABASE $GRAPH_C2M2_DBNAME IF NOT EXISTS"
