#%%
import zipfile
import pathlib
from tqdm.auto import tqdm
from datapackage import Package

from ingest_common import ingest_path, current_dcc_assets, pdp_helper

def predicate_from_fields(fields):
  if len(fields) == 1: return fields[0]
  elif len(fields) == 2 and fields[0].endswith('_id_namespace') and fields[1].endswith('_local_id'): return fields[0][:-len('_id_namespace')]
  else: raise NotImplementedError(fields)

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
c2m2s_path = ingest_path / 'c2m2s'

for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
  c2m2_path = c2m2s_path/c2m2['short_label']/c2m2['filename']
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
  with pdp_helper() as helper:
    dcc_id = helper.upsert_entity('dcc', dict(
      label=c2m2['short_label']
    ), slug=c2m2['short_label'])
    dcc_asset_id = helper.upsert_entity('dcc_asset', dict(
      label=c2m2['filename'],
      link=c2m2['link'],
      filetype=c2m2['filetype'],
    ))
    helper.upsert_m2o(dcc_asset_id, 'dcc', dcc_id)
  for rc_name in ['file', 'subject', 'biosample']:
    rc = pkg.get_resource(rc_name)
    with pdp_helper() as helper:
      in_mem_ids = {}
      for fk in rc.schema.foreign_keys:
        fk_rc = fk['reference']['resource']
        in_mem_ids[fk_rc] = {}
        for row in tqdm(pkg.get_resource(fk_rc).read(keyed=True), desc=f"Reading {fk_rc}..."):
          row['label'] = row.pop('name')
          key = tuple([row[k] for k in fk['reference']['fields']])
          in_mem_ids[fk_rc][key] = helper.upsert_entity(fk_rc, row)
      for row in tqdm(rc.read(keyed=True), desc=f"Reading {rc_name} records..."):
        if 'name' in row: row['label'] = row.pop('name')
        elif 'filename' in row: row['label'] = row['filename']
        elif 'local_id' in row: row['label'] = f"{row['id_namespace']}:{row['local_id']}"
        else: raise RuntimeError(f"{row=}")
        source_id = helper.upsert_entity(rc_name, row)
        helper.upsert_m2o(source_id, 'dcc_asset', dcc_asset_id)
        helper.upsert_m2o(source_id, 'dcc', dcc_id)
        for fk in rc.schema.foreign_keys:
          key = tuple([row[k] for k in fk['fields']])
          if None in key: continue
          target_id = in_mem_ids[fk['reference']['resource']][key]
          helper.upsert_m2m(source_id, predicate_from_fields(fk['fields']), target_id)
