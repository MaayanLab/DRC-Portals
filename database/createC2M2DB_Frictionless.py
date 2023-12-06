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

    # List all subdirectories in the base directory
    subdirectories = [d for d in os.listdir(base_directory) if os.path.isdir(os.path.join(base_directory, d))]

    # Iterate over each subdirectory
    for dcc_name in subdirectories:
        dcc_directory = os.path.join(base_directory, dcc_name, 'data')

        # Construct the path to the corresponding JSON file within the subdirectory
        json_path = os.path.join(dcc_directory, 'C2M2_datapackage.json')
        print(json_path)
        try:
            # Load the JSON file into a Frictionless Package
            package = Package(json_path)

            # Iterate over each resource in the package
            for resource in package.resources:
                # Construct the path to the TSV file within the subdirectory
                tsv_path = os.path.join(dcc_directory, f"{resource.path}")
                print(tsv_path)
                # Load the TSV file into a Pandas DataFrame
                data_frame = pd.read_csv(tsv_path, delimiter='\t')

                # Add a new column for the DCC name
                data_frame['dcc_name'] = dcc_name

                # Insert the DataFrame into the PostgreSQL database
                data_frame.to_sql(resource.name, con=engine, index=False, if_exists='replace', schema=desired_schema)

        except Exception as e:
            print(f"Error processing {json_path}: {e}")
except Exception as e:
    print(f"Error creating schema: {e}")

finally:
    # Close the cursor and PostgreSQL connection
    cursor.close()
    conn.close()


# Close the PostgreSQL connection
engine.dispose()
