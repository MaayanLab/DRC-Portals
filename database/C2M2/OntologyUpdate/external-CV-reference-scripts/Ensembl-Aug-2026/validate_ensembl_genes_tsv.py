##!/usr/bin/env python3

"""
Validate a gene TSV file.

Checks:
  - Exactly 5 columns.
  - id matches ENSG[0-9]+
  - synonyms is a valid Python list of strings.
  - organism matches NCBI:txid[0-9]+

Usage:
    python validate_gene_tsv.py input.tsv
"""

import ast
import csv
import re
import sys
from pathlib import Path

EXPECTED_COLUMNS = 5

ID_RE = re.compile(r"^ENSG\d+$")
TAXON_RE = re.compile(r"^NCBI:txid\d+$")


def error(lineno, msg):
    print(f"Line {lineno}: ERROR - {msg}")


def main():

    if len(sys.argv) != 2:
        print(f"Usage: {Path(sys.argv[0]).name} <input.tsv>", file=sys.stderr)
        return 2

    infile = sys.argv[1]
    bad = 0

    with open(infile, encoding="utf-8", newline="") as fh:

        reader = csv.reader(fh, delimiter="\t")

        try:
            header = next(reader)
        except StopIteration:
            print("ERROR: Empty file.", file=sys.stderr)
            return 1

        for lineno, row in enumerate(reader, start=2):

            if len(row) != EXPECTED_COLUMNS:
                error(lineno,
                      f"Expected {EXPECTED_COLUMNS} columns, found {len(row)}")
                print("    " + "\t".join(row))
                bad += 1
                continue

            gene_id, name, description, synonyms, organism = row

            #
            # Validate gene ID
            #
            if not ID_RE.fullmatch(gene_id):
                error(lineno, f"Invalid id: {gene_id}")
                bad += 1

            #
            # Validate organism
            #
            if not TAXON_RE.fullmatch(organism):
                error(lineno, f"Invalid organism: {organism}")
                bad += 1

            #
            # Validate synonyms
            #
            try:
                value = ast.literal_eval(synonyms)

                if not isinstance(value, list):
                    raise ValueError("not a list")

                if not all(isinstance(x, str) for x in value):
                    raise ValueError("contains non-string values")

            except Exception as e:
                error(lineno, f"Invalid synonyms: {e}")
                print(f"    {synonyms}")
                bad += 1

    if bad:
        print(f"\nValidation FAILED: {bad} error(s).")
        return 1

    print("Validation PASSED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

