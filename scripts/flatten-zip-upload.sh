#!/usr/bin/env bash
set -euo pipefail

# Move files from a single nested folder (common after ZIP upload)
# into the current directory, without overwriting existing files.
#
# Usage:
#   ./scripts/flatten-zip-upload.sh <nested-folder>
# Example:
#   ./scripts/flatten-zip-upload.sh Discord-Bot-Template-01

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <nested-folder>"
  exit 1
fi

SOURCE_DIR="$1"
TARGET_DIR="$(pwd)"

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Error: '$SOURCE_DIR' is not a directory in $(pwd)"
  exit 1
fi

shopt -s dotglob nullglob

items=("$SOURCE_DIR"/*)
if [[ ${#items[@]} -eq 0 ]]; then
  echo "Nothing to move. '$SOURCE_DIR' is empty."
  exit 0
fi

for item in "${items[@]}"; do
  base="$(basename "$item")"
  dest="$TARGET_DIR/$base"

  if [[ -e "$dest" ]]; then
    echo "Skipping '$base' (already exists in target)"
    continue
  fi

  mv "$item" "$TARGET_DIR/"
  echo "Moved: $base"
done

# Remove source folder if empty
rmdir "$SOURCE_DIR" 2>/dev/null || true

echo "Done. Review files, then run: npm install && npm run check"
