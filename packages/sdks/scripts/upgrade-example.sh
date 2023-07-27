# doing this for each SDK is getting tedious, and I'm lazy.
VERSION=${2:-'latest'}
SDK_NAME=$(if [[ $1 = 'nextjs' ]]; then echo "react-nextjs"; else echo $1; fi)

echo "Upgrading @builder.io/sdk-$SDK_NAME@$VERSION usage in examples."

cd "../../" && npm run update-npm-dependency -- --force-lib-upgrade --lib="@builder.io/sdk-$SDK_NAME" --version=$VERSION
