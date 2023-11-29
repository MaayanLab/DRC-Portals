## Getting the Database

Database entries can be downloaded on s3: cfde-drc/database/

You must first start and migrate the database (see [DRC Portal Dev Guide](../drc-portals/README.md))

Run `python ingestion.py` to provision the db

(Much Slower, for production, optional in development)
```bash
python ingest_c2m2.py
python ingest_gmts.py
python ingest_kg.py
```
