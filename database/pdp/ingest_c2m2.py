#%%
import pathlib
__dir__ = pathlib.Path(__file__).parent
import sys
sys.path.insert(0, str(__dir__.parent))

#%%
import json
import zipfile
import traceback
from datetime import datetime
from tqdm.auto import tqdm
from datapackage import Package

from ingest_pdp import NodeHelper, RelationHelper
from ingest_common import ingest_path, current_dcc_assets, uuid0, uuid5
from ingest_entity_common import gene_labels, gene_entrez, gene_lookup, gene_descriptions

def ensure_list(L):
  if type(L) == list: return L
  else: return [L]

class ExEncoder(json.JSONEncoder):
  def default(self, o):
    import decimal
    if isinstance(o, decimal.Decimal):
      return str(o)
    elif isinstance(o, datetime):
      return o.isoformat()
    return super(ExEncoder, self).default(o)

def validate(pkg: Package):
  try:
    pkg.validate()
    for resource in package.resources:
      for record in resource.read(keyed=True):
        json.dumps(record, cls=ExEncoder)
  except:
    import traceback; traceback.print_exc()
    print(pkg.errors)
    return False
  return True

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

c2m2s = dcc_assets[dcc_assets['filetype'] == 'C2M2']
c2m2s_path = ingest_path / 'c2m2s'

map_type = {
  'gene': 'gene',
  'disease': 'disease',
  'compound': 'compound',
  'anatomy': 'anatomy',
  'substance': 'substance',
  'ncbi_taxonomy': 'ncbi_taxonomy',
  'file_format': 'file_format',
}

relation_helper = RelationHelper()
node_helper = NodeHelper()

for _, c2m2 in tqdm(c2m2s.iterrows(), total=c2m2s.shape[0], desc='Processing C2M2 Files...'):
  with relation_helper.writer() as relation:
    dccs = {}
    genes = {}
    entities = {}
    dcc_assets_ = {}
    with node_helper.writer() as node:
      def ensure_entity(entity_type, entity_attributes):
        if entity_type == 'gene':
          for gene_ensembl in gene_lookup.get(entity_attributes['label'], []):
            gene_id = str(uuid5(uuid0, f"entity:gene:{gene_ensembl}"))
            def ensure():
              if gene_id not in genes:
                genes[gene_id] = dict(
                  id=gene_id,
                  type='gene',
                  attributes=json.dumps(dict(
                    label=gene_labels[gene_ensembl],
                    description=gene_descriptions[gene_ensembl],
                    entrez=gene_entrez[gene_ensembl],
                    ensembl=gene_ensembl,
                  )),
                  pagerank=0,
                )
              else:
                genes[gene_id]['pagerank'] += 1
              return gene_id, 'gene'
            yield ensure
        elif entity_type:
          entity_type = map_type.get(entity_type, entity_type)
          entity_id = str(uuid5(uuid0, ':'.join(['entity', entity_type, entity_attributes['label']])))
          def ensure():
            if entity_id not in entities:
              entities[entity_id] = dict(
                id=entity_id,
                type=f"{entity_type}",
                attributes=json.dumps(dict(
                  entity_attributes,
                  description=f"A {entity_type.lower()} in the c2m2",
                )),
                pagerank=0,
              )
            else:
              entities[entity_id]['pagerank'] += 1
            return entity_id, entity_type
          yield ensure
      #
      dcc_id = str(uuid5(uuid0, f"dcc:{c2m2['dcc_short_label']}"))
      if dcc_id not in dccs:
        dccs[dcc_id] = dict(
          type='dcc',
          id=dcc_id,
          attributes=json.dumps(dict(label=c2m2['dcc_short_label'])),
          pagerank=1,
        )
      else:
        dccs[dcc_id]['pagerank'] += 1
      c2m2_path = c2m2s_path/c2m2['dcc_short_label']/c2m2['filename']
      c2m2_path.parent.mkdir(parents=True, exist_ok=True)
      print("c2m2['link'] object:"); print(c2m2['link']); ##

      if not c2m2_path.exists():
        import urllib.request
        urllib.request.urlretrieve(c2m2['link'].replace(' ', '%20'), c2m2_path); # quote to handle space etc in the URL
      c2m2_extract_path = c2m2_path.parent / c2m2_path.stem
      if not c2m2_extract_path.exists():
        with zipfile.ZipFile(c2m2_path, 'r') as c2m2_zip:
          c2m2_zip.extractall(c2m2_extract_path)

      dcc_asset_id = str(uuid5(uuid0, f"dcc_asset:{c2m2['link']}"))
      if dcc_asset_id not in dcc_assets_:
        dcc_assets_[dcc_asset_id] = dict(
          type='dcc_asset',
          id=dcc_asset_id,
          attributes=json.dumps(dict(
            label=f"{c2m2['dcc_short_label']}_{c2m2['filename']}",
            description=f"A {c2m2['filetype']} processed data file from {c2m2['dcc_short_label']}",
          )),
          pagerank=1,
        )
        relation.writerow(dict(
          source_id=dcc_asset_id,
          predicate='dcc',
          target_id=dcc_id,
        ))
      else:
        dcc_assets_[dcc_asset_id]['pagerank'] += 1
      try:
        package = Package(str(next(iter(p for p in c2m2_extract_path.rglob('*datapackage.json') if not p.name.startswith('.')))))
        assert validate(package)
      except KeyboardInterrupt: raise
      except:
        traceback.print_exc()
        print(c2m2_path, 'is invalid')
        continue
      for resource in package.resources:
        pk = ensure_list(resource.descriptor['schema']['primaryKey'])
        fks = {field for fk in resource.descriptor['schema'].get('foreignKeys', []) for field in ensure_list(fk['fields'])}
        for record_with_relations in tqdm(resource.read(keyed=True, relations=True), desc=f"Processing {c2m2['dcc_short_label']}/{resource.descriptor['name']}..."):
          record = dict(**record_with_relations)
          for fk in resource.descriptor['schema'].get('foreignKeys', []):
            for fk_field, target_field in zip(ensure_list(fk['fields']), ensure_list(fk['reference']['fields'])):
              if record_with_relations[fk_field] is not None:
                record[fk_field] = record_with_relations[fk_field][target_field]
          if resource.name in map_type:
            if 'label' not in record:
              record['label'] = record['name']
              del record['name']
            for ensure_gene_entity in ensure_entity(resource.name, record):
              source_id, source_type = ensure_gene_entity()
          else:
            source_id = str(uuid5(uuid0, ':'.join(['c2m2', resource.descriptor['name']]+[record[k] for k in pk])))
            source_type = f"c2m2_{resource.name}"
            node.writerow(dict(
              type=source_type,
              id=source_id,
              attributes=json.dumps({
                k: v
                for k,v in record.items()
                if k not in pk and k not in fks
              }, cls=ExEncoder),
              pagerank=1,
            ))
            relation.writerow(dict(
              source_id=source_id,
              predicate='is_from_dcc_asset',
              target_id=dcc_asset_id,
            ))
            dcc_assets_[dcc_asset_id]['pagerank'] += 1
          
          for fk in resource.descriptor['schema'].get('foreignKeys', []):
            if any(record[k] is None for k in ensure_list(fk['fields'])): continue
            target_record = record_with_relations[ensure_list(fk['fields'])[0]]
            if fk['reference']['resource'] in map_type:
              if 'label' not in target_record:
                target_record['label'] = target_record['name']
                del target_record['name']
              for ensure_target_entity in ensure_entity(fk['reference']['resource'], target_record):
                target_id, target_type = ensure_target_entity()
            else:
              target_type = f"c2m2_{fk['reference']['resource']}"
              target_id = str(uuid5(uuid0, ':'.join(['c2m2', fk['reference']['resource']]+[target_record[k] for k in ensure_list(fk['reference']['fields'])])))
            #
            try:
              relation.writerow(dict(
                source_id=source_id,
                predicate=f"c2m2__{source_type}__{target_type}",
                target_id=target_id,
              ))
            except AssertionError:
              print('duplicated', f"c2m2__{source_type}__{target_type}", source_id, target_id)
              pass

      node.writerows(genes.values())
      node.writerows(entities.values())
      node.writerows(dccs.values())
      node.writerows(dcc_assets_.values())

# %%
