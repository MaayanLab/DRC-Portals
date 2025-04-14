#%%
import re
import csv
import zipfile
import pandas as pd
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
c2m2s_path = ingest_path / 'c2m2s'

c2m2_datapackage_helper = TableHelper('c2m2_datapackage', ('id', 'dcc_asset_link',), pk_columns=('id',))
c2m2_file_helper = TableHelper('c2m2_file_node', ('id', 'c2m2_datapackage_id', 'creation_time', 'persistent_id', 'access_url', 'size_in_bytes', 'file_format', 'data_type', 'assay_type', 'mime_type', 'md5', 'sha256'), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'slug', 'type', 'entity_type', 'label', 'description', 'pagerank', 'dcc_id',), pk_columns=('id',), add_columns=('pagerank',))

for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
  with c2m2_file_helper.writer() as c2m2_file:
    with node_helper.writer() as node:
      with c2m2_datapackage_helper.writer() as c2m2_datapackage:
        c2m2_path = c2m2s_path/c2m2['dcc_short_label']/c2m2['filename']
        c2m2_path.parent.mkdir(parents=True, exist_ok=True)
        print("c2m2['link'] object:"); print(c2m2['link']); ##

        if not c2m2_path.exists():
          import urllib.request
          urllib.request.urlretrieve(c2m2['link'].replace(' ', '%20'), c2m2_path); # quote to handle space etc in the URL
        c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
        if not c2m2_extract_path.exists():
          with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
            c2m2_zip.extractall(c2m2_extract_path)
        # get ontology lookups
        c2m2_extracted_file_format_tsv_path, = c2m2_extract_path.rglob('file_format.tsv')
        c2m2_extracted_file_format = pd.read_csv(c2m2_extracted_file_format_tsv_path, sep='\t', index_col=0)
        c2m2_extracted_data_type_tsv_path, = c2m2_extract_path.rglob('data_type.tsv')
        c2m2_extracted_data_type = pd.read_csv(c2m2_extracted_data_type_tsv_path, sep='\t', index_col=0)
        c2m2_extracted_assay_type_tsv_path, = c2m2_extract_path.rglob('assay_type.tsv')
        c2m2_extracted_assay_type = pd.read_csv(c2m2_extracted_assay_type_tsv_path, sep='\t', index_col=0)
        #
        c2m2_datapackage_id = str(uuid5(uuid0, c2m2['link']))
        c2m2_datapackage.writerow(dict(
          id=c2m2_datapackage_id,
          dcc_asset_link=c2m2['link'],
        ))
        # ingest files for this datapackage
        c2m2_extracted_files_tsv_path, = c2m2_extract_path.rglob('file.tsv')
        with open(c2m2_extracted_files_tsv_path, 'r') as fr:
          c2m2_files_reader = csv.DictReader(fr, fieldnames=next(fr).strip().split('\t'), delimiter='\t')
          for file in tqdm(c2m2_files_reader, desc=f"Processing {c2m2['dcc_short_label']}/{c2m2['filename']}..."):
            c2m2_file_id = str(uuid5(uuid0, '\t'.join((c2m2_datapackage_id, file['id_namespace'], file['local_id']))))
            # infer access_url from persistent_id
            if (
              file['persistent_id'] and (
                # persistent_id is a drs-compatible protocol (except https which is still ambiguous)
                re.match(r'^(s3|gs|ftp|gsiftp|globus|htsget|drs)://', file['persistent_id'])
                # we'll assume if we've got a dot in the last part of the url, we've got a valid file
                #  and not some kind of landing page
                or re.match(r'^https?://([^/]+)/(.+?)\.([^\./]+)$', file['persistent_id'])
              )
            ):
              access_url = file['persistent_id']
            else:
              access_url = None
            # try to resolve ontologies labels
            try:
              file_format = f"{c2m2_extracted_file_format.at[file['file_format'], 'name']} (EDAM:{file['file_format']})"
              description = f"A {c2m2_extracted_file_format.at[file['file_format'], 'name']} file"
            except KeyError:
              file_format = file['file_format']
              description = f"A file"
            try:
              data_type = f"{c2m2_extracted_data_type.at[file['data_type'], 'name']} (EDAM:{file['data_type']})"
              description += f" containing {c2m2_extracted_data_type.at[file['data_type'], 'name'].lower()} data"
            except KeyError:
              data_type = file['data_type']
            try:
              assay_type = f"{c2m2_extracted_assay_type.at[file['assay_type'], 'name']} ({file['assay_type']})"
              description += f" produced with {c2m2_extracted_data_type.at[file['assay_type'], 'name'].lower()}"
            except KeyError:
              assay_type = file['assay_type']
            #
            description += f" from {c2m2['dcc_short_label']}"
            #
            c2m2_file.writerow(dict(
              id=c2m2_file_id,
              c2m2_datapackage_id=c2m2_datapackage_id,
              creation_time=file['creation_time'],
              persistent_id=file['persistent_id'],
              size_in_bytes=file['size_in_bytes'],
              file_format=file_format,
              data_type=data_type,
              assay_type=assay_type,
              access_url=access_url,
              mime_type=file['mime_type'],
              md5=file['md5'],
              sha256=file['sha256'],
            ))
            node.writerow(dict(
              dcc_id=c2m2['dcc_id'],
              id=c2m2_file_id,
              slug=c2m2_file_id,
              type='c2m2_file',
              entity_type='',
              label=file['filename'],
              description=description,
              pagerank=0,
            ))
