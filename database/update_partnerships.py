import os
import sys
import pandas as pd
import csv
from datetime import date
from uuid import uuid5, NAMESPACE_URL
from upload_common import upload_file
from ingest_common import pg_connect
connection = pg_connect()
import math
import json
if len(sys.argv) == 0 or not sys.argv[1].endswith("tsv"):
		raise Exception("Please add a tsv file")

filename = sys.argv[1]
dccs = pd.read_csv('https://cfde-drc.s3.amazonaws.com/database/files/current_dccs.tsv', sep="\t", index_col=0, header=0)
# map dcc names to their respective ids
dcc_mapper = {}
for i, v in dccs.loc[:,'short_label'].items():
		dcc_mapper[v] = i
print(dcc_mapper)
now = str(date.today()).replace("-", "")

df = pd.read_csv(filename, sep="\t")

data = {}
dcc_partnership = []
partnership_publication = []
for i, row in df.iterrows():
	title = row['title']
	uid = str(uuid5(NAMESPACE_URL, title))
	data[uid] = {
		"title": row["title"],
		"description": row["description"],
		"status": row["status"],
		"website": row["website"],
		"priority": int(row["priority"] if not math.isnan(row['priority']) else 0),
		"image": row["image"],
		"grant_num": row["grant_num"],
	}
	if type(row["dccs"]) == str:
		lead_dccs = [dcc_mapper[i] for i in row["lead_dccs"].strip().split("; ")] if type(row["lead_dccs"]) == str else []
		for dcc in set([dcc_mapper[i] for i in row["dccs"].strip().split("; ")]):
			dcc_partnership.append({"partnership_id": uid, "dcc_id": dcc, "lead": dcc in lead_dccs})
	if type(row["publications"]) == str:
		for pub in set(row["publications"].strip().split("; ")):
			partnership_publication.append({"partnership_id": uid, "publication_id": pub})

partnership_df = pd.DataFrame.from_dict(data, orient="index").fillna('')
dcc_partnership_df = pd.DataFrame.from_records(dcc_partnership)
partnership_publication_df = pd.DataFrame.from_dict(data, orient="index").fillna('')
partnership_publication_df = pd.DataFrame.from_records(partnership_publication)
							 
partnership_file = "partnership_files/%s_partnership.tsv"%now
dcc_partnership_file = "partnership_files/%s_dcc_partnership.tsv"%now
partnership_publication_file = "partnership_files/%s_partnership_publication.tsv"%now

partnership_df.index.name = "id"
partnership_df.to_csv(partnership_file, sep="\t", header=True, quoting=csv.QUOTE_NONE)
dcc_partnership_df.to_csv(dcc_partnership_file, sep="\t", header=True, index=None)
partnership_publication_df.to_csv(partnership_publication_file, sep="\t", header=True, index=None)

print("Uploading to s3")

filename = partnership_file.replace('partnership_files', 'database/partnership_files')
print(filename)
upload_file(partnership_file, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(partnership_file, filename)

filename = dcc_partnership_file.replace('partnership_files', 'database/partnership_files')
print(filename)
upload_file(dcc_partnership_file, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(dcc_partnership_file, filename)

filename = partnership_publication_file.replace('partnership_files', 'database/publication_files')
print(filename)
upload_file(partnership_publication_file, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(partnership_publication_file, filename)

# ingest
print("ingesting...")

cur = connection.cursor()

cur.execute('''
	DELETE FROM dcc_partnerships;
''')

cur.execute('''
	DELETE FROM partnership_publications;
''')

cur.execute('''
	DELETE FROM partnerships;
''') 

cur.execute('''
	create table partnerships_tmp
	as table partnerships
	with no data;
''')

with open(partnership_file, 'r') as fr:
		columns = next(fr).strip().split('\t')
		cur.copy_from(fr, 'partnerships_tmp',
			columns=columns,
			null='',
			sep='\t',
		)
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
		insert into partnerships (%s)
			select %s
			from partnerships_tmp
			on conflict (id)
				do update
				set %s
		;
	'''%(column_string, column_string, set_string))
cur.execute('drop table partnerships_tmp;')

connection.commit()

cur = connection.cursor()
cur.execute('''
	create table dcc_partnerships_tmp
	as table dcc_partnerships
	with no data;
''')


with open(dcc_partnership_file, 'r') as fr:
		columns = next(fr).strip().split('\t')
		cur.copy_from(fr, 'dcc_partnerships_tmp',
			columns=columns,
			null='',
			sep='\t',
		)

column_string = ", ".join(columns)

cur.execute('''
		insert into dcc_partnerships (%s)
			select %s
			from dcc_partnerships_tmp
			on conflict 
				do nothing
		;
	'''%(column_string, column_string))
cur.execute('drop table dcc_partnerships_tmp;')
connection.commit()

cur = connection.cursor()
cur.execute('''
	create table partnership_publications_tmp
	as table partnership_publications
	with no data;
''')


with open(partnership_publication_file, 'r') as fr:
		columns = next(fr).strip().split('\t')
		cur.copy_from(fr, 'partnership_publications_tmp',
			columns=columns,
			null='',
			sep='\t',
		)

column_string = ", ".join(columns)

cur.execute('''
		insert into partnership_publications (%s)
			select %s
			from partnership_publications_tmp
			on conflict 
				do nothing
		;
	'''%(column_string, column_string))
cur.execute('drop table partnership_publications_tmp;')
connection.commit()

