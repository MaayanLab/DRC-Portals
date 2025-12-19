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
	title = str(row["date"]) + row["title"]
	uid = str(uuid5(NAMESPACE_URL, title))
	df.at[i, "id"] = uid
df = df.set_index("id")

news_file = "current/%s_news.tsv"%now
df = df[[i for i in df.columns if i != 'doi']]
df.to_csv(news_file, sep="\t", header=True,  quoting=csv.QUOTE_NONE)

print("Uploading to s3")

filename = news_file.replace('current', 'database/files')
print(filename)
upload_file(news_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(news_file, bucket, filename)

# ingest
print("ingesting...")
cur = connection.cursor()

cur.execute('''
  create table news_tmp
  as table news
  with no data;
''')

with open(news_file, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'news_tmp',
      columns=columns,
      null='',
      sep='\t',
    )
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
    insert into news (%s)
      select %s
      from news_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table news_tmp;')

connection.commit()