import os
import pathlib
import urllib.parse
from dotenv import load_dotenv
load_dotenv(pathlib.Path(__file__).parent.parent.parent/'drc-portals'/'.env')
########## DB ADMIN INFO: BEGIN ############
# Comment the line below with .env.dbadmin if not ingesting, almost always ingesting if running these scripts
#load_dotenv(pathlib.Path(__file__).parent.parent.parent.parent/'DB_ADMIN_INFO'/'.env.dbadmin')
########## DB ADMIN INFO: END   ############

c2m2_database_url = urllib.parse.urlparse(os.getenv('C2M2_DATABASE_URL'))
print(f"{c2m2_database_url.scheme}://{c2m2_database_url.username}:{urllib.parse.quote_plus(urllib.parse.unquote(c2m2_database_url.password))}@{c2m2_database_url.hostname}:{c2m2_database_url.port}{c2m2_database_url.path}")
