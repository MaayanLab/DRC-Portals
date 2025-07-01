from ingest_common import (
  connection,
  dcc_path,
  publications_path,
  dcc_publications_path,
  outreach_path,
  dcc_outreach_path,
  center_outreach_path,
  dcc_assets_path,
  file_assets_path,
  code_assets_path,
  partnerships_path,
  dcc_partnerships_path,
  partnership_publications_path,
  tools_path,
  dcc_usecase_path,
  usecase_path,
  news_path,
  centers_path,
  center_publication_path,
  r03_path,
  r03_publication_path,
  get_clean_path,
  write_clean_file
)
import io
import pandas as pd
import csv

cur = connection.cursor()
cur.execute('''
  create table dcc_tmp
  as table dccs
  with no data;
''')

with open(dcc_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'dcc_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

cur.execute('''
    insert into dccs (id, label, short_label, description, homepage, icon, cfde_partner, active, cf_site)
      select id, label, short_label, description, homepage, icon, cfde_partner, active, cf_site
      from dcc_tmp
      on conflict (id)
        do update
        set label = excluded.label,
            short_label = excluded.short_label,
            description = excluded.description,
            homepage = excluded.homepage,
            icon = excluded.icon,
            cfde_partner = excluded.cfde_partner,
            active = excluded.active,
            cf_site = excluded.cf_site
    ;
  ''')
cur.execute('drop table dcc_tmp;')
connection.commit()

# Partnerships
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

partnership_df = pd.read_csv(partnerships_path(), sep="\t", index_col=0)
s_buf = io.StringIO()
partnership_df.to_csv(s_buf, header=True, sep="\t", quoting=csv.QUOTE_NONE)
s_buf.seek(0)
columns = next(s_buf).strip().split('\t')
print(columns)
cur.copy_from(s_buf, 'partnerships_tmp',
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

cur = connection.cursor()
cur.execute('''
	create table dcc_partnerships_tmp
	as table dcc_partnerships
	with no data;
''')

dcc_partnership_df = pd.read_csv(dcc_partnerships_path(), sep="\t")
d_buf = io.StringIO()
dcc_partnership_df.to_csv(d_buf, header=True, sep="\t", index=None)
d_buf.seek(0)

columns = next(d_buf).strip().split('\t')
cur.copy_from(d_buf, 'dcc_partnerships_tmp',
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
print("Ingested Partnerships")

# centers
cur.execute('''
	create table centers_tmp
	as table centers
	with no data;
''')

center_df = pd.read_csv(centers_path(), sep="\t", index_col=0)
p_buf = io.StringIO()
center_df.to_csv(p_buf, header=True, quoting=csv.QUOTE_NONE, sep="\t", escapechar='\\')
p_buf.seek(0)
columns = next(p_buf).strip().split('\t')
cur.copy_from(p_buf, 'centers_tmp',
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
print("Ingested Centers")

# R03s

cur = connection.cursor()

cur.execute('''
  create table r03_tmp
  as table r03
  with no data;
''')
r03_df = pd.read_csv(r03_path(), sep="\t", index_col=0)
s_buf = io.StringIO()
r03_df.to_csv(s_buf, header=True, sep="\t", quoting=csv.QUOTE_NONE)
s_buf.seek(0)
columns = next(s_buf).strip().split('\t')
cur.copy_from(s_buf, 'r03_tmp',
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
print("ingested r03")

# tools
cur = connection.cursor()
# cur.execute('DELETE FROM partnership_publications')
# cur.execute('DELETE FROM dcc_publications')
cur.execute('DELETE FROM tools')
cur.execute('''
  create table tool_tmp
  as table tools
  with no data;
''')


tools_path_clean = get_clean_path(tools_path())
write_clean_file(tools_path(), tools_path_clean, ['tutorial'])
# Now, use tools_path_clean instead of tools_path
# with open(tools_path(), 'r') as fr: # original line
with open(tools_path_clean, 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'tool_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])
cur.execute('''
    insert into tools (%s)
      select %s
      from tool_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table tool_tmp;')

connection.commit()
print("ingested tools")

# Publication
publication_columns = ["title", "journal", "authors", "year", "page", "volume", "issue", "pmid", "pmcid", "doi", "landmark", "tool_id", "carousel", "carousel_title", "carousel_link", "carousel_description", "image", "featured", "keywords" ]
dcc_publication_columns = ["publication_id", "dcc_id"]
center_publication_columns = ["publication_id", "center_id"]
partnership_publication_columns = ["publication_id", "partnership_id"]
r03_publication_columns = ["publication_id", "r03_id"]

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
	DELETE FROM center_publications;
''')

cur.execute('''
  DELETE FROM publications;
''')

cur.execute('''
  create table publication_tmp
  as table publications
  with no data;
''')

publication_df = pd.read_csv(publications_path(), sep="\t", index_col=0)
p_buf = io.StringIO()
publication_df.to_csv(p_buf, header=True, quoting=csv.QUOTE_NONE, sep="\t")

p_buf.seek(0)
columns = next(p_buf).strip().split('\t')
cur.copy_from(p_buf, 'publication_tmp',
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

cur = connection.cursor()
cur.execute('''
  create table dcc_publication_tmp
  as table dcc_publications
  with no data;
''')
dcc_publication_df = pd.read_csv(dcc_publications_path(), sep="\t")
d_buf = io.StringIO()
dcc_publication_df.to_csv(d_buf, header=True, sep="\t", index=None)
d_buf.seek(0)
columns = next(d_buf).strip().split('\t')
cur.copy_from(d_buf, 'dcc_publication_tmp',
	columns=dcc_publication_columns,
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

cur.execute('''
  create table center_publication_tmp
  as table center_publications
  with no data;
''')

center_publication_df = pd.read_csv(center_publication_path(), sep="\t")
center_buf = io.StringIO()
center_publication_df.to_csv(center_buf, header=True, sep="\t", index=None)
center_buf.seek(0)
columns = next(center_buf).strip().split('\t')
cur.copy_from(center_buf, 'center_publication_tmp',
	columns=center_publication_columns,
	null='',
	sep='\t',
)
cur.execute('''
    insert into center_publications (publication_id, center_id)
      select publication_id, center_id
      from center_publication_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table center_publication_tmp;')

cur = connection.cursor()
cur.execute('''
  create table partnership_publication_tmp
  as table partnership_publications
  with no data;
''')

partnership_publication_df = pd.read_csv(partnership_publications_path(), sep="\t")
part_buf = io.StringIO()
partnership_publication_df.to_csv(part_buf, header=True, sep="\t", index=None)
part_buf.seek(0)
partnership_publication_columns = next(part_buf).strip().split('\t')
cur.copy_from(part_buf, 'partnership_publication_tmp',
	columns=partnership_publication_columns,
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
r03_publication_df = pd.read_csv(r03_publication_path(), sep="\t")
r_buf = io.StringIO()
r03_publication_df.to_csv(r_buf, header=True, sep="\t", index=None)
r_buf.seek(0)
columns = next(r_buf).strip().split('\t')
cur.copy_from(r_buf, 'r03_publication_tmp',
	columns=r03_publication_columns,
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

print("ingested publications")


## Outreach
outreach_columns = ["title", "short_description", "description", "tags", "agenda", "featured", "active", "start_date", "end_date", "application_start", "application_end", "link", "image", "carousel", "carousel_description", "cfde_specific", "flyer"]
dcc_outreach_columns = ["outreach_id", "dcc_id"]

cur = connection.cursor()

cur.execute('''
  DELETE FROM dcc_outreach;
''')

cur.execute('''
  DELETE FROM center_outreach;
''')

cur.execute('''
  DELETE FROM outreach;
''') 

cur.execute('''
  create table outreach_tmp
  as table outreach
  with no data;
''')

o_buf = io.StringIO()
outreach_df = pd.read_csv(outreach_path(), sep="\t", index_col=0)
outreach_df.to_csv(o_buf, header=True, quoting=csv.QUOTE_NONE, sep="\t")
o_buf.seek(0)
columns = next(o_buf).strip().split('\t')
cur.copy_from(o_buf, 'outreach_tmp',
	columns=columns,
	null='',
	sep='\t',
)
column_string = ", ".join(columns)
set_string = ",\n".join(["%s = excluded.%s"%(i,i) for i in columns])

cur.execute('''
    insert into outreach (%s)
      select %s
      from outreach_tmp
      on conflict (id)
        do update
        set %s
    ;
  '''%(column_string, column_string, set_string))
cur.execute('drop table outreach_tmp;')

cur = connection.cursor()
cur.execute('''
  create table dcc_outreach_tmp
  as table dcc_outreach
  with no data;
''')
d_buf = io.StringIO()
dcc_outreach_df = pd.read_csv(dcc_outreach_path(), sep="\t")
dcc_outreach_df.to_csv(d_buf, header=True, sep="\t", index=None)
d_buf.seek(0)
columns = next(d_buf).strip().split('\t')
cur.copy_from(d_buf, 'dcc_outreach_tmp',
	columns=dcc_outreach_columns,
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


cur = connection.cursor()
cur.execute('''
  create table center_outreach_tmp
  as table center_outreach
  with no data;
''')
c_buf = io.StringIO()
center_outreach_columns = ["outreach_id", "center_id"]
center_outreach_df = pd.read_csv(center_outreach_path(), sep="\t")
center_outreach_df.to_csv(c_buf, header=True, sep="\t", index=None)
c_buf.seek(0)
columns = next(c_buf).strip().split('\t')
cur.copy_from(c_buf, 'center_outreach_tmp',
	columns=center_outreach_columns,
	null='',
	sep='\t',
)

cur.execute('''
    insert into center_outreach (outreach_id, center_id)
      select outreach_id, center_id
      from center_outreach_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table center_outreach_tmp;')
connection.commit()


connection.commit()

print("Ingested outreach and webinars")


# Use Cases

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
usecase_df = pd.read_csv(usecase_path(), sep="\t", index_col=0)
u_buf = io.StringIO()
usecase_df.to_csv(u_buf, header=True, quoting=csv.QUOTE_NONE, sep="\t")
u_buf.seek(0)
columns = next(u_buf).strip().split('\t')
cur.copy_from(u_buf, 'usecase_tmp',
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



d_buf = io.StringIO()
dcc_usecase_df = pd.read_csv(dcc_usecase_path(), sep="\t")
dcc_usecase_df.to_csv(d_buf, header=True, index=None, sep="\t")
d_buf.seek(0)
columns = next(d_buf).strip().split('\t')
cur.copy_from(d_buf, 'dcc_usecase_tmp',
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



# DCC Assets
cur = connection.cursor()
cur.execute('''
  create table dcc_assets_tmp
  as table dcc_assets
  with no data;
''')

with open(dcc_assets_path(), 'r') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'dcc_assets_tmp',
    columns=columns,
    null='',
    sep='\t',
  )
cur.execute('''
    insert into dcc_assets (link, lastmodified, current, creator, 
            dcc_id, drcapproved, dccapproved, deleted, created)
    select link, lastmodified, current, creator, 
            dcc_id, drcapproved, dccapproved, deleted, created
    from dcc_assets_tmp
    on conflict (link)
      do nothing;
  ''')
cur.execute('drop table dcc_assets_tmp;')
connection.commit()

# DCC File Assets

cur.execute('''
  create table file_assets_tmp
  as table file_assets
  with no data;
''')
with open(file_assets_path(), 'r') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'file_assets_tmp',
    columns=columns,
    null='',
    sep='\t',
  )
cur.execute('''
  insert into file_assets (filetype, filename, link, size, sha256checksum)
  select filetype, filename, link, size, sha256checksum
  from file_assets_tmp
  on conflict (link)
    do nothing;
''')
cur.execute('drop table file_assets_tmp;')
connection.commit()

# DCC Code Assets

cur.execute('''
  create table code_assets_tmp
  as table code_assets
  with no data;
''')
with open(code_assets_path(), 'r') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'code_assets_tmp',
    columns=columns,
    null='',
    sep='\t',
  )
cur.execute('''
    insert into code_assets (type, name, link, description, 
            "openAPISpec", "smartAPISpec", "smartAPIURL", "entityPageExample")
    select type, name, link, description, 
            "openAPISpec", "smartAPISpec", "smartAPIURL", "entityPageExample"
    from code_assets_tmp
    on conflict (link)
      do nothing;
  ''')
cur.execute('drop table code_assets_tmp;')
connection.commit()
print("ingested assets")
## news

cur = connection.cursor()

cur.execute('''
  create table news_tmp
  as table news
  with no data;
''')

s_buf = io.StringIO()
news_df = pd.read_csv(news_path(), sep="\t", index_col=0)
news_df.to_csv(s_buf, header=True, sep="\t", quoting=csv.QUOTE_NONE)
s_buf.seek(0)
columns = next(s_buf).strip().split('\t')
cur.copy_from(s_buf, 'news_tmp',
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
print("ingested news")

cur.close()
connection.close()

print("Done")