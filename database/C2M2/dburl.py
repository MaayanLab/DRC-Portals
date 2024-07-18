import os
import pathlib
import urllib.parse
from dotenv import load_dotenv
load_dotenv(pathlib.Path(__file__).parent.parent.parent/'drc-portals'/'.env')
c2m2_database_url = urllib.parse.urlparse(os.getenv('C2M2_DATABASE_URL'))
print(f"{c2m2_database_url.scheme}://{c2m2_database_url.username}:{c2m2_database_url.password}@{c2m2_database_url.hostname}:{c2m2_database_url.port}{c2m2_database_url.path}")