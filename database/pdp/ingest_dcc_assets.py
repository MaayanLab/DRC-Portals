#%%
import pathlib
__dir__ = pathlib.Path(__file__).parent
import sys
sys.path.insert(0, str(__dir__.parent))

#%%
import json
from tqdm.auto import tqdm

from ingest_common import TableHelper, current_dcc_assets, uuid0, uuid5

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

relation_helper = TableHelper('relation', ('source_type', 'source_id', 'predicate', 'target_type', 'target_id'), pk_columns=('predicate', 'source_id', 'target_id'))
node_helper = TableHelper('node', ('type', 'id', 'attributes', 'pagerank',), pk_columns=('type', 'id',), add_columns=('pagerank',))

with relation_helper.writer() as relation:
  dccs = {}
  with node_helper.writer() as node:
    for _, file in tqdm(dcc_assets.iterrows(), total=dcc_assets.shape[0], desc='Processing DCC Assets...'):
      dcc_id = str(uuid5(uuid0, f"dcc:{file['dcc_short_label']}"))
      if dcc_id not in dccs:
        dccs[dcc_id] = dict(
          type='dcc',
          id=dcc_id,
          attributes=json.dumps(dict(label=file['dcc_short_label'])),
          pagerank=1,
        )
      else:
        dccs[dcc_id]['pagerank'] += 1

      dcc_asset_id = str(uuid5(uuid0, f"dcc_asset:{file['link']}"))
      node.writerow(dict(
        id=dcc_asset_id,
        type='dcc_asset',
        attributes=json.dumps(dict(
          label=f"{file['dcc_short_label']}_{file['filename']}",
          description=f"A {file['filetype']} processed data file from {file['dcc_short_label']}",
        )),
        pagerank=1,
      ))
      relation.writerow(dict(
        source_type='dcc_asset',
        source_id=dcc_asset_id,
        predicate='dcc',
        target_type='dcc',
        target_id=dcc_id,
      ))
    node.writerows(dccs.values())
