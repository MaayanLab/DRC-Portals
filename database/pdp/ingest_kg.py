#%%
import pathlib
__dir__ = pathlib.Path(__file__).parent
import sys
sys.path.insert(0, str(__dir__.parent))

#%%
import csv
import json
import zipfile
from tqdm.auto import tqdm

from ingest_pdp import NodeHelper, RelationHelper
from ingest_common import ingest_path, current_dcc_assets, uuid0, uuid5
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
  'Gene': 'gene',
}

relation_helper = RelationHelper()
node_helper = NodeHelper()

for _, file in tqdm(assertions.iterrows(), total=assertions.shape[0], desc='Processing KGAssertion Files...'):
  with relation_helper.writer() as relation:
    dccs = {}
    kg_assertions = set()
    genes = {}
    entities = {}
    kg_relations = {}
    with node_helper.writer() as node:
      def ensure_entity(entity_type, entity_label, entity_description=None):
        if entity_type == 'Gene':
          for gene_ensembl in gene_lookup.get(entity_label, []):
            gene_id = str(uuid5(uuid0, f"gene:{gene_ensembl}"))
            def ensure():
              if gene_id not in genes:
                genes[gene_id] = dict(
                  id=gene_id,
                  type='gene',
                  attributes=json.dumps(dict(
                    label=gene_labels[gene_ensembl],
                    description=gene_descriptions[gene_ensembl],
                    entrez=gene_entrez[gene_ensembl],
                    ensembl=gene_ensembl,
                  )),
                  pagerank=0,
                )
              else:
                genes[gene_id]['pagerank'] += 1
              return gene_id, 'gene'
            yield ensure
        elif entity_type:
          entity_type = map_type.get(entity_type, entity_type)
          entity_id = str(uuid5(uuid0, ':'.join(['entity', entity_type, entity_label])))
          def ensure():
            if entity_id not in entities:
              entities[entity_id] = dict(
                id=entity_id,
                type=f"{entity_type}",
                attributes=json.dumps(dict(
                  label=entity_label,
                  description=entity_description or f"A {entity_type.lower()} in the knowledge graph",
                )),
                pagerank=0,
              )
            else:
              entities[entity_id]['pagerank'] += 1
            return entity_id, entity_type
          yield ensure
      #
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
      # assemble the full file path for the DCC's asset
      file_path = assertions_path/file['dcc_short_label']/file['filename']
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
        import pathlib;
        assertions_extract_path = pathlib.Path('');
        print("  Warning: not a zip file, will skip!");

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
      # register all of the edges
      for assertion_edge_file in assertions_extract_path.glob('*.edges.csv'):
        with assertion_edge_file.open('r') as fr:
          columns = next(fr).strip().split(',')
          assertion_edge_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
          for assertion in tqdm(assertion_edge_reader, desc=f"  Processing {assertion_edge_file.name}..."):
            for ensure_source_id in assertion_nodes.get(assertion['source'], []):
              for ensure_target_id in assertion_nodes.get(assertion['target'], []):
                relation_id = str(uuid5(uuid0, ':'.join(['kg_relation', assertion['relation']])))
                if relation_id not in kg_relations:
                  kg_relations[relation_id] = dict(
                    id=relation_id,
                    type='kg_relation',
                    attributes=json.dumps(dict(
                      label=assertion['relation'],
                      description="A relationship in the knowledge graph",
                    )),
                    pagerank=1,
                  )
                else:
                  kg_relations[relation_id]['pagerank'] += 1
                if assertion['evidence_class'] == 'nan':
                  assertion['evidence_class'] = None
                if assertion['evidence_class']:
                  try:
                    assertion['evidence_class'] = json.loads(assertion['evidence_class'])
                  except:
                    assertion['evidence_class'] = assertion['evidence_class']
                  assertion['evidence_class'] = json.dumps(assertion['evidence_class'])
                #
                source_id, source_type = ensure_source_id()
                target_id, target_type = ensure_target_id()
                assertion_id = str(uuid5(uuid0, ':'.join(['kg_assertion', file['dcc_id'], source_id, target_id, relation_id, assertion['evidence_class'] or ''])))
                if assertion_id not in kg_assertions:
                  kg_assertions.add(assertion_id)
                  node.writerow(dict(
                    id=assertion_id,
                    type='kg_assertion',
                    attributes=json.dumps(dict(
                      SAB=assertion['SAB'],
                      evidence=assertion['evidence_class'],
                    )),
                  ))
                  relation.writerow(dict(
                    source_id=assertion_id,
                    predicate='kg_assertion_relation',
                    target_id=relation_id,
                  ))
                  relation.writerow(dict(
                    source_id=assertion_id,
                    predicate='kg_assertion_source',
                    target_id=source_id,
                  ))
                  relation.writerow(dict(
                    source_id=assertion_id,
                    predicate='kg_assertion_target',
                    target_id=target_id,
                  ))
                  relation.writerow(dict(
                    source_id=assertion_id,
                    predicate='dcc',
                    target_id=dcc_id,
                  ))

      node.writerows(dccs.values())
      node.writerows(kg_relations.values())
      node.writerows(entities.values())
      node.writerows(genes.values())
