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

c2m2Schema = 'C2M2_datapackage.json'

with open(c2m2Schema, 'r') as f:
    c2m2Obj = json.load(f)

def typeMatcher(schemaDataType):
    typeMap = {
        'string': 'varchar(5000)',
        'boolean': 'bool',
        'datetime': 'date',
        'binary': 'binary',
        'array': 'TEXT[]',
        'integer': 'int',
        'number': 'float8'
    }
    return typeMap.get(schemaDataType)

tables = c2m2Obj['resources']

conn = psycopg2.connect(
   database="drc",
    user='drc',
    password='drcpass',
    host='localhost',
    port= '5432'
)

schemaName = 'c2m2Metadata'
conn.autocommit = True

cursor = conn.cursor()
# Execute the CREATE SCHEMA command with IF NOT EXISTS clause

schemaName = "c2m2metadata"

for table in tables:
    conn.commit()
    tableName = table['name']
    fields = table['schema']['fields']
    cursor.execute(f'DROP TABLE {schemaName}.{tableName}')
    
    print("Tables have been dropped successfully !!");
    
# Closing the connection
conn.close()    
