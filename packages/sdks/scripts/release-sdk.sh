# doing this for each SDK is getting tedious, and I'm lazy.
echo "releasing SDK $1";
cd "output/$1" && npm run release:dev && echo "released $1";
