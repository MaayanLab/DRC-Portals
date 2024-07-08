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
publication_df = pd.read_csv('https://cfde-drc.s3.amazonaws.com/database/files/current_publications.tsv', sep="\t", index_col=0)
publication_mapper = {}
for i, row in publication_df.iterrows():
	doi = row['doi']
	if type(doi) == str:
		publication_mapper[doi] = i
          

now = str(date.today()).replace("-", "")
df = pd.read_csv(filename, sep="\t")

df["id"] = ""
for i, row in df.iterrows():
	doi = row['doi']
	uid = str(uuid5(NAMESPACE_URL, row['label']))
	if type(doi) == str:
		doi = doi.replace("https://doi.org/", "")
		pub_id = publication_mapper[doi]
		publication_df.at[pub_id, 'tool_id'] = uid
	df.at[i, "id"] = uid
df = df.set_index("id")

publication_file = "publication_files/%s_publications.tsv"%now
tool_file = "tool_files/%s_tools.tsv"%now
publication_df.to_csv(publication_file, sep="\t", header=True, quoting=csv.QUOTE_NONE, index_label="id")
df = df[[i for i in df.columns if i != 'doi']]
df.to_csv(tool_file, sep="\t", header=True)

print("Uploading to s3")

filename = publication_file.replace('publication_files', 'database/files')
print(filename)
upload_file(publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(publication_file, bucket, filename)

filename = tool_file.replace('tool_files', 'database/files')
print(filename)
upload_file(tool_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(tool_file, bucket, filename)

# ingest
print("ingesting...")
cur = connection.cursor()
# Remove tool_ids on publication
cur.execute('''
  UPDATE publications
  SET tool_id=NULL;
''')

# delete tool table
cur.execute('''
  DELETE FROM tools;
''') 
# Create tools
cur.execute('''
  create table tools_tmp
  as table tools
  with no data;
''')

with open(tool_file, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'tools_tmp',
      columns=columns,
      null='',
      sep='\t',
    )
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
    insert into tools (%s)
      select %s
      from tools_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table tools_tmp;')

# Create publications
cur.execute('''
  create table publications_tmp
  as table publications
  with no data;
''')

with open(publication_file, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'publications_tmp',
      columns=columns,
      null='',
      sep='\t',
    )
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
    insert into publications (%s)
      select %s
      from publications_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table publications_tmp;')



connection.commit()