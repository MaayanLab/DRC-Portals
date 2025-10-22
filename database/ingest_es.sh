#!/bin/sh

ELASTICSEARCH_URL=$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)
INDEX_VERSION=v1

es() {
  method=$1
  path=$2
  curl -H'Content-Type: application/json' -X${method} ${ELASTICSEARCH_URL}${path} -d @-
}

es_transform_execute() {
  transform=$1
  es POST /_transform/${transform}/_start
  while true; do
    STATUS="$(es GET /_transform/${transform}/_stats | jq -r '.transforms[0].state')"
    printf "$STATUS\r"
    if [[ "$STATUS" == "stopped" ]]; then
      break
    fi
    sleep 1
  done
}

# create index for entity
es PUT /entity_${INDEX_VERSION} << EOF
{
  "mappings": {
    "properties": {
      "id": {"type": "keyword"},
      "type": {"type": "keyword"},
      "slug": {"type": "keyword"},
      "pagerank": {"type": "long"}
    }
  }
}
EOF

es POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "*", "alias": "entity_staging" } }
  ]
}
EOF
es POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } }
  ]
}
EOF

# create index for m2m
es PUT /m2m_${INDEX_VERSION} << EOF
{
  "mappings": {
    "properties": {
      "source_id": {"type": "keyword"},
      "predicate": {"type": "keyword"},
      "target_id": {"type": "keyword"}
    }
  }
}
EOF

es POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "*", "alias": "m2m_staging" } }
  ]
}
EOF
es POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }
  ]
}
EOF

# actually ingest data (can happen in parallel)
../.venv/bin/python ingest_dcc_assets.py
../.venv/bin/python ingest_gmts.py
../.venv/bin/python ingest_c2m2_files.py
../.venv/bin/python ingest_kg.py

# sanity checks
es POST /entity_staging/_search << EOF
{"query":{"match_all":{}}, "size":10,"sort":[{"pagerank":{"order": "desc"}}]}
EOF
es POST /m2m_staging/_search << EOF
{"query":{"match_all":{}}, "size":10}
EOF

# provide a way to get entity from id
es PUT /_enrich/policy/entity_lookup << EOF
{
  "match": {
    "indices": "entity_staging",
    "match_field": "id",
    "enrich_fields": ["id", "slug", "type", "pagerank", "a_*", "r_*"]
  }
}
EOF

echo "" | es POST /_enrich/policy/entity_lookup/_execute

# expand target_id into full target entity
es PUT /_ingest/pipeline/m2m_expanded_target << EOF
{
  "processors": [
    {
      "enrich": {
        "policy_name": "entity_lookup",
        "field": "target_id",
        "target_field": "target"
      }
    },
    {
      "script": {
        "lang": "painless",
        "source": "
          if (ctx.target != null) {
            for (entry in ctx.target.entrySet()) {
              ctx['target_' + entry.getKey()] = entry.getValue();
            }
            ctx.remove('target');
          }
        "
      }
    }
  ]
}
EOF

# actually build the new index

# create index for m2m
es PUT /m2m_target_expanded_${INDEX_VERSION} << EOF
{
  "mappings": {
    "properties": {
      "source_id": {"type": "keyword"},
      "predicate": {"type": "keyword"},
      "target_id": {"type": "keyword"},
      "target_type": {"type": "keyword"},
      "target_slug": {"type": "keyword"},
      "target_pagerank": {"type": "long"}
    }
  }
}
EOF

es POST /_reindex << EOF
{
  "source": {
    "index": "m2m_staging"
  },
  "dest": {
    "index": "m2m_target_expanded_${INDEX_VERSION}",
    "pipeline": "m2m_expanded_target"
  }
}
EOF

# no longer staging
es POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "entity_${INDEX_VERSION}", "alias": "entity_staging" } },
    { "remove": { "index": "m2m_${INDEX_VERSION}", "alias": "m2m_staging" } }
  ]
}
EOF
# remove existing entity aliases if they exist
es POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "*", "alias": "entity" } }
  ]
}
EOF
# remove existing m2m_target_expanded aliases if they exist
es POST /_aliases << EOF
{
  "actions": [
    { "remove": { "index": "*", "alias": "m2m_target_expanded" } },
  ]
}
EOF

# update this version to production
es POST /_aliases << EOF
{
  "actions": [
    { "add": { "index": "entity_${INDEX_VERSION}", "alias": "entity" } },
    { "add": { "index": "m2m_target_expanded_${INDEX_VERSION}", "alias": "m2m_target_expanded" } }
  ]
}
EOF
