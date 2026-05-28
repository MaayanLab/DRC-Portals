'''
After cfde-c2m2 validation, a sqlite database for the datapackage is generated.
This script obtains & adds second hop relationships for files in the C2M2.
'''
#%%
import zipfile
import pathlib
import concurrent.futures
import subprocess
import sqlite3
from tqdm.auto import tqdm

import os, sys; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ingest_common import ingest_path, current_dcc_assets, es_helper, pdp_helper, label_ident

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

files = dcc_assets[dcc_assets['filetype'] == 'C2M2']
files_path = ingest_path / 'c2m2s'

def ingest_c2m2_datapackage(es_bulk, file, version="staging"):
  file_path = files_path/file['short_label']/f"{urllib.parse.quote(str(file['sha256checksum']), safe='')}/{urllib.parse.quote(file['filename'], safe='')}"
  file_path.parent.mkdir(parents=True, exist_ok=True)
  print("file['link'] object:"); print(file['link']); ##

  if not file_path.exists():
    import urllib.request
    urllib.request.urlretrieve(file['link'].replace(' ', '%20'), file_path); # quote to handle space etc in the URL
  #
  c2m2_extract_path = file_path.parent / file_path.stem
  if not c2m2_extract_path.exists():
    with zipfile.ZipFile(file_path, 'r') as c2m2_zip:
      c2m2_zip.extractall(c2m2_extract_path)
  #
  c2m2_datapackage_json, *_ = (
    set(pathlib.Path(c2m2_extract_path).rglob('C2M2_datapackage.json'))
    | set(pathlib.Path(c2m2_extract_path).rglob('datapackage.json'))
  )
  c2m2_datapackage_db = c2m2_datapackage_json.parent/'C2M2_datapackage.sqlite'
  conn = sqlite3.connect(c2m2_datapackage_db)
  queries = [
    # file [-> biosample ->] disease
    '''
      select file.id_namespace, file.local_id, file.filename, 'disease', disease.id, disease.name
      from file
      inner join file_describes_biosample
        on file.id_namespace = file_describes_biosample.file_id_namespace and file.local_id = file_describes_biosample.file_local_id
      inner join biosample
        on file_describes_biosample.biosample_id_namespace = biosample.id_namespace and file_describes_biosample.biosample_local_id = biosample.local_id
      inner join biosample_disease
        on biosample.id_namespace = biosample_disease.biosample_id_namespace and biosample.local_id = biosample_disease.biosample_local_id
      inner join disease
        on biosample_disease.disease = disease.id
      ;
    ''',
    # file [-> biosample ->] anatomy
    '''
      select file.id_namespace, file.local_id, file.filename, 'anatomy', anatomy.id, anatomy.name
      from file
      inner join file_describes_biosample
        on file.id_namespace = file_describes_biosample.file_id_namespace and file.local_id = file_describes_biosample.file_local_id
      inner join biosample
        on file_describes_biosample.biosample_id_namespace = biosample.id_namespace and file_describes_biosample.biosample_local_id = biosample.local_id
      inner join anatomy
        on biosample.anatomy = anatomy.id
      ;
    ''',
    # file [-> subject ->] disease
    '''
      select file.id_namespace, file.local_id, file.filename, 'disease', disease.id, disease.name
      from file
      inner join file_describes_subject
        on file.id_namespace = file_describes_subject.file_id_namespace and file.local_id = file_describes_subject.file_local_id
      inner join subject
        on file_describes_subject.subject_id_namespace = subject.id_namespace and file_describes_subject.subject_local_id = subject.local_id
      inner join subject_disease
        on subject.id_namespace = subject_disease.subject_id_namespace and subject.local_id = subject_disease.subject_local_id
      inner join disease
        on subject_disease.disease = disease.id
      ;
    ''',
    # file [-> subject ->] taxon
    '''
      select distinct file.id_namespace, file.local_id, file.filename, 'taxon', ncbi_taxonomy.id, ncbi_taxonomy.name
      from file
      inner join file_describes_subject
        on file.id_namespace = file_describes_subject.file_id_namespace and file.local_id = file_describes_subject.file_local_id
      inner join subject
        on file_describes_subject.subject_id_namespace = subject.id_namespace and file_describes_subject.subject_local_id = subject.local_id
      inner join subject_role_taxonomy
        on subject.id_namespace = subject_role_taxonomy.subject_id_namespace and subject.local_id = subject_role_taxonomy.subject_local_id
      inner join ncbi_taxonomy
        on subject_role_taxonomy.taxonomy_id = ncbi_taxonomy.id
      ;
    ''',
  ]
  # TODO: also link file to gene, protein, substance, ptm
  with pdp_helper(es_bulk, version=version) as helper:
    for query in queries:
      for file_id_namespace, file_local_id, filename, link_type, link_id, link_label in conn.execute(query):
        file_pk = helper.upsert_entity('file', dict(id_namespace=file_id_namespace, local_id=file_local_id, label=filename), pk=':'.join([file_id_namespace, file_local_id]))
        link_id = helper.upsert_entity(link_type, dict(id=link_id, label=link_label), pk=label_ident(link_label))
        helper.upsert_m2m(file_pk, link_type, link_id)

def main(version="staging"):
  with es_helper() as es_bulk:
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
      for fut in tqdm(concurrent.futures.as_completed((
        pool.submit(ingest_c2m2_datapackage, es_bulk, file, version=version)
        for _, file in files.iterrows()
      )), total=files.shape[0], desc='Processing C2M2 Files...'):
        fut.result()

if __name__ == '__main__':
  import os
  main(version=os.getenv('INDEX_VERSION', 'staging'))