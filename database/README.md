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

# To ingest controlled vocabulary files into c2m2 schema
# on psql prompt while being in database folder: \i ingest_CV.sql
# on bash prompt : psql -h localhost -U drc -d drc -a -f ingest_CV.sql # this may prompt for DB password if not stored in ~/.pgpass file (permission 600)
psql -h localhost -U drc -d drc -a -f ingest_CV.sql
# To be added if needed: using python script: I am using \COPY inside the sql file, so
# with self.connection as cursor: cursor.executescript(open("ingest_CV.sql", "r").read())
# will not work unless absolute path for the source tsv file is used.

# To ingest the c2m2 tables from files submitted by DCCs
python populateC2M2FromS3.py 2>&1 | tee MRM_ingestion.log
# If ingesting files from only one DCC (into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
python populateC2M2FromS3.py MW 2>&1 | tee MRM_ingestion_MW.log

# After ingesting c2m2 files, create the table ffl_biosample by running (be in the database folder)
psql -h localhost -U drc -d drc -a -f biosample_fully_flattened_allin1.sql;

# .. and other scripts above
```
