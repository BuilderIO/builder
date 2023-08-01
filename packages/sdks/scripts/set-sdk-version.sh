#!/bin/bash

# This file updates all `sdk-version.ts` and `sdk-version.js` files in an SDK to the current npm package version.
# It stores the package version that is sent to the visual editor.
#
# This script must execute after `npm version` (which bumps the version number), but before `npm publish`.

set -o nounset

# We expect to run this script from repo root. So we need to `cd` into the correct directory.
# PS: Calling it using 'yarn workspace sdks set-sdk-version' is equivalent to running it from the root.
cd "output/$1"

LOCAL_DIR=$(pwd)
if [[ "$LOCAL_DIR" =~ .*sdks\/output\/[a-z\|-]*$ ]]; then
  echo "Setting SDK Version for '$1' in '$LOCAL_DIR'."
else
  echo "Must run this script from the root of an SDK directory, e.g. 'sdks/output/<sdk-name>'."
  echo "Instead, you ran it from '$LOCAL_DIR'."
  echo "Exiting."
  exit 1
fi

# get version from package.json
VERSION=$(grep -o '"version": *"[^"]*"' package.json | sed 's/"version": "\(.*\)"/\1/')
echo "Found version number: $VERSION"

# create new file content
NEW_FILE_CONTENT="export const SDK_VERSION = \"$VERSION\""

# find all files named sdk-version.js or sdk-version.ts in the current directory (recursively)
FILES=$(find . -type f \( -name "sdk-version.js" -o -name "sdk-version.ts" \))

for FILE in $FILES; do
  echo "Updating $FILE..."

  # replace file content
  echo $NEW_FILE_CONTENT >$FILE

  echo "Updated $FILE."
done
