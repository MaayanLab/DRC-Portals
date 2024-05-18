from ingest_common import (
  connection,
  dcc_path,
  publications_path,
  dcc_publications_path,
  outreach_path,
  dcc_outreach_path,
  dcc_assets_path,
  file_assets_path,
  code_assets_path,
  partnerships_path,
  dcc_partnerships_path,
  partnership_publications_path,
  tools_path,
  dcc_usecase_path,
  usecase_path,
)

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

# tools
cur = connection.cursor()
cur.execute('DELETE FROM partnership_publications')
cur.execute('DELETE FROM dcc_publications')
cur.execute('DELETE FROM tools')
cur.execute('''
  create table tool_tmp
  as table tools
  with no data;
''')

with open(tools_path(), 'r') as fr:
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

# Publication
cur = connection.cursor()
cur.execute('''
  create table publication_tmp
  as table publications
  with no data;
''')

with open(publications_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'publication_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

cur.execute('''
    insert into publications (id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors, landmark, tool_id, carousel, carousel_title, carousel_link, carousel_description, image, featured)
      select id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors, landmark, tool_id, carousel, carousel_title, carousel_link, carousel_description, image, featured
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
            tool_id = excluded.tool_id,
            carousel = excluded.carousel,
            carousel_title = excluded.carousel_title,
            carousel_link = excluded.carousel_link,
            carousel_description = excluded.carousel_description,
            image = excluded.image,
            featured = excluded.featured
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

with open(dcc_publications_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'dcc_publication_tmp',
      columns=columns,
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
connection.commit()

cur = connection.cursor()

cur.execute('DELETE FROM dcc_outreach')
cur.execute('DELETE FROM outreach')
cur.execute('''
  create table outreach_tmp
  as table outreach
  with no data;
''')

with open(outreach_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'outreach_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

cur.execute('''
    insert into outreach (id, title, short_description, description, tags, featured,active,
       start_date, end_date, application_start, application_end, link, image, carousel, cfde_specific, flyer)
      select id, title, short_description, description, tags, featured,active,
       start_date, end_date, application_start, application_end, link, image, carousel, cfde_specific, flyer
      from outreach_tmp
      on conflict (id)
        do update
        set id = excluded.id,
            title = excluded.title,
            short_description = excluded.short_description,
            description = excluded.description,
            tags = excluded.tags,
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

with open(dcc_outreach_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'dcc_outreach_tmp',
      columns=columns,
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

## Partnerships

cur = connection.cursor()
# cur.execute('DELETE FROM dcc_partnerships')
# cur.execute('DELETE FROM partnerships')

cur.execute('''
  create table partnerships_tmp
  as table partnerships
  with no data;
''')

with open(partnerships_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'partnerships_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

cur.execute('''
    insert into partnerships (id, title, description, status, website, image)
      select id, title, description, status, website, image
      from partnerships_tmp
      on conflict (id)
        do update
        set id = excluded.id,
            title = excluded.title,
            description = excluded.description,
            status = excluded.status,
            website = excluded.website,
            image = excluded.image
    ;
  ''')
cur.execute('drop table partnerships_tmp;')
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table dcc_partnerships_tmp
  as table dcc_partnerships
  with no data;
''')

with open(dcc_partnerships_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'dcc_partnerships_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

cur.execute('''
    insert into dcc_partnerships (partnership_id, dcc_id)
      select partnership_id, dcc_id
      from dcc_partnerships_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table dcc_partnerships_tmp;')
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table partnership_publications_tmp
  as table partnership_publications
  with no data;
''')

with open(partnership_publications_path(), 'r') as fr:
    columns = next(fr).strip().split('\t')
    cur.copy_from(fr, 'partnership_publications_tmp',
      columns=columns,
      null='',
      sep='\t',
    )

cur.execute('''
    insert into partnership_publications (partnership_id, publication_id)
      select partnership_id, publication_id
      from partnership_publications_tmp
      on conflict 
        do nothing
    ;
  ''')
cur.execute('drop table partnership_publications_tmp;')
connection.commit()

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

with open(usecase_path(), 'r') as fr:
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


with open(dcc_usecase_path(), 'r') as fr:
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

cur.close()
connection.close()