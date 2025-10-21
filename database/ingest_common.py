import pandas as pd
import os
import functools
import psycopg2
import pathlib
import csv
import contextlib
import tempfile
import urllib.request
import queue
import threading
import traceback
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv
from uuid import UUID, uuid5
from datetime import datetime
from collections import deque
from tqdm.auto import tqdm
import json
import elasticsearch, elasticsearch.helpers


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
    connection = pg_connect()
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

@functools.cache
def pg_connect():
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
  return connection

#%%
@functools.cache
def es_connect():
  return elasticsearch.Elasticsearch(os.getenv('ELASTICSEARCH_URL'), retry_on_timeout=True)

#%%
class ExEncoder(json.JSONEncoder):
  def default(self, o):
    import decimal
    if isinstance(o, decimal.Decimal):
      return str(o)
    elif isinstance(o, datetime):
      return o.isoformat()
    elif isinstance(o, UUID):
      return str(o)
    return super(ExEncoder, self).default(o)

def maybe_json_dumps(v):
  if type(v) == str: return v
  else: return json.dumps(v, sort_keys=True, cls=ExEncoder)

def es_bulk_insert(Q: queue.Queue):
  while True:
    try:
      for success, info in elasticsearch.helpers.parallel_bulk(es_connect(), tqdm(iter(Q.get, None), desc='Ingesting...'), max_chunk_bytes=10*1024*1024, raise_on_exception=False):
        Q.task_done()
        if not success:
          print(f"putting back failed task {info=}")
          Q.put(info)
    except KeyboardInterrupt:
      raise
    except Exception as e:
      traceback.print_exc()
      continue
    else:
      break
    
@contextlib.contextmanager
def es_helper():
  Q = queue.Queue()
  bulk_insert_thread = threading.Thread(target=es_bulk_insert, args=(Q,))
  bulk_insert_thread.start()
  try:
    yield Q
  finally:
    Q.put(None)
    bulk_insert_thread.join()

@contextlib.contextmanager
def pdp_helper():
  with es_helper() as es:
    entities = {}
    pagerank = {}
    m2m = set()
    m2o = {}
    def upsert_entity(type, attributes, slug=None):
      entity_serialized = maybe_json_dumps({'type': type, 'slug': slug, **{f"a_{k}": maybe_json_dumps(v) for k, v in attributes.items() if v is not None}})
      id = str(uuid5(uuid0, entity_serialized))
      entity = json.loads(entity_serialized)
      entity['id'] = id
      entity['pagerank'] = 0
      assert 'a_label' in entity
      if id not in entities:
        entities[id] = entity
        es.put(dict(
          _index='entity_staging',
          _id=id,
          doc=entity,
          doc_as_upsert=True,
        ))
      return id
    def upsert_o2m(source_id, predicate, target_id):
      if target_id not in m2o: m2o[target_id] = {}
      assert predicate not in m2o[target_id] or m2o[target_id][predicate] == source_id
      m2o[target_id][predicate] = source_id
      es.put(dict(
        _index='entity_staging',
        _id=target_id,
        doc={f"r_{predicate}": source_id},
        doc_as_upsert=True,
      ))
      if (source_id, predicate, target_id) not in m2m:
        m2m.add((source_id, predicate, target_id))
        es.put(dict(
          _index='m2m_staging',
          _id=f"{source_id}:{predicate}:{target_id}",
          doc=dict(source_id=source_id, predicate=predicate, target_id=target_id),
          doc_as_upsert=True,
        ))
        if source_id not in pagerank:
          pagerank[source_id] = 0
        pagerank[source_id] += 1
    def upsert_m2o(source_id, predicate, target_id):
      upsert_o2m(target_id, predicate, source_id)
    def upsert_m2m(source_id, predicate, target_id):
      if (source_id, predicate, target_id) not in m2m:
        m2m.add((source_id, predicate, target_id))
        es.put(dict(
          _index='m2m_staging',
          _id=f"{source_id}:{predicate}:{target_id}",
          doc=dict(source_id=source_id, predicate=predicate, target_id=target_id),
          doc_as_upsert=True,
        ))
        if source_id not in pagerank:
          pagerank[source_id] = 0
        pagerank[source_id] += 1
      if (target_id, f"inv_{predicate}", source_id) not in m2m:
        m2m.add((target_id, f"inv_{predicate}", source_id))
        es.put(dict(
          _index='m2m_staging',
          _id=f"{target_id}:inv_{predicate}:{source_id}",
          doc=dict(source_id=target_id, predicate=f"inv_{predicate}", target_id=source_id),
          doc_as_upsert=True,
        ))
        if target_id not in pagerank:
          pagerank[target_id] = 0
        pagerank[target_id] += 1
    #
    yield type('pdp', tuple(), dict(entities=entities, upsert_o2m=upsert_o2m, upsert_m2o=upsert_m2o, upsert_m2m=upsert_m2m, upsert_entity=upsert_entity))
  #
  for target_id, count in pagerank.items():
    es.put(dict(
      _index='entity_staging',
      _id=target_id,
      script=dict(source='ctx._source.pagerank += params.count', lang='painless', params=dict(count=count)),
      doc_as_upsert=True,
    ))

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
  ).merge(pd.read_csv(dcc_path(), sep='\t'), left_on='dcc_id', right_on='id', suffixes=('asset_', 'dcc_'))
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
  ).merge(pd.read_csv(dcc_path(), sep='\t'), left_on='dcc_id', right_on='id', suffixes=('asset_', 'dcc_'))
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
