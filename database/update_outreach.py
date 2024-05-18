import os
import sys
import pandas as pd
import csv
from datetime import date
from uuid import uuid5, NAMESPACE_URL
import boto3
from botocore.exceptions import ClientError
from ingest_common import connection
import json

# python update_outreach.py outreach.tsv [webinar.tsv]
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
for i, v in dccs.iloc[:,1].items():
    dcc_mapper[v] = i
print(dcc_mapper)
now = str(date.today()).replace("-", "")
df = pd.read_csv(filename, sep="\t")
outreach_columns = [i for i in df.columns if not i == 'dcc']
dcc_outreach_columns = ["outreach_id", "dcc_id"]

outreach_df = pd.DataFrame("-", index=[], columns=outreach_columns)
dcc_outreach_df = pd.DataFrame("-", index=[], columns=dcc_outreach_columns)
ind = 0
outreach_df = outreach_df.fillna('')
for i in df.index:
    val = df.loc[i]
    title = val["title"]
    start_date = val["start_date"]
    end_date = val["end_date"]
    string_id = title + str(start_date) + str(end_date)
    uid = str(uuid5(NAMESPACE_URL, string_id))
    v = {c: val[c] for c in outreach_columns}
    outreach_df.loc[uid] = val
    if type(val["dcc"]) == str and val["dcc"].strip() != '':
        for dcc in val["dcc"].split("; "):
            dcc_id = dcc_mapper[dcc]
            dcc_outreach_df.loc[ind] = [uid, dcc_mapper[dcc]]
            ind += 1

## Add webinars
if len(sys.argv) > 2:
  print('updating webinars...')
  webinar_filename = sys.argv[2]  
  df2 = pd.read_csv(webinar_filename, sep="\t")
  webinars = {}
  for i, val in df2.fillna('').iterrows():
      title = 'CFDE Webinar Series'
      label = val['label']
      start_date = val["start"]
      end_date = val["end"]
      string_id = title + str(start_date) + str(end_date)
      uid = str(uuid5(NAMESPACE_URL, string_id))
      if uid not in outreach_df.index:
          print(uid)
      else:
          if uid not in webinars:
              webinars[uid] = {
                  "speakers": {},
                  "agenda": []
              }
          if label not in webinars[uid]['speakers']:
              webinars[uid]['speakers'][label] = []
              webinars[uid]['agenda'].append({
                  "label": val["label"],
                  "summary": val["summary"],
                  "video_link": val["video_link"]
              })
          webinars[uid]['speakers'][label].append({
              "presenter": val["presenter"],
              "affiliation": val["affiliation"]
          })
  for k, v in webinars.items():
    agenda = []
    for i in v["agenda"]:
      agenda.append({
        "presenters": v["speakers"][i["label"]],
        **i
      })
    outreach_df.at[k,'agenda'] = json.dumps(agenda, ensure_ascii=False)


outreach_file = "outreach_files/%s_outreach.tsv"%now
dcc_outreach_file = "outreach_files/%s_dcc_outreach.tsv"%now
outreach_df.index.name = "id"
outreach_df.to_csv(outreach_file, sep="\t", header=True, quoting=csv.QUOTE_NONE)
dcc_outreach_df.to_csv(dcc_outreach_file, sep="\t", header=True, index=None)

print("Uploading to s3")

filename = outreach_file.replace('outreach_files', 'database/outreach_files')
print(filename)
upload_file(outreach_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(outreach_file, bucket, filename)

filename = dcc_outreach_file.replace('outreach_files', 'database/outreach_files')
print(filename)
upload_file(dcc_outreach_file, bucket, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(dcc_outreach_file, bucket, filename)

# ingest
print("ingesting...")

cur = connection.cursor()

cur.execute('''
  DELETE FROM dcc_outreach;
''')

cur.execute('''
  DELETE FROM outreach;
''') 
cur.execute('''
  create table outreach_tmp
  as table outreach
  with no data;
''')

with open(outreach_file, 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'outreach_tmp',
      columns=('id', 'title', 'short_description', 'description', 'tags', 'agenda', 'featured','active',
       'start_date', 'end_date', 'application_start', 'application_end', 'link', 'image', 'carousel', 'cfde_specific', 'flyer'),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into outreach (id, title, short_description, description, tags, agenda, featured,active,
       start_date, end_date, application_start, application_end, link, image, carousel, cfde_specific, flyer)
      select id, title, short_description, description, tags, agenda, featured,active,
       start_date, end_date, application_start, application_end, link, image, carousel, cfde_specific, flyer
      from outreach_tmp
      on conflict (id)
        do update
        set id = excluded.id,
            title = excluded.title,
            short_description = excluded.short_description,
            description = excluded.description,
            tags = excluded.tags,
            agenda = excluded.agenda,
            featured = excluded.featured,
            active = excluded.active,
            start_date = excluded.start_date,
            end_date = excluded.end_date,
            application_start = excluded.application_start,
            application_end = excluded.application_end,
            link = excluded.link,
            image = excluded.image,
            carousel = excluded.carousel,
            cfde_specific = excluded.cfde_specific,
            flyer = excluded.flyer
    ;
  ''')
cur.execute('drop table outreach_tmp;')
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table dcc_outreach_tmp
  as table dcc_outreach
  with no data;
''')

with open(dcc_outreach_file, 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'dcc_outreach_tmp',
      columns=("outreach_id", "dcc_id"),
      null='',
      sep='\t',
    )


cur.execute('''
    insert into dcc_outreach (outreach_id, dcc_id)
      select outreach_id, dcc_id
      from dcc_outreach_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table dcc_outreach_tmp;')
connection.commit()

