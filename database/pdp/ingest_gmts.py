#%%
import pathlib
__dir__ = pathlib.Path(__file__).parent
import sys
sys.path.insert(0, str(__dir__.parent))

#%%
import json
from tqdm.auto import tqdm

from ingest_pdp import NodeHelper, RelationHelper
from ingest_common import ingest_path, current_dcc_assets, uuid0, uuid5
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest GMTs

gmts = dcc_assets[((dcc_assets['filetype'] == 'XMT') & (dcc_assets['filename'].str.endswith('.gmt')))]
gmts_path = ingest_path / 'gmts'

relation_helper = RelationHelper()
node_helper = NodeHelper()

for _, gmt in tqdm(gmts.iterrows(), total=gmts.shape[0], desc='Processing GMTs...'):
  with relation_helper.writer() as relation:
    dccs = {}
    genes = {}
    with node_helper.writer() as node:
      gmt_path = gmts_path/gmt['dcc_short_label']/gmt['filename']
      gmt_path.parent.mkdir(parents=True, exist_ok=True)
      if not gmt_path.exists():
        import urllib.request
        urllib.request.urlretrieve(gmt['link'].replace(' ', '%20'), gmt_path)
      #
      dcc_id = str(uuid5(uuid0, f"dcc:{gmt['dcc_short_label']}"))
      if dcc_id not in dccs:
        dccs[dcc_id] = dict(
          type='dcc',
          id=dcc_id,
          attributes=json.dumps(dict(label=gmt['dcc_short_label'])),
          pagerank=1,
        )
      else:
        dccs[dcc_id]['pagerank'] += 1
      dcc_asset_id = str(uuid5(uuid0, f"dcc_asset:{gmt['link']}"))
      node.writerow(dict(
        type='dcc_asset',
        id=dcc_asset_id,
        attributes=json.dumps(dict(label=gmt['filename'])),
      ))
      relation.writerow(dict(
        source_id=dcc_asset_id,
        predicate='dcc',
        target_id=dcc_id,
      ))
      library_genes = set()
      if gmt_path.suffix == '.gmt':
        gene_set_library_id = str(uuid5(uuid0, f"gene_set_library:{gmt['link']}"))
        gene_set_library_node = dict(
          type='gene_set_library',
          id=gene_set_library_id,
          attributes=json.dumps(dict(
            label=gmt_path.stem.replace('_', ' '),
            description=f"A gene set library provided by {gmt['dcc_short_label']}",
          )),
          pagerank=1,
        )
        relation.writerow(dict(
          source_id=gene_set_library_id,
          predicate='is_from_dcc_asset',
          target_id=dcc_asset_id,
        ))
        relation.writerow(dict(
          source_id=gene_set_library_id,
          predicate='dcc',
          target_id=dcc_id,
        ))
      else:
        raise NotImplementedError(gmt_path.suffix)

      with gmt_path.open('r') as fr:
        for line in tqdm(fr, desc=f"Processing {gmt['dcc_short_label']}/{gmt['filename']}..."):
          line_split = list(map(str.strip, line.split('\t')))
          if len(line_split) < 3: continue
          gene_set_label, gene_set_description, *gene_set_genes = line_split
          gene_set_id = str(uuid5(uuid0, f"gene_set:{gene_set_library_id}:{gene_set_label}:{gene_set_description}"))
          gene_set_genes = {gene_id for raw_gene in gene_set_genes if raw_gene for gene_id in gene_lookup.get(raw_gene, [])}
          gene_set_node = dict(
            type='gene_set',
            id=gene_set_id,
            attributes=json.dumps(dict(
              label=gene_set_label,
              description=gene_set_description or f"A gene set from {gmt_path.stem.replace('_',' ')} provided by {gmt['dcc_short_label']}",
            )),
            pagerank=1,
          )
          relation.writerow(dict(
            source_id=gene_set_id,
            predicate='is_in_gene_set_library',
            target_id=gene_set_library_id,
          ))
          relation.writerow(dict(
            source_id=gene_set_id,
            predicate='dcc',
            target_id=dcc_id,
          ))
          #
          for gene_set_gene in gene_set_genes:
            for gene_ensembl in gene_lookup.get(gene_set_gene, []):
              gene_id = str(uuid5(uuid0, f"gene:{gene_ensembl}"))
              if gene_id not in genes:
                label = gene_labels[gene_set_gene]
                description = gene_descriptions[gene_set_gene]
                #
                genes[gene_id] = gene_node = dict(
                  type='gene',
                  id=gene_id,
                  attributes=json.dumps(dict(
                    label=label,
                    description=description,
                    entrez=gene_entrez[gene_set_gene],
                    ensembl=gene_set_gene,
                  )),
                  pagerank=1,
                )
              else:
                genes[gene_id]['pagerank'] += 1
              #
              if gene_id not in library_genes:
                relation.writerow(dict(
                  source_id=gene_id,
                  predicate='is_in_gene_set_library',
                  target_id=gene_set_library_id,
                ))
                library_genes.add(gene_id)
                gene_set_library_node['pagerank'] += 1
              relation.writerow(dict(
                source_id=gene_id,
                predicate='is_in_gene_set',
                target_id=gene_set_id,
              ))
              gene_set_node['pagerank'] += 1
          #
          node.writerow(gene_set_node)
      node.writerow(gene_set_library_node)

      node.writerows(genes.values())
      node.writerows(dccs.values())
