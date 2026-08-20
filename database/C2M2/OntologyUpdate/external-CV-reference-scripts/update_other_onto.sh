#!/bin/bash

# To update ontology files (e.g., doid.obo) from GitHub or other sources.
#
# Usage:
#   ./update_other_onto.sh [outdir]
# OR
#   ./update_other_onto.sh [outdir] 2>&1 | tee <logfname>
#
# If outdir is omitted, the default is:
#   ../external_CV_reference_files_updated

set -euo pipefail

outdir="${1:-../external_CV_reference_files_updated}"
# The above line for outdir is a compact form of:
#if [[ $# -lt 1 ]]; then
#    outdir="../external_CV_reference_files_updated"
#else
#    outdir="$1"
#fi

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create the output folder if it doesn't exist.
mkdir -p "$SCRIPT_DIR/$outdir"
readonly outdir_abs="$(cd "$SCRIPT_DIR/$outdir" && pwd)"

failed_downloads=0

###############################################################################
# Download an ontology file.
#
# Parameters:
#   $1 - Ontology name (used in output filename)
#   $2 - Format version
#   $3 - Data/release version
#   $4 - Raw download URL
#   $5 - File extension (obo, owl, tsv, csv, etc.)
###############################################################################
download_file() {
    local ontology="$1"
    local format_version="$2"
    local data_version="$3"
    local url="$4"
    local ext="$5"

    local outfile="${outdir_abs}/${ontology}_v${format_version}_r${data_version}.${ext}"

    printf "Downloading %s...\n" "$ontology"

    if curl -fL --retry 3 -o "$outfile" "$url"; then
        printf "Saved to %s\n\n" "$outfile"
    else
        printf "ERROR downloading %s\n" "$ontology" >&2
        printf "URL: %s\n\n" "$url" >&2
        return 1
    fi
}

echo "----------------------------------- Processing started -----------------------------------";
date

###############################################################################
# Disease Ontology (DO)
#
# GitHub: https://github.com/DiseaseOntology/HumanDiseaseOntology/blob/main/src/ontology/doid.obo
#
# Raw URL: https://raw.githubusercontent.com/DiseaseOntology/HumanDiseaseOntology/refs/heads/main/src/ontology/doid.obo
###############################################################################

data_version="2026-07-31"
format_version="1.2"
ontology_name="doid"
ontology_format="obo"
raw_url="https://raw.githubusercontent.com/DiseaseOntology/HumanDiseaseOntology/refs/heads/main/src/ontology/doid.obo"

redownload_DO=1
if [[ $redownload_DO -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
        #echo "Continuing with remaining downloads..."
    fi
fi

###############################################################################
# EDAM Ontology (EDAM)
#
# GitHub:
# 
#
# Raw URL: https://edamontology.org/EDAM_1.25.tsv 
###############################################################################

data_version="2020-06-18"
format_version="1.25"
ontology_name="EDAM"
ontology_format="tsv"
raw_url="https://edamontology.org/EDAM_1.25.tsv"

redownload_EDAM=0
if [[ $redownload_EDAM -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
    fi
fi

###############################################################################
# Human Phenotype (HP)
#
# Main: http://purl.obolibrary.org/obo/hp.obo
# GitHub: https://github.com/obophenotype/human-phenotype-ontology/blob/master/hp.obo
#
# Raw URL: https://raw.githubusercontent.com/obophenotype/human-phenotype-ontology/refs/heads/master/hp.obo
###############################################################################

data_version="2026-06-23"
format_version="1.2"
ontology_name="hp"
ontology_format="obo"
raw_url="https://raw.githubusercontent.com/obophenotype/human-phenotype-ontology/refs/heads/master/hp.obo"

redownload_HP=1
if [[ $redownload_HP -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
    fi
fi

###############################################################################
# Mammalian Phenotype (MP)
#
# Main: 
# GitHub: 
#
# Raw URL: https://www.informatics.jax.org/downloads/reports/MPheno_OBO.ontology 
###############################################################################

data_version="2026-07-22"
format_version="1.2"
ontology_name="MPO"
ontology_format="obo"
raw_url="https://www.informatics.jax.org/downloads/reports/MPheno_OBO.ontology"

redownload_MPO=1
if [[ $redownload_MPO -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
    fi
fi

###############################################################################
# OBI
#
# Main: 
# GitHub: https://github.com/obi-ontology/obi/blob/master/views/obi.obo 
#
# Raw URL: https://raw.githubusercontent.com/obi-ontology/obi/refs/heads/master/views/obi.obo
# Once the latest obo for OBI is downloaded, you can check if all terms in the 
# provisional OBI are now part of mature OBI
# Example command: modify filenames as needed, run it just as one-off command rather 
# than as part of a script.
# grep -Fvwf <(grep '^id:' obi_v1.2_r2026-07-27.obo | cut -d' ' -f2) <(tail -n +2 OBI.provisional_terms.2024-08-22.tsv | cut -f3,4)
# Terms that are part of the mature OBI
# awk -F': ' '/^id:/ {id=$2} /^name:/ {print id "\t" $2}' obi_v1.2_r2026-07-27.obo | grep -Fwf <(tail -n +2 OBI.provisional_terms.2024-08-22.tsv | cut -f3)
###############################################################################

data_version="2026-07-27"
format_version="1.2"
ontology_name="obi"
ontology_format="obo"
raw_url="https://raw.githubusercontent.com/obi-ontology/obi/refs/heads/master/views/obi.obo"

redownload_OBI=1
if [[ $redownload_OBI -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
    fi
fi

###############################################################################
# Uberon
#
# Main: 
# GitHub: https://github.com/obophenotype/uberon/blob/master/uberon.obo
#
# Raw URL: https://raw.githubusercontent.com/obophenotype/uberon/refs/heads/master/uberon.obo
###############################################################################

data_version="2026-06-19"
format_version="1.2"
ontology_name="uberon"
ontology_format="obo"
raw_url="https://raw.githubusercontent.com/obophenotype/uberon/refs/heads/master/uberon.obo"

redownload_UBERON=1
if [[ $redownload_UBERON -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
    fi
fi

###############################################################################
# cl
#
# Main: 
#
# Raw URL:https://purl.obolibrary.org/obo/cl.obo 
###############################################################################

data_version="2026-06-08"
format_version="1.2"
ontology_name="cl"
ontology_format="obo"
raw_url="https://purl.obolibrary.org/obo/cl.obo"

redownload_cl=1
if [[ $redownload_cl -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
    fi
fi

###############################################################################
# clo
#
# Main:http://purl.obolibrary.org/obo/clo.owl
#
# Raw URL:https://raw.githubusercontent.com/CLO-ontology/CLO/master/clo.owl
###############################################################################

data_version="2026-06-19"
format_version="1.0"
ontology_name="clo"
ontology_format="owl"
raw_url="https://raw.githubusercontent.com/CLO-ontology/CLO/master/clo.owl"

redownload_clo=1
if [[ $redownload_clo -eq 1 ]]; then
    if ! download_file \
        "$ontology_name" "$format_version" "$data_version" "$raw_url" "$ontology_format"
    then
        ((failed_downloads++))
    fi
fi

###############################################################################
# Summary
###############################################################################

printf "\nDownloaded ontology files to:\n"
printf "  Relative path : %s\n" "$outdir"
printf "  Absolute path : %s\n" "$outdir_abs"
printf "  Failed downloads: %d\n\n" "$failed_downloads"

exit "$failed_downloads"
