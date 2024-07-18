#%%
import pandas as pd

#%%

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
unique_ensembl = df_entrez['Ensembl'].dropna().explode().unique()
ensembl_ensembl_lookup = { ensembl: {ensembl} for ensembl in unique_ensembl }
symbol_ensembl_lookup = df_entrez[['Symbol', 'Ensembl']].explode('Ensembl').dropna(how='any').groupby('Symbol')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
synonym_ensembl_lookup = df_entrez[['Synonyms', 'Ensembl']].explode('Ensembl').explode('Synonyms').dropna(how='any').groupby('Synonyms')['Ensembl'].agg(lambda genes: set(genes)).to_dict()
for k in list(synonym_ensembl_lookup.keys() & symbol_ensembl_lookup.keys()):
  synonym_ensembl_lookup.pop(k)

gene_lookup = {}
gene_lookup.update(symbol_ensembl_lookup)
gene_lookup.update(synonym_ensembl_lookup)
gene_lookup.update(ensembl_ensembl_lookup)

gene_labels = df_entrez[['Ensembl', 'Symbol']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['Symbol'].first().to_dict()
gene_descriptions = df_entrez[['Ensembl', 'description']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['description'].first().to_dict()
gene_entrez = df_entrez[['Ensembl', 'GeneID']].explode('Ensembl').dropna(how='any').groupby('Ensembl')['GeneID'].first().to_dict()
