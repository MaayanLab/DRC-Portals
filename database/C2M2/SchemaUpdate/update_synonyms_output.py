import pandas as pd

# File paths
output_file = "output.tsv"
synonyms_resolved_file = "synonyms_resolved_both.tsv"
updated_output_file = "updated_output.tsv"

# Read the TSV files into pandas dataframes
output_df = pd.read_csv(output_file, sep="\t")
synonyms_resolved_df = pd.read_csv(synonyms_resolved_file, sep="\t", names=["ENSEMBL", "SYNONYMS"])

# Create a dictionary mapping ENSEMBL IDs to their synonyms
synonyms_dict = synonyms_resolved_df.set_index("ENSEMBL")["SYNONYMS"].to_dict()

# Update the 'synonyms' column in output_df
def update_synonyms(row):
    ensembl_id = row['id']
    if ensembl_id in synonyms_dict:
        return synonyms_dict[ensembl_id]
    return row['synonyms']

output_df["synonyms"] = output_df.apply(update_synonyms, axis=1)

# Save the updated dataframe to a new file
output_df.to_csv(updated_output_file, sep="\t", index=False)

print(f"Updated output saved to {updated_output_file}")
