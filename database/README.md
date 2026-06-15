## Getting the Database

Database entries can be downloaded on s3: cfde-drc/database/

## Configure Python

```bash
uv venv
uv pip install -r requirements.txt
uv tool install python-dotenv[cli]
```

You must first start and migrate the database (see [DRC Portal Dev Guide](../drc-portals/README.md))

## Ingesting new changes

Ingest scripts try to be incremental for the most part (so they should be able to apply to an existing database). However, since downloads are cached you might need to remove stale files to get the proper updates.

```bash
# typically good enough to clear the primary cached files
rm ingest/*.tsv
uv run ingestion.py

# OR

# for more extensive cache removal (i.e. with the processed data portal files), typically shouldn't be necessary
rm -r ingest
uv run ingestion.py
```

## Ingesting C2M2

To populate C2M2 related tables, see [the C2M2 README.md](C2M2/README.md).

## Ingesting Elasticsearch

To populate Elasticsearch instance, see [the ElasticSearch README.md](es/README.md)

## Running FAIR Assessment 

Update the DCCAssets.tsv, FileAssets.tsv and CodeAssets.tsv file paths in the ingest_commmon.py script to contain all the currently uploaded assets. Running these files should perform the fair assessments:
```bash
# FAIR assessment of current code and file assets
uv run fair_assessment/assess_fair.py

```

## Updating S3 Ingest Files from Production Database
```bash
# in one terminal, port forward the prod db
kubectl port-forward -n drc deploy/drc-portal-postgres 5432

# in another, run the following script to generate these files and load them into s3
uv run update_s3_from_db.py dcc_assets file_assets code_assets
```

## Updating Outreach/Webinar in Production
```bash
# in one terminal, port forward the prod db
kubectl port-forward -n drc deploy/drc-portal-postgres 5432

# in another, run the following script to generate the files and load them into s3 & the prod database
uv run update_outreach.py updated-outreach.tsv updated-webinar.tsv
```

## Setting Up GMT Crossing

```bash
npx prisma db pull --schema=prisma/g2sg/schema.prisma --url "postgresql://postgres:<password>@localhost:5436/postgres"

npx prisma generate --schema=prisma/g2sg/schema.prisma
```

```json
datasource db {
  provider = "postgresql"
  url      = env("G2SG_DATABASE_URL")
}
```