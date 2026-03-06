#%%
import csv
import json
import zipfile
import re
import concurrent.futures
from tqdm.auto import tqdm

from ingest_common import ingest_path, current_dcc_assets, es_helper, pdp_helper, label_ident
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

debug = 1;

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest KG Assertions

assertions = dcc_assets[dcc_assets['filetype'] == 'KG Assertions']
assertions = assertions[assertions['size'] < 100000000]
assertions_path = ingest_path / 'assertions'

# for now, we'll map entity types to get less junk/duplication
map_type = {
  'hsclo': None,
  'gp id2pro': None,
  'glygen src': None,
  'motrpac': None,
  'glygen location': None,
  'glygen glycosequences': 'glycosequences',
  'gylcoprotein citation': None,
  'gylcoprotein evidence': None,
  '4dn qval bin': None,
  '4dn file': None,
  '4dn dataset': None,
}

def ingest_kg(es_bulk, file):
  # assemble the full file path for the DCC's asset
  file_path = assertions_path/file['short_label']/file['filename']
  if(debug >0):
    print(f"file_path:{file_path}");
  file_path.parent.mkdir(parents=True, exist_ok=True)
  if not file_path.exists():
    import urllib.request
    if(debug > 0):
      print("file link:"); print(file['link']);
    urllib.request.urlretrieve(file['link'].replace(' ', '%20'), file_path)
  # extract the KG Assertion bundle
  if(debug > 0):
    print(f'file_path.parent:{file_path.parent}, stem:{file_path.stem}, suffix:{file_path.suffix}');

  # Process on zip files
  if(file_path.suffix == '.zip'):
    assertions_extract_path = file_path.parent / file_path.stem
    if not assertions_extract_path.exists():
      with zipfile.ZipFile(file_path, 'r') as assertions_zip:
        assertions_zip.extractall(assertions_extract_path)
  else:
    print("  Warning: not a zip file, will skip!");
    return

  with pdp_helper(es_bulk) as helper:
    entities = {}
    def upsert_entity(type, attributes, slug=None, pk=None):
      id = helper.upsert_entity(type, attributes, slug=slug, pk=pk)
      entities[id] = dict(type=type, slug=slug or id, **{f"a_{k}": v for k,v in attributes.items()})
      return id
    def ensure_entity(entity):
      entity_type = entity.pop('type').lower()
      if entity_type == 'gene':
        for gene in gene_lookup.get(entity['label'], []):
          yield lambda gene=gene: upsert_entity('gene', dict(entity,
            label=gene_labels[gene],
            description=gene_descriptions[gene],
            ensembl=gene,
            entrez=gene_entrez[gene],
          ), slug=gene)
        if not gene_lookup.get(entity['label']) and entity.get('ensembl'):
          yield lambda entity=entity: upsert_entity('gene', entity, slug=entity['ensembl'])
      elif entity_type:
        entity_type = map_type.get(entity_type, entity_type)
        if entity_type:
          yield lambda entity_type=entity_type, entity=entity: upsert_entity(entity_type, entity, pk=label_ident(entity['label']))
    #
    dcc_id = upsert_entity('dcc', dict(
      label=file['short_label']
    ), slug=file['short_label'])
    dcc_asset_id = upsert_entity('dcc_asset', dict(
      label=file['filename'],
      access_url=file['link'],
      filetype=file['filetype'],
    ), pk=file['link'])
    helper.upsert_m2o(dcc_asset_id, 'dcc', dcc_id)

    # capture all the nodes
    assertion_nodes = {}
    # To list all tsv files: tsvf = [f for f in assertions_extract_path.glob("*.tsv")]
    for assertion_node_file in assertions_extract_path.glob('*.nodes.csv'):
      with assertion_node_file.open('r') as fr:
        columns = next(fr).strip().split(',')
        columns[0] = 'id'
        assertion_node_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
        for assertion_node in tqdm(assertion_node_reader, desc=f"  Processing {assertion_node_file.name}..."):
          if not assertion_node.get('label'): assertion_node['label'] = assertion_node['id']
          assertion_nodes[assertion_node['id']] = list(ensure_entity({ re.sub(r'[ \.-]', '_', k.lower()): v for k, v in assertion_node.items() }))
    #
    # register all of the edges
    for assertion_edge_file in assertions_extract_path.glob('*.edges.csv'):
      with assertion_edge_file.open('r') as fr:
        columns = next(fr).strip().split(',')
        assertion_edge_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
        for assertion in tqdm(assertion_edge_reader, desc=f"  Processing {assertion_edge_file.name}..."):
          assertion = {re.sub(r'[ \.-]', '_', k.lower()): v for k,v in assertion.items() if k != 'dcc'}
          for ensure_source_id in assertion_nodes.get(assertion['source'], []):
            for ensure_target_id in assertion_nodes.get(assertion['target'], []):
              relation_id = upsert_entity('kg_relation', dict(
                label=assertion['relation'],
              ))
              if assertion['evidence_class'] == 'nan':
                assertion['evidence_class'] = None
              if assertion['evidence_class']:
                try: assertion['evidence_class'] = json.loads(assertion['evidence_class'])
                except KeyboardInterrupt: raise
                except: assertion['evidence_class'] = assertion['evidence_class']
                assertion['evidence_class'] = json.dumps(assertion['evidence_class'])
              #
              source_id = ensure_source_id()
              target_id = ensure_target_id()
              if not assertion.get('label'): assertion['label'] = f"{entities[source_id]['a_label']} {entities[relation_id]['a_label']} {entities[target_id]['a_label']}"
              assertion_id = upsert_entity('kg_assertion', assertion, pk=f"{dcc_asset_id}:{source_id}:{relation_id}:{target_id}")
              try:
                helper.upsert_m2o(assertion_id, 'source', source_id)
                helper.upsert_m2o(assertion_id, 'target', target_id)
                helper.upsert_m2o(assertion_id, 'relation', relation_id)
              except KeyboardInterrupt: raise
              except: continue
              helper.upsert_m2o(assertion_id, 'dcc_asset', dcc_asset_id)
              helper.upsert_m2o(assertion_id, 'dcc', dcc_id)

with es_helper() as es_bulk:
  with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for fut in tqdm(concurrent.futures.as_completed((
      pool.submit(ingest_kg, es_bulk, file)
      for _, file in assertions.iterrows()
    )), total=assertions.shape[0], desc='Processing KGAssertion Files...'):
      fut.result()
