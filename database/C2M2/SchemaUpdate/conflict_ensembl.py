import csv
import os
from pathlib import Path
import re
import requests
from collections import defaultdict


file1 = Path('/mnt/share/cfdeworkbench/C2M2/ontology/external_CV_reference_files_updated_202412/ensembl_genes.tsv')
file2 = Path('/mnt/share/cfdeworkbench/C2M2/ontology/external-CV-reference-scripts/Ensembl_preprocessing/002_all/ensembl_genes.tsv')
file3 = Path('/mnt/share/cfdeworkbench/C2M2/ontology/C2M2_genes.tsv')

def read_tsv(file_path):
    with open(file_path, mode='r') as file:
        return [row for row in csv.DictReader(file, delimiter='\t')]

# Combine data from three files
data = read_tsv(file1) + read_tsv(file2) + read_tsv(file3)

def parse_synonyms(row):
    return re.findall(r'\b\w+\b', row['synonyms']) if 'synonyms' in row else []

# Group by (id, name) and retain the row with the most synonyms
unique_rows = {}
for row in data:
    key = (row['id'], row['name'])
    synonyms = parse_synonyms(row)
    row['synonym_count'] = len(synonyms)
    if key not in unique_rows or row['synonym_count'] > unique_rows[key]['synonym_count']:
        unique_rows[key] = row

# Group by ID to find conflicts
id_to_names = defaultdict(set)
for row in unique_rows.values():
    id_to_names[row['id']].add(row['name'])

conflicted_ids = {id_ for id_, names in id_to_names.items() if len(names) > 1}
conflicted_rows = [row for row in unique_rows.values() if row['id'] in conflicted_ids]
filtered_rows = [row for row in unique_rows.values() if row['id'] not in conflicted_ids]

def get_ensembl_official_name(ensembl_id):
    url = f"https://rest.ensembl.org/lookup/id/{ensembl_id}?content-type=application/json"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('display_name')
    return None

# Update names if they don’t match the official Ensembl name
for row in conflicted_rows:
    official_name = get_ensembl_official_name(row['id'])
    if official_name and row['name'] != official_name:
        row['name'] = official_name

final_data = filtered_rows + conflicted_rows
final_data.sort(key=lambda x: x['id'])

# Write the final data back to a TSV file
with open('output.tsv', mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=final_data[0].keys(), delimiter='\t')
    writer.writeheader()
    writer.writerows(final_data)