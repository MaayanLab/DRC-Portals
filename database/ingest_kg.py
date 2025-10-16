#%%
import csv
import json
import zipfile
from tqdm.auto import tqdm

from ingest_common import ingest_path, current_dcc_assets, pdp_helper
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
  'gp_id2pro': None,
  'glygen_src': None,
  'motrpac': None,
  'glygen_location': None,
  'gylcoprotein_citation': None,
  'gylcoprotein_evidence': None,
  '4dn_qval_bin': None,
  '4dn_file': None,
  '4dn_dataset': None,
}

for _, file in tqdm(assertions.iterrows(), total=assertions.shape[0], desc='Processing KGAssertion Files...'):
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
    continue

  with pdp_helper() as helper:
    def ensure_entity(entity_type, entity_label):
      entity_type = entity_type.lower()
      if entity_type == 'gene':
        for gene in gene_lookup.get(entity_label, []):
          yield lambda gene=gene: helper.upsert_entity('gene', dict(
            label=gene_labels[gene],
            description=gene_descriptions[gene],
            ensembl=gene,
            entrez=gene_entrez[gene],
          ), slug=gene)
      elif entity_type:
        entity_type = map_type.get(entity_type, entity_type)
        if entity_type:
          yield lambda entity_type=entity_type, entity_label=entity_label: helper.upsert_entity(entity_type, dict(
            label=entity_label,
          ))
    #
    dcc_id = helper.upsert_entity('dcc', dict(
      label=file['short_label']
    ), slug=file['short_label'])
    dcc_asset_id = helper.upsert_entity('dcc_asset', dict(
      label=file['filename'],
      link=file['link'],
      filetype=file['filetype'],
    ))
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
          # TODO: capture other metdata
          assertion_nodes[assertion_node['id']] = list(ensure_entity(assertion_node['type'], assertion_node['label'] or assertion_node['id']))
    #
    # register all of the edges
    for assertion_edge_file in assertions_extract_path.glob('*.edges.csv'):
      with assertion_edge_file.open('r') as fr:
        columns = next(fr).strip().split(',')
        assertion_edge_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
        for assertion in tqdm(assertion_edge_reader, desc=f"  Processing {assertion_edge_file.name}..."):
          for ensure_source_id in assertion_nodes.get(assertion['source'], []):
            for ensure_target_id in assertion_nodes.get(assertion['target'], []):
              relation_id = helper.upsert_entity('kg_relation', dict(
                label=assertion['relation'],
              ))
              if assertion['evidence_class'] == 'nan':
                assertion['evidence_class'] = None
              if assertion['evidence_class']:
                try:
                  assertion['evidence_class'] = json.loads(assertion['evidence_class'])
                except:
                  assertion['evidence_class'] = assertion['evidence_class']
                assertion['evidence_class'] = json.dumps(assertion['evidence_class'])
              #
              source_id = ensure_source_id()
              target_id = ensure_target_id()
              assertion_id = helper.upsert_entity('kg_assertion', dict(
                label=f"{helper.entities[source_id]['a_label']} {helper.entities[relation_id]['a_label']} {helper.entities[target_id]['a_label']}",
                SAB=assertion['SAB'],
                evidence=assertion['evidence_class'],
              ))
              try:
                helper.upsert_o2m(source_id, 'source', assertion_id)
                helper.upsert_o2m(target_id, 'target', assertion_id)
                helper.upsert_o2m(relation_id, 'relation', assertion_id)
              except KeyboardInterrupt: raise
              except:
                continue
              helper.upsert_m2o(assertion_id, 'dcc_asset', dcc_asset_id)
              helper.upsert_m2o(assertion_id, 'dcc', dcc_id)
