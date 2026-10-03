# Elasticsearch

This facilitates fast search across DCC assets. These scripts are meant to be run from the /database directory.

## Elasticsearch Snapshots

Once ingest is successful, it should be uploaded to our s3 bucket. It can then be used by others from the same bucket.

### On Dev
```bash
# setup s3 bucket for snapshots
# relies on AWS_ACCESS_KEY_ID // AWS_SECRET_ACCESS_KEY in .env at the time of deployment
just es_snapshot_configure false

# create snapshot from relevant index
just es_snapshot_push
```

### In Prod
```bash
# relies on AWS_ACCESS_KEY_ID // AWS_SECRET_ACCESS_KEY in .env at the time of deployment
just es_snapshot_configure

# check the available snapshots
just es_view_snapshots
# pull INDEX_VERSION_OUTPUT snapshot into this instance
just es_snapshot_pull
# view indices in this instance
just es_view_indices
# update entity_extended to point to INDEX_VERSION_OUTPUT
just es_alias

# to revert to prior index you can
just INDEX_VERSION_OUTPUT=oldversion es_alias
```

## Ingesting Elasticsearch

```bash
# add INDEX_VERSION to /drc-portals/.env

# list all available commands
just

# look for potentially un-archived DCC assets
just es_scruitinize

# actually perform ingest
just es_ingest_all2

# swap entity_expanded to make UI use the ingested index
just es_alias

# see what's currently in the database
just es_view_indices es_view_aliases
```
