#!/bin/bash
# call syntax: ./backup_to_DRC-Portals.sh

set -e

path_to_backup="/home/mano/DRC/DRC-Portals/database/C2M2/OntologyUpdate"

mkdir -p "$path_to_backup"

# Back up the key folder external-CV-reference-scripts
find external-CV-reference-scripts -type f \
  ! -size 0c \
  ! -name '*.out' \
  ! -name '*.err' \
  ! -name '*.err-*' \
  ! -iname '*compound*.tsv*' \
  ! -iname '*substance*.tsv*' \
  \( -size -1M -o -name '*.sh' -o -name '*.bash' -o -iname '*.py' -o -iname '*.r' -o -name '*.pl' -o -iname '*readme*' \) \
  -exec cp --parents -- {} "$path_to_backup" \;

# Back up key files from the current folder
find . -maxdepth 1 -type f \
  ! -size 0c \
  ! -name '*.out' \
  ! -name '*.err' \
  ! -name '*.err-*' \
  ! -iname '*compound*.tsv*' \
  ! -iname '*substance*.tsv*' \
  \( -iname '*readme*' -o -name '*.bat' -o -name '*.sh' \) \
  -exec cp --parents -- {} "$path_to_backup" \;

echo -e "Copied scripts and some small files to ${path_to_backup}";

