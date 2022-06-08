# doing this for each SDK is getting tedious, and I'm lazy.
echo "Upgrading SDK $1 usage in examples";
cd "../../" && npm run update-npm-dependency -- --force-lib-upgrade --lib="@builder.io/sdk-$1" --version=dev
