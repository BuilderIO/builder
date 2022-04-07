#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

# Removes `@builder.io/sdk-vue` resolution from the list of resolutions in `package.json``
echo "$(jq 'del(.resolutions."@builder.io/sdk-vue")' package.json)" >package.json
