#%%
import uuid
import json
import zipfile
import pathlib
import df2pg
from tqdm.auto import tqdm
from datapackage import Package
from datetime import datetime

from ingest_common import ingest_path, current_dcc_assets, uuid0, uuid5, connection

class ExEncoder(json.JSONEncoder):
  def default(self, o):
    import decimal
    if isinstance(o, decimal.Decimal):
      return str(o)
    elif isinstance(o, datetime):
      return o.isoformat()
    elif isinstance(o, uuid.UUID):
      return str(o)
    return super(ExEncoder, self).default(o)

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
c2m2s_path = ingest_path / 'c2m2s'

for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
  if c2m2['link'] in {
    # broken
    'https://cfde-drc.s3.amazonaws.com/HuBMAP/C2M2/2024-12-04/20241202-submission.zip',
    'https://cfde-drc.s3.amazonaws.com/Bridge2AI/C2M2/2024-12-09/draft_C2M2_submission_TSVs.zip',
    'https://cfde-drc.s3.amazonaws.com/SenNet/C2M2/2024-12-16/Visium_no_probes-aggregate.zip',
    'https://cfde-drc.s3.amazonaws.com/IDG/C2M2/2024-07-03/IDG_C2M2_2024-01-09_datapackage_validated.zip',
    # completed
    'https://cfde-drc.s3.amazonaws.com/Metabolomics/C2M2/2024-12-11/MW_submission_packet_20241211.zip',
    'https://cfde-drc.s3.amazonaws.com/KidsFirst/C2M2/2024-09-17/20240821_frictionless.zip',
    'https://cfde-drc.s3.amazonaws.com/GlyGen/C2M2/2024-09-17/data.zip',
    'https://cfde-drc.s3.amazonaws.com/SPARC/C2M2/2024-09-17/c2m2_2024SEP16_submit.zip',
    'https://cfde-drc.s3.amazonaws.com/ERCC/C2M2/2023-08-17/ERCC_C2M2_2023-08-17_datapackage.zip',
    'https://cfde-drc.s3.amazonaws.com/MoTrPAC/C2M2/2024-04-03/MoTrPAC_C2M2_datapackage_2024-03-12.zip',
    'https://cfde-drc.s3.amazonaws.com/LINCS/C2M2/2023-09-18/LINCS_C2M2_2023-09-18_datapackage.zip',
    'https://cfde-drc.s3.amazonaws.com/HMP/C2M2/2022-06-20/HMP_C2M2_2022-06-20_datapackage.zip',
    'https://cfde-drc.s3.amazonaws.com/GTEx/C2M2/2023-09-01/GTEx_C2M2_2023-09-01_datapackage.zip',
    'https://cfde-drc.s3.amazonaws.com/GlyGen/C2M2/2024-12-06/data.zip',
    'https://cfde-drc.s3.amazonaws.com/4DN/C2M2/2024-12-05/241204_c2m2_4dn_submission.zip',
  } : continue
  c2m2_path = c2m2s_path/c2m2['dcc_short_label']/c2m2['filename']
  c2m2_path.parent.mkdir(parents=True, exist_ok=True)
  print("c2m2['link'] object:"); print(c2m2['link']); ##

  if not c2m2_path.exists():
    import urllib.request
    urllib.request.urlretrieve(c2m2['link'].replace(' ', '%20'), c2m2_path); # quote to handle space etc in the URL
  #
  c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
  if not c2m2_extract_path.exists():
    with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
      c2m2_zip.extractall(c2m2_extract_path)
  #
  c2m2_datapackage_json, *_ = (
    set(pathlib.Path(c2m2_extract_path).rglob('C2M2_datapackage.json'))
    | set(pathlib.Path(c2m2_extract_path).rglob('datapackage.json'))
  )
  pkg = Package(str(c2m2_datapackage_json))
  file_resource = pkg.get_resource('file')
  entities = {}
  edges = {}
  def upsert_entity(type, attributes):
    id = str(uuid5(uuid0, json.dumps({'@type': type, **attributes}, sort_keys=True, cls=ExEncoder)))
    entities[id] = dict(id=id, type=type, attributes=json.dumps(attributes, cls=ExEncoder))
    return id
  def upsert_edge(source_id, predicate, target_id):
    edges[''.join((source_id, predicate, target_id))] = dict(source_id=source_id, predicate=predicate, target_id=target_id)
    return id
  def predicate_from_fields(fields):
    if len(fields) == 1: return fields[0]
    elif len(fields) == 2 and fields[0].endswith('_id_namespace') and fields[1].endswith('_local_id'): return fields[0][:-len('_id_namespace')]
    else: raise NotImplementedError(fields)

  in_mem_ids = {}
  for fk in file_resource.schema.foreign_keys:
    fk_rc = fk['reference']['resource']
    in_mem_ids[fk_rc] = {}
    for row in tqdm(pkg.get_resource(fk_rc).read(keyed=True), desc=f"Reading {fk_rc}..."):
      key = tuple([row[k] for k in fk['reference']['fields']])
      in_mem_ids[fk_rc][key] = upsert_entity(fk_rc, row)
  for row in tqdm(file_resource.read(keyed=True), desc='Reading files...'):
    source_id = upsert_entity('file', row)
    for fk in file_resource.schema.foreign_keys:
      key = tuple([row[k] for k in fk['fields']])
      if None in key: continue
      target_id = in_mem_ids[fk['reference']['resource']][key]
      upsert_edge(source_id, predicate_from_fields(fk['fields']), target_id)

  df2pg.copy_from_records(
    connection,
    'pdp.entity_ingest',
    tqdm(entities.values(), desc='Ingesting entities...'),
  )
  df2pg.copy_from_records(
    connection,
    'pdp.edge_ingest',
    tqdm(edges.values(), desc='Ingesting edges...'),
  )
