#!/bin/bash
set -e

cypher-shell -p $PASSWORD -u $USERNAME "CREATE USER $GRAPH_C2M2_READER_USERNAME IF NOT EXISTS\
 SET PASSWORD '$GRAPH_C2M2_READER_PASSWORD' CHANGE NOT REQUIRED\
 SET STATUS ACTIVE\
 SET HOME DATABASE $GRAPH_C2M2_DBNAME
"
cypher-shell -p $PASSWORD -u $USERNAME "GRANT ACCESS ON DATABASE $GRAPH_C2M2_DBNAME TO $GRAPH_C2M2_READER_USERNAME"
cypher-shell -p $PASSWORD -u $USERNAME "GRANT MATCH {*} ON GRAPH $GRAPH_C2M2_DBNAME NODES * TO PUBLIC"
cypher-shell -p $PASSWORD -u $USERNAME "GRANT MATCH {*} ON GRAPH $GRAPH_C2M2_DBNAME RELATIONSHIPS * TO PUBLIC"