## Elasticsearch Snapshots

Once ingest is successful, it should be uploaded to our s3 bucket. It can then be used by other from the same bucket.

```bash
# setup terminal
ELASTICSEARCH_URL="$(dotenv -f ../drc-portals/.env get ELASTICSEARCH_URL)"
es() {
  method=$1; shift
  path=$1; shift
  curl -H'Content-Type: application/json' -X${method} ${ELASTICSEARCH_URL}${path} $@
}
es_put() {
  es $@ -d @-
}
```

### In Prod
```bash
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
es_put POST '/_snapshot/s3/entity_v17_expanded/_restore?wait_for_completion=true' << EOF
{
  "indices": "*",
  "ignore_unavailable": false,
  "include_global_state": false
}
EOF

es GET /_cat/indices?v
```
