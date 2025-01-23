import psycopg2

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

# Specify the schema name you want to remove
schema_to_remove = "c2m2_metadata"

try:
    # Execute the DROP SCHEMA command with CASCADE option to remove objects within the schema
    cursor.execute(f"DROP SCHEMA IF EXISTS {schema_to_remove} CASCADE")

    # Commit the transaction
    conn.commit()
    print(f"Schema '{schema_to_remove}' removed successfully.")

except Exception as e:
    print(f"Error removing schema: {e}")

finally:
    # Close the cursor and PostgreSQL connection
    cursor.close()
    conn.close()
