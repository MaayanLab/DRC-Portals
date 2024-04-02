import sys
import json
import pathlib
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from ingest_common import connection

connection.autocommit = True
cur = connection.cursor()

for f in pathlib.Path(__file__).parent.glob('CV/*.tsv'):
  cur.execute(
    f'''
      DROP TABLE IF EXISTS "c2m2"."{f.stem}" RESTRICT;
      CREATE TABLE "c2m2"."{f.stem}"(
        id VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        description VARCHAR NOT NULL,
        PRIMARY KEY(id)
      );
    '''
  )
  with f.open('r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_expert(f'''COPY "c2m2"."{f.stem}" ({','.join(map(json.dumps, columns))}) from STDIN with CSV DELIMITER '\t';''', fr)

# Ingest slim (and associated ontology) tables into a schema called 'slim', because c2m2 also has tables like anatomy, disease etc., which is likely to be a much smaller subset of the corresponding tables in the slim schema.
# There is also the table dbgap_study_id.tsv ; for now, it will be in slim schema, if needed later, can be put in a schema called dbgap.
try:
  cur.execute('create schema "slim";')
except:
  connection.rollback()

for f in pathlib.Path(__file__).parent.glob('slim/*.tsv'):
  if f.stem.endswith('_slim'):
    cur.execute(
      f'''
        DROP TABLE IF EXISTS slim."{f.stem}" RESTRICT;
        CREATE TABLE slim."{f.stem}" (
          original_term_id VARCHAR NOT NULL,
          slim_term_id VARCHAR NOT NULL,
          pk_id SERIAL PRIMARY KEY
        );
      '''
    )
  else:
    cur.execute(
      f'''
        DROP TABLE IF EXISTS slim."{f.stem}" RESTRICT;
        CREATE TABLE slim."{f.stem}" (
          id VARCHAR NOT NULL PRIMARY KEY,
          name VARCHAR NOT NULL,
          description VARCHAR DEFAULT NULL,
          synonyms VARCHAR DEFAULT NULL
        );
      '''
    )
  with f.open('r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_expert(f'''COPY "slim"."{f.stem}" ({','.join(map(json.dumps, columns))}) from STDIN with CSV DELIMITER '\t';''', fr)
