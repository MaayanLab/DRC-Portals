import os
import elasticsearch
from dotenv import load_dotenv
load_dotenv('../drc-portals/.env')
load_dotenv()

es = elasticsearch.Elasticsearch(os.getenv('ELASTICSEARCH_URL'))
try:
  es.indices.create(index='entity')
  es.indices.put_settings(index='entity', body={'index': {'refresh_interval': '-1'}})
except elasticsearch.BadRequestError: pass
try:
  es.indices.create(index='m2m')
  es.indices.put_settings(index='m2m', body={'index': {'refresh_interval': '-1'}})
except elasticsearch.BadRequestError: pass
try:
  es.indices.create(index='m2m_source_expanded')
  es.indices.put_settings(index='m2m_source_expanded', body={'index': {'refresh_interval': '-1'}})
except elasticsearch.BadRequestError: pass
try:
  es.indices.create(index='m2m_target_expanded')
  es.indices.put_settings(index='m2m_target_expanded', body={'index': {'refresh_interval': '-1'}})
except elasticsearch.BadRequestError: pass
