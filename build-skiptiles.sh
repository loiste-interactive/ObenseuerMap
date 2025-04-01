#!/bin/bash

cd "${0%/*}" # cd to script dir

shopt -s expand_aliases
command -v gsed >/dev/null 2>&1 && alias sed=gsed

commit=$(git rev-parse --short HEAD)

# Remove existing directories
rm -rf dist/res/ dist/locations/

# Create the dist/res directory
mkdir -p dist/res/

# Copy everything from src/res to dist/res except the images directory
for file in $(find src/res -type f -not -path "src/res/images*"); do
    # Get the relative path from src/res
    rel_path=${file#src/res/}
    # Create the directory if it doesn't exist
    mkdir -p "dist/res/$(dirname "$rel_path")"
    # Copy the file
    cp "$file" "dist/res/$rel_path"
done

# Create a symlink for the images directory
ln -sf ../../src/res/images dist/res/images

# Copy index.html and favicon.ico
cp -f src/index.html src/favicon.ico dist/

# replacing internal values with short commit id
sed -i "s/{MAPDEV}/$commit/g" dist/index.html
sed -i "s/{MAPDEV}/$commit/g" dist/res/map-config.js

# renaming existing tiles to match new commit id
mv -f dist/tiles/base-*  dist/tiles/base-$commit 2>/dev/null || true
