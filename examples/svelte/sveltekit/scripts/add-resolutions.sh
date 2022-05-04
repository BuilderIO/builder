#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

# Sets `@builder.io/sdk-vue` resolution symlinks in `package.json`
echo "$(jq '.resolutions."@builder.io/sdk-svelte" = "link:../../../packages/sdks/output/svelte"' package.json)" >package.json
