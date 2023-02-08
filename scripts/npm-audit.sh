#!/bin/bash
set -eou pipefail

export NVM_DIR=$HOME/.nvm;
# shellcheck source=/dev/null
source "$NVM_DIR/nvm.sh";
# default to project root node version
nvm use

for dir in ./{examples,packages}/*; do
  if [ -d "$dir" ]; then
  (
    cd "$dir"

    # use node version if .nvmrc exists
    if [ -f .nvmrc ]; then
      nvm use
    fi

    # use yarn if yarn.lock exists
    if [ -f yarn.lock ]; then
      echo "Installing dependencies in $dir"
      yarn install || exit 0

      echo "Running 'yarn audit fix' in $dir"
      yarn audit fix || exit 0
    else
      echo "Installing dependencies in $dir"
      npm install || exit 0

      echo "Running 'npm audit fix' in $dir"
      npm audit fix || exit 0
    fi
  )
  fi
done
