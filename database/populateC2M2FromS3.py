#%%
import csv
import zipfile
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, dcc_assets, uuid0, uuid5

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
        # ingest files per table for all
        tables  = ["analysis_type", "anatomy", "assay_type",
                       "biosample", "biosample_disease", "biosample_from_subject",
                       "biosample_gene", "biosample_in_collection", "biosample_substance",
                       "collection", "collection_anatomy", "collection_compound",
                       "collection_defined_by_project", "collection_disease", "collection_gene",
                       "collection_in_collection", "collection_phenotype", "collection_protein",
                       "collection_substance", "collection_taxonomy", "compound",
                       "data_type", "dcc,disease", "file", "file_describes_biosample", "file_describes_collection",
                       "file_describes_subject", "file_format", "file_in_collection", "gene", "id_namespace",
                       "ncbi_taxonomy", "phenotype", "phenotype_disease", "phenotype_gene", "project", "project_in_project",
                       "protein", "protein_gene", "sample_prep_method", "subject", "subject_disease", "subject_in_collection",
                       "subject_phenotype", "subject_race", "subject_role_taxonomy", "subject_substance", "substance"
                    ]
        
        for table in tables:
          c2m2_extracted_table_tsv_path, = c2m2_extract_path.rglob(table+'.tsv')
          print(c2m2_extracted_table_tsv_path)
        

