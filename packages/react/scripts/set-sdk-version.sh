#!/bin/bash

# This file finds all instances of `UNKNOWN_VERSION_TO_REPLACE` within `dist` and replaces them with the real version.
# It stores the package version that is sent to the visual editor.
#
# This script must execute after `npm version` (which bumps the version number), but before `npm publish`.

set -o nounset

LOCAL_DIR=$(pwd)
if [[ "$LOCAL_DIR" =~ .*packages/react*$ ]]; then
  echo "Setting SDK Version for React Gen1 SDK in '$LOCAL_DIR'."
else
  echo "Must run this script from the root of the React Gen1 SDK directory, e.g. 'packages/react'."
  echo "Instead, you ran it from '$LOCAL_DIR'."
  echo "Exiting."
  exit 1
fi

# get version from package.json
VERSION=$(grep -o '"version": *"[^"]*"' package.json | sed 's/"version": "\(.*\)"/\1/')
echo "Found version number: $VERSION"

# Find all instances of `UNKNOWN_VERSION_TO_REPLACE` within `dist` and replace with the real version
find dist -type f -exec sed -i.bak "s/UNKNOWN_VERSION_TO_REPLACE/$VERSION/g" {} + && find dist -name "*.bak" -type f -delete
