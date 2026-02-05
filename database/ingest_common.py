import pandas as pd
import os
import functools
import psycopg2
import pathlib
import csv
import time
import contextlib
import tempfile
import urllib.request
import queue
import threading
import traceback
import typing as t
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv
from uuid import UUID, uuid5
from datetime import datetime
from tqdm.auto import tqdm
import itertools
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

@functools.lru_cache()
def stemmer():
  import nltk; nltk.download('punkt_tab')
  from nltk.stem.porter import PorterStemmer
  return PorterStemmer()

def label_ident(k):
  ps = stemmer()
  from nltk.tokenize import word_tokenize
  return ' '.join([ps.stem(word) for word in word_tokenize(k)])

def es_bulk_insert(Q: queue.Queue):
  consume, items = itertools.tee(iter(Q.get, None))
  retries = 0
  reconnects = 0
  with tqdm(desc='Ingesting...') as pbar:
    while True:
      try:
        for (success, info), item in zip(elasticsearch.helpers.parallel_bulk(es_connect(), consume, max_chunk_bytes=10*1024*1024, raise_on_exception=False, raise_on_error=False, thread_count=16), items):
          Q.task_done()
          if success:
            pbar.update(1)
          else:
            retries += 1
            if info.get('update', {}).get('error', {}).get('type') == 'version_conflict_engine_exception':
              Q.put(item)
            else:
              print(f"\nerror: {info=} won't ingest {item=}\n")
            pbar.set_description(f"Ingesting {retries} retries {reconnects} reconnects...")
      except KeyboardInterrupt:
        raise
      except Exception:
        traceback.print_exc()
        reconnects += 1
        pbar.set_description(f"Ingesting {retries} retries {reconnects} reconnects...")
        time.sleep(1)
        continue
      else:
        break

@contextlib.contextmanager
def es_helper():
  Q = queue.Queue(1_000_000)
  bulk_insert_thread = threading.Thread(target=es_bulk_insert, args=(Q,))
  bulk_insert_thread.start()
  try:
    yield Q
  finally:
    Q.put(None)
    bulk_insert_thread.join()

@contextlib.contextmanager
def pdp_helper(es_bulk):
  resolved_ids = set()
  registered_ids = set()
  m2o = {}
  def resolve_entity_id(type: str, attributes: dict, slug: t.Optional[str]=None, pk: t.Optional[str]=None):
    assert type
    identity = dict(type=type)
    if slug is not None: identity['slug'] = slug
    elif pk is not None: identity['pk'] = pk
    else: identity.update(attributes)
    assert len(identity) > 1
    id = str(uuid5(uuid0, maybe_json_dumps(identity)))
    resolved_ids.add(id)
    return id
  def upsert_entity(type: str, attributes: dict, slug: t.Optional[str]=None, pk: t.Optional[str]=None):
    '''
    type: the entity type
    attributes: all entity attributes (searchable)
    slug: a human readable type-unique id for the entity id
    pk: a type-unique string for building the entity id
    '''
    attributes = {f"a_{k}": maybe_json_dumps(v) for k, v in attributes.items() if v is not None}
    assert 'a_label' in attributes
    id = resolve_entity_id(type, attributes, slug=slug, pk=pk)
    entity = dict(
      id=id,
      type=type,
      slug=slug or id,
      pagerank=1,
      **attributes,
    )
    registered_ids.add(id)
    es_bulk.put(dict(
      _op_type='update',
      _index='entity_staging',
      _id=id,
      doc=entity,
      doc_as_upsert=True,
    ))
    return id
  def upsert_m2o(source_id, predicate, target_id):
    '''
    source_id points to only one target_id
    '''
    # make sure these ids are registered
    assert source_id in resolved_ids or source_id in registered_ids
    assert target_id in resolved_ids or target_id in registered_ids
    # make sure source id points to only one target id
    if source_id not in m2o: m2o[source_id] = {}
    assert predicate not in m2o[source_id] or m2o[source_id][predicate] == target_id
    m2o[source_id][predicate] = target_id
    # create links
    es_bulk.put(dict(
      _op_type='index',
      _index='m2m_staging',
      _id=f"{source_id}:m2o_{predicate}:{target_id}",
      _source=dict(source_id=source_id, predicate=f"m2o_{predicate}", target_id=target_id),
    ))
    es_bulk.put(dict(
      _op_type='index',
      _index='m2m_staging',
      _id=f"{target_id}:o2m_{predicate}:{source_id}",
      _source=dict(source_id=target_id, predicate=f"o2m_{predicate}", target_id=source_id),
    ))
  def upsert_m2m(source_id, predicate, target_id):
    # make sure these ids are registered
    assert source_id in resolved_ids or source_id in registered_ids
    assert target_id in resolved_ids or target_id in registered_ids
    es_bulk.put(dict(
      _op_type='index',
      _index='m2m_staging',
      _id=f"{source_id}:m2m_{predicate}:{target_id}",
      _source=dict(source_id=source_id, predicate=f"m2m_{predicate}", target_id=target_id),
      doc_as_upsert=True,
    ))
    es_bulk.put(dict(
      _op_type='index',
      _index='m2m_staging',
      _id=f"{target_id}:m2m_{predicate}:{source_id}",
      _source=dict(source_id=target_id, predicate=f"m2m_{predicate}", target_id=source_id),
      doc_as_upsert=True,
    ))
  #
  yield type('pdp', tuple(), dict(upsert_m2o=upsert_m2o, upsert_m2m=upsert_m2m, upsert_entity=upsert_entity, resolve_entity_id=resolve_entity_id))
  assert registered_ids >= resolved_ids, f"Never registered {resolved_ids-registered_ids=}"

#%%
# Fetch assets to ingest

# TODO: I think the dcc label should be preserved instead of a uuid in this tsv..

# require dccapproved or not: True or False
require_dccapproved=False

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
  if require_dccapproved:
    dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted'] & dcc_assets['dccapproved'] & dcc_assets['drcapproved'] ]
  else:
    # Without DCC approval
    dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted'] & dcc_assets['drcapproved'] ]
  return dcc_assets

def current_code_assets():
  dcc_assets = pd.merge(
    left=pd.read_csv(code_assets_path(), sep='\t'),
    left_on='link',
    right=pd.read_csv(dcc_assets_path(), sep='\t'),
    right_on='link',
    how='inner',
  ).merge(pd.read_csv(dcc_path(), sep='\t'), left_on='dcc_id', right_on='id', suffixes=('asset_', 'dcc_'))
  if require_dccapproved:
    dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted'] & dcc_assets['dccapproved'] & dcc_assets['drcapproved'] ]
  else:
    # Without DCC approval
    dcc_assets = dcc_assets[dcc_assets['current'] & ~dcc_assets['deleted'] & dcc_assets['drcapproved'] ]
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
