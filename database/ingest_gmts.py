#%%
import concurrent.futures
from tqdm.auto import tqdm

from ingest_common import ingest_path, current_dcc_assets, es_helper, pdp_helper, label_ident
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest GMTs

files = dcc_assets[((dcc_assets['filetype'] == 'XMT') & (dcc_assets['filename'].str.endswith('.gmt')))]
files_path = ingest_path / 'gmts'

def ingest_gmt(es_bulk, file, version="staging"):
  if 'l1000_cp' in file['filename']: return
  file_path = files_path/file['short_label']/f"{urllib.parse.quote(str(file['sha256checksum']), safe='')}/{urllib.parse.quote(file['filename'], safe='')}"
  file_path.parent.mkdir(parents=True, exist_ok=True)
  if not file_path.exists():
    import urllib.request
    urllib.request.urlretrieve(file['link'].replace(' ', '%20'), file_path)
  if file_path.suffix == '.file':
    xmt_library_type = 'gene_set_library'
    xmt_set_type = 'gene_set'
    xmt_type = 'gene'
  elif file_path.suffix == '.dmt':
    xmt_library_type = 'drug_set_library'
    xmt_set_type = 'drug_set'
    xmt_type = 'drug'
  else:
    raise NotImplementedError(file_path.suffix)
  #
  with pdp_helper(es_bulk, version=version) as helper:
    dcc_id = helper.upsert_entity('dcc', dict(
      label=file['short_label']
    ), slug=file['short_label'])
    dcc_asset_id = helper.upsert_entity('dcc_asset', dict(
      label=file['filename'],
      access_url=file['link'],
      filetype=file['filetype'],
    ), pk=file['link'])
    helper.upsert_m2o(dcc_asset_id, 'dcc', dcc_id)
    #
    with file_path.open('r') as fr:
      for line in tqdm(fr, desc=f"Processing {file['short_label']}/{file['filename']}..."):
        line_split = list(map(str.strip, line.split('\t')))
        if len(line_split) < 3: continue
        set_label, set_description, *set_entities = line_split
        set_id = helper.upsert_entity(xmt_set_type, dict(
          label=set_label,
          description=set_description,
        ), pk=f"{dcc_asset_id}:{set_label}")
        helper.upsert_m2o(set_id, 'dcc_asset', dcc_asset_id)
        helper.upsert_m2o(set_id, 'dcc', dcc_id)
        if xmt_type == 'gene':
          set_entities = {gene_id for raw_gene in set_entities if raw_gene for gene_id in gene_lookup.get(raw_gene, [])}
          for gene in set_entities:
            entity_id = helper.upsert_entity(xmt_type, dict(
              label=gene_labels[gene],
              description=gene_descriptions[gene],
              ensembl=gene,
              entrez=gene_entrez[gene],
            ), slug=gene)
            helper.upsert_m2m(entity_id, xmt_set_type, set_id)
        else:
          for entity in set_entities:
            entity_id = helper.upsert_entity(xmt_type, dict(
              label=entity,
            ), pk=label_ident(entity))
            helper.upsert_m2m(entity_id, xmt_set_type, set_id)

def main(version="staging"):
  with es_helper() as es_bulk:
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
      for fut in tqdm(concurrent.futures.as_completed((
        pool.submit(ingest_gmt, es_bulk, gmt, version=version)
        for _, gmt in files.iterrows()
      )), total=files.shape[0], desc='Processing GMTs...'):
        fut.result()

if __name__ == '__main__':
  import os
  main(version=os.getenv('INDEX_VERSION', 'staging'))
