import pandas as pd
import os
import psycopg2
import pathlib
import csv
import contextlib
from urllib.parse import urlparse
from dotenv import load_dotenv
from uuid import UUID, uuid5

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

uuid0 = UUID('00000000-0000-0000-0000-000000000000')
tab = '\t'

ingest_path = pathlib.Path('ingest')
if not ingest_path.exists():
  ingest_path.mkdir()
if not (ingest_path/'DccAssets.tsv').exists():
  import urllib.request
  urllib.request.urlretrieve('https://cfde-drc.s3.amazonaws.com/database/111423/DccAssets.tsv', ingest_path/'DccAssets.tsv')

dcc_assets = pd.read_csv(ingest_path/'DccAssets.tsv', sep='\t', names=[
  'filetype', 'filename', 'link', 'size', 'lastmodified',
  'current', 'creator', 'approved', 'annotation', 'dcc_id'
])

xmts = dcc_assets[dcc_assets['filetype'] == 'XMT']
xmts_path = ingest_path / 'xmts'
xmts_path.mkdir(exist_ok=True)

def quote(col): return f'"{col}"'

class TableHelper:
  def __init__(self, tablename, columns, pk_columns):
    self.tablename = tablename
    self.pk_columns = pk_columns
    self.columns = columns
  @contextlib.contextmanager
  def writer(self):
    path = ingest_path/(self.tablename+'.tsv')
    with path.open('w') as fw:
      yield csv.DictWriter(fw, self.columns, delimiter='\t')
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
              set {','.join(f"{col} = excluded.{col}" for col in map(quote, self.columns))};
      ''')
      cur.execute(f"drop table {quote(self.tablename+'_tmp')};")
      connection.commit()

xentity_xset_helper = TableHelper('_XEntityToXSet', ('A', 'B',), pk_columns=('A', 'B',))
xentity_xlibrary_helper = TableHelper('_XEntityToXLibrary', ('A', 'B'), pk_columns=('A', 'B',))
xset_helper = TableHelper('xset', ('id', 'library_id',), pk_columns=('id',))
xlibrary_helper = TableHelper('xlibrary', ('id', 'dcc_asset_link', 'term_type', 'entity_type',), pk_columns=('id',))
xentity_helper = TableHelper('xentity', ('id',), pk_columns=('id',))
xidentity_helper = TableHelper('xidentity', ('id', 'type', 'label', 'description', 'entity_id', 'set_id', 'library_id',), pk_columns=('id',))

with xentity_xset_helper.writer() as xentity_xset:
  with xentity_xlibrary_helper.writer() as xentity_xlibrary:
    with xset_helper.writer() as xset:
      with xlibrary_helper.writer() as xlibrary:
        with xentity_helper.writer() as xentity:
          xentities = set()
          with xidentity_helper.writer() as xidentity:
            for _, xmt in xmts.iterrows():
              xmt_path = xmts_path/xmt['filename']
              if not xmt_path.exists():
                import urllib.request
                urllib.request.urlretrieve(xmt['link'], xmt_path)
              #
              library_id = str(uuid5(uuid0, xmt['link']))
              library_xentities = set()
              if xmt_path.suffix == '.gmt':
                term_type = 'unstructured'
                entity_type = 'gene'
                xlibrary.writerow(dict(
                  id=library_id,
                  dcc_asset_link=xmt['link'],
                  term_type=term_type,
                  entity_type=entity_type,
                ))
                xidentity.writerow(dict(
                  id=library_id,
                  type="library",
                  # TODO
                  label=xmt_path.stem.replace('_', ' '),
                  # TODO
                  description='TODO',
                  library_id=library_id,
                ))
              else:
                raise NotImplementedError(xmt_path.suffix)

              with xmt_path.open('r') as fr:
                for line in fr:
                  line_split = list(map(str.strip, line.split('\t')))
                  if len(line_split) < 3: continue
                  set_label, set_description, *set_entities = line_split
                  set_type = f"{entity_type}/set/{term_type}"
                  set_id = str(uuid5(uuid0, tab.join((library_id, set_label, set_description,))))
                  xset.writerow(dict(
                    id=set_id,
                    library_id=library_id,
                  ))
                  xidentity.writerow(dict(
                    id=set_id,
                    type=set_type,
                    label=set_label,
                    description=set_description or 'TODO',
                    set_id=set_id,
                  ))
                  for set_entity in filter(None, set_entities):
                    entity_id = str(uuid5(uuid0, set_entity))
                    if entity_id not in xentities:
                      xentity.writerow(dict(
                        id=entity_id,
                      ))
                      xidentity.writerow(dict(
                        id=entity_id,
                        type=entity_type,
                        # TODO
                        label=set_entity,
                        # TODO
                        description='TODO',
                        entity_id=entity_id,
                      ))
                      xentities.add(entity_id)
                    if entity_id not in library_xentities:
                      xentity_xlibrary.writerow(dict(
                        A=entity_id,
                        B=library_id,
                      ))
                      library_xentities.add(entity_id)
                    xentity_xset.writerow(dict(
                      A=entity_id,
                      B=set_id,
                    ))
