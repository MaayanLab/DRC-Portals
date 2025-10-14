## Getting the Database

Database entries can be downloaded on s3: cfde-drc/database/

You must first start and migrate the database (see [DRC Portal Dev Guide](../drc-portals/README.md))

```bash
# provision the primary database, mandatory and required before all other scripts
# May have to get updated file/folders for migrations if files on S3 have a different set of columns (see ingest_common.py)

# Be in the folder database

# must run at the beginning
python3 ingestion.py

# can run in parallel
python3 ingest_dcc_assets.py
python3 ingest_gmts.py
python3 ingest_c2m2_files.py
python3 ingest_kg.py

# run at the very end
python3 expand_m2m.py
```

## Ingesting new changes

Ingest scripts try to be incremental for the most part (so they should be able to apply to an existing database). However, since downloads are cached you might need to remove stale files to get the proper updates.

```bash
# typically good enough to clear the primary cached files
rm ingest/*.tsv
python3 ingestion.py

# OR

# for more extensive cache removal (i.e. with the processed data portal files), typically shouldn't be necessary
rm -r ingest
python3 ingestion.py
```

## Ingesting C2M2

To populate C2M2 related tables, see [the C2M2 README.md](C2M2/README.md).

## Running FAIR Assessment 

Update the DCCAssets.tsv, FileAssets.tsv and CodeAssets.tsv file paths in the ingest_commmon.py script to contain all the currently uploaded assets. Running these files should perform the fair assessments:
```bash
# FAIR assessment of current code and file assets
python3 fair_assessment/assess_fair.py

```

## Updating S3 Ingest Files from Production Database
```bash
# in one terminal, port forward the prod db
kubectl port-forward -n drc deploy/drc-portal-postgres 5432

# in another, run the following script to generate these files and load them into s3
python3 update_s3_from_db.py dcc_assets file_assets code_assets
```

## Updating Outreach/Webinar in Production
```bash
# in one terminal, port forward the prod db
kubectl port-forward -n drc deploy/drc-portal-postgres 5432

# in another, run the following script to generate the files and load them into s3 & the prod database
python3 update_outreach.py updated-outreach.tsv updated-webinar.tsv
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