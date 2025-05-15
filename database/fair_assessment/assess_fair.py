import pathlib
__dir__ = pathlib.Path(__file__).parent
import sys
sys.path.insert(0, str(__dir__.parent))
from tqdm.auto import tqdm
from datetime import datetime
import json
import pathlib
from uuid import UUID, uuid5
import zipfile
from df2pg import OnConflictSpec, copy_from_records
from fairshake import PWB_metanode_fair, api_fair, apps_urls_fair, attribute_tables_fair, c2m2_fair, models_fair, code_assets_fair_assessment, entity_page_fair, etl_fair, file_assets_fair_assessment, kg_assertions_fair, xmt_fair
from ingest_common import (
  TableHelper,
  connection,
  uuid0, uuid5
)
import pandas as pd


uuid0 = UUID('00000000-0000-0000-0000-000000000000')
ingest_path = pathlib.Path('ingest')
fair_assessments_helper = TableHelper('fair_assessments', ('id', 'dcc_id', 'type', 'link', 'rubric', 'timestamp'), pk_columns=("link", "timestamp"))

def assess_dcc_asset(row):
    """Runs fair assessment for a single DCC asset
    row: Row containing asset information with same fields as that in a dataframe returned by either current_dcc_assets() or current_code_assets()
    """
    asset_type = ''
    rubric = {}
    if 'type' in row: 
        asset_type = row['type']
        if asset_type == 'ETL': 
            rubric= etl_fair(row['link'])
        if asset_type == 'Entity Page Template': 
            rubric = entity_page_fair(row['entityPageExample'], row['link'])
        if asset_type == 'PWB Metanodes':
            rubric = PWB_metanode_fair(row['name'], row['link'])
        if asset_type == 'API':
            rubric = api_fair(row)
        if asset_type == 'Apps URL':
            rubric = apps_urls_fair(row['link'])
        if asset_type == 'Models':
            rubric = models_fair(row)
    else: 
        asset_type = row['filetype']
        row['dcc_short_label'] = row['link'].split('/')[3]
        if asset_type == 'XMT': 
            xmts_path = ingest_path / 'xmts'
            xmt_path = xmts_path/row['dcc_short_label']/row['filename']
            xmt_path.parent.mkdir(parents=True, exist_ok=True)
            if not xmt_path.exists():
                import urllib.request
                urllib.request.urlretrieve(row['link'].replace(' ', '%20'), xmt_path)
            rubric = xmt_fair(xmt_path, row)
        if asset_type == 'Attribute Table': 
            attr_tables_path = ingest_path / 'attribute_tables'
            attr_table_path = attr_tables_path/row['dcc_short_label']/row['filename']
            attr_table_path.parent.mkdir(parents=True, exist_ok=True)
            if not attr_table_path.exists():
                import urllib.request
                urllib.request.urlretrieve(row['link'].replace(' ', '%20'), attr_table_path)
            rubric = attribute_tables_fair(attr_table_path, row)
        if asset_type == 'C2M2': 
            c2m2s_path = ingest_path / 'c2m2s'
            c2m2_path = c2m2s_path/row['dcc_short_label']/row['filename']
            c2m2_path.parent.mkdir(parents=True, exist_ok=True)
            if not c2m2_path.exists():
                import urllib.request
                urllib.request.urlretrieve(row['link'].replace(' ', '%20'), c2m2_path)
            c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
            if not c2m2_extract_path.exists():
                with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
                    c2m2_zip.extractall(c2m2_extract_path)
            # run fair assessment here: 
            rubric = c2m2_fair(str(c2m2_extract_path))
        if asset_type == 'KG Assertions': 
            assertions_path = ingest_path / 'assertions'
            # assemble the full file path for the DCC's asset
            file_path = assertions_path/row['dcc_short_label']/row['filename']
            file_path.parent.mkdir(parents=True, exist_ok=True)
            if not file_path.exists():
                import urllib.request
                urllib.request.urlretrieve(row['link'].replace(' ', '%20'), file_path)
            # extract the KG Assertion bundle
            assertions_extract_path = file_path.parent / file_path.stem
            if not assertions_extract_path.exists():
                with zipfile.ZipFile(file_path, 'r') as assertions_zip:
                    assertions_zip.extractall(assertions_extract_path)
            rubric = kg_assertions_fair(assertions_extract_path)                
    fair_timestamp = datetime.now()
    return dict(
        id=str(uuid5(uuid0, '\t'.join((row['link'], str(fair_timestamp))))), 
        dcc_id=row['dcc_id'],
        type=asset_type,
        link=row['link'],
        rubric=rubric,
        timestamp=fair_timestamp.isoformat(),
    )

if __name__ == '__main__':
    # perform fair assessment of code assets
    code_fair_assessment_df = code_assets_fair_assessment()
    # perform fair assessment on file assets 
    file_fair_assessment_df = file_assets_fair_assessment()
    frames = [code_fair_assessment_df, file_fair_assessment_df]
    fair_assessment_df = pd.concat(frames, ignore_index=True)
    copy_from_records(connection, 'fair_assessments', ['id', 'dcc_id', 'type', 'link', 'rubric', 'timestamp'], (
    dict(id=str(uuid5(uuid0, '\t'.join((row['link'], str(row['timestamp']))))), dcc_id=row['dcc_id'], type=row['type'], link=row['link'], rubric=json.dumps(row['rubric']), timestamp=row['timestamp'])
        for index, row in tqdm(fair_assessment_df.iterrows(), total=fair_assessment_df.shape[0], desc='Ingesting fair assessment results...')
    ), on=OnConflictSpec(conflict=("link", "timestamp"), update=('rubric')))
