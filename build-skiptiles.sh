#!/bin/bash

cd "${0%/*}" # cd to script dir

shopt -s expand_aliases
command -v gsed >/dev/null 2>&1 && alias sed=gsed

commit=$(git rev-parse --short HEAD)

rm -rf dist/res/ dist/api/
cp -rf src/res/ dist/res/
cp -rf src/api/ dist/api/
cp -f src/index.html src/favicon.ico dist/

# replacing internal values with short commit id
sed -i "s/{MAPDEV}/$commit/g" dist/index.html
sed -i "s/{MAPDEV}/$commit/g" dist/res/map-v2.js

# renaming existing tiles to match new commit id
mv -f dist/tiles/base-*  dist/tiles/base-$commit
