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

# Function to map C2M2 data types to PostgreSQL data types
def typeMatcher(schemaDataType):
    typeMap = {
        'string': 'varchar(5000)',
        'boolean': 'bool',
        'datetime': 'varchar(5000)',
        'binary': 'binary',
        'array': 'TEXT[]',
        'integer': 'varchar(5000)',
        'number': 'varchar(5000)'
    }
    return typeMap.get(schemaDataType)

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

# Iterate over C2M2 tables and create corresponding PostgreSQL tables
for table in tables:
    # Commit any previous changes
    conn.commit()
    
    # Extract table name and fields from C2M2 schema
    tableName = table['name']
    fields = table['schema']['fields']

    # Build the SQL statement to create the table
    createFieldStr = ''
    for field in fields:
        fieldName = field['name']
        fieldType = typeMatcher(field['type'])
        createFieldStr += f'{fieldName} varchar default null, '
        # if fieldType == 'bigint' or fieldType == 'binary' or fieldType == 'float8' or fieldType == 'bool':
        #     createFieldStr = createFieldStr + 'default null,'
        # if fieldType == 'varchar(5000)' or fieldType == 'date' or fieldType == 'TEXT[]':
        #     createFieldStr = createFieldStr + 'default \'\','
    
    ## Add drop table command
    # dropTableStr = f'drop table if exists {tableName} restrict;'
    createTableStr = f'create table {schemaName}.{tableName} ({createFieldStr} sourceDCC varchar(100));'

    # Execute the SQL statement to create the table
    createTableCmd = createTableStr
    # print(createTableCmd)
    # dropTableCmd = dropTableStr
    # cursor.execute(dropTableCmd)
    cursor.execute(createTableCmd)
    
    print("Table has been created successfully!")

# Close the database connection
conn.close()
