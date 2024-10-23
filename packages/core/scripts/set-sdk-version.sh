#!/bin/bash

# This file updates all `sdk-version.ts` and `sdk-version.js` files in an SDK to the current npm package version.
# It stores the package version that is sent to the visual editor.
#
# This script must execute after `npm version` (which bumps the version number), but before `npm publish`.

set -o nounset

LOCAL_DIR=$(pwd)
if [[ "$LOCAL_DIR" =~ .*packages/core*$ ]]; then
  echo "Setting SDK Version for Gen1 SDK Core in '$LOCAL_DIR'."
else
  echo "Must run this script from the root of the Gen1 SDK Core directory, e.g. 'packages/core'."
  echo "Instead, you ran it from '$LOCAL_DIR'."
  echo "Exiting."
  exit 1
fi

# get version from package.json
VERSION=$(grep -o '"version": *"[^"]*"' package.json | sed 's/"version": "\(.*\)"/\1/')
echo "Found version number: $VERSION"

#  find all instances of UNKNOWN_VERSION_TO_REPLACE and replace with the real version
find dist -type f -exec grep -l "UNKNOWN_VERSION_TO_REPLACE" {} + | xargs sed -i '' "s/UNKNOWN_VERSION_TO_REPLACE/$VERSION/g"
