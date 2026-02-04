from tqdm.auto import tqdm
from ingest_common import es_connect, es_helper

es = es_connect()

def extract_m2m_values():
  base_query = {
    'index': 'm2m_staging',
    'query': { 'bool': {
      'filter': { 'regexp': { 'predicate': 'm2m_.*' } },
      # 'must_not': { 'term': { 'predicate': 'm2m_gene_set' } },
    } },
    'sort': [{'target_id': 'asc'}, {'predicate': 'asc'}]
  }

  res = es.search(**dict(base_query, size=1, rest_total_hits_as_int=True))
  target_id = res['hits']['hits'][0]['_source']['target_id']
  m2m = {}
  with tqdm(total=res['hits']['total']) as pbar:
    after_key = None
    while True:
      req = dict(**base_query, size=10000)
      if after_key: req['search_after'] = after_key
      res = es.search(**req)
      for hit in res['hits']['hits']:
        pbar.update(1)
        if hit['_source']['target_id'] != target_id:
          yield target_id, m2m
          m2m = {}
          target_id = hit['_source']['target_id']
        #
        if hit['_source']['predicate'] not in m2m:
          m2m[hit['_source']['predicate']] = set()
        m2m[hit['_source']['predicate']].add(hit['_source']['source_id'])

      after_key = res['hits']['hits'][-1]['sort'] if res['hits']['hits'] else None
      if after_key is None: break
    #
    yield target_id, m2m

with es_helper() as es_bulk:
  for target_id, m2m in extract_m2m_values():
    all_source_ids = set.union(*m2m.values())
    res = es.search(**{
      'index': 'm2m_staging',
      'query': { 'ids': { 'values': list(all_source_ids) } },
      'size': len(all_source_ids),
    })
    lookup = { hit['_id']: hit['_source'] for hit in res['hits']['hits'] }
    doc = {}
    for predicate, source_ids in m2m.items():
      doc[predicate] = [{
        'id': source['id'],
        'slug': source['slug'],
        'type': source['type'],
        'a': '\n'.join({ f"{k}: {v}" for k, v in source.items() if k.startswith('a_') }),
      } for source_id in source_ids for source in (lookup[source_id],)]
    es_bulk.put(dict(
      _op_type='update',
      _index='entity_expanded',
      _id=target_id,
      doc=doc,
      doc_as_upsert=True,
    ))
