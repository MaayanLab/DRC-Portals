import os
import pathlib
import urllib.parse
from dotenv import load_dotenv
import sys

debug = 0;

# check if the name of the env file was passed as an argument
argv = sys.argv[1:]; # exclude the name of the script file
if len(argv)>0:
    env_file_name = argv[0];
else:
    env_file_name = '.env';

if debug>0:
    print(f"env_file_name:{env_file_name}")

#load_dotenv(pathlib.Path(__file__).parent.parent.parent/'drc-portals'/'.env'); # Original line by Daniel
env_path = pathlib.Path(__file__).parent.parent.parent / 'drc-portals' / env_file_name
if debug>0:
    print(f"env_path:{env_path}")

load_dotenv(env_path)
########## DB ADMIN INFO: BEGIN ############
# Comment the line below with .env.dbadmin if not ingesting, almost always ingesting if running these scripts
#load_dotenv(pathlib.Path(__file__).parent.parent.parent.parent/'DB_ADMIN_INFO'/'.env.dbadmin')
########## DB ADMIN INFO: END   ############

c2m2_database_url = urllib.parse.urlparse(os.getenv('C2M2_DATABASE_URL'))
print(f"{c2m2_database_url.scheme}://{c2m2_database_url.username}:{urllib.parse.quote_plus(urllib.parse.unquote(c2m2_database_url.password))}@{c2m2_database_url.hostname}:{c2m2_database_url.port}{c2m2_database_url.path}")
