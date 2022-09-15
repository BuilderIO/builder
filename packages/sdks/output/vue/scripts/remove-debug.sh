#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

echo "$(jq 'del(.exports."./vue3-debug")' package.json)" >package.json
