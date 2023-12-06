import pandas as pd
import os
import psycopg2
from psycopg2 import sql
import pathlib
import csv
import contextlib
import tempfile
from urllib.parse import urlparse
from dotenv import load_dotenv
from uuid import UUID, uuid5
import json

# Load C2M2 schema from JSON file
c2m2Schema = 'C2M2_datapackage.json'
with open(c2m2Schema, 'r') as f:
    c2m2Obj = json.load(f)

# Extract tables from C2M2 data package
tables = c2m2Obj['resources']

# Connect to PostgreSQL database
conn = psycopg2.connect(
    database="drc",
    user='drc',
    password='drcpass',
    host='localhost',
    port='5432'
)

# Set the schema name
schemaName = 'c2m2Metadata'

# Create a cursor for executing SQL statements
cursor = conn.cursor()

# Enable autocommit to avoid transaction issues
conn.autocommit = True

# Specify the base directory for C2M2 data
baseDirectory = '/mnt/share/cfdeworkbench/C2M2/latest/'

# List directories within the base directory
dccDirectories = [d for d in os.listdir(baseDirectory) if os.path.isdir(os.path.join(baseDirectory, d))]

# Iterate over DCC directories
for dccDirectory in dccDirectories:
    # Construct the path to the data directory for the current DCC
    dataPath = os.path.join(baseDirectory, dccDirectory, 'data')
    
    # Iterate over C2M2 tables
    for table in tables:
        # Extract table name
        tableName = table['name']
        
        # Construct the path to the TSV file for the current table
        tableTSVPath = os.path.join(dataPath, tableName + '.tsv')
        
        # SQL command to populate data from TSV file into the PostgreSQL table
        populateData = f'COPY {schemaName}.{tableName} FROM \'{tableTSVPath}\' WITH CSV HEADER;'
        
        # SQL command to add the DCC name to the 'sourcedcc' column in the PostgreSQL table
        addDCCName = f'UPDATE {schemaName}.{tableName} SET sourcedcc = \'{dccDirectory}\';'
        
        # Execute the SQL commands
        cursor.execute(populateData)
        cursor.execute(addDCCName)

# Close the database connection
conn.close()
