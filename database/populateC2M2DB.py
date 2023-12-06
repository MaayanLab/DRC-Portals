import pandas as pd
import os
import psycopg2
from psycopg2 import SQL, sql
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


tables = c2m2Obj['resources']

conn = psycopg2.connect(
   database="drc",
    user='drc',
    password='drcpass',
    host='localhost',
    port= '5432'
)

schemaName = 'c2m2Metadata'

cursor = conn.cursor()

conn.autocommit = True

baseDirectory = '/mnt/share/cfdeworkbench/C2M2/latest/'
dccDirectories = [d for d in os.listdir(baseDirectory) if os.path.isdir(os.path.join(baseDirectory, d))]

for dccDirectory in dccDirectories:
    dataPath = os.path.join(baseDirectory,dccDirectory,'data')
    print(dccDirectory)
    for table in tables:
        tableName = table['name']
        tableTSVPath = os.path.join(dataPath,tableName + '.tsv')
        # print(tablePath)
        
        copy_data_query = sql.SQL("""
            COPY {}.{} FROM %s WITH DELIMITER E'\\t' CSV HEADER;
        """).format(sql.Identifier(schemaName), sql.Identifier(tableName))
        
        with open(tableTSVPath, 'r') as tsv_file:
            cursor.copy_expert(sql.SQL(copy_data_query), tsv_file)
            cursor.execute(sql.SQL(copy_data_query), tsv_file)

# for table in tables:
    
#     tsv_path = os.path.join(base_directory, f"")

#     tableName = table['name']
#     fields = table['schema']['fields']

#     createFieldStr = ''
#     for field in fields:
#         fieldName = field['name']
#         fieldType = typeMatcher(field['type'])
#         createFieldStr += (f'{fieldName} {fieldType}, ')
    
#     createFieldStr = createFieldStr[0:-2]

#     createTableStr = f'create table {schemaName}.{tableName} (sourceDCC varchar(100), {createFieldStr});'

#     sql = createTableStr
#     print(sql)
    
#     cursor.execute(sql)
    
#     print("Database has been created successfully !!");
    
# # Closing the connection
# conn.close()  
