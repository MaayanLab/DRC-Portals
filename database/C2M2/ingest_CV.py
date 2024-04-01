import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from ingest_common import connection

cur = connection.cursor()

# Create CV Tables
with open('CV/disease_association_type.tsv') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'disease_association_type', null='', columns=columns, sep='\t')
with open('CV/phenotype_association_type.tsv') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'phenotype_association_type', null='', columns=columns, sep='\t')
with open('CV/subject_ethnicity.tsv') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'subject_ethnicity', null='', columns=columns, sep='\t')
with open('CV/subject_granularity.tsv') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'subject_granularity', null='', columns=columns, sep='\t')
with open('CV/subject_race_CV.tsv') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'subject_race_CV', null='', columns=columns, sep='\t')
with open('CV/subject_role.tsv') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'subject_role', null='', columns=columns, sep='\t')
with open('CV/subject_sex.tsv') as fr:
  columns = next(fr).strip().split('\t')
  cur.copy_from(fr, 'subject_sex', null='', columns=columns, sep='\t')
