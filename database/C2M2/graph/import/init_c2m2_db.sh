#!/bin/bash
set -e

cypher-shell -p $PASSWORD -u $USERNAME -f "CREATE DATABASE $C2M2_DBNAME IF NOT EXISTS"
