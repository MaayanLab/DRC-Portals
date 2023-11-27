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
if not (ingest_path/'DccAssets.tsv').exists():
  import urllib.request
  urllib.request.urlretrieve('https://cfde-drc.s3.amazonaws.com/database/112123/DccAssets.tsv', ingest_path/'DccAssets.tsv')

dcc_assets = pd.read_csv(ingest_path/'DccAssets.tsv', sep='\t', names=[
  'filetype', 'filename', 'link', 'size', 'lastmodified', 'current',
  'creator', 'annotation', 'dcc_id', 'drcapproved', 'dccapproved'
])
dcc_assets['dcc_short_label'] = dcc_assets['link'].apply(lambda link: link.split('/')[3])
