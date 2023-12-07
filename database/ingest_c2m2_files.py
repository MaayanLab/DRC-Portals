#%%
import csv
import zipfile
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
c2m2s_path = ingest_path / 'c2m2s'

c2m2_datapackage_helper = TableHelper('c2m2_datapackage', ('id', 'dcc_asset_link',), pk_columns=('id',))
c2m2_file_helper = TableHelper('c2m2_file_node', ('id', 'c2m2_datapackage_id', 'creation_time', 'persistent_id', 'size_in_bytes', 'file_format', 'data_type', 'assay_type',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))

with c2m2_file_helper.writer() as c2m2_file:
  with node_helper.writer() as node:
    with c2m2_datapackage_helper.writer() as c2m2_datapackage:
      for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
        c2m2_path = c2m2s_path/c2m2['dcc_short_label']/c2m2['filename']
        c2m2_path.parent.mkdir(parents=True, exist_ok=True)
        if not c2m2_path.exists():
          import urllib.request
          urllib.request.urlretrieve(c2m2['link'], c2m2_path)
        c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
        if not c2m2_extract_path.exists():
          with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
            c2m2_zip.extractall(c2m2_extract_path)
        c2m2_datapackage_id = str(uuid5(uuid0, c2m2['link']))
        c2m2_datapackage.writerow(dict(
          id=c2m2_datapackage_id,
          dcc_asset_link=c2m2['link'],
        ))
        # ingest files for this datapackage
        c2m2_extracted_files_tsv_path, = c2m2_extract_path.rglob('file.tsv')
        # TODO: also ingest
        with open(c2m2_extracted_files_tsv_path, 'r') as fr:
          c2m2_files_reader = csv.DictReader(fr, fieldnames=next(fr).strip().split('\t'), delimiter='\t')
          for file in tqdm(c2m2_files_reader, desc=f"Processing {c2m2['dcc_short_label']}/{c2m2['filename']}..."):
            c2m2_file_id = str(uuid5(uuid0, '\t'.join((c2m2_datapackage_id, file['id_namespace'], file['local_id']))))
            c2m2_file.writerow(dict(
              id=c2m2_file_id,
              c2m2_datapackage_id=c2m2_datapackage_id,
              creation_time=file['creation_time'],
              persistent_id=file['persistent_id'],
              size_in_bytes=file['size_in_bytes'],
              file_format=file['file_format'],
              data_type=file['data_type'],
              assay_type=file['assay_type'],
            ))
            node.writerow(dict(
              dcc_id=c2m2['dcc_id'],
              id=c2m2_file_id,
              type='c2m2_file',
              label=file['local_id'],
              description=file['filename'],
            ))
