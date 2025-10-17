import os
import elasticsearch
from dotenv import load_dotenv
load_dotenv('../drc-portals/.env')
load_dotenv()

es = elasticsearch.Elasticsearch(os.getenv('ELASTICSEARCH_URL'))

es.indices.refresh(index='entity')
es.indices.refresh(index='m2m_target_expanded')
