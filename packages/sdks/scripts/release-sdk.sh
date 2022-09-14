# doing this for each SDK is getting tedious, and I'm lazy.
VERSION=${2:-'patch'}    
echo "releasing $VERSION version of SDK $1";
cd "output/$1" && npm run release:$VERSION && echo "released $1";
