#%%
from tqdm.auto import tqdm

from ingest_common import TableHelper, ingest_path, current_dcc_assets, uuid0, uuid5
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

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
node_helper = TableHelper('node', ('id', 'type', 'entity_type', 'label', 'description', 'pagerank', 'dcc_id',), pk_columns=('id',), add_columns=('pagerank',))

with gene__gene_set_helper.writer() as gene__gene_set:
  with gene__gene_set_library_helper.writer() as gene__gene_set_library:
    with gene_set_helper.writer() as gene_set:
      with gene_set_library_helper.writer() as gene_set_library:
        with gene_helper.writer() as gene:
          with entity_helper.writer() as entity:
            genes = {}
            with node_helper.writer() as node:
              for _, gmt in tqdm(gmts.iterrows(), total=gmts.shape[0], desc='Processing GMTs...'):
                gene_set_ids = set()
                gmt_path = gmts_path/gmt['dcc_short_label']/gmt['filename']
                gmt_path.parent.mkdir(parents=True, exist_ok=True)
                if not gmt_path.exists():
                  import urllib.request
                  urllib.request.urlretrieve(gmt['link'].replace(' ', '%20'), gmt_path)
                #
                gene_set_library_id = str(uuid5(uuid0, gmt['link']))
                library_genes = set()
                if gmt_path.suffix == '.gmt':
                  gene_set_library_node = dict(
                    dcc_id=gmt['dcc_id'],
                    id=gene_set_library_id,
                    type="gene_set_library",
                    entity_type=None,
                    label=gmt_path.stem.replace('_', ' '),
                    description=f"A gene set library provided by {gmt['dcc_short_label']}",
                    pagerank=1,
                  )
                  gene_set_library.writerow(dict(
                    id=gene_set_library_id,
                    dcc_asset_link=gmt['link'],
                  ))
                else:
                  raise NotImplementedError(gmt_path.suffix)

                with gmt_path.open('r') as fr:
                  for line in tqdm(fr, desc=f"Processing {gmt['dcc_short_label']}/{gmt['filename']}..."):
                    line_split = list(map(str.strip, line.split('\t')))
                    if len(line_split) < 3: continue
                    gene_set_label, gene_set_description, *gene_set_genes = line_split
                    gene_set_id = str(uuid5(uuid0, '\t'.join((gene_set_library_id, gene_set_label, gene_set_description,))))
                    assert gene_set_id not in gene_set_ids, f"Duplicate {gene_set_label} in {gmt_path}"
                    gene_set_ids.add(gene_set_id)
                    gene_set_genes = {gene_id for raw_gene in gene_set_genes if raw_gene for gene_id in gene_lookup.get(raw_gene, [])}
                    gene_set_node = dict(
                      dcc_id=gmt['dcc_id'],
                      id=gene_set_id,
                      type='gene_set',
                      entity_type=None,
                      label=gene_set_label.replace('_', ' '),
                      description=gene_set_description or f"A gene set from {gmt_path.stem.replace('_',' ')} provided by {gmt['dcc_short_label']}",
                      pagerank=1,
                    )
                    gene_set.writerow(dict(
                      id=gene_set_id,
                      gene_set_library_id=gene_set_library_id,
                    ))
                    #
                    for gene_set_gene in gene_set_genes:
                      gene_id = str(uuid5(uuid0, gene_set_gene))
                      if gene_id not in genes:
                        label = gene_labels[gene_set_gene]
                        description = gene_descriptions[gene_set_gene]
                        #
                        genes[gene_id] = gene_node = dict(
                          id=gene_id,
                          type='entity',
                          entity_type='gene',
                          label=label,
                          description=description,
                          pagerank=1,
                        )
                        gene.writerow(dict(
                          id=gene_id,
                          entrez=gene_entrez[gene_set_gene],
                          ensembl=gene_set_gene,
                        ))
                        entity.writerow(dict(
                          id=gene_id,
                          type='gene',
                        ))
                      else:
                        genes[gene_id]['pagerank'] += 1
                      #
                      if gene_id not in library_genes:
                        gene__gene_set_library.writerow(dict(
                          A=gene_id,
                          B=gene_set_library_id,
                        ))
                        library_genes.add(gene_id)
                        gene_set_library_node['pagerank'] += 1
                      gene__gene_set.writerow(dict(
                        A=gene_id,
                        B=gene_set_id,
                      ))
                      gene_set_node['pagerank'] += 1
                    #
                    node.writerow(gene_set_node)
                node.writerow(gene_set_library_node)
              node.writerows(genes.values())
