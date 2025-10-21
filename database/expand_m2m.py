import elasticsearch
import functools
import itertools
from collections import deque
from elasticsearch.dsl import Search
from ingest_common import es_connect

from tqdm.auto import tqdm

es = es_connect()

@functools.lru_cache(maxsize=1)
def entity_lookup(id):
  res = es.get(index='entity', id=id)
  return res.body['_source']

def generate_m2m_target_expanded():
  total_target_ids = es.search(index='m2m', size=0, aggs=dict(targets=dict(cardinality=dict(field='target_id.keyword')))).body['aggregations']['targets']['value']
  for target_id, hits in tqdm(itertools.groupby(Search(using=es, index='m2m').sort('target_id.keyword').iterate(), key=lambda hit: hit['target_id']), desc='Assembling m2m_targer_expanded...', total=total_target_ids):
    # get the target node entity
    res = es.get(index='entity', id=target_id)
    target = res.body['_source']
    hits = list(hits)
    # pagerank is just the number of links to this node
    pagerank = len(hits)
    # r_{} will be added to the entity iff only one link exists
    rel = {
      f"r_inv_{predicate}" if predicate.startswith('^') else f"r_{predicate}": first_source
      for predicate, predicate_hits in itertools.groupby(hits, key=lambda hit: hit['predicate'])
      for first_source, *other_sources in ({hit['source_id'] for hit in predicate_hits},)
      if not other_sources
    }
    # update the entity locally and in the db
    target.update(pagerank=pagerank, **rel)
    yield dict(
      _op_type='update',
      _index='entity',
      _id=target_id,
      doc=dict(pagerank=pagerank, **rel),
    )
    # add target_ to all keys and add it to the m2m object
    target = {f"target_{k}": v for k, v in target.items()}
    for hit in hits:
      yield dict(
        _index='m2m_target_expanded',
        _id=hit.meta['id'],
        _source={
          **hit,
          **target,
        }
      )

es.indices.refresh(index='entity')
es.indices.refresh(index='m2m')
deque(elasticsearch.helpers.parallel_bulk(es, generate_m2m_target_expanded(), chunk_size=100, timeout='30s'), maxlen=0)
es.indices.refresh(index='m2m_target_expanded')
