#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

# Sets `@builder.io/sdk-vue` resolution symlinks in `package.json`
echo "$(jq '.resolutions."@builder.io/sdk-vue" = "link:../../../packages/sdks/output/vue"' package.json)" >package.json
