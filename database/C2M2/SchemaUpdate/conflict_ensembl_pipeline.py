import csv
import os
from pathlib import Path
import re
import requests
from collections import defaultdict

def read_tsv(file_path):
    with open(file_path, mode='r') as file:
        return [row for row in csv.DictReader(file, delimiter='\t')]
    
def parse_synonyms(row):
    return re.findall(r'\b\w+\b', row['synonyms']) if 'synonyms' in row else []

def get_ensembl_official_name(ensembl_id):
    url = f"https://rest.ensembl.org/lookup/id/{ensembl_id}?content-type=application/json"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json().get('display_name')
    return None

def extract_synonyms_bdcw(data):
    """
    Extract synonyms from the JSON response data for the BDCW API.
    Combine GENENAME, REFSEQ, UNIPROT, KEGG fields into a formatted list.
    """
    columns_to_extract = ["GENENAME", "REFSEQ", "UNIPROT", "KEGG"]
    synonyms_dict = {}
    for entry in data:
        if entry['ENSEMBL'] not in synonyms_dict:
            synonyms_dict[entry['ENSEMBL']] = set()
        for column in columns_to_extract:
            if column in entry and entry[column]:
                synonyms_dict[entry['ENSEMBL']].update(entry[column])
    # Convert sets to sorted lists and return
    return {k: sorted(v) for k, v in synonyms_dict.items()}

def extract_synonyms_ensembl(ensembl_id):
    """
    Extract synonyms for a given Ensembl ID from the Ensembl REST API.
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
        return sorted(set(synonyms))  # Return deduplicated sorted list
    except Exception as e:
        print(f"Failed to fetch Ensembl synonyms for {ensembl_id}: {e}")
        return []


file1 = Path('/mnt/share/cfdeworkbench/C2M2/ontology/external_CV_reference_files_updated_202412/ensembl_genes.tsv')
file2 = Path('/mnt/share/cfdeworkbench/C2M2/ontology/external-CV-reference-scripts/Ensembl_preprocessing/002_all/ensembl_genes.tsv')
file3 = Path('/mnt/share/cfdeworkbench/C2M2/ontology/C2M2_genes.tsv')

# Combine data from three files
data = read_tsv(file1) + read_tsv(file2) + read_tsv(file3)

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


# Update names if they don’t match the official Ensembl name
for row in conflicted_rows:
    official_name = get_ensembl_official_name(row['id'])
    if official_name and row['name'] != official_name:
        row['name'] = official_name

final_data = filtered_rows + conflicted_rows
final_data.sort(key=lambda x: x['id'])

print(final_data)

results = {}
base_url_bdcw = "https://bdcw.org/geneid/rest/species/hsa/GeneIDType/ENSEMBL/GeneListStr/{}/USE_NCBI_GENE_INFO/0/View/json"

for row in final_data:
    ensembl_id = row['id']
    # Clean synonyms to the desired format
    if 'synonyms' in row:
        # Convert to desired list format with properly quoted values
        synonyms = row['synonyms']
        clean_synonyms = [f'"{syn.strip()}"' for syn in re.split(r',\s*', synonyms.strip('[]"'))]
        row['synonyms'] = f"[{', '.join(clean_synonyms)}]"
        if not row['synonyms']:  # Only process rows with empty synonyms
        # Fetch data from BDCW API
            url_bdcw = base_url_bdcw.format(ensembl_id)
            try:
                response_bdcw = requests.get(url_bdcw)
                response_bdcw.raise_for_status()
                json_data_bdcw = response_bdcw.json()
            # Extract synonyms from BDCW API
                synonyms_bdcw = extract_synonyms_bdcw(json_data_bdcw).get(ensembl_id, [])
            # Fetch synonyms from Ensembl REST API
                synonyms_ensembl = extract_synonyms_ensembl(ensembl_id)
            # Combine and deduplicate synonyms from both sources
                combined_synonyms = sorted(set(synonyms_bdcw + synonyms_ensembl))
            # Update the row with the collected synonyms
                cleaned_synonyms = [f'"{syn}"' for syn in combined_synonyms]
                row['synonyms'] = f"[{', '.join(cleaned_synonyms)}]"
            except Exception as e:
                print(f"Failed to process {ensembl_id}: {e}")

for row in final_data:
    ensembl_id = row['id']
    # Clean synonyms to the desired format
    if 'synonyms' in row:
        row['synonyms'] = re.sub(r'"{2,}', '"', row['synonyms'])  # Replace more than two consecutive quotes
        row['synonyms'] = re.sub(r'"', '', row['synonyms'])  # Replace single quotes
    
    if 'description' in row and row['description'].lower() == "tec" and not row['name']:
        row['description'] = "To be experimentally confirmed"

# Write the final data back to a TSV file
output_file = 'synonyms_resolved.tsv'
with open(output_file, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=final_data[0].keys(), delimiter='\t')
    writer.writeheader()
    writer.writerows(final_data)

print(f"Synonyms saved to {output_file}")

