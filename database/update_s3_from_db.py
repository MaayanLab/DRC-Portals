import pandas as pd
from datetime import date
import sys
import os
import boto3
from botocore.exceptions import ClientError
import csv
import json
import pathlib
from ingest_common import pg_connect
connection = pg_connect()

def upload_file(file_name, bucket, object_name=None):
	"""Upload a file to an S3 bucket

	:param file_name: File to upload
	:param bucket: Bucket to upload to
	:param object_name: S3 object name. If not specified then file_name is used
	:return: True if file was uploaded, else False
	"""

	# If S3 object_name was not specified, use file_name
	if object_name is None:
		object_name = os.path.basename(file_name)

	# Upload the file
	s3_client = boto3.client('s3')
	try:
		response = s3_client.upload_file(file_name, bucket, object_name)
	except ClientError as e:
		print(e)
		return False
	return True

bucket = 'cfde-drc'


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
		upload_file(filename, bucket, s3_filename)
		filename = 'current/current_%s.tsv'%(table)
		s3_filename = filename.replace('current/', 'database/files/')
		if not table == "code_assets":
			df.to_csv(filename, index=False, sep="\t", quoting=csv.QUOTE_NONE)
		else:
			df.replace(r'\r+|\n+|\t+', '', regex=True).to_csv(filename, index=False, sep="\t", quoting=csv.QUOTE_NONE)
		upload_file(filename, bucket, s3_filename)
	except Exception as e:
		print(f"failed {table}", e)
		# cur.rollback()
		cur.close()
