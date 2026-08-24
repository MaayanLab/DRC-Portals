#%%
from tqdm.auto import tqdm
import os, sys; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ingest_common import current_dcc_assets, es_helper, pdp_helper

#%%
dcc_assets = current_dcc_assets()

#%%
def ingest_dcc_asset(es_bulk, file, version="staging"):
  with pdp_helper(es_bulk, version=version) as helper:
    dcc_id = helper.upsert_entity('dcc', dict(
      label=file['short_label'],
      icon=file['icon'],
      description=file['description'],
      homepage=file['homepage'],
    ), slug=file['short_label'])
    dcc_asset_id = helper.upsert_entity('dcc_asset', dict(
      label=file['filename'],
      access_url=file['link'],
      filetype=file['filetype'],
      size=file['size'],
      sha256checksum=file['sha256checksum'],
      lastmodified=file['lastmodified'],
      created=file['created'],
    ), pk=file['link'])
    helper.upsert_m2o(dcc_asset_id, 'dcc', dcc_id)

#%%
def main(version="staging"):
  # Ingest C2M2
  with es_helper() as es_bulk:
    for _, file in tqdm(dcc_assets.iterrows(), total=dcc_assets.shape[0], desc='Processing DCC Assets...'):
      ingest_dcc_asset(es_bulk, file, version=version)

if __name__ == '__main__':
  import os
  main(version=os.getenv('INDEX_VERSION', 'staging'))
