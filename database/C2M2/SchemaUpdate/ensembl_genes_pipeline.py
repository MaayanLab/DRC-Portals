import csv
import os
from pathlib import Path
import re
import requests
from collections import defaultdict

# Function to read TSV files and return their data as a list of dictionaries
def read_tsv(file_path):
    with open(file_path, mode='r') as file:
        return [row for row in csv.DictReader(file, delimiter='\t')]

# Function to extract synonyms from a row's 'synonyms' field, using regular expressions
def parse_synonyms(row):
    return re.findall(r'\b\w+\b', row['synonyms']) if 'synonyms' in row else []

# Function to fetch the official Ensembl name for a given Ensembl ID using the Ensembl REST API
def get_ensembl_official_name(ensembl_id):
    url = f"https://rest.ensembl.org/lookup/id/{ensembl_id}?content-type=application/json"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('display_name')
    return None

# Function to extract synonyms from the BDCW API response
def extract_synonyms_bdcw(data):
    """
    Extract synonyms from JSON response data for the BDCW API.
    Combines values from GENENAME, REFSEQ, UNIPROT, KEGG fields into a formatted list.
    """
    columns_to_extract = ["GENENAME", "REFSEQ", "UNIPROT", "KEGG"]
    synonyms_dict = {}
    for entry in data:
        if entry['ENSEMBL'] not in synonyms_dict:
            synonyms_dict[entry['ENSEMBL']] = set()
        for column in columns_to_extract:
            if column in entry and entry[column]:
                synonyms_dict[entry['ENSEMBL']].update(entry[column])
    # Convert sets to sorted lists for consistency
    return {k: sorted(v) for k, v in synonyms_dict.items()}

# Function to extract synonyms for a given Ensembl ID using the Ensembl REST API
def extract_synonyms_ensembl(ensembl_id):
    """
    Fetch and deduplicate synonyms for a given Ensembl ID using the Ensembl REST API.
    """
    server = "https://rest.ensembl.org"
    ext = f"/xrefs/id/{ensembl_id}"
    synonyms = []
    try:
        response = requests.get(server + ext, headers={"Content-Type": "application/json"})
        response.raise_for_status()
        decoded = response.json()
        for item in decoded:
            if 'synonyms' in item:
                synonyms.extend(item['synonyms'])
        return sorted(set(synonyms))  # Deduplicated sorted list of synonyms
    except Exception as e:
        print(f"Failed to fetch Ensembl synonyms for {ensembl_id}: {e}")
        return []

# Paths to input TSV files
ontologyPath = Path('/mnt/share/cfdeworkbench/C2M2/ontology')
file1 = Path(ontologyPath/'external_CV_reference_files_202412/ensembl_genes.2024-08-18.tsv'); # Last master ontology table used (also on OSF)
ens_proc_rel_dir='external-CV-reference-scripts/Ensembl-Aug-2025'
file2 = Path(ontologyPath/ens_proc_rel_dir/'002_all/ensembl_genes.tsv') # From latest GFF processed
file3 = Path(ontologyPath/ens_proc_rel_dir/'C2M2_genes.tsv') # From DRC DB

# Combine data from all input TSV files
data = read_tsv(file1) + read_tsv(file2) + read_tsv(file3)

print(f"Finished reading {file1}, {file2} and {file3}")

# Group by (id, name) and retain the row with the most synonyms
unique_rows = {}
for row in data:
    key = (row['id'], row['name'])
    synonyms = parse_synonyms(row)
    row['synonym_count'] = len(synonyms)
    # Keep only the row with the highest synonym count for each (id, name) pair
    if key not in unique_rows or row['synonym_count'] > unique_rows[key]['synonym_count']:
        unique_rows[key] = row
print(f"Grouped by (id, name) and retained the row with the most synonyms")

# Identify IDs with conflicting names
id_to_names = defaultdict(set)
for row in unique_rows.values():
    id_to_names[row['id']].add(row['name'])

conflicted_ids = {id_ for id_, names in id_to_names.items() if len(names) > 1}
conflicted_rows = [row for row in unique_rows.values() if row['id'] in conflicted_ids]
filtered_rows = [row for row in unique_rows.values() if row['id'] not in conflicted_ids]

print(f"Identified IDs with conflicting names")

# Update names in conflicted rows to match the official Ensembl name
for row in conflicted_rows:
    official_name = get_ensembl_official_name(row['id'])
    if official_name and row['name'] != official_name:
        row['name'] = official_name

print(f"Updated names in conflicted rows to match the official Ensembl name")

# Combine filtered rows and resolved conflicted rows
final_data = filtered_rows + conflicted_rows
final_data.sort(key=lambda x: x['id'])

print(f"Combined filtered rows and resolved conflicted rows")

# Prepare API request URLs
results = {}
base_url_bdcw = "https://bdcw.org/geneid/rest/species/hsa/GeneIDType/ENSEMBL/GeneListStr/{}/USE_NCBI_GENE_INFO/0/View/json"

# Update and clean synonyms for each row
for row in final_data:
    ensembl_id = row['id']
    # Clean existing synonyms
    if 'synonyms' in row:
        synonyms = row['synonyms']
        clean_synonyms = [f'"{syn.strip()}"' for syn in re.split(r',\s*', synonyms.strip('[]"'))]
        row['synonyms'] = f"[{', '.join(clean_synonyms)}]"
        # Fetch and merge additional synonyms if empty
        if not row['synonyms']:
            url_bdcw = base_url_bdcw.format(ensembl_id)
            try:
                response_bdcw = requests.get(url_bdcw)
                response_bdcw.raise_for_status()
                json_data_bdcw = response_bdcw.json()
                synonyms_bdcw = extract_synonyms_bdcw(json_data_bdcw).get(ensembl_id, [])
                synonyms_ensembl = extract_synonyms_ensembl(ensembl_id)
                combined_synonyms = sorted(set(synonyms_bdcw + synonyms_ensembl))
                cleaned_synonyms = [f'"{syn}"' for syn in combined_synonyms]
                row['synonyms'] = f"[{', '.join(cleaned_synonyms)}]"
            except Exception as e:
                print(f"Failed to process {ensembl_id}: {e}")

print(f"Updated and cleaned synonyms for each row")

# Additional cleaning and fixes
for row in final_data:
    if 'synonyms' in row:
        row['synonyms'] = re.sub(r'"{2,}', '"', row['synonyms'])  # Replace consecutive quotes
        #row['synonyms'] = re.sub(r'"', '', row['synonyms'])  # Remove single quotes before array # Shiva
        row['synonyms'] = re.sub(r'^"\[(.*)\]"$', r'[\1]', row['synonyms']) # Mano
    if 'description' in row and row['description'].lower() == "tec" and not row['name']:
        row['description'] = "To be experimentally confirmed"

print(f"Additional cleaning and fixes done")

# Write the final processed data to a TSV file
output_file = Path(ontologyPath/ens_proc_rel_dir/'003_final/ensembl_gene_synonyms_resolved.tsv')

with open(output_file, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=final_data[0].keys(), delimiter='\t')
    writer.writeheader()
    writer.writerows(final_data)

print(f"Synonyms saved to {output_file}")
