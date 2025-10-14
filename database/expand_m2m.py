import os
import elasticsearch
import functools
from elasticsearch.dsl import Search

from dotenv import load_dotenv
from tqdm.auto import tqdm
load_dotenv('../drc-portals/.env')
load_dotenv()

print(os.getenv('ELASTICSEARCH_URL'))
es = elasticsearch.Elasticsearch(os.getenv('ELASTICSEARCH_URL'))

@functools.lru_cache(maxsize=1)
def entity_lookup(id):
  res = es.get(index='entity', id=id)
  return res.body['_source']

elasticsearch.helpers.bulk(es, [
  dict(
    _index='m2m_expanded',
    _id=hit.meta['id'],
    _source={
      **hit,
      **{f"target_{k}": v for k, v in entity_lookup(hit['target_id']).items()}
    }
  )
  for hit in tqdm(Search(using=es, index='m2m').sort('target_id'))
], chunk_size=100, timeout='30s')
