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
   database="c2m2",
    user='c2m2Super',
    password='c2m2',
    host='localhost',
    port= '5432'
)

conn.autocommit = True

cursor = conn.cursor()

for table in tables:
    tableName = table['name']
    fields = table['schema']['fields']

    createFieldStr = ''
    for field in fields:
        fieldName = field['name']
        fieldType = typeMatcher(field['type'])
        createFieldStr += (f'{fieldName} {fieldType}, ')
    
    createFieldStr = createFieldStr[0:-2]

    createTableStr = f'create table {tableName} ({createFieldStr});'

    sql = createTableStr
    
    cursor.execute(sql)
    
    print("Database has been created successfully !!");
    
# Closing the connection
conn.close()    
