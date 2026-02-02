from tqdm.auto import tqdm
from ingest_common import es_connect, es_helper

es = es_connect()

with es_helper() as es_bulk:
  res = es.search(**{'index': 'm2m_staging', 'size': 0, 'aggs': { 'target_id_count': { 'cardinality': { 'field': 'target_id' } } } })
  with tqdm(total=res['aggregations']['target_id_count']['value']) as pbar:
    after_key = None
    while True:
      req = {
        'index': 'm2m_staging',
        'size':0,
        'aggs': {
          'pagerank': {
            'composite': {
              'size': 10000,
              'sources': [
                { 'target_id': { 'terms': { 'field': 'target_id' } } }
              ]
            }
          }
        }
      }
      if after_key: req['aggs']['pagerank']['composite']['after'] = after_key
      res = es.search(**req)
      after_key = res['aggregations']['pagerank'].get('after_key')
      if after_key is None: break
      for bucket in res['aggregations']['pagerank']['buckets']:
        es_bulk.put(dict(
          _op_type='update',
          _index='entity_staging',
          _id=bucket['key']['target_id'],
          doc={'pagerank': bucket['doc_count']},
          doc_as_upsert=True,
        ))
        pbar.update(1)
