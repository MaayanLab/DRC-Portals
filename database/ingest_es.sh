#!/bin/sh

python create_index.py
python ingest_dcc_assets.py
python ingest_gmts.py
python ingest_c2m2_files.py
python ingest_kg.py
python expand_m2m.py
