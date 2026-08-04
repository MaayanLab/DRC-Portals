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
es_put POST "/_snapshot/s3/entity_${INDEX_VERSION_OUTPUT}_expanded?wait_for_completion=true" << EOF
{
  "indices": "entity_${INDEX_VERSION_OUTPUT}_expanded",
  "ignore_unavailable": false,
  "include_global_state": false,
  "metadata": {
    "taken_by": "danieljbclarke",
    "taken_because": "c2m2 update"
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
es_put POST '/_snapshot/s3/entity_${INDEX_VERSION_OUTPUT}_expanded/_restore?wait_for_completion=true' << EOF
{
  "indices": "*",
  "ignore_unavailable": false,
  "include_global_state": false
}
EOF

es GET /_snapshot/s3/_all
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
# add INDEX_VERSION to /drc-portals/.env

# list all available commands
just

# look for potentially un-archived DCC assets
just es_scruitinize

# actually perform ingest
just es_ingest

# swap entity_expanded to make UI use the ingested index
just es_alias

# see what's currently in the database
just es_view_indices es_view_aliases
```
