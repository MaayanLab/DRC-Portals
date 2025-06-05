#!/bin/bash
#
# Call syntax: be in the correct folder: C2M2
# ./extract_keyword_phrases.sh <outfile1.txt> <outfile2.txt>
# ./extract_keyword_phrases.sh lines_from_dcc_files_with_keywords.txt lines_from_dcc_files_with_phrase_around_keywords.txt

if [[ $# -lt 2 ]]; then
        echo -e "Usage: $0 <outfile1.txt> <outfile2.txt>";
        exit 1;
fi

# To find all such words in all files in ingest/c2m2s folder: use grep -r:
# Be in the C2M2 folder:

keywords_pipesep_string="gender|inclusion|diversity|equity|lgbt|women|trans-gen|transgen"

OLD_IFS=$IFS
IFS='|'
read -r -a keywords <<< "$keywords_pipesep_string"
IFS=$OLD_IFS

#for word in "${keywords[@]}"; do  echo "$word" ; done

search_path=ingest/c2m2s

#kwf=lines_from_dcc_files_with_keywords.txt
kwf=$1
egrep -r -i -e "${keywords_pipesep_string}" $search_path > "$kwf"
echo -e "Wrote grepped lines to the file $kwf";

# To find which files have these:
# grep diversity lines_from_dcc_files_with_keywords.txt |cut -d':' -f1|sort|uniq
# grep diversity "$kwf" |cut -d':' -f1|sort|uniq

#exit 0

# To replace gender with sex and women with females (account for case and plural forms) 
# in the tsv files accounting for word boundary. This is now called in the README.md
# ./replace_gender_sex_women_female_in_tsvfiles.sh ingest/c2m2s

# Then to find only specific words and up to 5 words before and after the target word (so that it is easy 
# to understand the context without having to read the whole project description, etc).

#keywords=("gender" "inclusion" "diversity" "equity" "lgbt" "women")

#opf=lines_from_dcc_files_with_phrase_around_keywords.txt
opf=$2

option=3

# This does not list the file names

echo "" > "$opf"

if [[ "$option" == "1" ]]; then
    echo "Option is 1: Will print without file name and line number"

    for word in "${keywords[@]}"; do
    echo "================================== Matches for '$word': ===================================" >> "$opf"
    grep -oiP "(\b\w+\b\s+){0,5}$word(\s+\b\w+\b){0,5}" "$kwf" >> "$opf"
    echo -e "\n" >> "$opf"
    done

elif [[ "$option" == "2" ]]; then
    echo "Option is 2: Will print with file name but without line number"

    for word in "${keywords[@]}"; do
    echo "================================== Matches for '$word': ===================================" >> "$opf"
        for file in $(find $search_path -type f -name "*.tsv"); do
            echo -e "\t================ Matches for '$word' in $file: =============" >> "$opf"
            grep -oiP "(\b\w+\b\s+){0,5}$word(\s+\b\w+\b){0,5}" "$file" >> "$opf"
    done
    echo -e "\n"  >> "$opf"
    done

elif [[ "$option" == "3" ]]; then
    echo "Option is 3: Will print with file name and line number"

    # To also add line numbers:
    for word in "${keywords[@]}"; do
        echo "================================== Matches for '$word': ==================================="
        echo "================================== Matches for '$word': ===================================" >> "$opf"

        for file in $(find $search_path -type f -name "*.tsv"); do
            #matches=$(grep -niP ".{0,50}\\b${word}s?\\b.{0,50}" "$file")
            matches=$(grep -niP ".{0,50}${word}.{0,50}" "$file")

            if [[ -n "$matches" ]]; then
                echo -e "\t================ Matches for '$word' in $file: ============="
                echo -e "\t================ Matches for '$word' in $file: =============" >> "$opf"

                echo "$matches" | while IFS=: read -r lineno line; do
                    #echo "$line" | grep -oiP ".{0,50}\\b${word}s?\\b.{0,50}" | while read -r match; do
                    echo "$line" | grep -oiP ".{0,50}${word}.{0,50}" | while read -r match; do
                        echo "Line $lineno: $match" >> "$opf"
                    done
                done
            fi
        done

        echo >> "$opf"
    done

else
  echo "Unknown option"
fi
echo -e "Wrote grepped phrases with file name and line numbers to the file $opf";


#------------------------------
# Do not run
without_across_sentences=0
if [[ "$without_across_sentences" == "1" ]] ; then
    echo "Option is 4: Generally not run"

    for word in "${keywords[@]}"; do
        echo "================================== Matches for '$word': ==================================="
        echo "================================== Matches for '$word': ===================================" >> "$opf"

        for file in $(find . -type f -name "*.tsv"); do
            matches=$(grep -niP "(?:[\\(\[\{\"'\\w,-]+\\s+){0,5}${word}s?(?:\\s+[\\(\[\{\"'\\w,-]+){0,5}" "$file")

            if [[ -n "$matches" ]]; then
                echo -e "\t================ Matches for '$word' in $file: ============="
                echo -e "\t================ Matches for '$word' in $file: =============" >> "$opf"

                echo "$matches" | while IFS=: read -r lineno line; do
                    echo "$line" | grep -oiP "(?:[\\(\[\{\"'\\w,-]+\\s+){0,5}${word}s?(?:\\s+[\\(\[\{\"'\\w,-]+){0,5}" | while read -r match; do
                        echo "Line $lineno: $match" >> "$opf"
                    done
                done
            fi
        done

        echo >> "$opf"
    done
fi

#------------------------------
# Do not run
five_words_before_after=0
if [[ "$five_words_before_after" == "1" ]] ; then
    echo "Option is 5: Generally not run"

    # To also add line numbers:
    for word in "${keywords[@]}"; do
        echo "================================== Matches for '$word': ==================================="
        echo "================================== Matches for '$word': ===================================" >> "$opf"

        for file in $(find $search_path -type f -name "*.tsv"); do
            # Match up to 5 tokens before and after the word, including punctuation and sentence breaks
            matches=$(grep -niP "(?:[\\(\[\{\\\"'\\w,\\-\\.\\?!]+\\s+){0,5}\\b${word}s?\\b(?:\\s+[\\(\[\{\\\"'\\w,\\-\\.\\?!]+){0,5}" "$file")

            if [[ -n "$matches" ]]; then
                echo -e "\t================ Matches for '$word' in $file: ============="
                echo -e "\t================ Matches for '$word' in $file: =============" >> "$opf"

                echo "$matches" | while IFS=: read -r lineno line; do
                    echo "$line" | grep -oiP "(?:[\\(\[\{\\\"'\\w,\\-\\.\\?!]+\\s+){0,5}\\b${word}s?\\b(?:\\s+[\\(\[\{\\\"'\\w,\\-\\.\\?!]+){0,5}" |
                    while read -r match; do
                        echo "Line $lineno: $match" >> "$opf"
                    done
                done
            fi
        done

        echo >> "$opf"
    done
fi
