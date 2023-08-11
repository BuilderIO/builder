set -eo nounset

# doing this for each SDK is getting tedious, and I'm lazy.
VERSION=${2:-'patch'}

LOOP=${3:-'not-loop'}

if [[ "$VERSION" != 'dev' && "$LOOP" == 'not-loop' ]]; then
  echo "Error: cannot release $VERSION version of only one SDK. You must release all SDKs at once to keep them in sync."
  echo "Error: only 'dev' versions are allowed to be released on a per-SDK basis."
  echo "Error: please run 'yarn release:all:$VERSION' to release all SDKs, or 'yarn release-sdk $1 dev' to release a dev version of $1."
  echo "Exiting."
  exit 1
fi

echo "Releasing a new '$VERSION' version of '$1' SDK."

cd "output/$1"

# bump the version number

if [[ "$VERSION" == 'dev' ]]; then
  npm version prerelease
else
  npm version $VERSION
fi

echo "Building SDK..."
yarn nx build

echo "Publishing SDK..."

if [[ "$VERSION" == 'dev' ]]; then
  npm publish --tag dev
else
  npm publish
fi

echo "released $1!"
