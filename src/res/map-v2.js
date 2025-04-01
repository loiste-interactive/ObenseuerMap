// WARNING!
// this code is bad and full of shit
// must be careful not to go too deep

function setHash(str) {
	if ("replaceState" in history) {
	    history.replaceState(undefined,undefined,'#' + str);
	} else {
	    location.hash = '#' + str;
	}
}

function removeHash() {
    var scrollV, scrollH, loc = window.location;
    if ("replaceState" in history)
    	history.replaceState({}, document.title, ".");
    else {
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;
        loc.hash = "";
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}

const DEFAULT = 0;

function addLocation(location) {

	switch(location.type) {
		default:
			location.class = 'location';
	}
	location.html = '<h2 class="location-title"><img src="res/images/icons/' + location.icon + '" style="width:32px;height:32px;vertical-align:middle">' + location.name + '</h2><div>';

	//console.log(location.html);
	//console.log(locationClass);

	if (typeof location.sublocs === 'object') {
		location.sublocs.forEach(sublocation => {
			location.html += '<div class="sublocation">';
			if (sublocation.icon) {
				location.html += '<h3><img src="res/images/icons/' + sublocation.icon + '" style="width:32px;height:32px;vertical-align:middle">' + sublocation.name + '</h3>';
			} else {
				location.html += '<h3>' + sublocation.name + '</h3>';
			}
			location.html += '<img src="' + (sublocation.image.startsWith('http') ? sublocation.image : 'res/images/locations/' + sublocation.image) + '" class="sublocation-image">';
			location.html += '<p class="description">' + sublocation.description + '</p>';
			location.html += '</div>';
		});
	} else {
		location.html += '<div class="sublocation">';
		location.html += '<img src="' + (location.image.startsWith('http') ? location.image : 'res/images/locations/' + location.image) + '" class="sublocation-image">';
		location.html += '<p class="description">' + location.description + '</p>';
		location.html += '</div>';
	}

	location.html += '</div>';

	new L.marker(
		location.latlng,
		{
			icon: L.icon({
				iconUrl: 'res/images/icons/' + location.icon,
				iconSize:     [32,32],
				iconAnchor:   [16,16],
				popupAnchor:  [0,-32]
			}),
			opacity: 0.9,
			id: location.id,
			location_data: location,
			draggable: false // Markers are not draggable by default, will be enabled in editor mode
		}
	)
	.bindPopup(location.html,{maxWidth:400,minWidth:400,className:'location',closeButton:false})
	.addTo(locations)
	.on('click',function(){setHash(location.id)});
}

docReady(function() { // for great js COMPATIBILITY (see docready.js, this shit is hilarious)

	locations = L.layerGroup();

	var os_base = L.tileLayer('tiles/base-{MAPDEV}/{z}/{x}/{y}.jpg', {
		maxZoom: 4,
		minZoom: 1,
		tms: true,
		continuousWorld: true,
		noWrap: true
	});

	var southWest = new L.LatLng(-85,-180,true),
		northEast = new L.LatLng(85,180,true),
		bounds = new L.LatLngBounds(southWest, northEast);

	map = L.map('map', {
		attributionControl: false,
		maxBounds: bounds,
		maxBoundsViscosity: 1.0,
		zoom: 2,
		scrollWheelZoom: true,
		tap: false,
		layers: [os_base]
	}).setView([0,0],2);

	L.control.attribution({prefix: '<a href="https://github.com/loiste-interactive/ObenseuerMap">Contribute on GitHub</a> | Made by <a href="https://d7.wtf/">deseven</a> &amp; Nextej | Based on original <a href="https://loisteinteractive.com/">Loiste</a> maps | Powered by <a href="https://leafletjs.com/">Leaflet</a>'}).addTo(map);

	map.addLayer(locations);
	
	// Function to handle hash-based navigation after locations are loaded
	function processLocationHash() {
		if (window.location.hash.substring(1)) {
			var loc, safeHash;
			if (window.location.hash.substring(1).toLowerCase().startsWith('loc:')) {
				loc = window.location.hash.substring(1).toLowerCase().split(':');
				loc = loc[1].split(',');
				map.setView([loc[0],loc[1]],loc[2]);
			} else {
				locations.eachLayer(function(l){
					if (l.options.id == window.location.hash.substring(1)) {
						map.setView(l.getLatLng());
						l.togglePopup();
					}
				});
			}
		}
	}
	
	// Load locations first, then process any hash in the URL
	fetch('https://obenseuer.stalburg.net/locations/getall')
		.then(response => response.json())
		.then(data => {
			data.forEach(addLocation);
			// After all locations are loaded, process the hash
			processLocationHash();
		})
		.catch(error => console.error('Error loading locations:', error));

	var baseLayers = {
	    '<span class="fas fa-map"></span> Map': os_base,
	};

	var overlayMaps = {
		'<span class="fas fa-map-marker-alt"></span> Locations': locations
	};

	L.control.layers(baseLayers,overlayMaps, {
		collapsed: false,
		hideSingleBase: true
	}).addTo(map);

	// if we're coming from stalburg wiki we should display a go back control
	if (document.referrer.indexOf("stalburg.arctar.us") > -1 || document.referrer.indexOf("stalburg.net") > -1) {
		var backToWiki = L.control({
	    	position : 'topcenter'
		});
		backToWiki.onAdd = function(map) {
	    	this._div = L.DomUtil.create('div','backToWikiControl');
	    	this._div.innerHTML = '<a href="' + document.referrer + '">back to Stalburg Wiki</a>';
	    	return this._div;
		}

		backToWiki.addTo(map);
	}

	promptCoordinates = false;
	if (window.location.hash.substring(1).toLowerCase() == 'enable_latlng_selector') {
		promptCoordinates = true;
	}

	// Handle editor login if needed
	if (window.location.search.includes('maintenance-login') || sessionStorage.getItem('token')) {
		// Load PathDrag extension first if not already loaded
		if (typeof L.Handler.PathDrag === 'undefined') {
			var pathDrag = document.createElement('script');
			pathDrag.onload = function() {
				// Then load editor script
				var editor = document.createElement('script');
				editor.onload = function () {
					editorLogin();
				};
				editor.src = "res/editor.js";
				document.head.appendChild(editor);
			};
			pathDrag.src = "res/Leaflet.PathDrag.js";
			document.head.appendChild(pathDrag);
		} else {
			// If PathDrag is already loaded, just load the editor
			var editor = document.createElement('script');
			editor.onload = function () {
				editorLogin();
			};
			editor.src = "res/editor.js";
			document.head.appendChild(editor);
		}
	}

	map.on('click',function(e){
		removeHash();
		var coord = e.latlng;
		var lat = coord.lat.toFixed(2);
		var lng = coord.lng.toFixed(2);
		if (promptCoordinates) {
			console.log('map coords: [' + lat + ',' + lng + ']');
			prompt('map coords',lat + ',' + lng);
		}
	});

	map.on('moveend',function(e){
		var anyPopupActivated = false;
		locations.eachLayer(function(l){
			if (l.getPopup().isOpen()) {
				anyPopupActivated = true;
				// and you can't actually break easily from this loop, because why would you want to?
			}
		});
		if (!anyPopupActivated) {
			var latlng = map.getCenter();
			latlng.lat = latlng.lat.toFixed(2);
			latlng.lng = latlng.lng.toFixed(2);
			setHash('loc:' + latlng.lat + ',' + latlng.lng + ',' + map.getZoom());
		}
	});

});
