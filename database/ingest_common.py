import pandas as pd
import os
import psycopg2
import pathlib
import csv
import contextlib
import tempfile
import urllib.request
from urllib.parse import urlparse
from dotenv import load_dotenv
from uuid import UUID, uuid5

uuid0 = UUID('00000000-0000-0000-0000-000000000000')
def quote(col): return f'"{col}"'

#%%
class TableHelper:
  def __init__(self, tablename, columns, pk_columns):
    self.tablename = tablename
    self.pk_columns = pk_columns
    self.columns = columns
  @contextlib.contextmanager
  def writer(self):
    with tempfile.TemporaryDirectory() as tmpdir:
      path = pathlib.Path(tmpdir)/(self.tablename+'.tsv')
      with path.open('w') as fw:
        yield csv.DictWriter(fw, self.columns, delimiter='\t', escapechar='\\', doublequote=False)
      print(f"inserting {self.tablename}...")
      with connection.cursor() as cur:
        cur.execute(f'''
          create table {quote(self.tablename+'_tmp')}
          as table {quote(self.tablename)}
          with no data;
        ''')
        with path.open('r') as fr:
          cur.copy_from(fr, f"{self.tablename}_tmp",
            columns=self.columns,
            null='',
            sep='\t',
          )
        cur.execute(f'''
            insert into {quote(self.tablename)} ({', '.join(map(quote, self.columns))})
              select {', '.join(map(quote, self.columns))}
              from {quote(self.tablename+'_tmp')}
              on conflict ({', '.join(map(quote, self.pk_columns))})
                do update
                set {','.join(f"{col} = excluded.{col}" for col in map(quote, self.columns) if col not in self.pk_columns)};
        ''')
        cur.execute(f"drop table {quote(self.tablename+'_tmp')};")
        connection.commit()

#%%
# Establish connection to database

load_dotenv('../drc-portals/.env')
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
result = urlparse(DATABASE_URL)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port

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
dcc_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/041124/DCC.tsv', 'DCC.tsv')
dcc_publications_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/publication_files/current_dcc_publication.tsv', 'dcc_publications.tsv')
publications_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/publication_files/current_publication.tsv', 'publications.tsv')
dcc_outreach_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/outreach_files/current_dcc_outreach.tsv', 'dcc_outreach.tsv')
outreach_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/outreach_files/current_outreach.tsv', 'outreach.tsv')
dcc_assets_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/050824/DccAssets.tsv', 'DccAssets.tsv')
file_assets_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/050824/FileAssets.tsv', 'FileAssets.tsv')
code_assets_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/041624/CodeAssets.tsv', 'CodeAssets.tsv')
dcc_partnerships_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/012224/dcc_partnerships.tsv', 'dcc_partnerships.tsv')
partnerships_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/032724/partnerships.tsv', 'partnerships.tsv')
partnership_publications_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/publication_files/current_partnership_publication.tsv', 'partnership_publications.tsv')
tools_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/tool_files/current_tool.tsv', 'tools.tsv')
dcc_usecase_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/usecase_files/current_dcc_usecase.tsv', 'dcc_usecase.tsv')
usecase_path = ensure_file_factory('https://cfde-drc.s3.amazonaws.com/database/usecase_files/current_usecase.tsv', 'usecase.tsv')

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
  dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted']]
  return dcc_assets

def current_code_assets():
  dcc_assets = pd.merge(
    left=pd.read_csv(code_assets_path(), sep='\t'),
    left_on='link',
    right=pd.read_csv(dcc_assets_path(), sep='\t'),
    right_on='link',
    how='inner',
  )
  dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted']]
  return dcc_assets
