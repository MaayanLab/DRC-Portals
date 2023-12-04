#%%
import csv
import json
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, dcc_assets, uuid0, uuid5
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

#%%
# Ingest KG Assertions

assertions = dcc_assets[dcc_assets['filetype'] == 'KGAssertions']
assertions_path = ingest_path / 'assertions'

# for now, we'll map entity types to get less junk/duplication
map_type = {
  'Acquired Abnormality': 'Acquired Abnormality',
  'Amino Acid, Peptide, or Protein': 'Amino Acid, Peptide, or Protein',
  'Anatomical Abnormality': 'Anatomical Abnormality',
  'Body Part, Organ, or Organ Component': 'Body Part, Organ, or Organ Component',
  'Body Substance': 'Body Substance',
  'Cell Type': 'Cell Type',
  'Cell': 'Cell',
  'CLINGEN ALLELE REGISTRY': 'CLINGEN ALLELE REGISTRY',
  'Congenital Abnormality': 'Congenital Abnormality',
  'Diagnostic Procedure': 'Diagnostic Procedure',
  'Disease or Syndrome': 'Disease',
  'Disease': 'Disease',
  'Drug': 'Drug',
  'ENCODE CCRE': 'ENCODE CCRE',
  'ENSEMBL': 'ENSEMBL',
  'gene': 'gene',
  'GLYCAN MOTIF': 'GLYCAN MOTIF',
  'GLYCAN': 'GLYCAN',
  'GLYCOSYLTRANSFERASE REACTION': 'GLYCOSYLTRANSFERASE REACTION',
  'GLYGEN GLYCOSEQUENCE': 'GLYGEN GLYCOSEQUENCE',
  'GLYGEN GLYCOSYLATION': 'GLYGEN GLYCOSYLATION',
  'GLYGEN RESIDUE': 'GLYGEN RESIDUE',
  'GLYTOUCAN': 'GLYTOUCAN',
  'GTEXEQTL': 'GTEXEQTL',
  'Hormone': 'Hormone',
  'Injury or Poisoning': 'Injury or Poisoning',
  'Inorganic Chemical': 'Drug',
  'KFVARBIN': 'KFVARBIN',
  'Laboratory Procedure': 'Laboratory Procedure',
  'Mental or Behavioral Dysfunction': 'Mental or Behavioral Dysfunction',
  'Nucleic Acid, Nucleoside, or Nucleotide': 'Nucleic Acid, Nucleoside, or Nucleotide',
  'Organic Chemical': 'Drug',
  'Pharmacologic Substance': 'Drug',
  'Phenotype': 'Phenotype',
  'Sign or Symptom': 'Phenotype',
  'Therapeutic or Preventive Procedure': 'Laboratory Procedure',
  'Tissue': 'Tissue',
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
          def ensure_entity(entity_type, entity_label, entity_description='TODO'):
            if entity_type in {'Gene', 'ENSEMBL'}:
              for gene_ensembl in gene_lookup.get(entity_label.rstrip(' gene'), []):
                gene_id = str(uuid5(uuid0, gene_ensembl))
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
                yield gene_id
            elif entity_type in map_type:
              entity_type = map_type[entity_type]
              entity_id = str(uuid5(uuid0, '\t'.join((entity_type.lower(), entity_label.lower()))))
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
                  description=entity_description,
                ))
              yield entity_id
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
                for source_id in ensure_entity(
                  assertion['source_type'],
                  assertion['source_label'],
                ):
                  if assertion['target_type'] == 'nan': assertion['target_type'] = None
                  if assertion['target_label'] == 'nan': assertion['target_label'] = None
                  if not assertion['target_label']: assertion['target_label'] = assertion['target']
                  assert assertion['target'] and assertion['target_type'], assertion
                  for target_id in ensure_entity(
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
                        description='TODO',
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
