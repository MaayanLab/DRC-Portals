# Elasticsearch

This facilitates fast search across DCC assets. These scripts are meant to be run from the /database directory.

## Elasticsearch Snapshots

Once ingest is successful, it should be uploaded to our s3 bucket. It can then be used by others from the same bucket.

### On Dev
```bash
# setup terminal
source es/ingest_common.sh

# setup s3 bucket for snapshots
# relies on AWS_ACCESS_KEY_ID // AWS_SECRET_ACCESS_KEY in .env
es_put PUT /_snapshot/s3 << EOF
{
  "type": "s3",
  "settings": {
    "bucket": "cfde-elasticsearch-backup"
  }
}
EOF

# create snapshot from relevant index
es_put POST '/_snapshot/s3/entity_${INDEX_VERSION}_expanded?wait_for_completion=true' << EOF
{
  "indices": "entity_v18_expanded",
  "ignore_unavailable": false,
  "include_global_state": false,
  "metadata": {
    "taken_by": "danieljbclarke",
    "taken_because": "speedup c2m2 reingestion"
  }
}
EOF
```

### In Prod
```bash
source es/ingest_common.sh

# relies on AWS_ACCESS_KEY_ID // AWS_SECRET_ACCESS_KEY in .env
es_put PUT /_snapshot/s3 << EOF
{
  "type": "s3",
  "settings": {
    "bucket": "cfde-elasticsearch-backup",
    "readonly": true
  }
}
EOF

# restore 
es_put POST '/_snapshot/s3/entity_${INDEX_VERSION}_expanded/_restore?wait_for_completion=true' << EOF
{
  "indices": "*",
  "ignore_unavailable": false,
  "include_global_state": false
}
EOF

es GET /_cat/indices?v

es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity_expanded" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "add": { "index": "entity_${INDEX_VERSION}_expanded", "alias": "entity_expanded" } }]}
EOF

```

## Ingesting Elasticsearch

```bash
source es/ingest_common.sh

# step 1: take a look at assets, there might be assets that should have been archived
uv run es/scruitinize_dcc_assets.py

# step 2: ensure all files validate before ingesting, sometimes the manual fix is easy and should be done. also builds an on-disk index used later
uv run es/check_c2m2_files.py


# create index in elasticsearch for entity
es_put PUT /entity_${INDEX_VERSION} < es/index/entity.json
es_put PUT "/entity_${INDEX_VERSION}/_settings" <<< '{"index":{"refresh_interval":"-1"}}'

# create index in elasticsearch for m2m
es_put PUT /m2m_${INDEX_VERSION} < es/index/m2m.json
es_put PUT "/m2m_${INDEX_VERSION}/_settings" <<< '{"index":{"refresh_interval":"-1"}}'

# actually ingest data (these can happen in parallel -- don't forget ingest_common which specifies INDEX_VERSION)
uv run es/ingest_dcc_assets.py
uv run es/ingest_gmts.py
uv run es/ingest_c2m2_files.py
uv run es/ingest_c2m2_index.py
uv run es/ingest_kg.py

# re-calculate stuff in elasticsearch
es POST "/entity_${INDEX_VERSION}/_refresh"
es POST "/m2m_${INDEX_VERSION}/_refresh"

# compute pagerank and add to the entity
uv run es/pagerank.py

# re-calculate stuff in elasticsearch
es POST "/entity_${INDEX_VERSION}/_refresh"

# create index in elastic search for final one-hop expanded form
es_put PUT /entity_${INDEX_VERSION_OUTPUT}_expanded < es/index/entity_expanded.json
es_put PUT "/entity_${INDEX_VERSION_OUTPUT}_expanded/_settings" <<< '{"index":{"refresh_interval":"-1"}}'

# actually build the expanded index
uv run es/add_m2o_and_m2m.py

# re-calculate stuff in elasticsearch
es POST "/entity_${INDEX_VERSION_OUTPUT}_expanded/_refresh"

# swap out "entity_expanded" alias for the latest version (this is what's used on the frontend)
es_put POST /_aliases << EOF
{"actions": [{ "remove": { "index": "*", "alias": "entity_expanded" } }]}
EOF
es_put POST /_aliases << EOF
{"actions": [{ "add": { "index": "entity_${INDEX_VERSION_OUTPUT}_expanded", "alias": "entity_expanded" } }]}
EOF
```

## Helpful Elasticsearch Commands
```bash
source es/ingest_common.sh

# get current indexes
es GET /_cat/indices?v
es GET /_aliases

# delete old index
es DELETE /entity_${INDEX_VERSION}
es DELETE /m2m_${INDEX_VERSION}
es DELETE /entity_${INDEX_VERSION_OUTPUT}_expanded

# run a query
es GET /entity_${INDEX_VERSION}/_search << EOF
{
  "query": {
    "simple_query": {
      "query": "type:dcc"
    }
  }
}
EOF

# delete all results satisfying a query
es GET /entity_${INDEX_VERSION}/_delete_by_query << EOF
{
  "query": {
    "simple_query": {
      "query": "type:dcc"
    }
  }
}
EOF
```
