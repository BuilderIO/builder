#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

echo "$(jq 'del(.exports."./debug")' package.json)" >package.json
