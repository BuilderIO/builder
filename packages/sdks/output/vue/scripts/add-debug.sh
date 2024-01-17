#!/bin/bash
# You'll need to install `jq`: https://stedolan.github.io/jq/

# Sets debug exports. Useful because when vite builds vue's async imports, errors get mangled and impossible to debug.
echo "$(jq '.exports."./debug" = {
      "import": "./packages/src/index.js",
      "require": "./packages/src/index.js"
    }' package.json)" >package.json
