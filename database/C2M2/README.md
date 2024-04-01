# Ingest C2M2
```bash
# To ingest controlled vocabulary files into c2m2 schema
python ingest_CV.py

# To ingest the c2m2 tables from files submitted by DCCs
python populateC2M2FromS3.py 2>&1 | tee MRM_ingestion.log
# If ingesting files from only one DCC (into schema mw), e.g., during per-DCC submission review and validation, can specify dcc_short_label as argument, e.g.,
#python populateC2M2FromS3.py MW 2>&1 | tee MRM_ingestion_MW.log

# Other c2m2 related sql scripts
# After ingesting c2m2 files, create the table ffl_biosample by running (be in the database folder)
python ingest_other.py

# .. and other scripts above
```
