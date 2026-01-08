## Getting the Database

Database entries can be downloaded on s3: cfde-drc/database/

You must first start and migrate the database (see [DRC Portal Dev Guide](../drc-portals/README.md))

```bash
# provision the primary database, mandatory and required before all other scripts, e.g., 
# if one of these scripts below fails with errors, it is best to see the README.md in 
# drc-portals folder, delete existing tables and related objects (non-system public.* tables), 
# apply the migrations (creates empty tables, etc) and then change to this folder and ingest again.

# May have to get updated file/folders for migrations if files on S3 have a different set of columns (see ingest_common.py)

# Be in the folder database

# Aux function
date_div() { echo "============= $(date) =============";}
ymd=$(date +%y%m%d);

# ingestion.py etc are run from ingest_es.sh, so, commenting such lines here
# Output to log files for cross-checking if needed
skip_py_scripts=1
if [[ "$skip_py_scripts" -eq 1 ]]; then
  echo "Skipping Python scripts here as they will be run in ingest_es.sh"
  # ingest all processed data files into elasticsearch for the processed data search
  sh ingest_es.sh
else
  echo "Running Python scripts here"

  logf=log/log_ingestion_${ymd}.log
  echo ${date_div} > ${logf};
  python3 ingestion.py 2>&1 | tee -a ${logf}
  echo ${date_div} >> ${logf};

  # Did the temp fix to ensure MW GMT gets ingested, had to give this command
  # Replace only the first on a line
  #ingest]$ sed -i 's/Metabolomics_Workbench_Metabolites_2022/Metabolomics_Workbench_Metabolites_2022.gmt/' FileAssets.tsv

  # much slower, for production or when developing with those features, can be omitted until necessary
  logf=log/log_ingest_dcc_assets_${ymd}.log
  echo ${date_div} > ${logf};
  python3 ingest_dcc_assets.py 2>&1 | tee -a ${logf}
  echo ${date_div} >> ${logf};

  logf=log/log_ingest_gmts_${ymd}.log
  echo ${date_div} > ${logf};
  python3 ingest_gmts.py 2>&1 | tee -a ${logf}
  echo ${date_div} >> ${logf};

  #python3 ingest_c2m2_files.py

  # Some KG files were > 100MB (ExRNA, GTEx); it was suggested to not to ingest then, i.e., keep the limit of 100MB
  logf=log/log_ingest_kg_${ymd}.log
  echo ${date_div} > ${logf};
  python3 ingest_kg.py 2>&1 | tee -a ${logf}
  echo ${date_div} >> ${logf};

  # Cleanup for keywords
  logf=log/log_sanitize_tables_for_keywords_${ymd}.log
  echo ${date_div} > ${logf};
  psql "$(python3 C2M2/dburl.py)" -a -f sanitize_tables_for_keywords.sql -L ${logf};
  echo ${date_div} >> ${logf};

  # For quick comparison across two servers, print size of tables and visually compare then check row counts on specific tables
  # Example
  # psql -t -A -F'|' -h localhost -v ON_ERROR_STOP=1 -U drc -d drc -p 5434 -c "\dt+ public.*" | awk -F'|' '{print $2, $7}'
  # psql -t -A -F'|' -h localhost -v ON_ERROR_STOP=1 -U drc -d drc -p 5434 -c "\dt+ public.*" | awk -F'|' '{print $2, $7}'
fi

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