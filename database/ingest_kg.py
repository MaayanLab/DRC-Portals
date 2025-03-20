#%%
import csv
import json
import zipfile
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5
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

entity_helper = TableHelper('entity_node', ('id', 'type',), pk_columns=('id',))
kg_relation_helper = TableHelper('kg_relation_node', ('id',), pk_columns=('id',))
kg_assertion_helper = TableHelper('kg_assertion', ('id', 'dcc_id', 'relation_id', 'source_id', 'target_id', 'SAB', 'evidence',), pk_columns=('id',))
gene_helper = TableHelper('gene_entity', ('id', 'entrez', 'ensembl',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'slug', 'type', 'entity_type', 'label', 'description', 'dcc_id', 'pagerank'), pk_columns=('id',), add_columns=('pagerank',))

for _, file in tqdm(assertions.iterrows(), total=assertions.shape[0], desc='Processing KGAssertion Files...'):
  with kg_assertion_helper.writer() as kg_assertion:
    kg_assertions = set()
    with gene_helper.writer() as gene:
      genes = {}
      with entity_helper.writer() as entity:
        entities = {}
        with kg_relation_helper.writer() as kg_relation:
          kg_relations = {}
          with node_helper.writer() as node:
            def ensure_entity(entity_type, entity_label, entity_description=None):
              if entity_type == 'Gene':
                for gene_ensembl in gene_lookup.get(entity_label, []):
                  gene_id = str(uuid5(uuid0, gene_ensembl))
                  def ensure():
                    if gene_id not in genes:
                      genes[gene_id] = dict(
                        id=gene_id,
                        slug=gene_ensembl,
                        type='entity',
                        entity_type='gene',
                        label=gene_labels[gene_ensembl],
                        description=gene_descriptions[gene_ensembl],
                        pagerank=0,
                      )
                      gene.writerow(dict(
                        id=gene_id,
                        entrez=gene_entrez[gene_ensembl],
                        ensembl=gene_ensembl,
                      ))
                      entity.writerow(dict(
                        id=gene_id,
                        type='gene',
                      ))
                    else:
                      genes[gene_id]['pagerank'] += 1
                    return gene_id
                  yield ensure
              elif entity_type:
                entity_type = map_type.get(entity_type, entity_type)
                entity_id = str(uuid5(uuid0, '\t'.join((entity_type, entity_label))))
                def ensure():
                  if entity_id not in entities:
                    entities[entity_id] = dict(
                      id=entity_id,
                      type='entity',
                      slug=entity_id,
                      entity_type=entity_type,
                      label=entity_label,
                      description=entity_description or f"A {entity_type.lower()} in the knowledge graph",
                      pagerank=0,
                    )
                    entity.writerow(dict(
                      id=entity_id,
                      type=entity_type,
                    ))
                  else:
                    entities[entity_id]['pagerank'] += 1
                  return entity_id
                yield ensure
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
                      relation_id = str(uuid5(uuid0, '\t'.join((assertion['relation'],))))
                      if relation_id not in kg_relations:
                        kg_relations[relation_id] = dict(
                          id=relation_id,
                          slug=assertion['relation'],
                          type='kg_relation',
                          entity_type='',
                          label=assertion['relation'],
                          description="A relationship in the knowledge graph",
                          pagerank=1,
                        )
                        kg_relation.writerow(dict(
                          id=relation_id,
                        ))
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
                      source_id = ensure_source_id()
                      target_id = ensure_target_id()
                      assertion_id = str(uuid5(uuid0, '\t'.join((file['dcc_id'], source_id, target_id, relation_id, assertion['evidence_class'] or '',))))
                      if assertion_id not in kg_assertions:
                        kg_assertions.add(assertion_id)
                        kg_assertion.writerow(dict(
                          id=assertion_id,
                          relation_id=relation_id,
                          source_id=source_id,
                          target_id=target_id,
                          SAB=assertion['SAB'],
                          evidence=assertion['evidence_class'],
                          dcc_id=file['dcc_id'],
                        ))
            node.writerows(kg_relations.values())
            node.writerows(entities.values())
            node.writerows(genes.values())
