#%%
import concurrent.futures
from tqdm.auto import tqdm

import os, sys; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ingest_common import ingest_path, current_dcc_assets, es_helper, pdp_helper, label_ident
from ingest_entity_common import gene_info, ensure_dcc_asset

#%%
def ingest_xmt(es_bulk, file, version="staging"):
  import xmt
  if 'l1000_cp' in file['filename']: return
  file_path = ensure_dcc_asset(ingest_path / 'xmts', file)
  xmt_file = xmt.from_file(file_path)
  if file_path.suffix == '.gmt':
    xmt_file.frontmatter['entity'] = 'hgnc.symbol:'
  elif file_path.suffix == '.dmt':
    xmt_file.frontmatter['entity'] = 'drug'
  elif file_path.suffix != '.xmt':
    raise NotImplementedError(file_path.suffix)
  #
  xmt_set_type, xmt_term_type = {
    'hgnc.symbol:': ('gene_set', 'gene'),
    'ensembl:': ('gene_set', 'gene'),
    'drug': ('drug_set', 'drug'),
  }.get(xmt_file.frontmatter['term'], ('set', 'term'))
  xmt_asset = dict(
    label=file['filename'],
    access_url=file['link'],
    filetype=file['filetype'],
    size=file['size'],
    sha256checksum=file['sha256checksum'],
    lastmodified=file['lastmodified'],
    created=file['created'],
    metadata=xmt_file.frontmatter,
  )
  if xmt_file.frontmatter.get('label'):
    xmt_asset['description'] = xmt_file.frontmatter['label'].format(
      term=xmt_file.frontmatter.get('term'),
      entity=xmt_file.frontmatter.get('entity'),
    )
  #
  with pdp_helper(es_bulk, version=version) as helper:
    dcc_id = helper.upsert_entity('dcc', dict(
      label=file['short_label'],
      icon=file['icon'],
      description=file['description'],
      homepage=file['homepage'],
    ), slug=file['short_label'])
    dcc_asset_id = helper.upsert_entity('dcc_asset', xmt_asset, pk=file['link'])
    helper.upsert_m2o(dcc_asset_id, 'dcc', dcc_id)
    #
    for set_label, set_description, set_entities in tqdm(xmt_file, desc=f"Processing {file['short_label']}/{file['filename']}..."):
      set_id = helper.upsert_entity(xmt_set_type, dict(
        label=set_label,
        description=set_description,
      ), pk=f"{dcc_asset_id}:{set_label}")
      helper.upsert_m2o(set_id, 'dcc_asset', dcc_asset_id)
      helper.upsert_m2o(set_id, 'dcc', dcc_id)
      if xmt_file.frontmatter['entity'] in {'hgnc.symbol:', 'ensembl:'}:
        gene_lookup, gene_labels, gene_descriptions, gene_entrez = gene_info()
        set_entities = {gene_id for raw_gene in set_entities if raw_gene for gene_id in gene_lookup.get(raw_gene, [])}
        for gene in set_entities:
          entity_id = helper.upsert_entity('gene', dict(
            label=gene_labels[gene],
            description=gene_descriptions[gene],
            ensembl=gene,
            entrez=gene_entrez[gene],
          ), slug=gene)
          helper.upsert_m2m(entity_id, 'gene_set', set_id)
      else:
        for entity in set_entities:
          entity_id = helper.upsert_entity(xmt_term_type, dict(
            label=entity,
          ), pk=label_ident(entity))
          helper.upsert_m2m(entity_id, xmt_set_type, set_id)

def main(version="staging"):
  dcc_assets = current_dcc_assets()
  files = dcc_assets[dcc_assets['filetype'] == 'XMT']
  with es_helper() as es_bulk:
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
      for fut in tqdm(concurrent.futures.as_completed((
        pool.submit(ingest_xmt, es_bulk, xmt, version=version)
        for _, xmt in files.iterrows()
      )), total=files.shape[0], desc='Processing XMTs...'):
        fut.result()

if __name__ == '__main__':
  import os
  main(version=os.getenv('INDEX_VERSION', 'staging'))
