#!/bin/bash

stdW=4096
stdH=4096

GREY='\033[1;37m'
DGREY='\033[1;30m'
RED='\033[1;31m'
GREEN='\033[1;32m'
PURPLE='\033[1;35m'
NC='\033[0m'

die() {
	echo -e "${RED}$@${NC}"
	exit 1
}

checkDep() {
    for prog in "$@"; do
        command -v $prog >/dev/null 2>&1 || die "Please install these dependencies first: $@"
    done
}

checkDep sed parallel gdal2tiles.py identify find mogrify

shopt -s expand_aliases
command -v gsed >/dev/null 2>&1 && alias sed=gsed

cd "${0%/*}" # cd to script dir
cd layers

echo "preparing..."

# checking that we have correct source images first
read baseW  baseH  <<< $(identify -format '%w %h' base.png)

if [[
		"$baseW"  != "$stdW" || "$baseH"  != "$stdH"

	]]
then
	die "layer(s) size is incorrect, correct size is ${stdW}x${stdH}"
fi

echo "generating tiles (this will take some time)..."

# running tasks in parallel (based on a number of your cpu cores)
echo 'gdal2tiles.py -p raster -w none base.png base' | parallel --bar --halt now,fail=1 :::: || die "tiles generation failed"

find base -iname '*.png' -exec mogrify -format jpg -quality 80 {} +
find base -iname '*.png' -delete

if [ "$1" == "dev" ]; then
	mkdir ../src/root/tiles
	mv base ../src/root/tiles/base-{MAPDEV}
else
	commit=$(git rev-parse --short HEAD)

	rm -rf ../dist
	mkdir -p ../dist/tiles
	mv base ../dist/tiles/base-$commit

	cd ..

	cp -r src/res/ dist/res/
	cp -r src/locations/ dist/locations/
	cp src/index.html src/favicon.ico src/locations* dist/

	# replacing internal values with short commit id
	sed -i "s/{MAPDEV}/$commit/g" dist/index.html
	sed -i "s/{MAPDEV}/$commit/g" dist/res/map-v2.js
fi
