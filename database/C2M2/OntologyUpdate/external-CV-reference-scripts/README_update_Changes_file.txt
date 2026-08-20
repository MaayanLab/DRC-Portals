To update the Update listing in the Changes file in the folder where final updated master ontology files are kept,
ChatGPT was used with the following prompt:

I am updating a set of files and creating/updating a Changes file that records what changed between the previous and current versions.

On Linux, I generated the current and previous file listings using:

    ls -al

The current listing contains files such as:

-rw-rw-r--.  1 mano drc  2611387591 Aug  5 13:17 compound.2026-07-27.tsv.gz
-rw-rw-r--.  1 mano drc     7192337 Aug 10 17:22 doid_v1.2_r2026-07-31.obo
-rw-rw-r--.  1 mano drc     9614849 Aug 13 16:26 ensembl_genes.2026-08-13.tsv
-rw-rw-r--.  1 mano drc     6975 Aug 19 15:30 OBI.provisional_terms.2026-08-19.tsv
-rw-r--r--.  1 mano drc  2252643946 Aug 19 12:39 protein_v2026.02_r2026-06-10.tsv.gz
-rw-rw-r--.  1 mano drc  4725820008 Aug  5 13:19 substance.2026-07-27.tsv.gz
-rw-rw-r--.  1 mano drc    22414082 Aug 10 17:22 uberon_v1.2_r2026-06-19.obo

The corresponding previous-year listing was also generated with `ls -al` and contained, for example:

-rw-rw-r--.  1 mano mano 2535625228 Aug 20  2025 compound.2025-08-11.tsv.gz
-rw-r--r--.  1 mano mano    6934648 Aug 15  2025 doid_v1.2_r2025-08-01.obo
-rw-rw-r--.  1 mano mano    9587288 Aug 20  2025 ensembl_genes.2025-08-20.tsv
-rw-r--r--.  1 mano mano    1561189 Aug 15  2025 obi_v1.2_r2025-07-28.obo
-rw-r--r--.  1 mano mano 3940308719 Aug 16  2025 protein_v2025.03_r2025-06-18.tsv.gz
-rw-rw-r--.  1 mano mano 4409366077 Aug 20  2025 substance.2025-08-11.tsv.gz
-rw-r--r--.  1 mano mano   22742453 Aug 15  2025 uberon_v1.2_r2025-05-28.obo

My previous Changes file contained entries such as:

compound.2025-08-11.tsv.gz - Updated from compound.2024-11-26.tsv.gz
doid_v1.2_r2025-08-01.obo - Updated from doid.version_2024-11-01.obo
ensembl_genes.2025-08-20.tsv - Updated from ensembl_genes.2024-08-18.tsv - Changed from Ensembl release 113 to 114
hp_v1.2_r2025-05-06.obo - Updated from hp.2024-08-13.obo
OBI.provisional_terms.2026-08-19.tsv - Updated from OBI.provisional_terms.2024-08-22.tsv
obi_v1.2_r2025-07-28.obo - Updated from OBI.version_2024-10-25.obo
protein_v2025.03_r2025-06-18.tsv.gz - Updated from protein.2024-11-22.tsv.gz
substance.2025-08-11.tsv.gz - Updated from substance.2024-11-26.tsv.gz
uberon_v1.2_r2025-05-28.obo - Updated from uberon.version_2024-09-03.obo

Other entries in the Changes file identify files that have not changed, for example:

EDAM_v1.25_r2020-06-18.tsv - No change
hp.phenotype_to_genes.txt - No change
ncbi_taxonomy.tsv.gz - No change (NCBI taxonomy terms downloaded on 3/2/2023)
Interlex_data_type.2023-03-02.tsv - No change

Please update the Changes entries from the previous year to reflect the current 2026 files.

Use the current and previous `ls -al` listings to determine which files were updated and which files remain unchanged. Several files may still be unchanged since 2024 or earlier, as indicated by their filenames, timestamps, and/or sizes.

For updated files:
- Update the current filename.
- Identify the previous version from the 2025 listing or the existing Changes entry.
- Preserve useful descriptions such as Ensembl release changes.
- For files that are clearly unchanged, retain `No change`.
- For reference-data directories such as `sample_pubchem_reference_data` and `sample_uniprot_reference_data`, describe the underlying dataset update rather than changing the directory name.
- Do not mention filesystem ownership or permission changes unless they are relevant to the actual data update.

Return the complete updated set of Changes entries, ready to paste into the Changes file.

