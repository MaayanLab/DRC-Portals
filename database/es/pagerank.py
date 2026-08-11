from tqdm.auto import tqdm
import os, sys; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ingest_common import es_connect, es_helper

def main(version="staging"):
  es = es_connect()
  with es_helper() as es_bulk:
    res = es.search(**{'index': f'm2m_{version}', 'size': 0, 'aggs': { 'target_id_count': { 'cardinality': { 'field': 'target_id' } } } })
    with tqdm(total=res['aggregations']['target_id_count']['value']) as pbar:
      after_key = None
      while True:
        req = {
          'index': f'm2m_{version}',
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
        for bucket in res['aggregations']['pagerank'].get('buckets', []):
          es_bulk.put(dict(
            _op_type='update',
            _index=f'entity_{version}',
            _id=bucket['key']['target_id'],
            doc={'pagerank': bucket['doc_count']},
            doc_as_upsert=True,
          ))
          pbar.update(1)
        if after_key is None: break

if __name__ == '__main__':
  import os
  main(version=os.getenv('INDEX_VERSION', 'staging'))
