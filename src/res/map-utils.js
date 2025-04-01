/**
 * Map Utilities
 * Contains utility functions and helpers used by both map and editor components
 */

/**
 * Sets the URL hash with a string value
 * @param {string} str - The string to set as the hash
 */
function setHash(str) {
    if ("replaceState" in history) {
        history.replaceState(undefined, undefined, '#' + str);
    } else {
        location.hash = '#' + str;
    }
}

/**
 * Removes the URL hash while maintaining scroll position
 */
function removeHash() {
    let scrollV, scrollH, loc = window.location;
    if ("replaceState" in history) {
        history.replaceState({}, document.title, ".");
    } else {
        // For older browsers that don't support replaceState
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;
        loc.hash = "";
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}

/**
 * Creates an HTML content for a location popup
 * @param {Object} location - The location object
 * @returns {string} HTML content for the popup
 */
function createLocationHTML(location) {
    let html = '';
    
    // Create header with title and icon
    html = `<h2 class="location-title">
              <img src="res/images/icons/${location.category}.png" style="width:32px;height:32px;vertical-align:middle">
              ${location.name}
            </h2><div>`;

    // Handle sublocations if they exist
    if (typeof location.sublocs === 'object' && location.sublocs.length > 0) {
        location.sublocs.forEach(sublocation => {
            // Ensure backward compatibility for sublocations
            if (!sublocation.category && sublocation.icon) {
                sublocation.category = sublocation.icon.replace('.png', '');
            }
            
            html += '<div class="sublocation">';
            
            // Add sublocation header with icon if available
            if (sublocation.category) {
                html += `<h3>
                          <img src="res/images/icons/${sublocation.category}.png" style="width:32px;height:32px;vertical-align:middle">
                          ${sublocation.name}
                        </h3>`;
            } else {
                html += `<h3>${sublocation.name}</h3>`;
            }
            
            // Add image - handle both local and external URLs
            const imagePath = sublocation.image.startsWith('http') 
                ? sublocation.image 
                : `res/images/locations/${sublocation.image}`;
            
            html += `<img src="${imagePath}" class="sublocation-image">`;
            html += `<p class="description">${sublocation.description}</p>`;
            html += '</div>';
        });
    } else {
        // Handle locations without sublocations
        html += '<div class="sublocation">';
        
        // Add image - handle both local and external URLs
        const imagePath = location.image.startsWith('http') 
            ? location.image 
            : `res/images/locations/${location.image}`;
        
        html += `<img src="${imagePath}" class="sublocation-image">`;
        html += `<p class="description">${location.description}</p>`;
        html += '</div>';
    }

    html += '</div>';
    
    return html;
}

/**
 * Creates a Leaflet icon for a location marker
 * @param {string} category - The category/icon name
 * @returns {L.Icon} Leaflet icon object
 */
function createLocationIcon(category) {
    return L.icon({
        iconUrl: `res/images/icons/${category}.png`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -32]
    });
}

/**
 * Adds a location marker to the specified layer
 * @param {L.LayerGroup} layerGroup - The layer group to add the marker to
 * @param {Object} location - The location data object
 * @returns {L.Marker} The created marker
 */
function addLocationMarker(layerGroup, location) {
    // Ensure backward compatibility - if category is missing but icon exists, extract category from icon
    if (!location.category && location.icon) {
        location.category = location.icon.replace('.png', '');
    }

    // Set default class if not specified
    if (!location.class) {
        location.class = 'location';
    }
    
    // Generate HTML content for the popup
    location.html = createLocationHTML(location);
    
    // Create and add the marker
    const marker = new L.marker(
        location.latlng,
        {
            icon: createLocationIcon(location.category),
            opacity: 0.9,
            id: location.id,
            location_data: location,
            draggable: false // Markers are not draggable by default
        }
    );
    
    // Bind popup
    marker.bindPopup(location.html, {
        maxWidth: 400,
        minWidth: 400,
        className: location.class,
        closeButton: false
    });
    
    // Default click behavior - this will be updated if in edit mode
    marker.on('click', function () {
        setHash(location.id);
    });
    
    // Add to layer group
    marker.addTo(layerGroup);
    
    return marker;
}

/**
 * Process a location hash from the URL
 * @param {L.Map} map - The map object
 * @param {Object} layerGroups - Object containing all layer groups
 */
function processLocationHash(map, layerGroups) {
    if (!window.location.hash.substring(1)) return;
    
    const hash = window.location.hash.substring(1);
    
    // Handle location coordinates format (e.g., loc:0,0,2)
    if (hash.toLowerCase().startsWith('loc:')) {
        const locParts = hash.toLowerCase().split(':')[1].split(',');
        map.setView([locParts[0], locParts[1]], locParts[2]);
        return;
    }
    
    // Handle location ID format (e.g., #location-1)
    Object.values(layerGroups).forEach(layerGroup => {
        layerGroup.eachLayer(function (layer) {
            if (layer.options.id == hash) {
                map.setView(layer.getLatLng());
                layer.togglePopup();
            }
        });
    });
}

/**
 * Determine if any popup is currently open
 * @param {Object} layerGroups - Object containing all layer groups
 * @returns {boolean} True if any popup is open
 */
function isAnyPopupOpen(layerGroups) {
    let isOpen = false;
    Object.values(layerGroups).forEach(layerGroup => {
        layerGroup.eachLayer(function (layer) {
            if (layer.getPopup && layer.getPopup().isOpen()) {
                isOpen = true;
            }
        });
    });
    return isOpen;
}

/**
 * Updates hash with current map position
 * @param {L.Map} map - The map object
 * @param {Object} layerGroups - Object containing all layer groups
 */
function updateLocationHash(map, layerGroups) {
    if (isAnyPopupOpen(layerGroups)) return;
    
    const center = map.getCenter();
    const lat = center.lat.toFixed(2);
    const lng = center.lng.toFixed(2);
    const zoom = map.getZoom();
    
    setHash(`loc:${lat},${lng},${zoom}`);
}

/**
 * SHA-256 hash function for password hashing
 * @param {string} message - The message to hash
 * @returns {Promise<string>} Promise resolving to the hash as a hex string
 */
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Export all utility functions
window.MAP_UTILS = {
    setHash,
    removeHash,
    createLocationHTML,
    createLocationIcon,
    addLocationMarker,
    processLocationHash,
    isAnyPopupOpen,
    updateLocationHash,
    sha256
};