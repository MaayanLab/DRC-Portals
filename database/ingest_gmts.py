#%%
from datetime import datetime
import json
from tqdm.auto import tqdm

from fairshake import check_ontology_in_term
from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions
from statistics import mean 


#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest GMTs

gmts = dcc_assets[((dcc_assets['filetype'] == 'XMT') & (dcc_assets['filename'].str.endswith('.gmt')))]
gmts_path = ingest_path / 'gmts'

gene__gene_set_helper = TableHelper('_GeneEntityToGeneSetNode', ('A', 'B',), pk_columns=('A', 'B',))
gene__gene_set_library_helper = TableHelper('_GeneEntityToGeneSetLibraryNode', ('A', 'B'), pk_columns=('A', 'B',))
gene_set_helper = TableHelper('gene_set_node', ('id', 'gene_set_library_id',), pk_columns=('id',))
gene_set_library_helper = TableHelper('gene_set_library_node', ('id', 'dcc_asset_link',), pk_columns=('id',))
entity_helper = TableHelper('entity_node', ('id', 'type',), pk_columns=('id',))
gene_helper = TableHelper('gene_entity', ('id', 'entrez', 'ensembl',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))
fair_assessments_helper = TableHelper('fair_assessments', ('id', 'dcc_id', 'type', 'link', 'rubric', 'timestamp'), pk_columns=("link", "timestamp"))

with gene__gene_set_helper.writer() as gene__gene_set:
  with gene__gene_set_library_helper.writer() as gene__gene_set_library:
    with gene_set_helper.writer() as gene_set:
      with gene_set_library_helper.writer() as gene_set_library:
        with gene_helper.writer() as gene:
          with entity_helper.writer() as entity:
            with fair_assessments_helper.writer() as fair_assessment:
              genes = set()
              with node_helper.writer() as node:
                for _, gmt in tqdm(gmts.iterrows(), total=gmts.shape[0], desc='Processing GMTs...'):
                  gmt_path = gmts_path/gmt['dcc_short_label']/gmt['filename']
                  gmt_path.parent.mkdir(parents=True, exist_ok=True)
                  if not gmt_path.exists():
                    import urllib.request
                    urllib.request.urlretrieve(gmt['link'], gmt_path)
                  #
                  gene_set_library_id = str(uuid5(uuid0, gmt['link']))

                  # initialize fairshake variables
                  fairshake_drs = 1
                  fairshake_persistent = 0
                  fairshake_ontological_count = 0
                  fairshake_standard_elements = []

                  library_genes = set()
                  if gmt_path.suffix == '.gmt':
                    gene_set_library.writerow(dict(
                      id=gene_set_library_id,
                      dcc_asset_link=gmt['link'],
                    ))
                    node.writerow(dict(
                      dcc_id=gmt['dcc_id'],
                      id=gene_set_library_id,
                      type="gene_set_library",
                      label=gmt_path.stem.replace('_', ' '),
                      description=f"A gene set library provided by {gmt['dcc_short_label']}",
                    ))
                  else:
                    raise NotImplementedError(gmt_path.suffix)

                  with gmt_path.open('r') as fr:
                    for line in tqdm(fr, desc=f"Processing {gmt['dcc_short_label']}/{gmt['filename']}..."):
                      line_split = list(map(str.strip, line.split('\t')))
                      if len(line_split) < 3: continue
                      gene_set_label, gene_set_description, *gene_set_genes = line_split
                      gene_set_id = str(uuid5(uuid0, '\t'.join((gene_set_library_id, gene_set_label, gene_set_description,))))
                      gene_set.writerow(dict(
                        id=gene_set_id,
                        gene_set_library_id=gene_set_library_id,
                      ))
                      node.writerow(dict(
                        dcc_id=gmt['dcc_id'],
                        id=gene_set_id,
                        type='gene_set',
                        label=gene_set_label.replace('_', ' '),
                        description=gene_set_description or f"A gene set from {gmt_path.stem.replace('_',' ')} provided by {gmt['dcc_short_label']}",
                      ))

                      term_ontological = check_ontology_in_term(gene_set_label.replace('_', ' '))
                      if term_ontological:
                        fairshake_ontological_count +=1
                      standard_genes = [1 if len(gene_lookup.get(raw_gene, [])) > 0 else 0 for raw_gene in gene_set_genes]
                      sum_standard_genes = sum(standard_genes)  
                      fairshake_standard_elements.append(sum_standard_genes/len(gene_set_genes))

                      gene_set_genes = {gene_id for raw_gene in gene_set_genes if raw_gene for gene_id in gene_lookup.get(raw_gene, [])}
                      #
                      for gene_set_gene in gene_set_genes:
                        gene_id = str(uuid5(uuid0, gene_set_gene))
                        if gene_id not in genes:
                          label = gene_labels[gene_set_gene]
                          description = gene_descriptions[gene_set_gene]
                          #
                          gene.writerow(dict(
                            id=gene_id,
                            entrez=gene_entrez[gene_set_gene],
                            ensembl=gene_set_gene,
                          ))
                          entity.writerow(dict(
                            id=gene_id,
                            type='gene',
                          ))
                          node.writerow(dict(
                            id=gene_id,
                            type='entity',
                            label=label,
                            description=description,
                          ))
                          genes.add(gene_id)
                        if gene_id not in library_genes:
                          gene__gene_set_library.writerow(dict(
                            A=gene_id,
                            B=gene_set_library_id,
                          ))
                          library_genes.add(gene_id)
                        gene__gene_set.writerow(dict(
                          A=gene_id,
                          B=gene_set_id,
                        ))
                      
                    fair_assessment_results={"XMT Terms contain ontological reference": fairshake_ontological_count/len(fairshake_standard_elements),
                            "XMT Elements are normalized to a standard": mean(fairshake_standard_elements), 
                            "Accessible via DRS": fairshake_drs,
                            "Persistent URL": fairshake_persistent
                            }
                    fair_timestamp = datetime.now()
                    fair_assessment.writerow(dict( #add fair assessment to database
                    id=str(uuid5(uuid0, '\t'.join((gmt['link'], str(fair_timestamp))))), 
                    dcc_id=gmt['dcc_id'],
                    type='XMT',
                    link=gmt['link'],
                    rubric=json.dumps(fair_assessment_results),
                    timestamp=fair_timestamp
                    ))
                      
