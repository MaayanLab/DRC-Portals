#%%
import re
import zipfile
import pathlib
import pandas as pd
from tqdm.auto import tqdm
from datapackage import Package

from ingest_common import ingest_path, current_dcc_assets, pdp_helper, label_ident
from ingest_entity_common import gene_labels, gene_descriptions, gene_entrez

def predicate_from_fields(fields):
  if len(fields) == 1: return fields[0]
  elif len(fields) == 2 and fields[0].endswith('_id_namespace') and fields[1].endswith('_local_id'): return fields[0][:-len('_id_namespace')]
  else: raise NotImplementedError(fields)

def valid_access_url(access_url):
  return type(access_url) == str and re.match(r'^(https?|drs|ftp|s3|gs|gsiftp|globus|htsget|ftps|sftp)://', access_url) is not None

def persistent_id_probably_access_url(access_url):
  if type(access_url) == str:
    # these IRIs are certainly access urls
    if re.match(r'^(drs|ftp|s3|gs|gsiftp|globus|htsget|ftps|sftp)://', access_url) is not None:
      return True
    # http(s) could be, probably is if the final path component seems to be a file with an extension
    if re.match(r'^https?://.+?/[^/]+?\.[^/\.]+$', access_url) is not None:
      return True
  return False

#%%
# get reference tables
if not pathlib.Path('ingest/c2m2_reference_tables').exists():
  import urllib.request
  urllib.request.urlretrieve("https://files.osf.io/v1/resources/m3a85/providers/osfstorage/?zip=", 'ingest/c2m2_reference_tables.zip')
  with zipfile.ZipFile('ingest/c2m2_reference_tables.zip', 'r') as c2m2_zip:
    c2m2_zip.extractall('ingest/c2m2_reference_tables')

c2m2_reference_tables = {
  f.stem: pd.read_csv(f, sep='\t') for f in pathlib.Path('ingest/c2m2_reference_tables').glob('*.tsv')
}
# TODO: ideally this could be implicit -- besides ptm site_type we probably could just look for enum fields
c2m2_reference_tables_mappings = {
  ('biosample_disease', 'association_type'): 'disease_association_type',
  ('subject_disease', 'association_type'): 'disease_association_type',
  ('subject_phenotype', 'association_type'): 'phenotype_association_type',
  ('ptm', 'site_type'): 'site_type',
  ('subject', 'ethnicity'): 'subject_ethnicity',
  ('subject', 'granularity'): 'subject_granularity',
  ('subject_race', 'race'): 'subject_race',
  ('subject_role_taxonomy', 'role_id'): 'subject_role',
  ('subject', 'sex'): 'subject_sex',
}

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
      access_url=c2m2['link'],
      filetype=c2m2['filetype'],
    ), pk=c2m2['link'])
    helper.upsert_m2o(dcc_asset_id, 'dcc', dcc_id)
    #
    # We rely on the fact that upsert_entity will merge with an entity
    #  with the same pk.
    # Then by using pk as (id_namespace, local_id) or (id),
    #  which is used throughout C2M2, we can get reference the actual entity
    #  even if it's not registered yet / without keeping it in memory
    #
    # process cv records first, store them in memory
    # TODO: if we could just use the id as the slug we could avoid storing any of this in memory
    #       but we'll need to update the other ingest steps to rely on C2M2 CV terms
    cv_lookup = {}
    #
    # the reference tables are pseudo-cv term tables but enums were used instead, we'll just treat them the same as cv tables
    for rc_name, rc in c2m2_reference_tables.items():
      for _, row in rc.iterrows():
        cv_lookup[row['id']] = helper.upsert_entity(rc_name, row, pk=row['id'])
    #
    for rc_name in pkg.resource_names:
      rc = pkg.get_resource(rc_name)
      if {field.name for field in rc.schema.fields} >= {'id'}:
        for row in tqdm(rc.read(keyed=True), desc=f"Reading {rc_name} records..."):
          if rc_name == 'dcc':
            row['label'] = c2m2['short_label']
            cv_lookup[row['id']] = helper.upsert_entity(rc_name, row, slug=c2m2['short_label'])
          elif rc_name == 'gene':
            gene = row['id']
            row['label'] = row.pop('name')
            if gene in gene_labels:
              row.update(
                label=gene_labels[gene],
                description=gene_descriptions[gene],
                ensembl=gene,
                entrez=gene_entrez[gene],
              )
            cv_lookup[row['id']] = helper.upsert_entity(rc_name, row, slug=row['id'])
          elif rc_name == 'ptm':
            row['label'] = row['id']
            cv_lookup[row['id']] = helper.upsert_entity(rc_name, row, pk=row['id'])
          else:
            if 'name' in row: row['label'] = row.pop('name')
            else: raise NotImplementedError(f"label for {row=}")
            cv_lookup[row['id']] = helper.upsert_entity(rc_name, row, pk=label_ident(row['label']))
    #
    # then process entities and m2m
    for rc_name in pkg.resource_names:
      rc = pkg.get_resource(rc_name)
      for row in tqdm(rc.read(keyed=True), desc=f"Reading {rc_name} records..."):
        fks = [*rc.schema.foreign_keys]
        edge_type = None
        if 'name' in row: row['label'] = row.pop('name')
        if {field.name for field in rc.schema.fields} >= {'id_namespace', 'local_id'}:
          # we have a dcc-specific entity
          edge_type = 'm2o'
          if 'filename' in row: row['label'] = row['filename']
          else: row['label'] = row['local_id']
          if rc_name == 'file':
            # remove access_url if present and invalid
            if not valid_access_url(row.get('access_url')):
              row['access_url'] = None
            # use persistent id if it's "probably" an access url
            if not row['access_url']:
              if persistent_id_probably_access_url(row.get('persistent_id')):
                row['access_url'] = row['persistent_id']
          #
          source_id = helper.upsert_entity(rc_name, row, pk=':'.join([row['id_namespace'], row['local_id']]))
          helper.upsert_m2o(source_id, 'dcc_asset', dcc_asset_id)
          helper.upsert_m2o(source_id, 'dcc', dcc_id)
        elif {field.name for field in rc.schema.fields} >= {'id'}:
          # we have a cv term (already added but not its fks)
          source_id = cv_lookup[row['id']]
          edge_type = 'm2o'
        else:
          # we have a m2m
          edge_type = 'm2m'
          # the first fk will be the source_id
          fk = fks.pop(0)
          local_key = tuple([row[k] for k in fk['fields']])
          # lookup ids in cv_lookup
          source_id = helper.resolve_entity_id(
            fk['reference']['resource'],
            {k: v for k, v in zip(fk['reference']['fields'], local_key)},
            pk=':'.join(local_key),
          ) if len(local_key) > 1 else cv_lookup[local_key[0]]
        #
        # add cv_reference_table relationships
        for k, v in row.items():
          if (rc_name, k) in c2m2_reference_tables_mappings:
            target_id = cv_lookup[v]
            helper.upsert_m2o(source_id, predicate, target_id)
        #
        # add foreign key relationships
        for fk in fks:
          # get fk
          local_key = tuple([row[k] for k in fk['fields']])
          # skip missing attributes
          if any(v is None for v in local_key): continue
          predicate = predicate_from_fields(fk['fields'])
          target_id = helper.resolve_entity_id(
            fk['reference']['resource'],
            {k: v for k, v in zip(fk['reference']['fields'], local_key)},
            pk=':'.join(local_key),
          ) if len(local_key) > 1 else cv_lookup[local_key[0]]
          # add the edge between the source and the target
          try:
            if edge_type == 'm2m':
              helper.upsert_m2m(source_id, predicate, target_id)
            elif edge_type == 'm2o':
              helper.upsert_m2o(source_id, predicate, target_id)
            elif edge_type == 'o2m':
              helper.upsert_m2o(target_id, predicate, source_id)
          except Exception as e:
            raise RuntimeError(f"{rc_name=}, {fk['reference']['resource']=}") from e
