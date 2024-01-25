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
)

cur = connection.cursor()
cur.execute('''
  create table dcc_tmp
  as table dccs
  with no data;
''')

with open(dcc_path(), 'r') as fr:
    next(fr)
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

# tools
cur = connection.cursor()
cur.execute('''
  create table tool_tmp
  as table tools
  with no data;
''')

with open(tools_path(), 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'tool_tmp',
      columns=("id", "label", "description", "url", "icon"),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into tools (id, label, description, url, icon)
      select id, label, description, url, icon
      from tool_tmp
      on conflict (id)
        do update
        set id = excluded.id,
            label = excluded.label,
            description = excluded.description,
            url = excluded.url,
            icon = excluded.icon
    ;
  ''')
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
    next(fr)
    cur.copy_from(fr, 'publication_tmp',
      columns=("id", "title", "year", "page", "volume", "issue", "journal", "pmid", "pmcid", "doi", "authors", "landmark", "tool_id"),
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

with open(dcc_publications_path(), 'r') as fr:
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
connection.commit()

cur = connection.cursor()
cur.execute('''
  create table outreach_tmp
  as table outreach
  with no data;
''')

with open(outreach_path(), 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'outreach_tmp',
      columns=('id', 'title', 'short_description', 'description', 'tags', 'featured','active',
       'start_date', 'end_date', 'application_start', 'application_end', 'link', 'image', 'carousel'),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into outreach (id, title, short_description, description, tags, featured,active,
       start_date, end_date, application_start, application_end, link, image, carousel)
      select id, title, short_description, description, tags, featured,active,
       start_date, end_date, application_start, application_end, link, image, carousel
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
            carousel = excluded.carousel
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

## Partnerships

cur = connection.cursor()
# cur.execute('DELETE FROM dcc_partnerships')
# cur.execute('DELETE FROM partnership_publications')
# cur.execute('DELETE FROM partnerships')

cur.execute('''
  create table partnerships_tmp
  as table partnerships
  with no data;
''')

with open(partnerships_path(), 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'partnerships_tmp',
      columns=('id', 'title', 'description', 'status', 'website', 'image'),
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
    next(fr)
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

cur = connection.cursor()
cur.execute('''
  create table partnership_publications_tmp
  as table partnership_publications
  with no data;
''')

with open(partnership_publications_path(), 'r') as fr:
    next(fr)
    cur.copy_from(fr, 'partnership_publications_tmp',
      columns=("partnership_id", "publication_id"),
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

# DCC Assets
cur = connection.cursor()
cur.execute('''
  create table dcc_assets_tmp
  as table dcc_assets
  with no data;
''')

with open(dcc_assets_path(), 'r') as fr:
  next(fr)
  cur.copy_from(fr, 'dcc_assets_tmp',
    columns=(
      'link', 'lastmodified', 'current', 'creator',
      'dcc_id', 'drcapproved', 'dccapproved', 'deleted'
    ),
    null='',
    sep='\t',
  )
cur.execute('''
    insert into dcc_assets (link, lastmodified, current, creator, 
            dcc_id, drcapproved, dccapproved, deleted)
    select link, lastmodified, current, creator, 
            dcc_id, drcapproved, dccapproved, deleted
    from dcc_assets_tmp
    on conflict (link)
      do update
      set lastmodified = excluded.lastmodified,
          current = excluded.current,
          creator = excluded.creator,
          dcc_id = excluded.dcc_id,
          drcapproved = excluded.drcapproved,
          dccapproved = excluded.dccapproved,
          deleted = excluded.deleted
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
  next(fr)
  cur.copy_from(fr, 'file_assets_tmp',
    columns=(
      'filetype', 'filename', 'link', 'size', 'sha256checksum'
    ),
    null='',
    sep='\t',
  )
cur.execute('''
  insert into file_assets (filetype, filename, link, size, sha256checksum)
  select filetype, filename, link, size, sha256checksum
  from file_assets_tmp
  on conflict (link)
    do update
    set filetype = excluded.filetype,
        filename = excluded.filename,
        size = excluded.size,
        sha256checksum = excluded.sha256checksum
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
  next(fr)
  cur.copy_from(fr, 'code_assets_tmp',
    columns=(
      'type',
      'name',
      'link',
      'description',
      'openAPISpec',
      'smartAPISpec',
      'smartAPIURL'
    ),
    null='',
    sep='\t',
  )
cur.execute('''
    insert into code_assets (type, name, link, description, 
            "openAPISpec", "smartAPISpec", "smartAPIURL")
    select type, name, link, description, 
            "openAPISpec", "smartAPISpec", "smartAPIURL"
    from code_assets_tmp
    on conflict (link)
      do update
      set type = excluded.type,
          name = excluded.name,
          description = excluded.description,
          "openAPISpec" = excluded."openAPISpec",
          "smartAPISpec" = excluded."smartAPISpec",
          "smartAPIURL" = excluded."smartAPIURL"
  ''')
cur.execute('drop table code_assets_tmp;')
connection.commit()

cur.close()
connection.close()