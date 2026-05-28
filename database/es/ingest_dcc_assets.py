#%%
from tqdm.auto import tqdm
import os, sys; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ingest_common import current_dcc_assets, es_helper, pdp_helper

#%%
dcc_assets = current_dcc_assets()

#%%
def main(version="staging"):
  # Ingest C2M2
  with es_helper() as es_bulk:
    with pdp_helper(es_bulk, version=version) as helper:
      for _, file in tqdm(dcc_assets.iterrows(), total=dcc_assets.shape[0], desc='Processing DCC Assets...'):
        dcc_asset_id = helper.upsert_entity('dcc_asset', dict(
          label=file['filename'],
          access_url=file['link'],
          filetype=file['filetype'],
        ), pk=file['link'])
        dcc_id = helper.upsert_entity('dcc', dict(
          label=file['short_label']
        ), slug=file['short_label'])
        helper.upsert_m2o(dcc_asset_id, 'dcc', dcc_id)

if __name__ == '__main__':
  import os
  main(version=os.getenv('INDEX_VERSION', 'staging'))
