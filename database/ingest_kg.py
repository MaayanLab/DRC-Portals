#%%
import csv
import json
import zipfile
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest KG Assertions

assertions = dcc_assets[dcc_assets['filetype'] == 'KG Assertions']
assertions_path = ingest_path / 'assertions'

# for now, we'll map entity types to get less junk/duplication
map_type = {
  'Gene': 'gene',
}

entity_helper = TableHelper('entity_node', ('id', 'type',), pk_columns=('id',))
kg_relation_helper = TableHelper('kg_relation_node', ('id',), pk_columns=('id',))
kg_assertion_helper = TableHelper('kg_assertion', ('id', 'dcc_id', 'relation_id', 'source_id', 'target_id', 'SAB', 'evidence',), pk_columns=('id',))
gene_helper = TableHelper('gene_entity', ('id', 'entrez', 'ensembl',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))

with kg_assertion_helper.writer() as kg_assertion:
  kg_assertions = set()
  with gene_helper.writer() as gene:
    genes = set()
    with entity_helper.writer() as entity:
      entities = set()
      with kg_relation_helper.writer() as kg_relation:
        kg_relations = set()
        with node_helper.writer() as node:
          def ensure_entity(entity_type, entity_label, entity_description=None):
            if entity_type == 'Gene':
              for gene_ensembl in gene_lookup.get(entity_label, []):
                gene_id = str(uuid5(uuid0, gene_ensembl))
                def ensure():
                  if gene_id not in genes:
                    genes.add(gene_id)
                    gene.writerow(dict(
                      id=gene_id,
                      entrez=gene_entrez[gene_ensembl],
                      ensembl=gene_ensembl,
                    ))
                    entity.writerow(dict(
                      id=gene_id,
                      type='gene',
                    ))
                    node.writerow(dict(
                      id=gene_id,
                      type='entity',
                      label=gene_labels[gene_ensembl],
                      description=gene_descriptions[gene_ensembl],
                    ))
                  return gene_id
                yield ensure
            elif entity_type:
              entity_type = map_type.get(entity_type, entity_type)
              entity_id = str(uuid5(uuid0, '\t'.join((entity_type, entity_label))))
              def ensure():
                if entity_id not in entities:
                  entities.add(entity_id)
                  entity.writerow(dict(
                    id=entity_id,
                    type=entity_type,
                  ))
                  node.writerow(dict(
                    id=entity_id,
                    type='entity',
                    label=entity_label,
                    description=entity_description or f"A {entity_type.lower()} in the knowledge graph",
                  ))
                return entity_id
              yield ensure
          for _, file in tqdm(assertions.iterrows(), total=assertions.shape[0], desc='Processing KGAssertion Files...'):
            # assemble the full file path for the DCC's asset
            file_path = assertions_path/file['dcc_short_label']/file['filename']
            file_path.parent.mkdir(parents=True, exist_ok=True)
            if not file_path.exists():
              import urllib.request
              urllib.request.urlretrieve(file['link'], file_path)
            # extract the KG Assertion bundle
            assertions_extract_path = file_path.parent / file_path.stem
            if not assertions_extract_path.exists():
              with zipfile.ZipFile(file_path, 'r') as assertions_zip:
                assertions_zip.extractall(assertions_extract_path)
            # capture all the nodes
            assertion_nodes = {}
            for assertion_node_file in assertions_extract_path.glob('*.nodes.csv'):
              with assertion_node_file.open('r') as fr:
                columns = next(fr).strip().split(',')
                columns[0] = 'id'
                assertion_node_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
                for assertion_node in tqdm(assertion_node_reader, desc=f"Processing {assertion_node_file.name}..."):
                  # TODO: capture other metdata
                  assertion_nodes[assertion_node['id']] = list(ensure_entity(assertion_node['type'], assertion_node['label'] or assertion_node['id']))
            # register all of the edges
            for assertion_edge_file in assertions_extract_path.glob('*.edges.csv'):
              with assertion_edge_file.open('r') as fr:
                columns = next(fr).strip().split(',')
                assertion_edge_reader = csv.DictReader(fr, fieldnames=columns, delimiter=',')
                for assertion in tqdm(assertion_edge_reader, desc=f"Processing {assertion_edge_file.name}..."):
                  for ensure_source_id in assertion_nodes.get(assertion['source'], []):
                    for ensure_target_id in assertion_nodes.get(assertion['target'], []):
                      relation_id = str(uuid5(uuid0, '\t'.join((assertion['relation'],))))
                      if relation_id not in kg_relations:
                        kg_relations.add(relation_id)
                        kg_relation.writerow(dict(
                          id=relation_id,
                        ))
                        node.writerow(dict(
                          id=relation_id,
                          type='kg_relation',
                          label=assertion['relation'],
                          description="A relationship in the knowledge graph",
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
