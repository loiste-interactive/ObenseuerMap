/**
 * Map Core Logic
 * Handles map initialization, location loading and display, and map event handling
 */

// Global map instance
let map;

/**
 * Loads location data from the API and adds it to the appropriate layer groups
 * @returns {Promise} Promise resolving when all locations are loaded
 */
async function loadLocations() {
    try {
        const response = await fetch(MAP_CONFIG.API_ENDPOINTS.getAllLocations);
        const data = await response.json();
        
        data.forEach(location => {
            // Determine which layer group this location belongs to
            let layerKey = 'pois'; // Default to POIs
            
            if (location.category && MAP_CONFIG.CATEGORY_MAPPING[location.category]) {
                layerKey = MAP_CONFIG.CATEGORY_MAPPING[location.category];
            } else if (location.icon) {
                // Try to match by icon for backward compatibility
                const category = location.icon.replace('.png', '');
                if (MAP_CONFIG.CATEGORY_MAPPING[category]) {
                    layerKey = MAP_CONFIG.CATEGORY_MAPPING[category];
                }
            }
            
            // Add the location to the appropriate layer group
            MAP_UTILS.addLocationMarker(MAP_CONFIG.LAYER_GROUPS[layerKey], location);
        });
        
        return data;
    } catch (error) {
        console.error('Error loading locations:', error);
        throw error;
    }
}

/**
 * Sets up map event handlers
 */
function setupMapEvents() {
    // Handle map click events - remove hash and show coordinates if enabled
    map.on('click', function(e) {
        MAP_UTILS.removeHash();
        
        const coord = e.latlng;
        const lat = coord.lat.toFixed(2);
        const lng = coord.lng.toFixed(2);
        
        if (window.promptCoordinates) {
            console.log('map coords: [' + lat + ',' + lng + ']');
            prompt('map coords', lat + ',' + lng);
        }
    });
    
    // Handle map move events - update location hash
    map.on('moveend', function() {
        MAP_UTILS.updateLocationHash(map, MAP_CONFIG.LAYER_GROUPS);
    });
}

/**
 * Checks if the editor should be loaded (based on URL or session token)
 */
function checkEditorMode() {
    if (window.location.search.includes('maintenance-login') || sessionStorage.getItem('token')) {
        loadEditor();
    }
}

/**
 * Loads the editor components if necessary
 */
function loadEditor() {
    // Load PathDrag extension first if not already loaded
    if (typeof L.Handler.PathDrag === 'undefined') {
        const pathDrag = document.createElement('script');
        pathDrag.onload = function() {
            // Then load editor script
            const editor = document.createElement('script');
            editor.onload = function() {
                // Once editor is loaded, call the login function
                if (typeof editorLogin === 'function') {
                    editorLogin();
                } else {
                    console.error('Editor loaded but editorLogin function not found');
                }
            };
            editor.src = "res/map-editor.js"; // Use the new editor file
            document.head.appendChild(editor);
        };
        pathDrag.src = "res/Leaflet.PathDrag.js";
        document.head.appendChild(pathDrag);
    } else {
        // If PathDrag is already loaded, just load the editor
        const editor = document.createElement('script');
        editor.onload = function() {
            if (typeof editorLogin === 'function') {
                editorLogin();
            } else {
                console.error('Editor loaded but editorLogin function not found');
            }
        };
        editor.src = "res/map-editor.js"; // Use the new editor file
        document.head.appendChild(editor);
    }
}

/**
 * Initialize coordinate prompt mode if needed
 */
function initCoordinatePrompt() {
    window.promptCoordinates = false;
    if (window.location.hash.substring(1).toLowerCase() === 'enable_latlng_selector') {
        window.promptCoordinates = true;
    }
}

/**
 * Main initialization function
 * Sets up the map and loads all required components
 */
function initialize() {
    // Initialize the map
    map = MAP_CONFIG.initializeMap();
    window.map = map; // Make map globally accessible
    
    // Initialize coordinate prompt
    initCoordinatePrompt();
    
    // Setup map event handlers
    setupMapEvents();
    
    // Load locations and then process any location hash
    loadLocations().then(() => {
        MAP_UTILS.processLocationHash(map, MAP_CONFIG.LAYER_GROUPS);
    });
    
    // Check if editor should be loaded
    checkEditorMode();
}

// Initialize the map when the document is ready
docReady(initialize);