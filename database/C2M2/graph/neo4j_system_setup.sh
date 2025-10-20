#!/bin/sh

# Add the Neo4j container group (note that 7474 is the value used by default in the Neo4j image, same for UID below)
sudo groupadd neo4j -g 7474

# Add the Neo4j container user
sudo useradd -r -s /sbin/nologin -d /nonexistent -g neo4j -u 7474 neo4j