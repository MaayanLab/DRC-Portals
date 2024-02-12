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
dccs = pd.read_csv('ingest/DCC.tsv', sep="\t", index_col=0, header=0)
# map dcc names to their respective ids
dcc_mapper = {}
for k,v in dccs.iterrows():
	dcc_mapper[v["short_label"]] = k

# map partnerships 
partnerships = pd.read_csv('ingest/partnerships.tsv', sep="\t", index_col=0)
partnership_mapper = {}
for k,v in partnerships.iterrows():
	partnership_mapper[v["title"]] = k
    
now = str(date.today()).replace("-", "")
df = pd.read_csv(filename, sep="\t")
publication_columns = [i for i in df.columns if i not in ["dccs", "partnerships"]]
dcc_publication_columns = ["publication_id", "dcc_id"]
partnership_publication_columns = ["publication_id", "partnership_id"]

publication_df = pd.DataFrame("-", index=[], columns=publication_columns)
dcc_publication_df = pd.DataFrame("-", index=[], columns=dcc_publication_columns)
partnership_publication_df = pd.DataFrame("-", index=[], columns=partnership_publication_columns)
ind = 0
pind = 0
for i, val in df.iterrows():
    title = val["title"]
    uid = val["id"] if type(val["id"]) == str else str(uuid5(NAMESPACE_URL, title))
    v = {c: val[c] for c in publication_columns}
    publication_df.loc[uid] = val
    if type(val["dccs"]) == str and val["dccs"].strip() != '':
        for dcc in val["dccs"].split(";"):
            dcc_id = dcc_mapper[dcc]
            dcc_publication_df.loc[ind] = [uid, dcc_mapper[dcc]]
            ind += 1
    if type(val["partnerships"]) == str and val["partnerships"].strip() != '':
        for partnership in val["partnerships"].split(";"):
            partnership_id = partnership_mapper[partnership]
            partnership_publication_df.loc[pind] = [uid, partnership_mapper[partnership]]
            pind += 1
publication_file = "publication_files/%s_publication.tsv"%now
dcc_publication_file = "publication_files/%s_dcc_publication.tsv"%now
partnership_publication_file = "publication_files/%s_partnership_publication.tsv"%now
publication_df[[i for i in publication_df.columns if i != "id"]].to_csv(publication_file, sep="\t", header=True, quoting=csv.QUOTE_NONE, index_label="id")
dcc_publication_df.to_csv(dcc_publication_file, sep="\t", header=True, index=None)
partnership_publication_df.to_csv(partnership_publication_file, sep="\t", header=True, index=None)

print("Uploading to s3")

filename = publication_file.replace('publication_files', 'database/publication_files')
print(filename)
upload_file(publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(publication_file, bucket, filename)

filename = dcc_publication_file.replace('publication_files', 'database/publication_files')
print(filename)
upload_file(dcc_publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(dcc_publication_file, bucket, filename)

filename = partnership_publication_file.replace('publication_files', 'database/publication_files')
print(filename)
upload_file(partnership_publication_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(partnership_publication_file, bucket, filename)

# ingest
print("ingesting...")
cur = connection.cursor()
cur.execute('''
  create table publication_tmp
  as table publications
  with no data;
''')

with open(publication_file, 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'publication_tmp',
      columns=(publication_df.columns),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into publications (id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors, landmark, tool_id)
      select id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors, landmark, tool_id
      from publication_tmp
      on conflict (id)
        do update
        set id = excluded.id,
            title = excluded.title,
            year = excluded.year,
            page = excluded.page,
            volume = excluded.volume,
            issue = excluded.issue,
            journal = excluded.journal,
            pmid = excluded.pmid,
            pmcid = excluded.pmcid,
            doi = excluded.doi,
            authors = excluded.authors,
            landmark = excluded.landmark,
            tool_id = excluded.tool_id
    ;
  ''')
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
  DELETE FROM dcc_publications;
''')

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
  DELETE FROM partnership_publications;
''')

cur.execute('''
    insert into partnership_publications (publication_id, partnership_id)
      select publication_id, partnership_id
      from partnership_publication_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table partnership_publication_tmp;')


connection.commit()

