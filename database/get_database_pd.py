from ingest_common import connection
import sys
import pandas as pd
from datetime import date
if len(sys.argv) == 0:
    raise Exception("Please add a table")
table = sys.argv[1]
cur = connection.cursor()
now = str(date.today()).replace("-", "")
try:
	cur.execute("select * from %s"%table)
	df = pd.DataFrame(cur.fetchall(), columns=[desc[0] for desc in cur.description])
	df.to_csv('current/%s_%s.csv'%(now, table), index=False)
	df.to_csv('current/current_%s.csv'%(table), index=False)
except Exception as e:
	print(e)
	cur.rollback()
	cur.close()
