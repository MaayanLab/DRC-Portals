import pandas as pd
from datetime import date
import sys
import csv
import json
import pathlib
import traceback
from upload_common import upload_file
from ingest_common import pg_connect
connection = pg_connect()

input_table = set([i.strip() for i in sys.argv[1:]])
tables_list = set([
"dccs",
"dcc_publications",
"publications",
"outreach",
"dcc_outreach",
"dcc_assets",
"file_assets",
"code_assets",
"partnerships",
"dcc_partnerships",
"partnership_publications",
"tools",
"usecase",
"dcc_usecase",
"centers"
])
tables = tables_list.intersection(input_table)

if not tables:
	raise Exception("Please put some tables")

pathlib.Path('current').mkdir(exist_ok=True)

for table in tables:
	cur = connection.cursor()
	now = str(date.today()).replace("-", "")
	try:
		print(table)
		cur.execute("select * from %s"%table)
		df = pd.DataFrame(cur.fetchall(), columns=[desc[0] for desc in cur.description])
		df = df.map(lambda x: x if not type(x) in [dict, list] else json.dumps(x))
		if table == 'dcc_assets':
			df['creator'] = ''
		filename = 'current/%s_%s.tsv'%(now, table)
		s3_filename = filename.replace('current/', 'database/files/')
		if not table == "code_assets":
			df.to_csv(filename, index=False, sep="\t", quoting=csv.QUOTE_NONE)
		else:
			df.replace(r'\r+|\n+|\t+', '', regex=True).to_csv(filename, index=False, sep="\t", quoting=csv.QUOTE_NONE)
		upload_file(filename, s3_filename)
		filename = 'current/current_%s.tsv'%(table)
		s3_filename = filename.replace('current/', 'database/files/')
		if not table == "code_assets":
			df.to_csv(filename, index=False, sep="\t", quoting=csv.QUOTE_NONE)
		else:
			df.replace(r'\r+|\n+|\t+', '', regex=True).to_csv(filename, index=False, sep="\t", quoting=csv.QUOTE_NONE)
		upload_file(filename, s3_filename)
	except Exception as e:
		print(f"failed {table}", traceback.format_exc())
		# cur.rollback()
		cur.close()
