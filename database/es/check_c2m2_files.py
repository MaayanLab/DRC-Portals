#%%
import zipfile
import pathlib
import subprocess
import urllib.request, urllib.parse
from tqdm.auto import tqdm
from frictionless import Package

import os, sys; sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from ingest_common import ingest_path, current_dcc_assets, ensure_dcc_asset

#%%
# Ingest C2M2

def check_c2m2_datapackage(file):
  file_path = ensure_dcc_asset(ingest_path / 'c2m2s', file)
  c2m2_extract_path = ensure_unzipped(file_path)
  c2m2_file_table, = pathlib.Path(c2m2_extract_path).rglob('file.tsv')
  c2m2_datapackage_json = c2m2_file_table.parent / 'C2M2_datapackage.json'
  c2m2_datapackage_db = c2m2_datapackage_json.parent/'C2M2_datapackage.sqlite'
  if not c2m2_datapackage_db.exists():
    try:
      subprocess.run(['cfde-c2m2', 'init'], cwd=str(c2m2_datapackage_json.parent.absolute()), check=True)
      subprocess.run(['cfde-c2m2', 'prepare'], cwd=str(c2m2_datapackage_json.parent.absolute()), check=True)
      subprocess.run(['cfde-c2m2', 'validate'], cwd=str(c2m2_datapackage_json.parent.absolute()), check=True)
      pkg = Package(str(c2m2_datapackage_json))
      print(f"  {str(c2m2_datapackage_json.parent)}")
      for rc_name in pkg.resource_names:
        print(f"      {rc_name}")
        with pkg.get_resource(rc_name) as rc:
          for _ in rc.row_stream:
            pass
    except:
      if c2m2_datapackage_db.exists(): c2m2_datapackage_db.unlink()
      raise

def main():
  dcc_assets = current_dcc_assets()
  files = dcc_assets[dcc_assets['filetype'] == 'C2M2']
  for short_label, dcc_files in files.groupby('short_label'):
    print(short_label)
    for _, file in dcc_files.iterrows():
      print(f"  {file['filename']}")
    check_c2m2_datapackage(file)

#%%
if __name__ == '__main__':
  import os
  main()
