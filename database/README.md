## Getting the Database

Database entries can be downloaded on s3: cfde-drc/database/

You must first start and migrate the database (see [DRC Portal Dev Guide](../drc-portals/README.md))

```bash
# provision the primary database, mandatory and required before all other scripts
python ingestion.py

# much slower, for production or when developing with those features, can be omitted until necessary
python ingest_dcc_assets.py
python ingest_gmts.py
python ingest_c2m2_files.py
python ingest_kg.py
```

## Ingesting new changes

Ingest scripts try to be incremental for the most part (so they should be able to apply to an existing database). However, since downloads are cached you might need to remove stale files to get the proper updates.

```bash
# typically good enough to clear the primary cached files
rm ingest/*.tsv
python ingestion.py

# OR

# for more extensive cache removal (i.e. with the processed data portal files), typically shouldn't be necessary
rm -r ingest
pyhon ingestion.py
# .. and other scripts above
```
## Running FAIR Assessment 

Update the DCCAssets.tsv, FileAssets.tsv and CodeAssets.tsv file paths in the ingest_commmon.py script to contain all the currently uploaded assets. Running these files should perform the fair assessments:
```bash
# FAIR assessment of current code and file assets
python assess_fair.py

```