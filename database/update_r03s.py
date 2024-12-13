import os
import sys
import pandas as pd
import csv
from datetime import date
from uuid import uuid5, NAMESPACE_URL
import boto3
from botocore.exceptions import ClientError
from ingest_common import connection

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
      
now = str(date.today()).replace("-", "")
df = pd.read_csv(filename, sep="\t")

df["id"] = ""
for i, row in df.iterrows():
	grant_num = row['grant_num']
	uid = str(uuid5(NAMESPACE_URL, grant_num))
	df.at[i, "id"] = uid
df = df.set_index("id")

r03_file = "current/%s_r03s.tsv"%now
df = df[[i for i in df.columns if i != 'doi']]
df.to_csv(r03_file, sep="\t", header=True, quoting=csv.QUOTE_NONE)

print("Uploading to s3")

filename = r03_file.replace('current', 'database/files')
print(filename)
upload_file(r03_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(r03_file, bucket, filename)

# ingest
print("ingesting...")
cur = connection.cursor()

# delete r03 table
cur.execute('''
  DELETE FROM r03;
''') 

# Create r03
cur.execute('''
  create table r03_tmp
  as table r03
  with no data;
''')

with open(r03_file, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'r03_tmp',
      columns=columns,
      null='',
      sep='\t',
    )
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
    insert into r03 (%s)
      select %s
      from r03_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table r03_tmp;')
connection.commit()