#%%
from tqdm.auto import tqdm
from ingest_common import current_dcc_assets, pdp_helper

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2
with pdp_helper() as helper:
  for _, file in tqdm(dcc_assets.iterrows(), total=dcc_assets.shape[0], desc='Processing DCC Assets...'):
    dcc_asset_id = helper.upsert_entity('dcc_asset', dict(
      link=file['link'],
      filename=file['filename'],
      filetype=file['filetype'],
    ))
    dcc_id = helper.upsert_entity('dcc', dict(
      short_label=file['dcc_short_label']
    ), slug=file['dcc_short_label'])
    helper.upsert_edge(dcc_asset_id, 'dcc', dcc_id)
