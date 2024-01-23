#%%
from tqdm.auto import tqdm

from ingest_common import TableHelper, current_dcc_assets, uuid0, uuid5

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

dcc_asset_helper = TableHelper('dcc_asset_node', ('id', 'link',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))

with dcc_asset_helper.writer() as dcc_asset:
  with node_helper.writer() as node:
    for _, file in tqdm(dcc_assets.iterrows(), total=dcc_assets.shape[0], desc='Processing DCC Assets...'):
      dcc_asset_id = str(uuid5(uuid0, file['link']))
      dcc_asset.writerow(dict(
        id=dcc_asset_id,
        link=file['link'],
      ))
      node.writerow(dict(
        dcc_id=file['dcc_id'],
        id=dcc_asset_id,
        type='dcc_asset',
        label=f"{file['dcc_short_label']}_{file['filename']}",
        description=f"A {file['filetype']} processed data file from {file['dcc_short_label']}",
      ))
