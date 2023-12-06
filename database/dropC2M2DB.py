import pandas as pd
import os
import psycopg2
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

# Enable autocommit to avoid transaction issues
conn.autocommit = True

# Create a cursor for executing SQL statements
cursor = conn.cursor()

# Iterate over C2M2 tables and drop the corresponding PostgreSQL tables
for table in tables:
    # Commit any previous changes
    conn.commit()
    
    # Extract table name
    tableName = table['name']
    
    # Execute the DROP TABLE command
    cursor.execute(f'DROP TABLE IF EXISTS {schemaName}.{tableName}')
    
    print(f'Table {schemaName}.{tableName} has been dropped successfully!')

# Close the database connection
conn.close()
