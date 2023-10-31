set -eo nounset

DIST_TAG=$1
SDK=$2

function version {
  echo "Bumping @builder.io/$1@$DIST_TAG..."

  cd "output/$1"

  if [[ "$DIST_TAG" == 'dev' ]]; then
    npm version prerelease
  else
    npm version $DIST_TAG
  fi

  echo "Bumped @builder.io/$1@$DIST_TAG."
}

if [[ "$SDK" == 'all' ]]; then
  echo "Bumping all SDKs with tag $DIST_TAG."
  for i in nextjs svelte react-native solid qwik react vue; do
    # run these loop commands in parallel
    version $i &
  done
  # wait for all the parallel commands to finish
  wait
else
  if [[ "$DIST_TAG" == 'dev' ]]; then
    version $SDK
  else
    echo "Error: cannot release $VERSION version of only one SDK. You must release all SDKs at once to keep them in sync."
    echo "Error: only 'dev' versions are allowed to be released on a per-SDK basis."
    echo "Error: please run 'yarn version:all:$VERSION' to bump all SDKs, or 'yarn version-sdks dev $SDK' to release a dev version of $SDK."
    echo "Exiting."
    exit 1
  fi
fi
