#%%
import os, sys; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ingest_common import current_dcc_assets

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2
for (short_label, filetype), assets in dcc_assets.groupby(['short_label', 'filetype']):
  if assets['filename'].nunique() != assets.shape[0] or (filetype=='C2M2' and assets.shape[0] > 1):
    print(assets[['short_label', 'filetype', 'filename', 'lastmodified']])
