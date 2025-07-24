#!/bin/bash
#
# Call syntax: be in the correct folder: C2M2
# ./replace_gender_sex_women_female_in_tsvfiles.sh <search_path>
# ./replace_gender_sex_women_female_in_tsvfiles.sh ingest/c2m2s

if [[ $# -lt 1 ]]; then
        echo -e "Usage: $0 <search_path>";
        exit 1;
fi

#search_path=ingest/c2m2s
search_path="$1"

# To replace gender with sex and women with females (account for case and plural forms) 
# in the tsv files accounting for word boundary
find ${search_path} -type f -name "*.tsv" -print0 | while IFS= read -r -d '' file; do
    echo -e "======== File:${file} =======";
    # Comment/uncomment as fit if doing it in several rounds
    perl -i -pe 's/\bgenders\b/sexes/g; s/\bGenders\b/Sexes/g; s/\bgender\b/sex/g; s/\bGender\b/Sex/g;' "$file"
    # To also replace Women by Females, & Woman by Female
    # Mano: 2025/04/11: Don't replace Women
    # perl -i -pe 's/\bWomen\b/Females/g; s/\bwomen\b/females/g; s/\bWoman\b/Female/g; s/\bwoman\b/female/g;' "$file"
    # Replace diversity with 'intrinsic variation'
    perl -i -pe 's/\bdiversity\b/intrinsic variation/g; s/\bchemodiversity\b/chemo intrinsic variation/g;' "$file"
    #perl -i -pe 's/\bchemodiversity\b/chemo intrinsic variation/g;' "$file"
done

