import elasticsearch
from ingest_common import es_connect

es = es_connect()
try:
  es.indices.create(index='entity')
  es.indices.put_settings(index='entity', body={'index': {'refresh_interval': '-1', 'number_of_shards': 4}})
except elasticsearch.BadRequestError: pass
try:
  es.indices.create(index='m2m')
  es.indices.put_settings(index='m2m', body={'index': {'refresh_interval': '-1', 'number_of_shards': 8}})
except elasticsearch.BadRequestError: pass
try:
  es.indices.create(index='m2m_source_expanded')
  es.indices.put_settings(index='m2m_source_expanded', body={'index': {'refresh_interval': '-1', 'number_of_shards': 16}})
except elasticsearch.BadRequestError: pass
try:
  es.indices.create(index='m2m_target_expanded')
  es.indices.put_settings(index='m2m_target_expanded', body={'index': {'refresh_interval': '-1', 'number_of_shards': 16}})
except elasticsearch.BadRequestError: pass
