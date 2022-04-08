#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

# Remove `@builder.io/mitosis-cli` resolution from the list of resolutions in `package.json``
# This is needed in CI since we don't currently have the mitosis repo locally existing in this one.
echo "$(jq 'del(.resolutions."@builder.io/mitosis-cli",.resolutions."@builder.io/mitosis")' package.json)" >package.json
