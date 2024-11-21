import pandas as pd

# Function to clean and format synonyms
def format_synonyms(synonyms):
    try:
        # Replace excessive quotes and handle the string as a list
        cleaned = synonyms.replace('""""', '"').replace('""', '"')
        # Convert the cleaned string to a list
        items = eval(cleaned)  # Safely evaluate as Python list
        # Wrap each item in double quotes
        return [f'"{item.strip()}"' for item in items]
    except Exception as e:
        print(f"Error processing synonyms: {synonyms}\n{e}")
        return []

# Read the input file
input_file = "testInput.tsv"
df = pd.read_csv(input_file, sep="\t", engine="python", lineterminator="\n")

# Clean the synonyms column
df["synonyms"] = df["synonyms"].apply(format_synonyms)

# Write the cleaned data to output file
output_file = "cleaned_output.tsv"
df.to_csv(output_file, sep="\t", index=False)

print(f"Cleaned data written to {output_file}")
