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
import json

# debug
debug = 1
actually_ingest_tables = 1

newline = '\n'

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


#%%
dcc_assets = current_dcc_assets()

# Load C2M2 schema from JSON file
c2m2Schema = 'C2M2_datapackage.json'
# Create a Package from the JSON file
package = FLPackage(c2m2Schema)
schema_name = "c2m2"

# write the query to a file as well
qf_name = 'TableDefs.sql'
qf = open(qf_name, "w")

# Create a cursor for executing SQL statements
cursor = conn.cursor()
# Enable autocommit to avoid transaction issues
conn.autocommit = True
# Function to map C2M2 data types to PostgreSQL data types
def typeMatcher(schemaDataType):
    typeMap = {
        'string': 'varchar', # removed the limit of 5000 char for now
        'boolean': 'bool',
        'datetime': 'varchar',
        'binary': 'binary',
        'array': 'TEXT[]',
        'integer': 'varchar', # later, to try bigint
        'number': 'varchar' # later, to try float32?
    }
    return typeMap.get(schemaDataType)

# Create schema from the json definition using frictionless
# Create the schema if it doesn't exist
drop_schema_sql = f'DROP SCHEMA {schema_name} CASCADE;'
print(drop_schema_sql)
cursor.execute(drop_schema_sql)
print("Creating "+ schema_name)
create_schema_str = f"CREATE SCHEMA IF NOT EXISTS {schema_name};"
cursor.execute(create_schema_str)

qf.write(drop_schema_sql)
qf.write(create_schema_str)
qf.write('\n\n/* Define the tables */\n')

if(debug> 1): print(f"Type of package: {type(package)}")

# Iterate over resources in the package
table_names = []; # collect the list from schema
for resource in package.resources:
    table_name = resource.name
    table_names.append(table_name)
    if(debug >0): print(f"=================== table_name: {table_name} ===========================");
    
    fields = resource.schema.fields
    pk = resource.schema.primary_key # Mano: 2023/12/22: frictionless uses _ instead of caps, so use primary_key

    if(debug > 1): print(f"primaryKey: {pk}")

    # Create SQL statement to define the table with default values  DEFAULT {field.get('default', 'NULL')}
    columns_definition = ', '.join([
       f"{field.name} VARCHAR DEFAULT NULL" # original line
       for field in fields
    ])
    # keeping original code
    # Mano: 2023/12/21: to try typeMatcher({field.type}) instead of a single type VARCHAR
    # Better to use full for loop for constructing if then based strings
    coldef_strs =[]

    #if(debug > 0): print(f"type of fields: {type(fields)}");

    for field in fields:
        str1 = f"{field.name} VARCHAR "
        if(debug> 0): print(f"---- Column name: {field.name} ----")
        if(debug> 1): print(f"str1: {str1}")
        if(debug> 1): print(f"field: {field}")
        if(debug> 1): print(f"field.constraints: {field.constraints}")
        if(debug> 1): print(f"type(field.constraints): {type(field.constraints)}")
        if((debug> 1) and ("required" in field.constraints)): print(f'field.constraints["required"]: {field.constraints["required"]}')
        #if(debug > 0): print(f"str(field): {str(field)}");

        #field_keys = list(json.loads(str(field)).keys());
        #cond1 = ("constraints" in field_keys);
        #cond2 = cond1; 
        #if(cond1): cond2 = (field.constraints["required"]);
        #if(debug> 0): print(f'cond1: {cond1}, cond2: {cond2}');

        str2 = "NOT NULL" if (("required" in field.constraints) and (field.constraints["required"])) else "DEFAULT ''" # DEFAULT to change based on type
        #str2 = "NOT NULL" if (field.constraints["required"]) else "DEFAULT ''"; # DEFAULT to change based on type
        coldef_strs.append(str1 + str2)
        if(debug> 0): print(f"---- Column name: {field.name}: information read ----")

    columns_definition = ', \n'.join(coldef_strs)

    #Mano: 2023/12/21: add primary key info
    pk_str = ",\nPRIMARY KEY(" + ', '.join(pk) + ")"

    if(debug >0): print(columns_definition)
    if(debug >0): print(pk_str)
    
    #create_table_query = f"CREATE TABLE {schema_name}.{table_name} ({columns_definition});"
    create_table_query = f"CREATE TABLE {schema_name}.{table_name} ({newline}{columns_definition}{pk_str}{newline});"

    if(debug >0): print(f"create_table_query:{newline}{create_table_query}")

    if(debug >1): input("Press Enter to continue... Will execute the query")
    # Execute the SQL statement to create the table
    
    cursor.execute(create_table_query)
    qf.write(create_table_query)
    qf.write("\n\n")

# # Commit the changes 
conn.commit()

if(debug >0): print("================== Defined all tables ======================")

# sample command to list all clumns of a table
# SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'c2m2' AND table_name = 'file';

qf.close();


print("Names of all tables:"); print(table_names)
input("Press Enter to continue, to ingest the tables...")

qf = open(qf_name, "a")

# #%%
# Ingest C2M2

c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
c2m2s_path = ingest_path / 'c2m2s'

c2m2_datapackage_helper = TableHelper('c2m2_datapackage', ('id', 'dcc_asset_link',), pk_columns=('id',))
c2m2_file_helper = TableHelper('c2m2_file_node', ('id', 'c2m2_datapackage_id', 'creation_time', 'persistent_id', 'size_in_bytes', 'file_format', 'data_type', 'assay_type',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))

with c2m2_file_helper.writer() as c2m2_file:
  with node_helper.writer() as node:
    with c2m2_datapackage_helper.writer() as c2m2_datapackage:
      for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
        c2m2_path = c2m2s_path/c2m2['dcc_short_label']/c2m2['filename']
        c2m2_path.parent.mkdir(parents=True, exist_ok=True)
        if not c2m2_path.exists():
          import urllib.request
          urllib.request.urlretrieve(c2m2['link'], c2m2_path)
        c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
        if not c2m2_extract_path.exists():
          with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
            c2m2_zip.extractall(c2m2_extract_path)

        for table in c2m2_extract_path.rglob('*.tsv'):
            # countDCC = 1
            print(table)
            # ignore files that start with . and also files that not in table names
            table_str = str(table)
            if(debug > 0): print(f"--- {table_str} ---")

            # Check if the last part after the final "/" starts with a dot
            if not re.search(r'/\.', table_str):
                # get table name from posix pathtable_name_withtsv = os.path.basename(table)
                # # Remove the file extension if present
                pattern = r"/(.*).tsv"

                # Use re.search to find the match
                pattern = r"/([^/]+)\.tsv$"

                # Use re.search to find the match
                match = re.search(pattern, table_str)
                table_name = match.group(1)
                
                # Mano: added the if condition: table_names was defined when schema was read
                if (table_name in table_names):
                    df = pd.read_csv(table_str, delimiter='\t')
                
                    print("*** Entering " + table_name + " to database ***")
                    
                    if(debug > 0): print(f"df: #rows = {df.shape[0]}, #cols: {df.shape[1]}{newline}df:{newline}{df}");
                    if(debug > 0): print(f"db schema name:{schema_name}"); 
                    
                    #if(actually_ingest_tables > 0): 
                    df.to_sql(table_name, con=engine, if_exists="append", index=False, schema=schema_name)
                    print(">>> All good.")
                    
                    # SQL command to add the DCC name to the 'sourcedcc' column in the PostgreSQL table
                    # dcc_name = c2m2['dcc_short_label']
                    # #addDCCName = f'UPDATE {schema_name}.{table_name} SET sourcedcc = \'{dcc_name}\';'
                    # if (countDCC == 1):
                    #     add_column_sql = f"ALTER TABLE {schema_name}.{table_name} ADD COLUMN sourcedcc VARCHAR(255);"
                    #     cursor.execute(add_column_sql)
                    # update_dcc_sql = f"UPDATE {schema_name}.{table_name} SET sourcedcc = \'{dcc_name}\';"
                    # cursor.execute(update_dcc_sql)
                    # countDCC = countDCC + 1

qf.write('\n/* Add foreign key constraints */\n');

# Handle foreign keys
for resource in package.resources:
    table_name = resource.name
    if(debug > 0): print(f" ----------- Adding foreign key constraint for table {table_name} ----------");
    
    fks = resource.schema.foreign_keys; # fks is an array since the line in schema file is: "foreignKeys": [ # use foreign_keys
    fkstr0 = f"ALTER TABLE {schema_name}.{table_name} ADD CONSTRAINT ";
    fkcnt = 0;
    for fk in fks:
        fkcnt = fkcnt + 1;
        table2_name = fk["reference"]["resource"];
        cl1 = fk["fields"]; # column names from current table
        cl2 = fk["reference"]["fields"]; # column names from other table
        if(debug > 0):
            print(f"table2_name: {table2_name}") 
            print(f"cl1: {cl1}")
            print(f"cl2: {cl2}")

        if not(isinstance(cl1, list)): cl1 = [cl1]    
        if not(isinstance(cl2, list)): cl2 = [cl2]
        cl1_str = ', '.join(cl1)
        cl2_str = ', '.join(cl2)
        fkname = f"fk_{table_name}_{table2_name}_{fkcnt}"
        fk_query = f"{fkstr0} {fkname} FOREIGN KEY ({cl1_str}) REFERENCES {schema_name}.{table2_name} ({cl2_str});"
        if(debug > 0): print(fk_query)
        # Execute the SQL statement to create the table
        cursor.execute(fk_query)
        qf.write(fk_query);     qf.write("\n")
    
    qf.write("\n")


# # Commit the changes 
conn.commit()

conn.close()

qf.close()
