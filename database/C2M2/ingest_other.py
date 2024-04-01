import sys
import pathlib
sys.path.append(str(pathlib.Path(__file__).parent.parent))
from ingest_common import connection

cur = connection.cursor()
cur.execute((pathlib.Path(__file__).parent/'c2m2_other_tables.sql').read_text())
cur.execute((pathlib.Path(__file__).parent/'biosample_fully_flattened_allin1.sql').read_text())
