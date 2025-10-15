import psycopg2
import pandas as pd
import os
import glob

conn = psycopg2.connect(
    dbname="db",
    user="postgres",
    password="postgres",
    host="postgresql",
    port="5432"
)
cur = conn.cursor()

data_folder = "path/to/csv/files"

# Load all CSVs into DataFrames
tables = {}
for csv_file in glob.glob(os.path.join(data_folder, "*.csv")):
    table_name = os.path.splitext(os.path.basename(csv_file))[0]
    df = pd.read_csv(csv_file)
    tables[table_name] = df

# Simple dependency resolver (assumes foreign key = column with another table’s name)
def get_dependencies(table_name):
    df = tables[table_name]
    deps = [col for col in df.columns if col in tables and col != table_name]
    return deps

load_order = []
visited = set()

def resolve_order(table_name):
    if table_name in visited:
        return
    for dep in get_dependencies(table_name):
        resolve_order(dep)
    load_order.append(table_name)
    visited.add(table_name)

for t in tables:
    resolve_order(t)

print("Load order:", load_order)

# Load tables in dependency order
for table_name in load_order:
    df = tables[table_name]

    # Resolve foreign key labels to IDs
    for col in df.columns:
        if col in tables and col != table_name:
            ref_table = col
            print(f"Resolving FK {table_name}.{col} → {ref_table}.id")

            # Fetch mapping from the referenced table
            cur.execute(f"SELECT id, name FROM {ref_table}")
            mapping = dict(cur.fetchall())

            # Replace the column with the matching ID
            df[col] = df[col].map({v: k for k, v in mapping.items()})

    # Insert into the database
    print(f"Inserting data into {table_name}...")
    tmp_file = f"/tmp/{table_name}.csv"
    df.to_csv(tmp_file, index=False)
    with open(tmp_file, 'r', encoding='utf-8') as f:
        next(f)
        cur.copy_expert(f"""
            COPY {table_name} FROM STDIN WITH (FORMAT CSV, HEADER TRUE)
        """, f)

conn.commit()
cur.close()
conn.close()

print("✅ All tables loaded successfully with foreign keys resolved.")
