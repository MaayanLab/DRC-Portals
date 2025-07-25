import pandas as pd
import os
import psycopg2
import pathlib
import csv
import contextlib
import tempfile
import urllib.request
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv
from uuid import UUID, uuid5
import json

uuid0 = UUID('00000000-0000-0000-0000-000000000000')
def quote(col): return f'"{col}"'

#%%
class TableHelper:
  def __init__(self, tablename, columns, pk_columns, add_columns=tuple()):
    self.tablename = tablename
    self.pk_columns = pk_columns
    self.columns = columns
    self.add_columns = add_columns
  @contextlib.contextmanager
  def writer(self):
    with tempfile.TemporaryDirectory() as tmpdir:
      path = pathlib.Path(tmpdir)/(self.tablename+'.tsv')
      with path.open('w') as fw:
        yield csv.DictWriter(fw, self.columns, delimiter='\t', escapechar='\\', doublequote=False, restval='NULL')
      print(f"inserting {self.tablename}...")
      with connection.cursor() as cur:
        cur.execute('set statement_timeout = 0')
        cur.execute(f'''
          create temporary table {quote(self.tablename+'_tmp')}
          as table {quote(self.tablename)}
          with no data;
        ''')
        with path.open('r') as fr:
          cur.copy_from(fr, f"{self.tablename}_tmp",
            columns=self.columns,
            #null='',
            null='NULL',
            sep='\t',
          )
        update_set = ','.join([
          *[f"{quote(col)} = excluded.{quote(col)}" for col in self.columns if col not in self.pk_columns and col not in self.add_columns],
          *[f"{quote(col)} = {quote(self.tablename)}.{quote(col)} + excluded.{quote(col)}" for col in self.add_columns],
        ])
        do_update_set = f"do update set {update_set}" if update_set else "do nothing"
        cur.execute(f'''
            insert into {quote(self.tablename)} ({', '.join(map(quote, self.columns))})
              select {', '.join(map(quote, self.columns))}
              from {quote(self.tablename+'_tmp')}
              on conflict ({', '.join(map(quote, self.pk_columns))})
              {do_update_set};
        ''')
        cur.execute(f"drop table {quote(self.tablename+'_tmp')};")
        connection.commit()

#%%
# Establish connection to database

load_dotenv(pathlib.Path(__file__).parent.parent / 'drc-portals' / '.env')
load_dotenv()
########## DB ADMIN INFO: BEGIN ############
# Comment the line below with .env.dbadmin if not ingesting, almost always ingesting if running these scripts
#load_dotenv(pathlib.Path(__file__).parent.parent.parent/'DB_ADMIN_INFO'/'.env.dbadmin')
########## DB ADMIN INFO: END   ############

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL == None:
  load_dotenv('../../drc-portals/.env') # for fair assessment 
  load_dotenv()
  DATABASE_URL = os.getenv("DATABASE_URL")
result = urlparse(DATABASE_URL)
username = result.username
password = unquote(result.password)
database = result.path[1:]
hostname = result.hostname
port = result.port

##### Line below is for debug only, always keep commented otherwise
#####print(f"username: {username}, password: {password}, database: {database}, hostname: {hostname}")

connection = psycopg2.connect(
    database = database,
    user = username,
    password = password,
    host = hostname,
    port = port
)

#%%
# Fetch assets to ingest

# TODO: I think the dcc label should be preserved instead of a uuid in this tsv..

ingest_path = pathlib.Path('ingest')

if not ingest_path.exists():
  ingest_path.mkdir()

def ensure_file_factory(url, path):
  def ensure_file():
    if not (ingest_path / path).exists():
      urllib.request.urlretrieve(url, ingest_path / path)
    return ingest_path / path
  return ensure_file

#%%
# Fetch data for ingest
dcc_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_dccs.tsv', 'DCC.tsv')
dcc_publications_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_dcc_publications.tsv', 'dcc_publications.tsv')
centers_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_centers.tsv', 'Centers.tsv')
center_publication_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_center_publications.tsv', 'Center_Publication.tsv')
r03_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_r03s.tsv', 'R03.tsv')
r03_publication_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_r03_publications.tsv', 'R03_Publication.tsv')
publications_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_publications.tsv', 'publications.tsv')
dcc_outreach_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_dcc_outreach.tsv', 'dcc_outreach.tsv')
center_outreach_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_center_outreach.tsv', 'center_outreach.tsv')
outreach_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_outreach.tsv', 'outreach.tsv')
dcc_assets_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_dcc_assets.tsv', 'DccAssets.tsv')
file_assets_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_file_assets.tsv', 'FileAssets.tsv')
code_assets_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_code_assets.tsv', 'CodeAssets.tsv')
dcc_partnerships_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_dcc_partnerships.tsv', 'dcc_partnerships.tsv')
partnerships_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_partnerships.tsv', 'partnerships.tsv')
partnership_publications_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_partnership_publications.tsv', 'partnership_publications.tsv')
tools_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_tools.tsv', 'tools.tsv')
dcc_usecase_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_dcc_usecase.tsv', 'dcc_usecase.tsv')
usecase_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_usecase.tsv', 'usecase.tsv')
news_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/files/current_news.tsv', 'news.tsv')

#%%
def current_dcc_assets():
  dcc_assets = pd.merge(
    left=pd.read_csv(file_assets_path(), sep='\t'),
    left_on='link',
    right=pd.read_csv(dcc_assets_path(), sep='\t'),
    right_on='link',
    how='inner',
  )
  dcc_assets['dcc_short_label'] = dcc_assets['link'].apply(lambda link: link.split('/')[3])
  #dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted']]
  dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted'] & dcc_assets['dccapproved'] & dcc_assets['drcapproved'] ]
  return dcc_assets

def current_code_assets():
  dcc_assets = pd.merge(
    left=pd.read_csv(code_assets_path(), sep='\t'),
    left_on='link',
    right=pd.read_csv(dcc_assets_path(), sep='\t'),
    right_on='link',
    how='inner',
  )
  dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted'] & dcc_assets['dccapproved'] & dcc_assets['drcapproved'] ]
  return dcc_assets

#%%
def get_clean_path(path):
  return path.with_name(path.stem + "_clean.tsv")

# Function to clean up the JSON column
def fix_json_column(json_str):
  if json_str:
    #json_str = json_str.strip('"')  # Remove surrounding quotes
    #json_str = json_str.replace('""', '"')  # Fix internal double quotes
    return json.dumps(json.loads(json_str))  # Ensure it's valid JSON
  return None

def write_clean_file(path, path_clean, colnames):
  debug = 0
  # In below, newline = '' and newline = '\n' are practically same on unix (ensire newline character)
  with open(path, 'r', encoding='utf-8') as fr, open(path_clean, 'w', encoding='utf-8', newline='') as fw:
    reader = csv.DictReader(fr, delimiter='\t')
    writer = csv.DictWriter(fw, fieldnames=reader.fieldnames, delimiter='\t', quoting=csv.QUOTE_NONE, escapechar='\\')
    writer.writeheader()

    for row in reader:
      if(debug> 0): print(row)
      for col in colnames:
        if(debug> 0): print(col)
        if col in row:
          if(debug> 1): print(row[col])
          row[col] = fix_json_column(row[col])  # Apply fix_json_column to specified columns
      writer.writerow(row)

#