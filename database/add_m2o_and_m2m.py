import yaml
import concurrent.futures
from tqdm.auto import tqdm
from ingest_common import es_connect, es_helper

es = es_connect()

def count_all_entities():
  res = es.count(**{
    'index': 'entity_staging',
  })
  return res['count']

def extract_all_entities():
  base_query = {
    'index': 'entity_staging',
    'sort': [{'id': 'asc'}]
  }
  # with tqdm(total=res['hits']['total']) as pbar:
  after_key = None
  while True:
    req = dict(**base_query, size=100)
    if after_key: req['search_after'] = after_key
    res = es.search(**req)
    for hit in res['hits']['hits']:
      yield hit['_source']
      pbar.update(1)
    after_key = res['hits']['hits'][-1]['sort'] if res['hits']['hits'] else None
    if after_key is None: break

def extract_entities_by_ids(ids):
  base_query = {
    'index': 'entity_staging',
    'query': {
      'ids': {
        'values': list(ids),
      }
    },
    'sort': [{'id': 'asc'}]
  }
  res = es.search(**dict(base_query, size=1, rest_total_hits_as_int=True))
  # with tqdm(total=res['hits']['total']) as pbar:
  after_key = None
  while True:
    req = dict(**base_query, size=100)
    if after_key: req['search_after'] = after_key
    res = es.search(**req)
    for hit in res['hits']['hits']:
      yield hit['_source']
      # pbar.update(1)
    after_key = res['hits']['hits'][-1]['sort'] if res['hits']['hits'] else None
    if after_key is None: break

def extract_m2m_values(source_id):
  base_query = {
    'index': 'm2m_staging',
    'query': { 'bool': {
      'filter': [
        { 'term': { 'source_id': source_id } },
        { 'regexp': { 'predicate': 'm2m_.*' } },
      ],
    } },
    'sort': [{'predicate': 'asc'}, {'target_id': 'asc'}]
  }
  res = es.search(**dict(base_query, size=1, rest_total_hits_as_int=True))
  if not res['hits']['hits']: return
  predicate = res['hits']['hits'][0]['_source']['predicate']
  targets = set()
  # with tqdm(total=res['hits']['total']) as pbar:
  after_key = None
  while True:
    req = dict(**base_query, size=100)
    if after_key: req['search_after'] = after_key
    res = es.search(**req)
    for hit in res['hits']['hits']:
      if hit['_source']['predicate'] != predicate:
        yield predicate, targets
        predicate = hit['_source']['predicate']
        targets = set()
      #
      targets.add(hit['_source']['target_id'])
      # pbar.update(1)
    after_key = res['hits']['hits'][-1]['sort'] if res['hits']['hits'] else None
    if after_key is None: break
  #
  yield predicate, targets

def expand_entity_index(es_bulk, entities):
  for entity in entities:
    m2o = { key: source_id for key, source_id in entity.items() if key.startswith('r_') }
    m2m = { predicate: source_ids for predicate, source_ids in extract_m2m_values(entity['id'])}
    all_link_ids = set.union(set(m2o.values()), *map(set, m2m.values()))
    all_link_entities = { hit['id']: hit for hit in extract_entities_by_ids(all_link_ids) }
    for predicate, source_id in m2o.items():
      if source_id in all_link_entities:
        entity[predicate] = all_link_entities[source_id]
      else:
        del entity[predicate]
    for predicate, source_ids in m2m.items():
      entity[predicate] = yaml.safe_dump_all(all_link_entities[source_id] for source_id in source_ids if source_id in all_link_entities)
    #
    es_bulk.put(dict(
      _op_type='index',
      _index='entity_expanded',
      _id=entity['id'],
      _source=entity,
    ))

def chunk(L, cs):
  buf = []
  for el in L:
    buf.append(el)
    if len(buf) >= cs:
      yield buf
      buf = []
  if buf:
    yield buf

jobs = 16

n = count_all_entities()
with tqdm(total=n) as pbar:
  with es_helper() as es_bulk:
    with concurrent.futures.ThreadPoolExecutor(max_workers=jobs) as pool:
      futures = set()
      # grab a chunk of entities
      for entity_chunk in chunk(extract_all_entities(), 1024):
        # trigger a job with that chunk to extract the entity relationships
        futures.add(pool.submit(expand_entity_index, es_bulk, entity_chunk))
        if len(futures) >= jobs:
          done, futures = concurrent.futures.wait(futures, return_when=concurrent.futures.FIRST_COMPLETED)
          for item in done:
            item.result()
          pbar.update(len(done))
