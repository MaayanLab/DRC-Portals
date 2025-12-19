import os
import sys
import pandas as pd
import csv
from datetime import date
from uuid import uuid5, NAMESPACE_URL
import boto3
from botocore.exceptions import ClientError
from ingest_common import pg_connect
connection = pg_connect()
import json
if len(sys.argv) == 0 or not sys.argv[1].endswith("tsv"):
    raise Exception("Please add a tsv file")

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

filename = sys.argv[1]
dccs = pd.read_csv('ingest/DCC.tsv', sep="\t", index_col=0, header=0)
# map dcc names to their respective ids
dcc_mapper = {}
for i, v in dccs.loc[:,'short_label'].items():
    dcc_mapper[v] = i
print(dcc_mapper)
now = str(date.today()).replace("-", "")

df = pd.read_csv(filename, sep="\t")

data = {}
dcc_usecase = []
for i, row in df.iterrows():
	title = row['title']
	uid = str(uuid5(NAMESPACE_URL, title))
	data[uid] = {
		"title": row["title"],
		"short_description": row["short_description"],
		"description": row["description"],
		"tool_icon": row["tool_icon"],
    "tool_name": row["tool_name"],
		"inputs": json.dumps(list(set(row["inputs"].strip().split("; ")))) if type(row["inputs"]) == str else '',
		"sources": json.dumps(list(set(row["sources"].strip().split("; ")))) if type(row["sources"]) == str else '',
		"link": row["link"],
		"image": row["image"],
		"tutorial": row["tutorial"],
		"featured": row["featured"],
		"creator_dcc_id": dcc_mapper[row["creator_dcc"]],
	}
	if type(row["source_dcc"]) == str: 
		for dcc in set([dcc_mapper[i] for i in row["source_dcc"].strip().split("; ")]):
			dcc_usecase.append({"usecase_id": uid, "dcc_id": dcc})

usecase_df = pd.DataFrame.from_dict(data, orient="index").fillna('')
dcc_usecase_df = pd.DataFrame.from_records(dcc_usecase)
               
usecase_file = "usecase_files/%s_usecase.tsv"%now
dcc_usecase_file = "usecase_files/%s_dcc_usecase.tsv"%now

usecase_df.index.name = "id"
usecase_df.to_csv(usecase_file, sep="\t", header=True, quoting=csv.QUOTE_NONE)
dcc_usecase_df.to_csv(dcc_usecase_file, sep="\t", header=True, index=None)

print("Uploading to s3")

filename = usecase_file.replace('usecase_files', 'database/usecase_files')
print(filename)
upload_file(usecase_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(usecase_file, bucket, filename)

filename = dcc_usecase_file.replace('usecase_files', 'database/usecase_files')
print(filename)
upload_file(dcc_usecase_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(dcc_usecase_file, bucket, filename)

# ingest
print("ingesting...")

cur = connection.cursor()

cur.execute('''
  DELETE FROM dcc_usecase;
''')

cur.execute('''
  DELETE FROM usecase;
''') 
cur.execute('''
  create table usecase_tmp
  as table usecase
  with no data;
''')

with open(usecase_file, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'usecase_tmp',
      columns=columns,
      null='',
      sep='\t',
    )
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
    insert into usecase (%s)
      select %s
      from usecase_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table usecase_tmp;')
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table dcc_usecase_tmp
  as table dcc_usecase
  with no data;
''')


with open(dcc_usecase_file, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'dcc_usecase_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

column_string = ", ".join(columns)

cur.execute('''
    insert into dcc_usecase (%s)
      select %s
      from dcc_usecase_tmp
      on conflict 
        do nothing
    ;
  '''%(column_string, column_string))
cur.execute('drop table dcc_usecase_tmp;')
connection.commit()

