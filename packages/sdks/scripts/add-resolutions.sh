#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

# Sets `@builder.io/mitosis-cli` resolution symlinks in `../package.json`. Assumes `mitosis` repo lives besides this one.
echo "$(jq '.resolutions."@builder.io/mitosis-cli" = "link:../mitosis/packages/cli" | .resolutions."@builder.io/mitosis" = "link:../mitosis/packages/core"' ../../package.json)" >../../package.json
