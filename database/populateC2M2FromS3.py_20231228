import csv
import re
import os
import zipfile
import pandas as pd
import psycopg2
from tqdm.auto import tqdm
from sqlalchemy import create_engine
from frictionless import Package as FLPackage

from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5

# PostgreSQL connection details
database_name = "drc"
user = "drc"
password = "drcpass"
host = "localhost"
port = "5432"

# Connection parameters
conn_params = {
    'database': database_name,
    'user': user,
    'password': password,
    'host': host,
    'port': port,
}

# Replace these with your connection parameters
conn = psycopg2.connect(**conn_params)

# Create a PostgreSQL engine
engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{database_name}')
# engine = create_engine(f'postgresql://drc:drcpass@localhost:5432/drc')


#%%
dcc_assets = current_dcc_assets()

# Load C2M2 schema from JSON file
c2m2Schema = 'C2M2_datapackage.json'

# Create a Package from the JSON file
package = FLPackage(c2m2Schema)
schema_name = "c2m2"

# Create a cursor for executing SQL statements
cursor = conn.cursor()

# Enable autocommit to avoid transaction issues
conn.autocommit = True

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

# Create schema from the json definition using frictionless
cursor.execute(f"DROP SCHEMA {schema_name} CASCADE;")
print("Creating "+ schema_name)
cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {schema_name};")

# Iterate over resources in the package
for resource in package.resources:
    table_name = resource.name
    print(table_name)
    # Extract fields and primary keys to create the table definition
    table_fields = resource.schema.fields
    table_primaryKeys = resource.schema.primary_key

    # Create SQL statement to define the table with default values  DEFAULT {field.get('default', 'NULL')}
    all_fields_definition = ', '.join([
        f"{field.name} VARCHAR DEFAULT NULL"
        for field in table_fields
    ])

    primary_keys_def_query = f"ALTER TABLE {schema_name}.{table_name} ADD PRIMARY KEY (" + ", ".join([
        pk for pk in table_primaryKeys
    ]) + ");"

    create_table_query = f"CREATE TABLE {schema_name}.{table_name} ({all_fields_definition});"
    
    # print(create_table_query)
    # print(primary_keys_def_query)

    # Execute the SQL statement to create the table

    cursor.execute(create_table_query)
    cursor.execute(primary_keys_def_query)

for resource in package.resources:
    table_name = resource.name

    table_foreignKeys_info = resource.schema.foreign_keys

    if table_foreignKeys_info:
      number_relations = len(table_foreignKeys_info)
      for rel in range(number_relations):
        internal_fields = table_foreignKeys_info[rel]["fields"]
        reference_table = table_foreignKeys_info[rel]["reference"]["resource"]
        reference_fields = table_foreignKeys_info[rel]["reference"]["fields"]
        
        # print(internal_fields, reference_table, reference_fields)
        
        foreign_keys_def_query = f"ALTER TABLE {schema_name}.{table_name} ADD CONSTRAINT constraint_{rel} FOREIGN KEY (" + ", ".join([fk for fk in internal_fields]) + f") REFERENCES {reference_table} (" + ", ".join([ext for ext in reference_fields]) + ");"
        # cursor.execute(foreign_keys_def_query)
        print(foreign_keys_def_query, "\n-------------------------------------------------")

# # Commit the changes 
conn.commit()

# Ingest C2M2

# c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
# c2m2s_path = ingest_path / 'c2m2s'

# c2m2_datapackage_helper = TableHelper('c2m2_datapackage', ('id', 'dcc_asset_link',), pk_columns=('id',))
# c2m2_file_helper = TableHelper('c2m2_file_node', ('id', 'c2m2_datapackage_id', 'creation_time', 'persistent_id', 'size_in_bytes', 'file_format', 'data_type', 'assay_type',), pk_columns=('id',))
# node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))

# with c2m2_file_helper.writer() as c2m2_file:
#   with node_helper.writer() as node:
#     with c2m2_datapackage_helper.writer() as c2m2_datapackage:
#       for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
#         c2m2_path = c2m2s_path/c2m2['dcc_short_label']/c2m2['filename']
#         c2m2_path.parent.mkdir(parents=True, exist_ok=True)
#         if not c2m2_path.exists():
#           import urllib.request
#           urllib.request.urlretrieve(c2m2['link'], c2m2_path)
#         c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
#         if not c2m2_extract_path.exists():
#           with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
#             c2m2_zip.extractall(c2m2_extract_path)

#         for table in c2m2_extract_path.rglob('*.tsv'):
#             # countDCC = 1
#             print(table)
#             # ignore files that start with . and also files that not in table names
#             table_str = str(table)
#             # print("---")
#             # print(table_str)
#             # print("---")
#             # Check if the last part after the final "/" starts with a dot
#             if not re.search(r'/\.', table_str):
                
                
#                 # get table name from posix pathtable_name_withtsv = os.path.basename(table)
#                 # # Remove the file extension if present
#                 pattern = r"/(.*).tsv"

#                 # Use re.search to find the match
#                 pattern = r"/([^/]+)\.tsv$"

#                 # Use re.search to find the match
#                 match = re.search(pattern, table_str)
#                 table_name = match.group(1)
                
#                 df = pd.read_csv(table_str, delimiter='\t')
                
#                 print("Entering " + table_name + " to database")
                    
                        
#                 df.to_sql(table_name, con=engine, if_exists="append", index=False, schema=schema_name)
#                 print(">>> All good.")
                    
#                 # SQL command to add the DCC name to the 'sourcedcc' column in the PostgreSQL table
#                 # dcc_name = c2m2['dcc_short_label']
#                 # #addDCCName = f'UPDATE {schema_name}.{table_name} SET sourcedcc = \'{dcc_name}\';'
#                 # if (countDCC == 1):
#                 #     add_column_sql = f"ALTER TABLE {schema_name}.{table_name} ADD COLUMN sourcedcc VARCHAR(255);"
#                 #     cursor.execute(add_column_sql)
#                 # update_dcc_sql = f"UPDATE {schema_name}.{table_name} SET sourcedcc = \'{dcc_name}\';"
#                 # cursor.execute(update_dcc_sql)
#                 # countDCC = countDCC + 1
                

conn.close()