from ingest_common import (
  connection,
  dcc_path,
  publications_path,
  dcc_publications_path,
  outreach_path,
  dcc_outreach_path,
  dcc_assets_path,
  partnerships_path,
  dcc_partnerships_path,
)

cur = connection.cursor()
cur.execute('''
  create table dcc_tmp
  as table dccs
  with no data;
''')

with open(dcc_path(), 'r') as fr:
    cur.copy_from(fr, 'dcc_tmp',
      columns=('id', 'label', 'short_label', 'description', 'homepage', 'icon', 'cfde_partner', 'cf_site'),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into dccs (id, label, short_label, description, homepage, icon, cfde_partner, cf_site)
      select id, label, short_label, description, homepage, icon, cfde_partner, cf_site
      from dcc_tmp
      on conflict (id)
        do update
        set label = excluded.label,
            short_label = excluded.short_label,
            description = excluded.description,
            homepage = excluded.homepage,
            icon = excluded.icon,
            cfde_partner = excluded.cfde_partner,
            cf_site = excluded.cf_site
    ;
  ''')
cur.execute('drop table dcc_tmp;')
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table publication_tmp
  as table publications
  with no data;
''')

with open(publications_path(), 'r') as fr:
    cur.copy_from(fr, 'publication_tmp',
      columns=("id", "title", "year", "page", "volume", "issue", "journal", "pmid", "pmcid", "doi", "authors", "landmark"),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into publications (id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors, landmark)
      select id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors, landmark
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
            landmark = excluded.landmark
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
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table outreach_tmp
  as table outreach
  with no data;
''')

with open(outreach_path(), 'r') as fr:
    cur.copy_from(fr, 'outreach_tmp',
      columns=('id', 'title', 'short_description', 'description', 'tags', 'featured','active',
       'start_date', 'end_date', 'application_start', 'application_end', 'link', 'image'),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into outreach (id, title, short_description, description, tags, featured,active,
       start_date, end_date, application_start, application_end, link, image)
      select id, title, short_description, description, tags, featured,active,
       start_date, end_date, application_start, application_end, link, image
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
            image = excluded.image
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

## Partnerships

cur = connection.cursor()
cur.execute('''
  create table partnerships_tmp
  as table partnerships
  with no data;
''')

with open(partnerships_path(), 'r') as fr:
    cur.copy_from(fr, 'partnerships_tmp',
      columns=('id', 'title', 'description', 'active', 'image'),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into partnerships (id, title, description, active, image)
      select id, title, description, active, image
      from partnerships_tmp
      on conflict (id)
        do update
        set id = excluded.id,
            title = excluded.title,
            description = excluded.description,
            active = excluded.active,
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
    cur.copy_from(fr, 'dcc_partnerships_tmp',
      columns=("partnership_id", "dcc_id"),
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


# DCC Assets
cur = connection.cursor()
cur.execute('''
  create table dcc_assets_tmp
  as table dcc_assets
  with no data;
''')

with open(dcc_assets_path(), 'r') as fr:
  cur.copy_from(fr, 'dcc_assets_tmp',
    columns=(
      'filetype', 'filename', 'link', 'size', 'lastmodified', 'current',
      'creator', 'annotation', 'dcc_id', 'drcapproved', 'dccapproved'
    ),
    null='',
    sep='\t',
  )

cur.execute('''
    insert into dcc_assets (dcc_id, filetype, filename, link, size, 
      lastmodified, current, creator, drcapproved, dccapproved, annotation)
    select dcc_id, filetype, filename, link, size, lastmodified, current, 
      creator, drcapproved, dccapproved, annotation
    from dcc_assets_tmp
    on conflict (link)
      do update
      set size = excluded.size,
          current = excluded.current,
          creator = excluded.creator,
          drcapproved = excluded.drcapproved,
          dccapproved = excluded.dccapproved,
          annotation = excluded.annotation
  ''')
cur.execute('drop table dcc_assets_tmp;')
connection.commit()

cur.close()
connection.close()