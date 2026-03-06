import sys
import pathlib

#inside_C2M2_SchemaUpdate = 0; # set it to 0 if inside C2M2 (SchemaUpdate is a subfolder inside C2M2)
from set_inside_C2M2_SchemaUpdate import inside_C2M2_SchemaUpdate
from set_actually_read_tables import actually_read_tables

if(inside_C2M2_SchemaUpdate==1):
    sys.path.insert(0, str(pathlib.Path(__file__).parent.parent.parent))
else:
    sys.path.insert(0, str(pathlib.Path(__file__).parent.parent))

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
import numpy as np
import sys
import time
import datetime
import subprocess
import gc
import urllib.parse
from dotenv import load_dotenv

# To only download DccAssets.tsv and not actually ingest, set:
# actually_ingest_tables = 0
# actually_read_tables = 0


# debug
debug = 1
actually_create_schema = 1
# actually_read_tables = 0 # imported # do not set here
actually_ingest_tables = 1
write_empty_tsvs = 0
add_missing_columns_for_SchemaUpdate = 1
exit_after_creating_empty_tsvs = 0

fkeycon_include_on_delete_cascade_str = " ON DELETE CASCADE" # or ""

add_searchable_column = 1
index_searchable = 1
searchable_colname = "searchable"
varchar_gin_trgm_ops_str="gin_trgm_ops" # or ""
# Define the exclusion patterns, if none, put some junk string so that no columns excluded
#searchable_col_exclude_pattern = r'id_namespace$|local_id$|persistent_id$|creation_time|access_url|size_in_bytes' #r'^project_|_id$|temp'
# Need to be able to exlcude records with keywords in IDs as well, so include those columns
searchable_col_exclude_pattern = r'id_namespace$|creation_time|size_in_bytes' #r'^project_|_id$|temp'

actually_ingest_tables = actually_create_schema * actually_read_tables * actually_ingest_tables

newline = '\n'
tabchar = '\t'

timenow = datetime.datetime.now(); timenow_fmt = timenow.strftime("%Y-%m-%d %H:%M:%S");
print(f"=============== SRART Time: {timenow_fmt} ===============");

# Lines copied from dburl.py and modified
if (add_missing_columns_for_SchemaUpdate >= 0):
    # Original line if were to use ..../drc-portals/.env
    if(inside_C2M2_SchemaUpdate==1):
        load_dotenv(pathlib.Path(__file__).parent.parent.parent.parent/'drc-portals'/'.env') 
    else:
        load_dotenv(pathlib.Path(__file__).parent.parent.parent/'drc-portals'/'.env') 

    print(f"Loading from ..../drc-portals/.env")
else:
    # This .env doesn't seem to get loaded or DB connection has some issue likely due to Prisma
    load_dotenv(pathlib.Path(__file__).parent/'.env') # Note that .env from this folder itself is used
    print(f"Loading from .env in the current folder")

########## DB ADMIN INFO: BEGIN ############
# Comment the line below with .env.dbadmin if not ingesting, almost always ingesting if running these scripts
#load_dotenv(pathlib.Path(__file__).parent.parent.parent.parent.parent/'DB_ADMIN_INFO'/'.env.dbadmin')
########## DB ADMIN INFO: END   ############
c2m2_database_url = urllib.parse.urlparse(os.getenv('C2M2_DATABASE_URL'))
if(debug> 1):
    ####print(f"{c2m2_database_url.scheme}://{c2m2_database_url.username}:{c2m2_database_url.password}@{c2m2_database_url.hostname}:{c2m2_database_url.port}{c2m2_database_url.path}")
    print(f"Printed debug info on DB");

# PostgreSQL connection details
database_name = c2m2_database_url.path.lstrip('/') # c2m2_database_url.path is /drc, don't want the / part, so fixed here
user = c2m2_database_url.username # "drc"
password = urllib.parse.unquote(c2m2_database_url.password); # "drcpass"
host = c2m2_database_url.hostname # "localhost"
port = c2m2_database_url.port # "5433" # "5432" (default) or "5433"

##### Line below is for debug only, always keep commented otherwise
if(debug> 1):
    ####print(f"user: {user}, password: {password}, database_name: {database_name}, host: {host}, port: {port}")
    print(f"Printed debug info on DB");

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
#engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{database_name}', connect_args={"options": "-c statement_timeout=0"})
# encode the password: https://docs.sqlalchemy.org/en/20/core/engines.html
engine = create_engine(f'postgresql://{user}:{urllib.parse.quote_plus(password)}@{host}:{port}/{database_name}', connect_args={"options": "-c statement_timeout=0"})

#%%
dcc_assets = current_dcc_assets()

# Mano: To define specific schema for each DCC, need their short name or label
# dcc_short_labels not used but kept here for ref if needed later
c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
dcc_short_labels = list(np.unique(c2m2s[['dcc_short_label']].values));
if(debug> 0): print(f"------------ dcc_short_labels:{dcc_short_labels}")

# Load C2M2 schema from JSON file
c2m2Schema = 'C2M2_datapackage.json'
#c2m2Schema = 'C2M2_datapackage_biofluid.json'
#c2m2Schema = 'C2M2_datapackage_PTM.json'
# Create a Package from the JSON file
package = FLPackage(c2m2Schema)

default_dcc_short_label = "C2M2";
default_schema_name = default_dcc_short_label.lower();

# schemaname_pat_rep:
schemaname_pat_rep = {
    " ": "",
    "%20": ""
}

# Mano: 2024/01/02: Trying to use this script to also ingest C2M2 metadata from a single DCC as the DCC submits it.
# Ingest it into a schema by the DCC short name/label, so that the submitter can query from their own metadata only.
# The dcc short name (case sensitive) can be passed in as an argument to this script.
if(len(sys.argv) > 1):
    dcc_short_label = str(sys.argv[1]);
    schema_name = dcc_short_label.lower();
    # schema_name cannot have space and %20
    for patstr, repstr in schemaname_pat_rep.items():
        schema_name = schema_name.replace(patstr, repstr);
    if schema_name[0].isdigit(): schema_name = '_' + schema_name;

    single_dcc = 1;
    print(f"********** DCC name (dcc_short_label) specified as an argument: {dcc_short_label}; will use schema_name: {schema_name}, so, will ingest only from that DCC.");
    qf_folder = 'log/';
    if(len(sys.argv) > 2):
        logfolder = str(sys.argv[2]);
        qf_folder = f'{logfolder}/';
else:
    dcc_short_label = "C2M2";
    schema_name = "c2m2"; #dcc_short_label.lower(); # if there is one by the name c2m2 for testing, use a different name here, e.g., c2
    single_dcc = 0; # metadata from all dccs to be ingested
    print(f"********** No arguments specified: will use schema_name: {schema_name}, and ingest from all DCCs.");
    qf_folder = '';

# write the query to a file as well
qf_name = qf_folder + 'TableDefs_' + dcc_short_label + '.sql'
qf = open(qf_name, "w")

# folder for writing empty tsv files
empty_tsvs_folder = 'empty_tsvs';
pathlib.Path(empty_tsvs_folder).mkdir(parents=True, exist_ok=True);

# Create a cursor for executing SQL statements
cursor = conn.cursor()
# Enable autocommit to avoid transaction issues
conn.autocommit = True
cursor.execute('set statement_timeout = 0')

#==========================================================================================
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

# Function to construct a somewhat complex postgres query
def get_count_match_query(default_schema_name, table_name, schema_name, first_idnamespace_pat_colname, patcol_unique_values_pgstr):
    """
    Based on some variables such as table_name, schema_name, etc.,
    construct string for postgres query code that will compare the 
    count of records in a table in a schema for that DCC with the 
    count in that table in the c2m2 schema with matching id_namespace.
    This is will serve as an additional cross-check for ingestion of 
    metadata in DCC-specific schema.table.
    """
    count_match_query = (
    f"WITH counts AS (SELECT {newline}" +
    f"(select count(*) from {default_schema_name}.{table_name} where {first_idnamespace_pat_colname} IN {patcol_unique_values_pgstr}) AS count1, {newline}" +
    f"(select count(*) from {schema_name}.{table_name}) AS count2) {newline}" +
    f"SELECT counts.count1, counts.count2, CASE WHEN counts.count1 != counts.count2 {newline}" + 
    f"THEN '{schema_name}.{table_name}: Number of records do not match' {newline}" + 
    f"ELSE '{schema_name}.{table_name}: Number of records match' {newline}" +
    f"END AS count_match FROM counts;{newline}");
    return count_match_query

#==========================================================================================
# Function to warn if the columns are not the same in the two lists
def warn_column_names_different(column_names_in_schema, column_names_in_df, debug, newline, cur_dcc_short_label, table_name, extralineText):
    if ((column_names_in_schema != column_names_in_df) or (debug > 0)):
        print(f"{extralineText}");
        if(column_names_in_schema != column_names_in_df):
            fstr1 = f"! WARNING ! dcc_short_label: {cur_dcc_short_label}: "
            fstr2 = f"Table: {table_name}: The columns in the schema and in the tsv file/Pandas dataframe are not the same."
            print(fstr1 + fstr2)
        print(f"Columns names of the table <{table_name}> as listed in the json schema:");
        print(column_names_in_schema);
        print(f"Columns names of the table <{table_name}> as listed in tsv file/Pandas dataframe:");
        print(column_names_in_df);

#==========================================================================================
# query string to add index
def gen_searchable_index_query(schema_name, table_name, searchable_colname, debug, newline, tabchar):
    index_name_str = f"{schema_name}_{table_name}_idx_searchable"
    sidx_str1 = f"DO $${newline}BEGIN{newline}{tabchar}DROP INDEX IF EXISTS {index_name_str};"
    sidx_str2 = f"{tabchar}IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = '{schema_name}' AND tablename = '{table_name}' "
    sidx_str3 = f"{tabchar}AND indexname = '{index_name_str}') THEN"
    sidx_str4 = f"{tabchar}{tabchar}CREATE INDEX {index_name_str} ON {schema_name}.{table_name} USING gin({searchable_colname} {varchar_gin_trgm_ops_str});"
    sidx_str5 = f"{tabchar}END IF;{newline}END $$;"
    searchable_index_query = f"{sidx_str1}{newline}{sidx_str2}{newline}{sidx_str3}{newline}{sidx_str4}{newline}{sidx_str5}";
    return searchable_index_query

#==========================================================================================
def gen_add_searchable_col_query(schema_name, table_name, column_names, searchable_colname, searchable_col_exclude_pattern, debug):
    schema_table_name = f"{schema_name}.{table_name}"

    # Do not use tsvector, use plain text
    # add_searchable_col_str1=f"ALTER TABLE {schema_table_name} ADD COLUMN {searchable_colname} tsvector;";
    add_searchable_col_str1=f"ALTER TABLE {schema_table_name} ADD COLUMN {searchable_colname} VARCHAR DEFAULT '';";

    if(debug > 0):
        print(f"column_names: {column_names}") 
        print(f"searchable_col_exclude_pattern: {searchable_col_exclude_pattern}") 

    # Exclude columns matching any of the patterns
    filtered_columns = [col for col in column_names if not re.search(searchable_col_exclude_pattern, col)]

    column_names_with_schema_table_name = [f"{schema_table_name}.{col}" for col in filtered_columns]

    column_names_comma_sep_str = ', '.join(column_names_with_schema_table_name);
    add_comma_str = ', ' if (len(filtered_columns) > 0) else ''
    # Add empty string as default so that searchable column will get added
    # add_searchable_col_str2_part1 = f"UPDATE {schema_table_name} SET {searchable_colname} = to_tsvector(concat_ws('|', ''{add_comma_str}";
    add_searchable_col_str2_part1 = f"UPDATE {schema_table_name} SET {searchable_colname} = concat_ws('|', ''{add_comma_str}";
    add_searchable_col_str2_part2 =  column_names_comma_sep_str;
    add_searchable_col_str2_part3 = ");"; # "));";
    if(debug > 1):
        print(f"add_searchable_col_str1: {add_searchable_col_str1}") 
        print(f"add_searchable_col_str2_part1: {add_searchable_col_str2_part1}");
        print(f"add_searchable_col_str2_part2: {add_searchable_col_str2_part2}");
        print(f"add_searchable_col_str2_part3: {add_searchable_col_str2_part3}");

    add_searchable_col_str2 = f"{add_searchable_col_str2_part1}{add_searchable_col_str2_part2}{add_searchable_col_str2_part3}";
    # Execute the SQL statement to add the column
    addcol_query = f"{add_searchable_col_str1}{newline}{add_searchable_col_str2}{newline}"
    return addcol_query

#==========================================================================================

t0 = time.time();

# Create schema from the json definition using frictionless
# Create the schema if it doesn't exist
drop_schema_sql = f'DROP SCHEMA IF EXISTS {schema_name} CASCADE;'
print(drop_schema_sql)
if(actually_create_schema==1):
    cursor.execute(drop_schema_sql)
print("Creating "+ schema_name)
create_schema_str = f"CREATE SCHEMA IF NOT EXISTS {schema_name};"
if(actually_create_schema==1):
    cursor.execute(create_schema_str)

qf.write(drop_schema_sql); qf.write(newline);
qf.write(create_schema_str)
qf.write('\n\n/* Define the tables */\n')

if(debug> 1): print(f"Type of package: {type(package)}")

# Iterate over resources in the package
table_names = []; # collect the list from schema
table_exists_dict = {}; # to keep track if this table is in the package submitted by the DCC
for resource in package.resources:
    table_name = resource.name
    table_names.append(table_name)
    table_exists_dict[table_name] = 0
    if(debug >0): print(f"=================== table_name: {table_name} ===========================");
    
    table_fields = resource.schema.fields
    table_primaryKeys = resource.schema.primary_key # Mano: 2023/12/22: frictionless uses _ instead of caps, so use primary_key

    if(debug > 1): print(f"primaryKey: {table_primaryKeys}")

    # Create SQL statement to define the table with default values  DEFAULT {field.get('default', 'NULL')}
    columns_definition = ', '.join([
       f"{field.name} VARCHAR DEFAULT NULL" # original line
       for field in table_fields
    ])
    # keeping original code
    # Mano: 2023/12/21: to try typeMatcher({field.type}) instead of a single type VARCHAR
    # Better to use full for loop for constructing if then based strings
    coldef_strs =[]

    #if(debug > 0): print(f"type of fields: {type(fields)}");
    headerRow=tabchar.join([f"{field.name}" for field in table_fields]);

    empty_table_path = empty_tsvs_folder + '/' + table_name + '.tsv';
    if (write_empty_tsvs == 1):
        ef = open(empty_table_path, "w");    ef.write(f'{headerRow}{newline}');    ef.close();

    for field in table_fields:
        str1 = f"{field.name} VARCHAR "
        if(debug> 1): print(f"---- Column name: {field.name} ----")
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

    #Mano: 2023/12/21: add primary key info: pk means primary key
    pk_str = ",\nPRIMARY KEY(" + ', '.join(table_primaryKeys) + ")"

    if(debug >1): print(columns_definition)
    if(debug >1): print(pk_str)
    
    #create_table_query = f"CREATE TABLE {schema_name}.{table_name} ({columns_definition});"
    create_table_query = f"CREATE TABLE {schema_name}.{table_name} ({newline}{columns_definition}{pk_str}{newline});"

    if(debug >0): print(f"create_table_query:{newline}{create_table_query}")

    if(debug >2): input("Press Enter to continue... Will execute the query")
    # Execute the SQL statement to create the table
    
    if(actually_create_schema==1):
        cursor.execute(create_table_query)
    qf.write(create_table_query)
    qf.write("\n\n")

# # Commit the changes 
#if(actually_create_schema==1):
conn.commit()

if(debug >0): print("================== Defined all tables ======================")

# sample command to list all clumns of a table
# SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'c2m2' AND table_name = 'file';

qf.close();

t1 = time.time();
print(f">>>>>>>>>>>>>>>>>>>>>>>>>>>>> Time taken to define table: {t1-t0} seconds.{newline}");

print("Names of all tables:"); print(f"{table_names}{newline}")

if exit_after_creating_empty_tsvs:    
    conn.close()
    sys.exit(); # exit
#-----------------------------------------------------------------------------

print(f"Going to ingest metadata from files{newline}");

# #%%
# Ingest C2M2

#input("Press Enter to continue, to ingest the tables...")

# Mano: dcc_assets is a pandas data.frame (see the file ingest_common.py) with columns such as 
# 'filetype', 'filename', 'link', 'size', 'lastmodified', 'current', ... 'dcc_short_label'
# Below, c2m2 holds one row.
c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
print(f"{newline}********* c2m2s dataframe, before checking if a single DCC is to be processed, is: **********");
print(f"{c2m2s}"); 

if(single_dcc == 1): # Mano
    c2m2s = c2m2s[c2m2s['dcc_short_label'] == dcc_short_label]; # This should select just one row of the c2m2s data.frame

print(f"{newline}********* c2m2s dataframe is: **********");
print(f"{c2m2s}"); 
#print(f"{str(c2m2s['link'])}");  wait_str = input("Press Enter to continue.");

# write a count query to a file
count_qf_name = qf_folder + 'CountQuery_Crosscheck_' + dcc_short_label + '.sql'
cqf = open(count_qf_name, "w")

if not ingest_path.exists():
  ingest_path.mkdir() # This gets created inside the folder that contains this file

c2m2s_path = ingest_path / 'c2m2s'

c2m2_datapackage_helper = TableHelper('c2m2_datapackage', ('id', 'dcc_asset_link',), pk_columns=('id',))
c2m2_file_helper = TableHelper('c2m2_file_node', ('id', 'c2m2_datapackage_id', 'creation_time', 'persistent_id', 'size_in_bytes', 'file_format', 'data_type', 'assay_type',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))

# Mano: 2024/01/04: Do we really need the three "with ...." lines below. 
# We are not using the variables/objects c2m2_file, node or c2m2_datapackage
# Mano: 2024/04/04: Here we use just two spaces for indent, but later use 4, can create big issue if not careful
# Original lines 'with ... as ' were giving some error based on code in ingest_common.py
####with c2m2_file_helper.writer() as c2m2_file:
####  with node_helper.writer() as node:
####    with c2m2_datapackage_helper.writer() as c2m2_datapackage:
for dummy_x in [1]:
  for dummy_y in [1]:
    for dummy_z in [1]:
      for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
        cur_dcc_short_label = c2m2['dcc_short_label'];
        print(f"\n================================== DCC short label: {cur_dcc_short_label} =============================================");
        c2m2_path = c2m2s_path/c2m2['dcc_short_label']/c2m2['filename']
        c2m2_path.parent.mkdir(parents=True, exist_ok=True)
        if not c2m2_path.exists():
          import urllib.request
          urllib.request.urlretrieve(c2m2['link'].replace(' ', '%20'), c2m2_path)
        c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
        if not c2m2_extract_path.exists():
          with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
            print(f"Unpack zip file: c2m2_extract_path: <{c2m2_extract_path}>"); # Mano
            c2m2_zip.extractall(c2m2_extract_path)

        cqf.write(f"/* =============== DCC short label: {cur_dcc_short_label} =============== */{newline}");

        # Reset all values in table_exists_dict to all 0
        table_exists_dict = {key: 0 for key in table_exists_dict}

        ###############
        if(actually_read_tables == 0):
            print("Not going to read and ingest tables");
            continue
        
        ###############################################################################################
        for table in c2m2_extract_path.rglob('*.tsv'):
            t01 = time.time();

            # countDCC = 1
            # ignore files that start with . and also files that are not in table names
            table_str = str(table)
            if(debug > -1): print(f"--------- {table_str} ---------");
            #print(f"{table}"); # This line may have been causing issue

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

                if(debug > 0): print(f"table_name:{table_name}");

                # Mano: added the if condition: table_names was defined when schema was read
                #
                # Mano: 2024/10/29: For schema update, if a table from table_names is not in the package
                # submitted by the DCC, one option is to copy it from the empty_tsvs and put in that 
                # DCC's folder inside ingest/c2m2s, but since it will have only header row, there is 
                # no impact of doing this. So, let us not do this. Applying/checking the FK constraints 
                # will ensure that a CV ID/value is a colummn of one of the core-tables, then it is also 
                # there in the corresponding CV term table such as anatomy or disease. However, if the 
                # file was not found, then print a warning so that the concerned DCC can be informed.
                #
                # Mano: 2024/10/29: Related to schema update, if table_name is in table_names, then the 
                # column name and order should match between the table and that in the schema. If a column 
                # is missing, then it could be the newly added column corresponding to the schema update. In 
                # this case, during the schema update phase, add the column with appropriate type, default 
                # values e.g., empty string, etc., at the appropriate location (order must match) in the 
                # pandas dataframe and save the file in the same folder by the current file name table_name.tsv 
                # after renaming the existing file as table_name.tsv.orig.
                # This updated file will serve as the new test file. Print enough warning lines 
                # and messages to copy the file to elsewhere. There, the dev team can prepare the package 
                # again, put back in the folder ingest/c2m2s/{c2m2['dcc_short_label']} and try to reingest.
                # Now, the warnings should not be displayed. If multiple columns needed to be inserted, 
                # then ensure the correct order of the columns.
                if (table_name in table_names):
                    # Mark that key in table_exists_dict
                    table_exists_dict[table_name] = 1
                    # Columns in this table as listed in the schema
                    ind = table_names.index(table_name); # 0-based index
                    resource = package.resources[ind];
                    #column_names_in_schema = [field["name"] for field in resource["schema"]["fields"]]
                    column_names_in_schema = [field.name for field in resource.schema.fields]
                    # If needed, try: column_names = [field.name for field in resource.schema.fields]

                    df = pd.read_csv(table_str, delimiter='\t');
                    if(debug > 0): print(f"{cur_dcc_short_label}: {table_name}: Read from file: df: #rows = {df.shape[0]}, #cols: {df.shape[1]}{newline}");
                    
                    #if(debug > 0): print(f"For cross-check:{cur_dcc_short_label}: {df.shape[0]} {table_name}.tsv{newline}");
                    # Use subprocess to count lines in the file to cross-check
                    #numlines_in_file = int(subprocess.check_output("/usr/bin/wc -l " + table_str, shell=True).split()[0]);
                    gc.collect();
                    numlines_in_file = int(subprocess.check_output("grep -c '' " + f'"{table_str}"', shell=True).split()[0]);
                    if(debug > 0): print(f"#Lines in file {table_str}: {numlines_in_file}");

                    if(numlines_in_file - df.shape[0] != 1):
                        raise ValueError(f'#Lines in file should be just 1 more than #rows in df{newline}' +
                                         f'#Lines in file {table_str}: {numlines_in_file}{newline}#Rows of df:{df.shape[0]}');
                    
                    if(df.shape[0] > 0):
                        # drop duplicate rows to begin with
                        df = df.drop_duplicates();
                        if(debug > 0): print(f"df: #rows = {df.shape[0]}, #cols: {df.shape[1]}");

                        # Better to take care of such things in the C2M2 package TSV files themselves, 
                        # so that the burden is on the submitter as this is not scalable for future changes.
                        # Mano: For HMP and SPARC, for the table biosample replace the column name 'assay_type' with 'sample_prep_method'
                        # These DCCs don't have the table sample_prep_method.tsv in their set of files, but that is OK as far as ingestion goes.
                        # cur_dcc_short_label = c2m2['dcc_short_label']; # defined near top of: for _, c2m2 loop
                        if((table_name == 'biosample') and ((cur_dcc_short_label == 'HMP') or (cur_dcc_short_label == 'SPARC'))):
                            df.rename(columns={'assay_type': 'sample_prep_method'}, inplace=True);
                            print(f"{cur_dcc_short_label}: biosample table: changed column name assay_type to sample_prep_method");

                        #++++++++++++++++++++++++++++++++++++++++++++++++++++++
                        # Better to handle in the C2M2 package itself, but keep it for now
                        # This should be after, in biosample, column name assay_type has been replaced with sample_prep_method
                        column_names_in_df = list(df.columns.values);
                        # Warn if the columns are not the same in the two lists
                        extralineText = "Before insertion of any missing columns";
                        warn_column_names_different(column_names_in_schema, column_names_in_df, debug, newline, cur_dcc_short_label, table_name, extralineText);
                        
                        # Add any missing columns in correct position, with default value of '' or null
                        missing_columns = [(index, col) for index, col in enumerate(column_names_in_schema) if col not in column_names_in_df]
                        if((add_missing_columns_for_SchemaUpdate > 0) and (len(missing_columns) > 0)):
                            for index, col in missing_columns:
                                # Put a strict condition that col should be biofluid
                                if(col == 'biofluid'):
                                    df.insert(index, col, None); # use '' (for '' in DB) or None for Null in the DB
                                    column_names_in_df = list(df.columns.values);
                                    extralineText = f"After insertion of column <{col}>";
                                    warn_column_names_different(column_names_in_schema, column_names_in_df, debug, newline, cur_dcc_short_label, table_name, extralineText);

                        #++++++++++++++++++++++++++++++++++++++++++++++++++++++

                        #-----------------------------------------------------------------------------------------
                        # Mano: Look into "on conflict ignore": https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.to_sql.html
                        # if any of pKeys has id_namespace in it, no need to check for duplicate primary keys in current df with query
                        # Mano: 2023/12/30: if duplicate primary key, delete it from the df first before ingestion
                        # Since this is quite involved, may be write it in a function later
                        # First, query the current table in the db, extract the primary key fields
                        ind = table_names.index(table_name); # 0-based index
                        resource = package.resources[ind];
                        table_name_tmp = resource.name;
                        if(table_name != table_name_tmp): # Nearly redundant check
                            raise ValueError(f'The table name from resource, {table_name_tmp}, does not match with, {table_name}, being ingested currently');

                        pKeys = resource.schema.primary_key;
                        npk = len(pKeys);
                        if(debug > 0): print(f"pKeys: {pKeys}");

                        COLSEP = "___";

                        id_namespace_pat = 'id_namespace';
                        pKeys_has_id_namespace = any([id_namespace_pat in i for i in pKeys]);
                        # To build a query to get count
                        if(pKeys_has_id_namespace):
                            if(debug > 0): print("Going to write the count query");
                            first_idnamespace_pat_index = [id_namespace_pat in i for i in pKeys].index(True);
                            first_idnamespace_pat_colname = pKeys[first_idnamespace_pat_index];
                            patcol_unique_values_list = list(df[first_idnamespace_pat_colname].unique());
                            patcol_unique_values_pgstr = postgres_string = "(" + ", ".join(["'{}'".format(item) for item in patcol_unique_values_list]) + ")";
                            count_query =  f"select count(*) from {schema_name}.{table_name} where {first_idnamespace_pat_colname} IN {patcol_unique_values_pgstr}";
                            cqf.write(f"{count_query};{newline}");
                            if(debug > 0): print(f"Wrote the count query");
                            if(single_dcc == 1):
                                count_match_query = get_count_match_query(default_schema_name, table_name, 
                                                    schema_name, first_idnamespace_pat_colname, 
                                                    patcol_unique_values_pgstr);
                                cqf.write(f"{count_match_query}{newline}");
                        
                        #                      
                        if((single_dcc == 0) and (not pKeys_has_id_namespace) and (df.shape[0] > 0)):
                            if(debug > 0): print("---- Will check if a primary key in current df is already in the table in the DB");
                            # make a string of primary key columns of df sep by COLSEP
                            if npk == 1: df_pk_df = df[pKeys[0]]; # astype(str).apply("___".join, axis=1) # apply is slow for large DF
                            elif npk == 2: df_pk_df = df[pKeys[0]] + COLSEP + df[pKeys[1]];
                            elif npk == 3: df_pk_df = df[pKeys[0]] + COLSEP + df[pKeys[1]]  + COLSEP + df[pKeys[2]];
                            elif npk == 4: df_pk_df = df[pKeys[0]] + COLSEP + df[pKeys[1]]  + COLSEP + df[pKeys[2]] + COLSEP + df[pKeys[3]];
                            #
                            df_pk = df_pk_df.values; # 1-col df to numpy 1-D array
                            # check if duplicate primary key: https://stackoverflow.com/questions/11528078/determining-duplicate-values-in-an-array
                            # sort both df_pk and df since later I used the index to extract subset
                            df_pk_sort_index = np.argsort(df_pk, axis=None); df_pk = df_pk[df_pk_sort_index]; # df_pk = np.sort(df_pk, axis=None);
                            df = df.iloc[df_pk_sort_index];
                            df_pk_dup = df_pk[:-1][df_pk[1:] == df_pk[:-1]];
                            if(df_pk_dup.size > 0):
                                raise ValueError(f'The primary key columns in df of table read for a DCC have duplicates'); # should never happen
                            #
                            df_pk = list(df_pk); # easier to work with list later
                            df_pk = [str(i) for i in df_pk]; # make sure the elements are string
                            #
                            # if(len(table_primaryKeys) == 1): # some tables such as protein_gene.tsv can have more than two columns in primary key
                            pk_concat_name = 'pk'; # Use this as colummn name for the column in the query output
                            sql_qstr = f"SELECT distinct CONCAT_WS('{COLSEP}', " + ', '.join(pKeys) + f") as {pk_concat_name} FROM {schema_name}.{table_name};";
                            # use fetchmany if memory becomes issue: https://stackoverflow.com/questions/17933344/python-postgres-can-i-fetchall-1-million-rows
                            if(debug > 0): print("---- Going to query database to get the primary key columns");
                            if(debug > 0): print(f"sql_qstr: {sql_qstr}");
                            # qt means queried table; qt_df: result of query as a dataframe
                            qt_df = pd.read_sql_query(sql_qstr, con=engine); # if this is very slow, try cursor.execute, cursor.fetchall and pd.DataFrame below
                            ## cursor.execute(qstr);  qt_data = cursor.fetchall(); # DO NOT DELETE LINE
                            ## qt_cols = [desc[0] for desc in cursor.description]; qt_df = pd.DataFrame((qt_data) , columns=qt_cols); # DO NOT DELETE LINE
                            if(debug > 0): print(f"qt_df: {qt_df}");
                            if(debug > 1): print(f"type of qt_df: {type(qt_df)}");
                            if(debug > 0): print(f"---- Executed query, got data.frame: qt_df: #rows = {qt_df.shape[0]}, #cols: {qt_df.shape[1]}{newline}");
                            #
                            qt_pk = list(qt_df[pk_concat_name].values);
                            qt_pk = [str(i) for i in qt_pk]; # make sure the elements are string
                            if(debug > 0): print(f"df_pk (at most first 10 elements): {df_pk[0:min(10,len(df_pk))]}");
                            if(debug > 0): print(f"qt_pk (at most first 10 elements): {qt_pk[0:min(10,len(qt_pk))]}");
                            # If some element of df_pk already in qt_pk then find its index and remove such rows from df
                            # Define a lambda function match or nomatch: 0-based index
                            #match = lambda a, b: [ b.index(x) if x in b else None for x in a ];
                            #nomatch_ind_in_first = lambda a, b: [ a.index(x) if x not in b else None for x in a ];
                            nomatch_ind_in_first = lambda a, b: [a.index(x) for x in a if x not in b]; # CAN BE VERY SLOW for long arrays/lists
                            ind_df_pk_notin_qt_pk = nomatch_ind_in_first(df_pk, qt_pk);
                            # keep the rows of df corresponding to ind_df_pk_notin_qt_pk
                            #df0 = df.copy(); # don't make copy as waste of memory for large df
                            # index.isin can be misleading if sorting changes order of df and df_pk: df = df[df.index.isin(ind_df_pk_notin_qt_pk)];
                            df = df.iloc[ind_df_pk_notin_qt_pk];
                            if(debug > 0): print("---- Removed rows from df with matching pk");
                        #-----------------------------------------------------------------------------------------
                        #
                        print(f"*** Entering {table_name} to database ***");
                        #print(f"debug = {debug}");
                        if(debug > 0): 
                            print(f"df: #rows = {df.shape[0]}, #cols: {df.shape[1]}{newline}");
                            # Printing the whole DF requires formatting it, could cause memory leak, so print a slice?
                            print(f"A slice of df:{newline}{df.iloc[0:min(10,df.shape[0]), 0:min(5,df.shape[1])]}");
                        if(debug > 1): print(f"db schema name:{schema_name}"); 
                        gc.collect();
                        #
                        if((actually_ingest_tables > 0) and (df.shape[0] > 0)):
                            try:
                                # Try to write DataFrame to PostgreSQL
                                df.to_sql(table_name, con=engine, if_exists="append", index=False, schema=schema_name);
                                conn.commit();
                                print("Data inserted successfully!")
                                # Match counts# Mano: 2024/04/23
                                if(pKeys_has_id_namespace):
                                    sql_count_df = pd.read_sql_query(count_query + ";", con=engine);
                                    print(f"sql_count_df: {sql_count_df}{newline}count:{sql_count_df.iloc[0,0]}");
                                    if(df.shape[0] != sql_count_df.iloc[0,0]):
                                        raise ValueError(f'#count from query of DB table {schema_name}.{table_name} should be same as #rows in df{newline}' +
                                         f'#count from DB table {schema_name}.{table_name}: {sql_count_df.iloc[0,0]}{newline}#Rows of df:{df.shape[0]}');

                            except Exception as e:
                                print("Error occurred in df.to_sql or conn.commit:", e);
                        #    
                        print(">>> All good.");
                        #                    
                        # SQL command to add the DCC name to the 'sourcedcc' column in the PostgreSQL table
                        # dcc_name = c2m2['dcc_short_label']
                        # #addDCCName = f'UPDATE {schema_name}.{table_name} SET sourcedcc = \'{dcc_name}\';'
                        # if (countDCC == 1):
                        #     add_column_sql = f"ALTER TABLE {schema_name}.{table_name} ADD COLUMN sourcedcc VARCHAR(255);"
                        #     cursor.execute(add_column_sql)
                        # update_dcc_sql = f"UPDATE {schema_name}.{table_name} SET sourcedcc = \'{dcc_name}\';"
                        # cursor.execute(update_dcc_sql)
                        # countDCC = countDCC + 1
                    #
                #
            #
            t02 = time.time();
            print(f">>>>>>>> Time taken to ingest the metadata from this file: {t02-t01} seconds.{newline}");
            gc.collect();
        #for table in c2m2_extract_path.rglob('*.tsv'):
        ###############################################################################################
        # Cross-check that we are inside the correct for loop
        print(f"{tabchar}=============== DCC short label: {cur_dcc_short_label} ==============={newline}");

        # Check if any elements of table_exists_dict are 0: these tables are not in the DCC's package, 
        # so, print a warning
        tables_not_in_DCC_package = [key for key, value in table_exists_dict.items() if value == 0]
        for table in tables_not_in_DCC_package:
            print(f"{tabchar}Warning: DCC: {cur_dcc_short_label}: Table file for the table {table} is missing from the C2M2 package{newline}")
        #
      #for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
    #for dummy_z in [1]:
  #for dummy_y in [1]:
#for dummy_x in [1]:

#input("Press Enter to continue, to add foreign key constraints...")

# Should we commit the changes 
#conn.commit()

cqf.write(f"{newline}");
cqf.close();

t2 = time.time();
print(f">>>>>>>>>>>>>>>>>>>>>>>>>>>>> Time taken to ingest the metadata from the files: {t2-t1} seconds.{newline}");

qf = open(qf_name, "a")
qf.write('\n/* Add foreign key constraints */\n');

# Handle foreign keys
# How variable names are constructed: fk: foreign key, str: string, cnt: counter
fk_referenced_tables = [];
for resource in package.resources:
    table_name = resource.name
    schema_table_name = f"{schema_name}.{table_name}"
    if(debug > 0): print(f" ----------- Adding foreign key constraint for table {table_name} ----------");

    fks = resource.schema.foreign_keys; # fks is an array since the line in schema file is: "foreignKeys": [ # use foreign_keys
    fkstr0 = f"ALTER TABLE {schema_table_name} ADD CONSTRAINT ";
    fkcnt = 0;
    for fk in fks:
        fkcnt = fkcnt + 1;
        table2_name = fk["reference"]["resource"]; # name of the other table
        fk_referenced_tables.append(table2_name);
        cl1 = fk["fields"]; # column names from current table
        cl2 = fk["reference"]["fields"]; # column names from other table
        if(debug > 1):
            print(f"table2_name: {table2_name}") 
            print(f"cl1: {cl1}")
            print(f"cl2: {cl2}")

        if not(isinstance(cl1, list)): cl1 = [cl1]    
        if not(isinstance(cl2, list)): cl2 = [cl2]
        cl1_str = ', '.join(cl1)
        cl2_str = ', '.join(cl2)
        fkname = f"fk_{table_name}_{table2_name}_{fkcnt}"
        fkstr0_drop = f"ALTER TABLE {schema_name}.{table_name} DROP CONSTRAINT IF EXISTS {fkname};{newline}";
        fk_query = f"{fkstr0_drop}{fkstr0} {fkname} FOREIGN KEY ({cl1_str}) REFERENCES {schema_name}.{table2_name} ({cl2_str})"
        fk_query = f"{fk_query}{fkeycon_include_on_delete_cascade_str};"
        if(debug > 0): print(fk_query)
        # Execute the SQL statement to create the table
        if(actually_ingest_tables == 1):
            cursor.execute(fk_query)
        qf.write(fk_query);     qf.write("\n")
    
    qf.write("\n")

# write unique fk_referenced_tables to a file for later use
fk_referenced_tables = sorted(set(fk_referenced_tables))
# Write to file
fkref_file = "fk_referenced_tables.txt"
with open(fkref_file, "w", encoding="utf-8") as fkref:
    for item in fk_referenced_tables:
        fkref.write(item + "\n")

t3 = time.time();
print(f">>>>>>>>>>>>>>>>>>>>>>>>>>>>> Time taken to add foreign constraints: {t3-t2} seconds.{newline}");

# # Commit the changes 
conn.commit()

#------------------------------------------------------
# Remove .0 from the size_in_bytes column of file table
# Define the UPDATE query
file_size_in_bytes_update_query1 = f"UPDATE {schema_name}.file  SET size_in_bytes = REGEXP_REPLACE(size_in_bytes, '\.0$', '');";
file_size_in_bytes_update_query2 = f"UPDATE {schema_name}.file  SET uncompressed_size_in_bytes = REGEXP_REPLACE(uncompressed_size_in_bytes, '\.0$', '');";
file_size_in_bytes_update_query = file_size_in_bytes_update_query1 + file_size_in_bytes_update_query2;
# Execute the UPDATE query
print(f"{newline}>>>>>>>> Attempting removal of .0 from columns size_in_bytes and uncompressed_size_in_bytes of table {schema_name}.file successful.{newline}");
try:
    cursor.execute(file_size_in_bytes_update_query)
    print(f"Update successful.{newline}");
except Exception as fsu_e:
    print(f"Error executing the query{newline}{file_size_in_bytes_update_query}: {fsu_e}");
finally:
    # Commit the changes 
    conn.commit();
#------------------------------------------------------
# Update the description and synonyms for the name 'Homo sapiens' in the table c2m2.ncbi_taxonomy
# This will be redundant if the entry is updated in the ncbi_taxonomy.tsv[.gz] file itself
if (schema_name == 'c2m2'):
    ncbi_tax_human_str_1 = f"UPDATE {schema_name}.ncbi_taxonomy SET description = 'Human', synonyms = '[\"Human\"]' ";
    ncbi_tax_human_str_2 = f"WHERE id = 'NCBI:txid9606' AND name = 'Homo sapiens';";
    ncbi_tax_human_update_query = ncbi_tax_human_str_1 + ncbi_tax_human_str_2; 
    # Execute the UPDATE query
    print(f"{newline}>>>>>>>> Attempting update of description and synonym for Homo sapiens in table {schema_name}.ncbi_taxonomy successful.{newline}");
    try:
        cursor.execute(ncbi_tax_human_update_query)
        print(f"Update successful.{newline}");
    except Exception as fsu_e:
        print(f"Error executing the query{newline}{ncbi_tax_human_update_query}: {fsu_e}");
    finally:
        # Commit the changes 
        conn.commit();
#------------------------------------------------------

t4 = time.time();

#------------------------------------------------------
# Add searchable column to each table
#Mano: 2025/01/23: if adding searchable column
if(add_searchable_column == 1):
    qf.write(f"--- Adding COLUMN {searchable_colname} to all tables{newline}");
    for resource in package.resources:
        table_name = resource.name
        schema_table_name = f"{schema_name}.{table_name}"
        table_fields = resource.schema.fields
        column_names = [field.name for field in table_fields]
        if(debug > 0): print(f" ----------- Adding COLUMN {searchable_colname} to table {schema_table_name} ----------");

        qf.write(f"{newline}--- Adding COLUMN {searchable_colname} to table {schema_table_name}{newline}");

        # Execute the SQL statement to add the column
        addcol_query = gen_add_searchable_col_query(schema_name, table_name, column_names, searchable_colname, searchable_col_exclude_pattern, debug)
        if(debug > 0): print(addcol_query)
        qf.write(addcol_query);     qf.write("\n"); 

        # query string to add index
        searchable_index_query = gen_searchable_index_query(schema_name, table_name, searchable_colname, debug, newline, tabchar)
        if(debug > 0): print(searchable_index_query)
        qf.write(searchable_index_query);     qf.write("\n"); 

        if((actually_ingest_tables == 1)):
            #cursor.execute(addcol_query);
            try:
                cursor.execute(addcol_query);
                print(f"Update successful.{newline}");
            except Exception as fsu_e:
                print(f"Error executing the query{newline}{addcol_query}: {fsu_e}");
            finally:
                # Commit the changes 
                conn.commit();

            # Add index on searchable
            if(index_searchable>0):
                try:
                    cursor.execute(searchable_index_query);
                    print(f"Index creation on searchable column successful.{newline}");
                except Exception as fsu_siq_e:
                    print(f"Error executing the query{newline}{searchable_index_query}: {fsu_siq_e}");
                finally:
                    # Commit the changes 
                    conn.commit();

t5 = time.time();
print(f">>>>>>>>>>>>>>>>>>>>>>>>>>>>> Time taken to add COLUMN {searchable_colname}: {t5-t4} seconds.{newline}");
#------------------------------------------------------

# # Commit the changes 
#conn.commit()


#cursor.close()
conn.close()

t6 = time.time();

print(f">>>>>>>>>>>>>>>>>>>>>>>>>>>>> Total time taken: {t6-t0} seconds.{newline}");
print(f"********** C2M2 metadata ingestion completed: schema_name: {schema_name}.");

timenow = datetime.datetime.now(); timenow_fmt = timenow.strftime("%Y-%m-%d %H:%M:%S");
print(f"=============== END Time: {timenow_fmt} ===============");

qf.close()

