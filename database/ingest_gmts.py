#%%
import pandas as pd

from ingest_common import TableHelper, ingest_path, dcc_assets, uuid0, uuid5

#%%
# Ingest GMTs

gmts = dcc_assets[((dcc_assets['filetype'] == 'XMT') & (dcc_assets['filename'].str.endswith('.gmt')))]
gmts_path = ingest_path / 'gmts'

# load entrez gene info
df_entrez = pd.read_csv('https://ftp.ncbi.nlm.nih.gov/gene/DATA/GENE_INFO/Mammalia/Homo_sapiens.gene_info.gz', sep='\t')
df_entrez['Synonyms'] = df_entrez['Synonyms'].replace('-', float('nan')).str.split('|').apply(lambda synonyms: synonyms if type(synonyms) == list else [])
df_entrez['Ensembl'] = df_entrez['dbXrefs'].replace('-', float('nan')).str.split('|').apply(lambda xrefs: [xref.partition(':')[-1] for xref in xrefs if xref.startswith('Ensembl:')] if type(xrefs) == list else [])

# synonym to gene ids lookup
# symbol_entrez_lookup = df_entrez[['Symbol', 'GeneID']].groupby('Symbol')['GeneID'].agg(lambda genes: set(genes)).to_dict()
# ensembl_entrez_lookup = df_entrez[['Ensembl', 'GeneID']].explode('Ensembl').groupby('Ensembl')['GeneID'].agg(lambda genes: set(genes)).to_dict()
# synonym_entrez_lookup = df_entrez[['Synonyms', 'GeneID']].explode('Synonyms').groupby('Synonyms')['GeneID'].agg(lambda genes: set(genes)).to_dict()
# for k in list(synonym_entrez_lookup.keys() & symbol_entrez_lookup.keys()):
#   synonym_entrez_lookup.pop(k)
# lookup = { row['Symbol']: {row['GeneID']} for row in df_entrez.iterrows() }
# lookup.update(ensembl_entrez_lookup)
# lookup.update(synonym_entrez_lookup)

# synonym to ensembl gene ids lookup
symbol_ensembl_lookup = df_entrez[['Symbol', 'Ensembl']].explode('Ensembl').dropna(how='any').groupby('Symbol')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
synonym_ensembl_lookup = df_entrez[['Synonyms', 'Ensembl']].explode('Ensembl').explode('Synonyms').dropna(how='any').groupby('Synonyms')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
for k in list(synonym_ensembl_lookup.keys() & symbol_ensembl_lookup.keys()):
  synonym_ensembl_lookup.pop(k)

gene_lookup = {}
gene_lookup.update(symbol_ensembl_lookup)
gene_lookup.update(synonym_ensembl_lookup)

gene_labels = df_entrez[['Ensembl', 'Symbol']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['Symbol'].first().to_dict()
gene_descriptions = df_entrez[['Ensembl', 'description']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['description'].first().to_dict()
gene_entrez = df_entrez[['Ensembl', 'GeneID']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['GeneID'].first().to_dict()

gene__gene_set_helper = TableHelper('_GeneNodeToGeneSetNode', ('A', 'B',), pk_columns=('A', 'B',))
gene__gene_set_library_helper = TableHelper('_GeneNodeToGeneSetLibraryNode', ('A', 'B'), pk_columns=('A', 'B',))
gene_set_helper = TableHelper('gene_set_node', ('id', 'gene_set_library_id',), pk_columns=('id',))
gene_set_library_helper = TableHelper('gene_set_library_node', ('id', 'dcc_asset_link',), pk_columns=('id',))
gene_helper = TableHelper('gene_node', ('id', 'entrez', 'ensembl',), pk_columns=('id',))
node_helper = TableHelper('node', ('id', 'type', 'label', 'description', 'dcc_id',), pk_columns=('id',))

with gene__gene_set_helper.writer() as gene__gene_set:
  with gene__gene_set_library_helper.writer() as gene__gene_set_library:
    with gene_set_helper.writer() as gene_set:
      with gene_set_library_helper.writer() as gene_set_library:
        with gene_helper.writer() as gene:
          genes = set()
          with node_helper.writer() as node:
            for _, gmt in gmts.iterrows():
              gmt_path = gmts_path/gmt['dcc_short_label']/gmt['filename']
              gmt_path.parent.mkdir(parents=True, exist_ok=True)
              if not gmt_path.exists():
                import urllib.request
                urllib.request.urlretrieve(gmt['link'], gmt_path)
              #
              gene_set_library_id = str(uuid5(uuid0, gmt['link']))
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
                  # TODO
                  label=gmt_path.stem.replace('_', ' '),
                  # TODO
                  description='TODO',
                ))
              else:
                raise NotImplementedError(gmt_path.suffix)

              with gmt_path.open('r') as fr:
                for line in fr:
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
                    label=gene_set_label,
                    description=gene_set_description or 'TODO',
                  ))
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
                      node.writerow(dict(
                        id=gene_id,
                        type='gene',
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
