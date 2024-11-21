# Define file paths
input_file = "synonyms_resolved.tsv"  # Replace with your actual input file path
output_file = "ensembl_id_NA.txt"     # Output file path

# Open the input file and output file
with open(input_file, "r") as infile, open(output_file, "w") as outfile:
    for line in infile:
        # Split the line into ENS ID and synonyms
        ensembl_id, synonyms = line.strip().split("\t")
        # Check if the synonyms match the condition
        if synonyms == "[""NA"", ""NA"", ""NA"", ""NA""]":
            # Write the ENS ID to the output file
            outfile.write(ensembl_id + "\n")

print(f"Filtered ENS IDs written to {output_file}")
