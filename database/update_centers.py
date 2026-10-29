import os
import sys
import pandas as pd
import csv
from datetime import date
from uuid import uuid5, NAMESPACE_URL
from upload_common import upload_file
from ingest_common import pg_connect
connection = pg_connect()
import pathlib
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
center_publication = []
for i, row in df.iterrows():
	label = row['label']
	uid = str(uuid5(NAMESPACE_URL, label))
	data[uid] = {
		"label": row["label"],
		"short_label": row["short_label"],
		"short_description": row["short_description"],
		"description": row["description"],
		"homepage": row["homepage"],
		"icon": row["icon"],
		"grant_num": row["grant_num"],
		"active": row["active"],
	}
	if type(row.get("publications")) == str:
		for pub in set(row["publications"].strip().split("; ")):
			center_publication.append({"center_id": uid, "publication_id": pub})

center_df = pd.DataFrame.from_dict(data, orient="index").fillna('')
center_publication_df = pd.DataFrame.from_records(center_publication, columns=['center_id', 'publication_id'])

center_file = "center_files/%s_center.tsv"%now
center_publication_file = "center_files/%s_center_publication.tsv"%now

pathlib.Path('center_files').mkdir(exist_ok=True)
center_df.index.name = "id"
center_df.to_csv(center_file, sep="\t", header=True, quoting=csv.QUOTE_NONE)
center_publication_df.to_csv(center_publication_file, sep="\t", header=True, index=None)

print("Uploading to s3")

filename = center_file.replace('center_files', 'database/center_files')
print(filename)
upload_file(center_file, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(center_file, filename)

filename = center_publication_file.replace('center_files', 'database/publication_files')
print(filename)
upload_file(center_publication_file, filename)
filename = filename.replace(now, "current")
print(filename)
upload_file(center_publication_file, filename)

# ingest
print("ingesting...")

cur = connection.cursor()

cur.execute('''
	DELETE FROM center_publications;
''')

cur.execute('''
	DELETE FROM centers;
''') 

cur.execute('''
	create table centers_tmp
	as table centers
	with no data;
''')

with open(center_file, 'r') as fr:
		columns = next(fr).strip().split('\t')
		cur.copy_from(fr, 'centers_tmp',
			columns=columns,
			null='',
			sep='\t',
		)
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
		insert into centers (%s)
			select %s
			from centers_tmp
			on conflict (id)
				do update
				set %s
		;
	'''%(column_string, column_string, set_string))
cur.execute('drop table centers_tmp;')

connection.commit()

cur = connection.cursor()
cur.execute('''
	create table center_publications_tmp
	as table center_publications
	with no data;
''')


with open(center_publication_file, 'r') as fr:
		columns = next(fr).strip().split('\t')
		cur.copy_from(fr, 'center_publications_tmp',
			columns=columns,
			null='',
			sep='\t',
		)

column_string = ", ".join(columns)

cur.execute('''
		insert into center_publications (%s)
			select %s
			from center_publications_tmp
			on conflict 
				do nothing
		;
	'''%(column_string, column_string))
cur.execute('drop table center_publications_tmp;')
connection.commit()

