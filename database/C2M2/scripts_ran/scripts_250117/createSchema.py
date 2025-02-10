from frictionless import Package 
import os
import pandas as pd
import psycopg2
from sqlalchemy import create_engine

# Specify the base directory containing your TSV files
base_directory = '/mnt/share/cfdeworkbench/C2M2/latest'

# PostgreSQL connection details
database_name = "drc"
user = "drc"
password = "drcpass"
host = "localhost"
port = "5432"

# Create a PostgreSQL engine
engine = create_engine(f'postgresql://{user}:{password}@{host}:{port}/{database_name}')

# PostgreSQL connection details
conn_params = {
    "database": "drc",
    "user": "drc",
    "password": "drcpass",
    "host": "localhost",
    "port": "5432"
}

# Connect to the PostgreSQL database
conn = psycopg2.connect(**conn_params)

# Create a cursor
cursor = conn.cursor()
desired_schema = "c2m2_metadata"

try:
    # Execute the CREATE SCHEMA command with IF NOT EXISTS clause
    cursor.execute(f"CREATE SCHEMA IF NOT EXISTS {desired_schema}")

    # Commit the transaction
    conn.commit()
    print(f"Schema '{desired_schema}' created or already exists.")

except Exception as e:
    print(f"Error creating schema: {e}")

finally:
    # Close the cursor and PostgreSQL connection
    cursor.close()
    conn.close()