#%%
import zipfile
import pathlib
import subprocess
import urllib.request, urllib.parse
from tqdm.auto import tqdm
from frictionless import Package

from ingest_common import ingest_path, current_dcc_assets

#%%
dcc_assets = current_dcc_assets()

#%%
# Ingest C2M2

files = dcc_assets[dcc_assets['filetype'] == 'C2M2']
files_path = ingest_path / 'c2m2s'

def check_c2m2_datapackage(file):
  file_path = files_path/file['short_label']/f"{urllib.parse.quote(str(file['sha256checksum']), safe='')}/{urllib.parse.quote(file['filename'], safe='')}"
  file_path.parent.mkdir(parents=True, exist_ok=True)

  if not file_path.exists():
    urllib.request.urlretrieve(file['link'].replace(' ', '%20'), file_path); # quote to handle space etc in the URL
  #
  c2m2_extract_path = file_path.parent / file_path.stem
  if not c2m2_extract_path.exists():
    with zipfile.ZipFile(file_path, 'r') as c2m2_zip:
      c2m2_zip.extractall(c2m2_extract_path)
  #
  c2m2_file_table, = pathlib.Path(c2m2_extract_path).rglob('file.tsv')
  c2m2_datapackage_json = c2m2_file_table.parent / 'C2M2_datapackage.json'
  c2m2_datapackage_db = c2m2_datapackage_json.parent/'C2M2_datapackage.sqlite'
  if not c2m2_datapackage_json.exists():
    subprocess.run(['cfde-c2m2', 'init'], cwd=str(c2m2_datapackage_json.parent.absolute()), check=True)
    subprocess.run(['cfde-c2m2', 'prepare'], cwd=str(c2m2_datapackage_json.parent.absolute()), check=True)
  if not c2m2_datapackage_db.exists():
    try:
      subprocess.run(['cfde-c2m2', 'validate'], cwd=str(c2m2_datapackage_json.parent.absolute()), check=True)
    except:
      if c2m2_datapackage_db.exists(): c2m2_datapackage_db.unlink()
      raise
  pkg = Package(str(c2m2_datapackage_json))
  print(f"  {str(c2m2_datapackage_json.parent)}")
  for rc_name in pkg.resource_names:
    print(f"      {rc_name}")
    with pkg.get_resource(rc_name) as rc:
      for _ in rc.row_stream:
        pass

def main():
  for short_label, dcc_files in files.groupby('short_label'):
    print(short_label)
    for _, file in dcc_files.iterrows():
      print(f"  {file['filename']}")
    check_c2m2_datapackage(file)

#%%
if __name__ == '__main__':
  import os
  main()
