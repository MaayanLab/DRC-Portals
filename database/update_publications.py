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
dccs = pd.read_csv('https://cfde-drc.s3.amazonaws.com/database/files/current_dccs.tsv', sep="\t", index_col=0, header=0)
# map dcc names to their respective ids
dcc_mapper = {}
for k,v in dccs.iterrows():
	dcc_mapper[v["short_label"]] = k

# map partnerships 
partnerships = pd.read_csv('https://cfde-drc.s3.amazonaws.com/database/files/current_partnerships.tsv', sep="\t", index_col=0)
partnership_mapper = {}
for k,v in partnerships.iterrows():
	partnership_mapper[v["title"]] = k
     
r03 = pd.read_csv('https://cfde-drc.s3.amazonaws.com/database/files/current_r03s.tsv', sep="\t", index_col=0)
r03_mapper = {}
for k,v in r03.iterrows():
	r03_mapper[v["grant_num"]] = k
    
now = str(date.today()).replace("-", "")
df = pd.read_csv(filename, sep="\t")
publication_columns = [i for i in df.columns if i not in ["dccs", "partnerships"]]
dcc_publication_columns = ["publication_id", "dcc_id"]
partnership_publication_columns = ["publication_id", "partnership_id"]
r03_publication_columns = ["publication_id", "r03_id"]

publication_df = pd.DataFrame("-", index=[], columns=publication_columns)
dcc_publication_df = pd.DataFrame("-", index=[], columns=dcc_publication_columns)
partnership_publication_df = pd.DataFrame("-", index=[], columns=partnership_publication_columns)
r03_publication_df = pd.DataFrame("-", index=[], columns=r03_publication_columns)

ind = 0
pind = 0
df["id"] = ""
for i, val in df.iterrows():
    title = val["title"]
    uid = str(uuid5(NAMESPACE_URL, title))
    v = {c: val[c] for c in publication_columns}
    publication_df.loc[uid] = val
    if type(val["dccs"]) == str and val["dccs"].strip() != '':
        for dcc in val["dccs"].split(";"):
            dcc = dcc.strip()
            dcc_id = dcc_mapper[dcc]
            dcc_publication_df.loc[ind] = [uid, dcc_mapper[dcc]]
            ind += 1
    if type(val["partnerships"]) == str and val["partnerships"].strip() != '':
        for partnership in val["partnerships"].split(";"):
            partnership = partnership.strip()
            partnership_id = partnership_mapper[partnership]
            partnership_publication_df.loc[pind] = [uid, partnership_mapper[partnership]]
            pind += 1
    
    if type(val["r03"]) == str and val["r03"].strip() != '':
        for r03 in val["r03"].split(";"):
            r03 = r03.strip()
            r03_id = r03_mapper[r03]
            r03_publication_df.loc[pind] = [uid, r03_mapper[r03]]
            pind += 1
publication_file = "current/%s_publications.tsv"%now
dcc_publication_file = "current/%s_dcc_publications.tsv"%now
partnership_publication_file = "current/%s_partnership_publications.tsv"%now
r03_publication_file = "current/%s_r03_publications.tsv"%now
publication_df[[i for i in publication_df.columns if i != "id" and i != "r03"]].to_csv(publication_file, sep="\t", header=True, quoting=csv.QUOTE_NONE, index_label="id")
dcc_publication_df.to_csv(dcc_publication_file, sep="\t", header=True, index=None)
partnership_publication_df.to_csv(partnership_publication_file, sep="\t", header=True, index=None)
r03_publication_df.to_csv(r03_publication_file, sep="\t", header=True, index=None)

print("Uploading to s3")

filename = publication_file.replace('current', 'database/files')
print(filename)
upload_file(publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(publication_file, bucket, filename)

filename = dcc_publication_file.replace('current', 'database/files')
print(filename)
upload_file(dcc_publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(dcc_publication_file, bucket, filename)

filename = partnership_publication_file.replace('current', 'database/files')
print(filename)
upload_file(partnership_publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(partnership_publication_file, bucket, filename)

filename = r03_publication_file.replace('current', 'database/files')
print(filename)
upload_file(r03_publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(r03_publication_file, bucket, filename)


# ingest
print("ingesting...")
cur = connection.cursor()
cur.execute('''
  DELETE FROM dcc_publications;
''')

cur.execute('''
  DELETE FROM partnership_publications;
''')

cur.execute('''
  DELETE FROM r03_publications;
''')

cur.execute('''
  DELETE FROM publications;
''')

cur.execute('''
  create table publication_tmp
  as table publications
  with no data;
''')

with open(publication_file, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'publication_tmp',
      columns=columns,
      null='',
      sep='\t',
    )
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])

cur.execute('''
    insert into publications (%s)
      select %s
      from publication_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table publication_tmp;')
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table dcc_publication_tmp
  as table dcc_publications
  with no data;
''')

with open(dcc_publication_file, 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'dcc_publication_tmp',
      columns=("publication_id", "dcc_id"),
      null='',
      sep='\t',
    )


cur.execute('''
    insert into dcc_publications (publication_id, dcc_id)
      select publication_id, dcc_id
      from dcc_publication_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table dcc_publication_tmp;')

cur = connection.cursor()
cur.execute('''
  create table partnership_publication_tmp
  as table partnership_publications
  with no data;
''')

with open(partnership_publication_file, 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'partnership_publication_tmp',
      columns=("publication_id", "partnership_id"),
      null='',
      sep='\t',
    )


cur.execute('''
    insert into partnership_publications (publication_id, partnership_id)
      select publication_id, partnership_id
      from partnership_publication_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table partnership_publication_tmp;')


cur = connection.cursor()
cur.execute('''
  create table r03_publication_tmp
  as table r03_publications
  with no data;
''')

with open(r03_publication_file, 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'r03_publication_tmp',
      columns=("publication_id", "r03_id"),
      null='',
      sep='\t',
    )


cur.execute('''
    insert into r03_publications (publication_id, r03_id)
      select publication_id, r03_id
      from r03_publication_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table r03_publication_tmp;')


connection.commit()

