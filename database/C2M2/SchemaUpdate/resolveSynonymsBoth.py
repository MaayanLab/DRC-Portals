import pandas as pd
import requests
import sys

# Define a function to extract synonyms from the JSON response
def extract_synonyms_bdcw(data):
    """
    Extract synonyms from the JSON response data for the BDCW API.
    Combine GENENAME, REFSEQ, UNIPROT, KEGG fields into a formatted list.
    """
    columns_to_extract = ["GENENAME", "REFSEQ", "UNIPROT", "KEGG"]

    # Convert JSON data into a DataFrame
    df = pd.DataFrame(data)

    # Group by ENSEMBL, deduplicate, and format synonyms
    def format_synonyms(row):
        all_synonyms = [syn for col in row for syn in col if syn]
        return sorted(set(all_synonyms))

    df_synonyms = (
        df.groupby("ENSEMBL")[columns_to_extract]
        .agg(lambda x: sorted(set(filter(None, x))))
        .reset_index()
    )
    df_synonyms["SYNONYMS"] = df_synonyms[columns_to_extract].apply(format_synonyms, axis=1)

    # Return ENSEMBL and synonyms as a dictionary
    return df_synonyms.set_index("ENSEMBL")["SYNONYMS"].to_dict()

# Define a function to extract synonyms from the Ensembl REST API
def extract_synonyms_ensembl(ensembl_id):
    """
    Extract synonyms for a given Ensembl ID from the Ensembl REST API.
    """
    server = "https://rest.ensembl.org"
    ext = f"/xrefs/id/{ensembl_id}"

    try:
        r = requests.get(server + ext, headers={"Content-Type": "application/json"})
        r.raise_for_status()
        decoded = r.json()
        synonyms = [item.get("synonyms", []) for item in decoded if "synonyms" in item]
        # Flatten the list of synonyms
        return sorted(set(syn for sublist in synonyms for syn in sublist))
    except Exception as e:
        print(f"Failed to fetch Ensembl synonyms for {ensembl_id}: {e}")
        return []

# Read the input file with the list of Ensembl IDs
input_file = "no_synonym_ids_1001.txt"
ensembl_ids = pd.read_csv(input_file, sep="\t")["id"]

# Initialize a dictionary to store results
results = {}

# Iterate through each Ensembl ID and fetch data from both APIs
base_url_bdcw = "https://bdcw.org/geneid/rest/species/hsa/GeneIDType/ENSEMBL/GeneListStr/{}/USE_NCBI_GENE_INFO/0/View/json"
for ensembl_id in ensembl_ids:
    try:
        # Fetch data from the BDCW API
        print(ensembl_id, flush=True)
        url_bdcw = base_url_bdcw.format(ensembl_id)
        response_bdcw = requests.get(url_bdcw)
        response_bdcw.raise_for_status()
        json_data_bdcw = response_bdcw.json()

        # Extract synonyms from BDCW API
        synonyms_bdcw = extract_synonyms_bdcw(json_data_bdcw).get(ensembl_id, [])

        # Fetch synonyms from the Ensembl REST API
        synonyms_ensembl = extract_synonyms_ensembl(ensembl_id)

        # Combine and deduplicate synonyms from both sources
        combined_synonyms = sorted(set(synonyms_bdcw + synonyms_ensembl))

        # Store the results
        results[ensembl_id] = combined_synonyms
    except Exception as e:
        print(f"Failed to process {ensembl_id}: {e}")

# Prepare results for saving

final_data = [
    {
        "ENSEMBL": ensembl_id,
        "SYNONYMS": "[" + ", ".join([f'"{syn}"' for syn in synonyms]) + "]"
    }
    for ensembl_id, synonyms in results.items()
]

# Convert results to a DataFrame
final_df = pd.DataFrame(final_data)

# Save the results to a TSV file
output_file = "synonyms_resolved_both.tsv"
final_df.to_csv(output_file, sep="\t", index=False)

print(f"Synonyms saved to {output_file}")


# Convert results to a DataFrame
final_df = pd.DataFrame(final_data)

# Save the results to a TSV file
output_file = "synonyms_resolved.tsv"
final_df.to_csv(output_file, sep="\t", index=False)

print(f"Synonyms saved to {output_file}")


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

# Initialize the results dictionary for populated synonyms
results = {}
base_url_bdcw = "https://bdcw.org/geneid/rest/species/hsa/GeneIDType/ENSEMBL/GeneListStr/{}/USE_NCBI_GENE_INFO/0/View/json"

# Process each entry in final_data to populate synonyms
for row in final_data:
    ensembl_id = row['id']
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
            row['synonyms'] = f"[{', '.join([f'"{syn}"' for syn in combined_synonyms])}]"
        except Exception as e:
            print(f"Failed to process {ensembl_id}: {e}")

# Show the output for verification
print(final_data)

# Write the final data back to a TSV file
output_file = 'synonyms_resolved.tsv'
with open(output_file, mode='w', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=final_data[0].keys(), delimiter='\t')
    writer.writeheader()
    writer.writerows(final_data)

print(f"Synonyms saved to {output_file}")