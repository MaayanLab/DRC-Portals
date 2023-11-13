import pandas as pd
import os
import psycopg2
import pathlib
from urllib.parse import urlparse
from dotenv import load_dotenv
from uuid import NAMESPACE_URL, uuid5

# load .env from drc-portals potentially
load_dotenv('../drc-portals/.env')
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
result = urlparse(DATABASE_URL)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port

connection = psycopg2.connect(
    database = database,
    user = username,
    password = password,
    host = hostname,
    port = port
)

# Fetch data for ingest
if not pathlib.Path('ingest').exists():
  pathlib.Path('ingest').mkdir()
if not pathlib.Path('ingest/DCC.tsv').exists():
  import urllib.request
  urllib.request.urlretrieve('https://cfde-drc.s3.amazonaws.com/database/110723/DCC.tsv', 'ingest/DCC.tsv')
if not pathlib.Path('ingest/dcc_publications.tsv').exists():
  import urllib.request
  urllib.request.urlretrieve('https://cfde-drc.s3.amazonaws.com/database/110723/dcc_publications.tsv', 'ingest/dcc_publications.tsv')
if not pathlib.Path('ingest/publications.tsv').exists():
  import urllib.request
  urllib.request.urlretrieve('https://cfde-drc.s3.amazonaws.com/database/110723/publications.tsv', 'ingest/publications.tsv')

cur = connection.cursor()
cur.execute('''
  create table dcc_tmp
  as table dccs
  with no data;
''')

with open('ingest/DCC.tsv', 'r') as fr:
    cur.copy_from(fr, 'dcc_tmp',
      columns=('id', 'label', 'short_label', 'description', 'homepage', 'icon', 'cfde_partner'),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into dccs (id, label, short_label, description, homepage, icon, cfde_partner)
      select id, label, short_label, description, homepage, icon, cfde_partner
      from dcc_tmp
      on conflict (id)
        do update
        set label = excluded.label,
            short_label = excluded.short_label,
            description = excluded.description,
            homepage = excluded.homepage,
            icon = excluded.icon,
            cfde_partner = excluded.cfde_partner
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

with open('ingest/publications.tsv', 'r') as fr:
    cur.copy_from(fr, 'publication_tmp',
      columns=("id", "title", "year", "page", "volume", "issue", "journal", "pmid", "pmcid", "doi", "authors"),
      null='',
      sep='\t',
    )

cur.execute('''
    insert into publications (id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors)
      select id, title, year, page, volume, issue, journal, pmid, pmcid, doi, authors
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
            authors = excluded.authors
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

with open('ingest/dcc_publications.tsv', 'r') as fr:
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

cur.close()
connection.close()