#!/bin/sh

ELASTICSEARCH_URL=$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)
INDEX_VERSION=v1

es() {
  method=$1; shift
  path=$1; shift
  curl -H'Content-Type: application/json' -X${method} ${ELASTICSEARCH_URL}${path} $@
}

es_put() {
  es $@ -d @-
}

es_open_index() {
  INDEX=$1; shift
  es_put PUT "/${INDEX}/_settings" <<< '{"index":{"refresh_interval":"-1"}}'
}

es_close_index() {
  INDEX=$1; shift
  es_put PUT "/${INDEX}/_settings" <<< '{"index":{"refresh_interval":"1s"}}'
}

# create index for entity
es_put PUT /entity_${INDEX_VERSION} < es/index/entity.json

es_put POST /_aliases << EOF
{ "actions": [{ "remove": { "index": "*", "alias": "entity_staging" } }] }
EOF

es_put POST /_aliases << EOF
{ "actions": [{ "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } }] }
EOF

# create index for m2m
es_put PUT /m2m_${INDEX_VERSION} < es/index/m2m.json

es_put POST /_aliases << EOF
{ "actions": [{ "remove": { "index": "*", "alias": "m2m_staging" } }] }
EOF

es_put POST /_aliases << EOF
{ "actions": [{ "add": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }] }
EOF

# actually ingest data (can happen in parallel)
es_open_index entity_staging
es_open_index m2m_staging

uv run ingest_dcc_assets.py
uv run ingest_gmts.py
uv run ingest_c2m2_files.py
uv run ingest_kg.py

# compute pagerank
uv run pagerank.py

# sanity checks
es_put POST /entity_staging/_search << EOF
{"query":{"match_all":{}}, "size":10,"sort":[{"pagerank":{"order": "desc"}}]}
EOF
es_put POST /m2m_staging/_search << EOF
{"query":{"match_all":{}}, "size":10}
EOF

# provide a way to get entity from id
es_put PUT /_enrich/policy/entity_${INDEX_VERSION}_lookup << EOF
{
  "match": {
    "indices": "entity_${INDEX_VERSION}",
    "match_field": "id",
    "enrich_fields": ["*"]
  }
}
EOF
es POST /_enrich/policy/entity_${INDEX_VERSION}_lookup/_execute

# enrich all r_* fields
es GET "/entity_${INDEX_VERSION}/_field_caps?fields=r_*" | jq -rc '{
  "processors": [
    .fields|keys|.[]|{"enrich":{
      "policy_name": "entity_" + $INDEX_VERSION + "_lookup",
      "field": .,
      "target_field": .,
      "if": "ctx." + . + " != null"
    }}
  ]
}' --arg INDEX_VERSION $INDEX_VERSION | es_put PUT /_ingest/pipeline/entity_${INDEX_VERSION}_expanded

es_put PUT /entity_${INDEX_VERSION}_expanded < es/index/entity_expanded.json

es_put POST "/_reindex?slices=12" << EOF
{
  "source": {
    "index": "entity_${INDEX_VERSION}"
  },
  "dest": {
    "index": "entity_${INDEX_VERSION}_expanded",
    "pipeline": "entity_${INDEX_VERSION}_expanded"
  }
}
EOF

# add enriched r_ fields to m2m_expanded
es_put PUT /_enrich/policy/entity_${INDEX_VERSION}_expanded_lookup << EOF
{
  "match": {
    "indices": "entity_${INDEX_VERSION}_expanded",
    "match_field": "id",
    "enrich_fields": ["*"]
  }
}
EOF
es POST /_enrich/policy/entity_${INDEX_VERSION}_expanded_lookup/_execute

es_put PUT /_ingest/pipeline/m2m_${INDEX_VERSION}_expanded_target_expanded << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_${INDEX_VERSION}_expanded_lookup",
        "field": "target_id",
        "target_field": "target"
      }
    }
  ]
}
EOF

es_put PUT /m2m_${INDEX_VERSION}_expanded_target_expanded < es/index/m2m_expanded_target_expanded.json

es_put POST /_reindex << EOF
{
  "source": {
    "index": "m2m_${INDEX_VERSION}"
  },
  "dest": {
    "index": "m2m_${INDEX_VERSION}_expanded_target_expanded",
    "pipeline": "m2m_${INDEX_VERSION}_expanded_target_expanded"
  }
}
EOF

# no longer staging
es_put POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } },
    { "remove": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }
  ]
}
EOF
# remove existing entity_expanded aliases if they exist
es_put POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "*", "alias": "entity_expanded" } }
  ]
}
EOF
# remove existing m2m_expanded_target_expanded aliases if they exist
es_put POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "*", "alias": "m2m_expanded_target_expanded" } }
  ]
}
EOF

# update this version to production
es_put POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "entity_${INDEX_VERSION}_expanded", "alias": "entity_expanded" } },
    { "add": { "index": "m2m_${INDEX_VERSION}_expanded_target_expanded", "alias": "m2m_expanded_target_expanded" } }
  ]
}
EOF

# get current indexes
# es GET /_cat/indices?v
# es GET /_aliases

# delete old index
# es DELETE /entity_${INDEX_VERSION}
# es DELETE /entity_${INDEX_VERSION}_expanded
# es DELETE /m2m_${INDEX_VERSION}
# es DELETE /m2m_${INDEX_VERSION}_expanded_target_expanded
