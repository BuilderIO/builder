#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

# Sets debug exports. Useful because when vite builds vue3's async imports, errors get mangled and impossible to debug.
echo "$(jq '.exports."./vue3-debug" = {
      "import": "./packages/_vue3/src/index.js",
      "require": "./packages/_vue3/src/index.js"
    }' package.json)" >package.json
