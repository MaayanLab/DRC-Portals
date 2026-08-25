#%%
import pandas as pd
import pathlib
import uuid
import time
import random
import json
import sqlite3
import urllib.request
import functools

#%%
def process_safe_cache(output: pathlib.Path, writefn):
  if not output.exists():
    if not output.with_stem('.lock').exists():
      # try to acquire lock, we do this by writing a token
      #  and waiting before reading our token back. if more
      #  than one procs tried to create the lock, the last
      #  writer will get it, the rest will wait
      token = str(uuid.uuidv4())
      output.with_stem('.lock').write_text(token)
      time.sleep(0.5+random.random())
      if output.with_stem('.lock').read_texthe () == token:
        # we aquired the lock
        try:
          writefn(output)
        finally:
          # release the lock
          output.with_stem('.lock').unlink()
  # someone else has a lock
  while output.with_stem('.lock').exists():
    time.sleep(1)
  # we'd expect now that the lock is cleared for the writer
  #   to have written the output.
  assert output.exists()
  return output

def fetch_or_cache(url: str, output: pathlib.Path):
  return process_safe_cache(output, lambda output, _url=url: urllib.request.urlretrieve(url, output))

def ensure_dcc_asset(files_path: pathlib.Path, file):
  import urllib.parse
  file_path = files_path/file['short_label']/f"{urllib.parse.quote(str(file['sha256checksum']), safe='')}/{urllib.parse.quote(file['filename'], safe='')}"
  file_path.parent.mkdir(parents=True, exist_ok=True)
  return fetch_or_cache(file['link'].replace(' ', '%20'), file_path)

def unzip_file_path(file_path, extract_path):
    with zipfile.ZipFile(file_path, 'r') as z:
      z.extractall(extract_path)

def ensure_unzipped(file_path):
  return process_safe_cache(file_path.parent / file_path.stem, functools.partial(unzip_file_path, file_path))

@functools.cache
def gene_info():
  # load entrez gene info
  df_entrez = pd.read_csv(
    fetch_or_cache('https://ftp.ncbi.nlm.nih.gov/gene/DATA/GENE_INFO/Mammalia/Homo_sapiens.gene_info.gz', pathlib.Path('ingest')/'Homo_sapiens.gene_info.gz'),
    sep='\t',
  )
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
  unique_ensembl = df_entrez['Ensembl'].dropna().explode().unique()
  ensembl_ensembl_lookup = { ensembl: {ensembl} for ensembl in unique_ensembl }
  symbol_ensembl_lookup = df_entrez[['Symbol', 'Ensembl']].explode('Ensembl').dropna(how='any').groupby('Symbol')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
  synonym_ensembl_lookup = df_entrez[['Synonyms', 'Ensembl']].explode('Ensembl').explode('Synonyms').dropna(how='any').groupby('Synonyms')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
  for k in list(synonym_ensembl_lookup.keys() & symbol_ensembl_lookup.keys()):
    synonym_ensembl_lookup.pop(k)

  gene_lookup = {}
  gene_lookup.update(symbol_ensembl_lookup)
  gene_lookup.update(synonym_ensembl_lookup)
  gene_lookup.update(ensembl_ensembl_lookup)

  gene_labels = df_entrez[['Ensembl', 'Symbol']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['Symbol'].first().to_dict()
  gene_descriptions = df_entrez[['Ensembl', 'description']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['description'].first().to_dict()
  gene_entrez = df_entrez[['Ensembl', 'GeneID']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['GeneID'].first().to_dict()
  return gene_lookup, gene_labels, gene_descriptions, gene_entrez

class sqlite3dict:
  ''' Store kv in sqlite3 instead of in memory
  '''
  def __init__(self, conn, table):
    self.conn = conn
    self.table = table
    try:
      self.conn.execute(f'drop table {self.table};')
    except sqlite3.OperationalError:
      pass
    self.conn.execute(f'create table {self.table} (key varchar primary key, value varchar);')
    self.conn.commit()
  
  def __setitem__(self, key, value):
    self.conn.execute(f'insert or replace into {self.table} (key, value) values (?, ?)', (key, json.dumps(value),))
    self.conn.commit()
  
  def __getitem__(self, key):
    try:
      (value,), = self.conn.execute(f'select value from {self.table} where key = ?', (key,))
    except ValueError as e:
      raise KeyError from e
    else:
      return json.loads(value)
  
  def get(self, key, default=None):
    try:
      return self[key]
    except KeyError:
      return default
  
  def __contains__(self, key):
    try:
      (value,), = self.conn.execute(f'select 1 from {self.table} where key = ?', (key,))
      return True
    except ValueError:
      return False

def sqlite3dictquery(conn, stmt, *args):
  cur = conn.execute(stmt, *args)
  keys = [desc[0] for desc in cur.description]
  for row in cur:
    yield dict(zip(keys, row))
