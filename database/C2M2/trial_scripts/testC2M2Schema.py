import psycopg2
from sqlalchemy import create_engine

# PostgreSQL connection details
database_name = "drc"
user = "drc"
password = "drcpass"
host = "localhost"
port = "5432"

# Create a PostgreSQL engine
engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{database_name}')

# Connect to the PostgreSQL database
conn = psycopg2.connect(
    database=database_name,
    user=user,
    password=password,
    host=host,
    port=port
)

# Create a cursor
cursor = conn.cursor()

try:
    # Get a list of all tables in the database
    cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'c2m2_metadata'")
    tables = cursor.fetchall()

    # Iterate over each table and select the dcc_name
    for table in tables:
        table_name = table[0]
        query = f"SELECT dcc_name FROM c2m2_metadata.{table_name} LIMIT 1"
        cursor.execute(query)
        result = cursor.fetchone()

        if result:
            dcc_name = result[0]
            print(f"DCC name from table {table_name}: {dcc_name}")
        else:
            print(f"No data found in table {table_name}")

except Exception as e:
    print(f"Error executing query: {e}")

finally:
    # Close the cursor and PostgreSQL connection
    cursor.close()
    conn.close()
