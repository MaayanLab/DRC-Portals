#%%
from tqdm.auto import tqdm

from ingest_common import ingest_path, current_dcc_assets, pdp_helper
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest GMTs

gmts = dcc_assets[((dcc_assets['filetype'] == 'XMT') & (dcc_assets['filename'].str.endswith('.gmt')))]
gmts_path = ingest_path / 'gmts'

for _, gmt in tqdm(gmts.iterrows(), total=gmts.shape[0], desc='Processing GMTs...'):
  if 'l1000_cp' in gmt['filename']: continue
  with pdp_helper() as helper:
    gmt_path = gmts_path/gmt['dcc_short_label']/gmt['filename']
    gmt_path.parent.mkdir(parents=True, exist_ok=True)
    if not gmt_path.exists():
      import urllib.request
      urllib.request.urlretrieve(gmt['link'].replace(' ', '%20'), gmt_path)
    #
    dcc_id = helper.upsert_entity('dcc', dict(
      short_label=gmt['dcc_short_label']
    ), slug=gmt['dcc_short_label'])
    dcc_asset_id = helper.upsert_entity('dcc_asset', dict(
      link=gmt['link'],
      filename=gmt['filename'],
      filetype=gmt['filetype'],
    ))
    helper.upsert_edge(dcc_asset_id, 'dcc', dcc_id)
    if gmt_path.suffix == '.gmt':
      xmt_library_type = 'gene_set_library'
      xmt_set_type = 'gene_set'
      xmt_type = 'gene'
    elif gmt_path.suffix == '.dmt':
      xmt_library_type = 'drug_set_library'
      xmt_set_type = 'drug_set'
      xmt_type = 'drug'
    else:
      raise NotImplementedError(gmt_path.suffix)

    library_id = helper.upsert_entity(xmt_library_type, dict(
      filename=gmt['filename'],
    ))
    helper.upsert_edge(library_id, 'dcc_asset', dcc_asset_id)
    helper.upsert_edge(library_id, 'dcc', dcc_id)

    with gmt_path.open('r') as fr:
      for line in tqdm(fr, desc=f"Processing {gmt['dcc_short_label']}/{gmt['filename']}..."):
        line_split = list(map(str.strip, line.split('\t')))
        if len(line_split) < 3: continue
        set_label, set_description, *set_entities = line_split
        set_id = helper.upsert_entity(xmt_set_type, dict(
          label=set_label,
          description=set_description,
        ))
        helper.upsert_edge(set_id, xmt_library_type, library_id)
        helper.upsert_edge(set_id, 'dcc_asset', dcc_asset_id)
        helper.upsert_edge(set_id, 'dcc', dcc_id)
        if xmt_type == 'gene':
          set_entities = {gene_id for raw_gene in set_entities if raw_gene for gene_id in gene_lookup.get(raw_gene, [])}
          for gene in set_entities:
            entity_id = helper.upsert_entity(xmt_type, dict(
              label=gene_labels[gene],
              description=gene_descriptions[gene],
              ensembl=gene,
              entrez=gene_entrez[gene],
            ), slug=gene)
            helper.upsert_edge(entity_id, xmt_set_type, set_id)
        else:
          for entity in set_entities:
            entity_id = helper.upsert_entity(xmt_type, dict(
              label=entity,
            ))
            helper.upsert_edge(entity_id, xmt_set_type, set_id)
