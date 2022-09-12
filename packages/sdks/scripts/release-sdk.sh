# doing this for each SDK is getting tedious, and I'm lazy.
echo "releasing $2 version of SDK $1";
cd "output/$1" && npm run release:$2 && echo "released $1";
