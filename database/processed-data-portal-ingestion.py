import pandas as pd
import os
import psycopg2
import pathlib
import csv
import contextlib
from urllib.parse import urlparse
from dotenv import load_dotenv
from uuid import UUID, uuid5

uuid0 = UUID('00000000-0000-0000-0000-000000000000')
tab = '\t'
def quote(col): return f'"{col}"'

#%%
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

#%%
# Ingest XMTs

xmts = dcc_assets[dcc_assets['filetype'] == 'XMT']
xmts_path = ingest_path / 'xmts'
xmts_path.mkdir(exist_ok=True)

if xmts['filename'].apply(lambda fn: fn.endswith('.gmt')).any():
  # We'll be importing GMTs, load gene lookups

  # load entrez gene info
  df_entrez = pd.read_csv('https://ftp.ncbi.nlm.nih.gov/gene/DATA/GENE_INFO/Mammalia/Homo_sapiens.gene_info.gz', sep='\t')
  df_entrez['Synonyms'] = df_entrez['Synonyms'].replace('-', float('nan')).str.split('|').apply(lambda synonyms: synonyms if type(synonyms) == list else [])
  df_entrez['Ensembl'] = df_entrez['dbXrefs'].replace('-', float('nan')).str.split('|').apply(lambda xrefs: [xref.partition(':')[-1] for xref in xrefs if xref.startswith('Ensembl:')] if type(xrefs) == list else [])

  # synonym to gene ids lookup
  # symbol_entrez_lookup = df_entrez[['Symbol', 'GeneID']].groupby('Symbol')['GeneID'].agg(lambda genes: set(genes)).to_dict()
  # ensembl_entrez_lookup = df_entrez[['Ensembl', 'GeneID']].explode('Ensembl').groupby('Ensembl')['GeneID'].agg(lambda genes: set(genes)).to_dict()
  # synonym_entrez_lookup = df_entrez[['Synonyms', 'GeneID']].explode('Synonyms').groupby('Synonyms')['GeneID'].agg(lambda genes: set(genes)).to_dict()
  # for k in list(synonym_entrez_lookup.keys() & symbol_entrez_lookup.keys()):
  #   synonym_entrez_lookup.pop(k)
  # lookup = { row['Symbol']: {row['GeneID']} for row in df_entrez.iterrows() }
  # lookup.update(ensembl_entrez_lookup)
  # lookup.update(synonym_entrez_lookup)

  # synonym to ensembl gene ids lookup
  symbol_ensembl_lookup = df_entrez[['Symbol', 'Ensembl']].explode('Ensembl').dropna(how='any').groupby('Symbol')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
  synonym_ensembl_lookup = df_entrez[['Synonyms', 'Ensembl']].explode('Ensembl').explode('Synonyms').dropna(how='any').groupby('Synonyms')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
  for k in list(synonym_ensembl_lookup.keys() & symbol_ensembl_lookup.keys()):
    synonym_ensembl_lookup.pop(k)

  gene_lookup = {}
  gene_lookup.update(symbol_ensembl_lookup)
  gene_lookup.update(synonym_ensembl_lookup)

  gene_labels = df_entrez[['Ensembl', 'Symbol']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['Symbol'].first().to_dict()
  gene_descriptions = df_entrez[['Ensembl', 'description']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['description'].first().to_dict()


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
                  if entity_type == 'gene':
                    set_entities = {gene_id for raw_entity in set_entities if raw_entity for gene_id in gene_lookup.get(raw_entity, [])}
                  else:
                    print(f"Warning, unmapped entity_type {entity_type}")
                    set_entities = {raw_entity for raw_entity in set_entities if raw_entity}
                  #
                  for set_entity in set_entities:
                    entity_id = str(uuid5(uuid0, set_entity))
                    if entity_id not in xentities:
                      if entity_type == 'gene':
                        label = gene_labels[set_entity]
                        description = gene_descriptions[set_entity]
                      else:
                        label = set_entity
                        description = 'TODO'
                      #
                      xentity.writerow(dict(
                        id=entity_id,
                      ))
                      xidentity.writerow(dict(
                        id=entity_id,
                        type=entity_type,
                        label=label,
                        description=description,
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
