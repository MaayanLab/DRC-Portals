#%%
from datetime import datetime
import json
from tqdm.auto import tqdm
import numpy as np
import h5py
from fairshake import traverse_datasets, check_ontology_in_term
from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5


#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest Attribute Tables

attr_tables = dcc_assets[dcc_assets['filetype'] == 'Attribute Table']
attr_tables_path = ingest_path / 'attribute_tables'

fair_assessments_helper = TableHelper('fair_assessments', ('id', 'dcc_id', 'type', 'link', 'rubric', 'timestamp'), pk_columns=("link", "timestamp"))


with fair_assessments_helper.writer() as fair_assessment:
    for _, attr_table in tqdm(attr_tables.iterrows(), total=attr_tables.shape[0], desc='Processing Attribute Tables...'):
        attr_table_path = attr_tables_path/attr_table['dcc_short_label']/attr_table['filename']
        attr_table_path.parent.mkdir(parents=True, exist_ok=True)
        if not attr_table_path.exists():
            import urllib.request
            urllib.request.urlretrieve(attr_table['link'].replace(' ', '%20'), attr_table_path)
        # initialize fairshake variables
        fairshake_drs = 1
        fairshake_persistent = 0
        fairshake_row_ontological = 0
        fairshake_col_ontological = 0

        if attr_table['filename'].endswith('.h5'):
            with h5py.File(attr_table_path, 'r') as f:
                for dset in traverse_datasets(f):
                    if dset == '/col/id': 
                        col_values = np.array(f[dset])
                        col_reference_ontological = np.array([check_ontology_in_term(xi.decode()) for xi in col_values])
                        fairshake_col_ontological = np.mean(col_reference_ontological).tolist()
                    if dset == '/row/id': 
                        row_values = np.array(f[dset])
                        row_reference_ontological = np.array([check_ontology_in_term(xi.decode()) for xi in row_values])
                        fairshake_row_ontological = np.mean(row_reference_ontological).tolist()

                fair_assessment_results={"Columns reference a community standardized id": fairshake_col_ontological,
                                        "Rows reference a community standardized id":fairshake_row_ontological, 
                                        "Accessible via DRS": fairshake_drs,
                                        "Persistent URL": fairshake_persistent
                                            }
        else:
            fair_assessment_results={"Columns reference a community standardized id": fairshake_col_ontological,
            "Rows reference a community standardized id":fairshake_row_ontological, 
            "Accessible via DRS": fairshake_drs,
            "Persistent URL": fairshake_persistent
            }
        fair_timestamp = datetime.now()
        fair_assessment.writerow(dict( #add fair assessment to database
        id=str(uuid5(uuid0, '\t'.join((attr_table['link'], str(fair_timestamp))))), 
        dcc_id=attr_table['dcc_id'],
        type='Attribute Table',
        link=attr_table['link'],
        rubric=json.dumps(fair_assessment_results),
        timestamp=fair_timestamp
        ))

