import pandas as pd
import requests

# Define a function to extract synonyms from the JSON response
def extract_synonyms(data):
    """
    Extract synonyms from the JSON response data.
    Combine GENENAME, REFSEQ, UNIPROT, KEGG fields into a formatted list.
    """
    columns_to_extract = ["GENENAME", "REFSEQ", "UNIPROT", "KEGG"]

    # Convert JSON data into a DataFrame
    df = pd.DataFrame(data)

    # Group by ENSEMBL, deduplicate, and format synonyms
    def format_synonyms(row):
        all_synonyms = [f'"{syn}"' for col in row for syn in col if syn]
        return f"[{', '.join(all_synonyms)}]"

    df_synonyms = (
        df.groupby("ENSEMBL")[columns_to_extract]
        .agg(lambda x: sorted(set(filter(None, x))))
        .reset_index()
    )
    df_synonyms["SYNONYMS"] = df_synonyms[columns_to_extract].apply(format_synonyms, axis=1)

    # Return ENSEMBL and formatted synonyms
    return df_synonyms[["ENSEMBL", "SYNONYMS"]]

# Read the input file with the list of Ensembl IDs
input_file = "testinput.txt"
ensembl_ids = pd.read_csv(input_file, sep="\t")["id"]

# Initialize a list to store results
results = []

# Iterate through each Ensembl ID and fetch data
base_url = "https://bdcw.org/geneid/rest/species/hsa/GeneIDType/ENSEMBL/GeneListStr/{}/USE_NCBI_GENE_INFO/0/View/json"
for ensembl_id in ensembl_ids:
    try:
        # Fetch data from the API
        url = base_url.format(ensembl_id)
        response = requests.get(url)
        response.raise_for_status()

        # Parse the JSON response
        json_data = response.json()

        # Extract synonyms
        synonyms_df = extract_synonyms(json_data)
        results.append(synonyms_df)
    except Exception as e:
        print(f"Failed to process {ensembl_id}: {e}")

# Combine all results into a single DataFrame
if results:
    final_df = pd.concat(results, ignore_index=True)

    # Save the results to a TSV file
    output_file = "test_resolved.tsv"
    final_df.to_csv(output_file, sep="\t", index=False)
    print(f"Synonyms saved to {output_file}")
else:
    print("No results were processed successfully.")
