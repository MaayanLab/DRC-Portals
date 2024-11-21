import pandas as pd
import ast

# Input and output file paths
input_file = "testinput.tsv"
output_file = "cleaned_output.tsv"

# Read the file into a pandas dataframe
df = pd.read_csv(input_file, sep="\t")

# Function to clean and transform the synonyms column
def clean_synonyms(synonyms):
    try:
        # Convert the string to a Python list using ast.literal_eval
        synonyms_list = ast.literal_eval(synonyms)
        
        # Format each synonym with double quotes and ensure proper list formatting
        cleaned_list = [f'"{syn.strip()}"' for syn in synonyms_list]
        
        # Return the cleaned list as a properly formatted string enclosed in square brackets
        return f"[{', '.join(cleaned_list)}]"
    except Exception as e:
        print(f"Error processing synonyms: {synonyms}, Error: {e}")
        return "[]"

# Apply the cleaning function to the synonyms column
df["synonyms"] = df["synonyms"].apply(clean_synonyms)

# Save the updated dataframe to a new file
df.to_csv(output_file, sep="\t", index=False)

print(f"Processed file saved to {output_file}")
