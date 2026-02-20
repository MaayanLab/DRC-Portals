#!/bin/sh

ELASTICSEARCH_URL=$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)
INDEX_VERSION=v17

es() {
  method=$1; shift
  path=$1; shift
  curl -H'Content-Type: application/json' -X${method} ${ELASTICSEARCH_URL}${path} $@
}

es_put() {
  es $@ -d @-
}

# create index for entity
es_put PUT /entity_${INDEX_VERSION} < es/index/entity.json
es_put PUT "/entity_${INDEX_VERSION}/_settings" <<< '{"index":{"refresh_interval":"-1"}}'

es_put POST /_aliases << EOF
{ "actions": [{ "remove": { "index": "*", "alias": "entity_staging" } }] }
EOF

es_put POST /_aliases << EOF
{ "actions": [{ "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } }] }
EOF

# create index for m2m
es_put PUT /m2m_${INDEX_VERSION} < es/index/m2m.json
es_put PUT "/m2m_${INDEX_VERSION}/_settings" <<< '{"index":{"refresh_interval":"-1"}}'

es_put POST /_aliases << EOF
{ "actions": [{ "remove": { "index": "*", "alias": "m2m_staging" } }] }
EOF

es_put POST /_aliases << EOF
{ "actions": [{ "add": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }] }
EOF


# actually ingest data (can happen in parallel)
uv run ingest_dcc_assets.py
uv run ingest_gmts.py
uv run ingest_c2m2_files.py
uv run ingest_kg.py

es POST "/entity_staging/_refresh"
es POST "/m2m_staging/_refresh"

# compute pagerank
uv run pagerank.py

es POST "/entity_staging/_refresh"

es_put PUT /entity_${INDEX_VERSION}_expanded < es/index/entity_expanded.json
es_put PUT "/entity_${INDEX_VERSION}_expanded/_settings" <<< '{"index":{"refresh_interval":"-1"}}'

es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity_expanded" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "add": { "index": "entity_${INDEX_VERSION}_expanded", "alias": "entity_expanded" } }]}
EOF

uv run add_m2o_and_m2m.py

es POST "/entity_${INDEX_VERSION}_expanded/_refresh"

es_put POST "/entity_${INDEX_VERSION}_expanded/_search" << EOF
{ "query": { "match_all": {} }, "size": 1 }
EOF

# remove existing entity_expanded aliases if they exist
es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity_expanded" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "add": { "index": "entity_${INDEX_VERSION}_expanded", "alias": "entity_expanded" } }]}
EOF

# get current indexes
# es GET /_cat/indices?v
# es GET /_aliases

# delete old index
# es DELETE /entity_${INDEX_VERSION}
# es DELETE /m2m_${INDEX_VERSION}
# es DELETE /entity_${INDEX_VERSION}_expanded
