#%%
import csv
import json
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest KG Assertions

assertions = dcc_assets[dcc_assets['filetype'] == 'KGAssertions']
assertions_path = ingest_path / 'assertions'

# for now, we'll map entity types to get less junk/duplication
valid_entity_types = {
  'Acquired Abnormality',
  'Amino Acid, Peptide, or Protein',
  'Anatomical Abnormality',
  'Body Part, Organ, or Organ Component',
  'Body Substance',
  'Cell Type',
  'Cell',
  'CLINGEN ALLELE REGISTRY',
  'Congenital Abnormality',
  'Diagnostic Procedure',
  'Disease or Syndrome',
  'Disease',
  'Drug',
  'ENCODE CCRE',
  'ENSEMBL',
  'GLYCAN MOTIF',
  'GLYCAN',
  'GLYCOSYLTRANSFERASE REACTION',
  'GLYGEN GLYCOSEQUENCE',
  'GLYGEN GLYCOSYLATION',
  'GLYGEN RESIDUE',
  'GLYTOUCAN',
  'GTEXEQTL',
  'Hormone',
  'Injury or Poisoning',
  'Inorganic Chemical',
  'Laboratory Procedure',
  'Mental or Behavioral Dysfunction',
  'Nucleic Acid, Nucleoside, or Nucleotide',
  'Organic Chemical',
  'Pharmacologic Substance',
  'Phenotype',
  'Sign or Symptom',
  'Therapeutic or Preventive Procedure',
  'Tissue',
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
              for gene_ensembl in gene_lookup.get(entity_label.rstrip(' gene'), []):
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
            elif entity_type in valid_entity_types:
              entity_id = str(uuid5(uuid0, '\t'.join((entity_type.lower(), entity_label.lower()))))
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
            if file['dcc_short_label'] in ('4DN',): continue
            file_path = assertions_path/file['dcc_short_label']/file['filename']
            file_path.parent.mkdir(parents=True, exist_ok=True)
            if not file_path.exists():
              import urllib.request
              urllib.request.urlretrieve(file['link'], file_path)
            with file_path.open('r') as fr:
              assertion_reader = csv.DictReader(fr, fieldnames=next(fr).strip().split(','), delimiter=',')
              for assertion in tqdm(assertion_reader, desc=f"Processing {file['dcc_short_label']}..."):
                if assertion['source_type'] == 'nan': assertion['source_type'] = None
                if assertion['source_label'] == 'nan': assertion['source_label'] = None
                if not assertion['source_label']: assertion['source_label'] = assertion['source']
                assert assertion['source'] and assertion['source_type'], assertion
                for ensure_source_id in ensure_entity(
                  assertion['source_type'],
                  assertion['source_label'],
                ):
                  if assertion['target_type'] == 'nan': assertion['target_type'] = None
                  if assertion['target_label'] == 'nan': assertion['target_label'] = None
                  if not assertion['target_label']: assertion['target_label'] = assertion['target']
                  assert assertion['target'] and assertion['target_type'], assertion
                  for ensure_target_id in ensure_entity(
                    assertion['target_type'],
                    assertion['target_label'],
                  ):
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
                    if assertion['evidence'] == 'nan':
                      assertion['evidence'] = None
                    if assertion['evidence']:
                      try:
                        assertion['evidence'] = json.loads(assertion['evidence'])
                      except:
                        assertion['evidence'] = assertion['evidence']
                      assertion['evidence'] = json.dumps(assertion['evidence'])
                    #
                    source_id = ensure_source_id()
                    target_id = ensure_target_id()
                    assertion_id = str(uuid5(uuid0, '\t'.join((file['dcc_id'], source_id, target_id, relation_id, assertion['evidence'] or '',))))
                    if assertion_id not in kg_assertions:
                      kg_assertions.add(assertion_id)
                      kg_assertion.writerow(dict(
                        id=assertion_id,
                        relation_id=relation_id,
                        source_id=source_id,
                        target_id=target_id,
                        SAB=assertion['SAB'],
                        evidence=assertion['evidence'],
                        dcc_id=file['dcc_id'],
                      ))
