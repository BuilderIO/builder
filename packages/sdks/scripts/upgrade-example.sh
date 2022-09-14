# doing this for each SDK is getting tedious, and I'm lazy.
VERSION=${2:-'latest'}    
echo "Upgrading SDK $1@$VERSION usage in examples";

cd "../../" && npm run update-npm-dependency -- --force-lib-upgrade --lib="@builder.io/sdk-$1" --version=$VERSION