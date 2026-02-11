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

def extract_all_entity_ids():
  base_query = {
    'index': 'entity_staging',
    '_source': {
      'includes': ['id'],
    },
    'sort': [{'pagerank': 'desc'}, {'id': 'desc'}]
  }
  # with tqdm(total=res['hits']['total']) as pbar:
  after_key = None
  while True:
    req = dict(**base_query, size=128)
    if after_key: req['search_after'] = after_key
    res = es.search(**req)
    for hit in res['hits']['hits']:
      if 'id' not in hit['_source']: continue
      yield hit['_source']['id']
      pbar.update(1)
    after_key = res['hits']['hits'][-1]['sort'] if res['hits']['hits'] else None
    if after_key is None: break

def extract_unexpanded_entity_ids():
  ''' filter entity ids by those already in entity_expanded
  '''
  for ids in chunk(extract_all_entity_ids(), 128):
    res = es.search(**{
      'index': 'entity_expanded',
      '_source': {
        'includes': 'id',
      },
      'query': {
        'ids': {
          'values': list(ids),
        }
      },
      'size': len(ids),
    })
    yield from (set(ids) - {hit['_source']['id'] for hit in res['hits']['hits']})

def extract_entities_by_ids(all_ids):
  for ids in chunk(all_ids, 128):
    res = es.search(**{
      'index': 'entity_staging',
      'query': {
        'ids': {
          'values': list(ids),
        }
      },
      'size': len(ids),
      'sort': [{'id': 'asc'}]
    })
    for hit in res['hits']['hits']:
      yield hit['_source']

def extract_m2m_values(source_id):
  base_query = {
    'index': 'm2m_staging',
    'query': { 'bool': {
      'filter': [
        { 'term': { 'source_id': source_id } },
        { 'regexp': { 'predicate': '(m2m|m2o)_.*' } },
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
    req = dict(**base_query, size=128)
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

def expand_entity_index(es_bulk, entity_ids):
  for entity_id in entity_ids:
    links = { predicate: source_ids for predicate, source_ids in extract_m2m_values(entity_id)}
    entities = {
      hit['id']: hit
      for hit in extract_entities_by_ids(set.union({entity_id}, *map(set, links.values())))
      if 'id' in hit # hack but should be fixed
    }
    entity = entities[entity_id]
    for predicate, source_ids in links.items():
      if predicate.startswith('m2o_'):
        source_id, = source_ids
        if source_id in entities:
          entity[predicate] = entities[source_id]
        else:
          if predicate != 'm2o_project': # TODO: figure out what's going wrong here
            print(f"WARN: {predicate=} {source_id=} is missing from {entity_id=}")
      elif predicate.startswith('m2m_'):
        entity[predicate] = yaml.safe_dump_all(
          entities[source_id]
          for source_id in source_ids
          if source_id in entities # hack but should be fixed
        )
      else:
        raise NotImplementedError(predicate)
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
      for entity_id_chunk in chunk(extract_unexpanded_entity_ids(), 128):
        # trigger a job with that chunk to extract the entity relationships
        futures.add(pool.submit(expand_entity_index, es_bulk, entity_id_chunk))
        if len(futures) >= jobs:
          done, futures = concurrent.futures.wait(futures, return_when=concurrent.futures.FIRST_COMPLETED)
          for item in done:
            item.result()
          pbar.update(len(done))
