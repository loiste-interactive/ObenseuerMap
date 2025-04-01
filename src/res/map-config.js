/**
 * Map Configuration and Initialization
 * Contains all configuration settings, constants, and initialization logic for the map
 */

// Constants
const DEFAULT_ZOOM = 2;
const DEFAULT_CENTER = [0, 0];
const MAX_ZOOM = 4;
const MIN_ZOOM = 1;

// Single layer group for all location markers
const allMarkersLayer = L.layerGroup();

// Filter definitions (based on original layer groups)
const FILTERS = {
    people: { active: true, label: '<span class="fas fa-user"></span> People' },
    services: { active: true, label: '<span class="fas fa-concierge-bell"></span> Services' },
    resources: { active: true, label: '<span class="fas fa-cubes"></span> Resources' },
    toilets: { active: true, label: '<span class="fas fa-toilet"></span> Toilets' },
    shops: { active: true, label: '<span class="fas fa-shopping-cart"></span> Shops' },
    vending: { active: true, label: '<span class="fas fa-cookie-bite"></span> Vending Machines' },
    jobs: { active: true, label: '<span class="fas fa-briefcase"></span> Jobs' },
    tenements: { active: true, label: '<span class="fas fa-home"></span> Tenements' },
    pois: { active: true, label: '<span class="fas fa-map-marker-alt"></span> Points of Interest' }
};

// Category to layer mapping
const CATEGORY_MAPPING = {
    // People
    'LM_NPC': 'people',
    'LM_Bus': 'people',
    
    // Services
    'LM_ATM': 'services',
    'LM_Phone': 'services',
    'LM_Post': 'services',
    'LM_Border': 'services',
    
    // Resources
    'LM_Rockdebris': 'resources',
    'LM_Wooddebris': 'resources',
    
    // Toilets
    'LM_Toilet': 'toilets',
    
    // Shops
    'LM_Market': 'shops',
    'LM_OneStopShop': 'shops',
    'LM_Skeida': 'shops',
    'LM_Stall': 'shops',
    
    // Vending
    'LM_Vending': 'vending',

    // Jobs
    'LM_Job': 'jobs',
    
    // Tenements
    'LM_Tenement_A': 'tenements',
    'LM_Tenement_B': 'tenements',
    'LM_Tenement_C': 'tenements',
    'LM_Tenement_Player': 'tenements',
    'LM_Sauna_Player': 'tenements',
    
    // Default to POIs for any other category
    'default': 'pois'
};

// Layer labels for the control panel (Now used for filter labels)
// Kept for backward compatibility with parts of the code that might still reference it,
// but FILTERS.label should be preferred.
const LAYER_LABELS = Object.entries(FILTERS).reduce((acc, [key, value]) => {
    acc[key] = value.label;
    return acc;
}, {});

// API endpoint configuration
const API_ENDPOINTS = {
    getAllLocations: 'https://obenseuer.stalburg.net/locations/getall',
    checkToken: '/locations/checktoken',
    login: '/locations/login',
    saveLocation: '/locations/save',
    getCategories: '/locations/getcategories',
    getImages: '/locations/getimages',
    deleteLocation: '/locations/delete/'
};

/**
 * Initializes the map and its base components
 * @returns {Object} The initialized map object
 */
function initializeMap() {
    // Create the base tile layer
    const baseLayer = L.tileLayer('tiles/base-{MAPDEV}/{z}/{x}/{y}.jpg', {
        maxZoom: MAX_ZOOM,
        minZoom: MIN_ZOOM,
        tms: true,
        continuousWorld: true,
        noWrap: true
    });

    // Define map bounds
    const southWest = new L.LatLng(-85, -180, true);
    const northEast = new L.LatLng(85, 180, true);
    const bounds = new L.LatLngBounds(southWest, northEast);

    // Define map layers (base layer + the single marker layer)
    const allLayers = [baseLayer, allMarkersLayer];

    // Initialize the map with configuration
    const map = L.map('map', {
        attributionControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
        zoom: DEFAULT_ZOOM,
        scrollWheelZoom: true,
        tap: false,
        layers: allLayers
    }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);

    // Add attribution
    L.control.attribution({
        prefix: '<a href="https://github.com/loiste-interactive/ObenseuerMap">Contribute on GitHub</a> | ' +
            'Made by <a href="https://d7.wtf/">deseven</a> &amp; Nextej | ' +
            'Based on original <a href="https://loisteinteractive.com/">Loiste</a> maps | ' +
            'Powered by <a href="https://leafletjs.com/">Leaflet</a>'
    }).addTo(map);

    // Add layer control
    const baseLayers = {
        '<span class="fas fa-map"></span> Map': baseLayer
    };

    // The layer control now manages filter visibility, not separate layers.
    // We still use its structure for the UI checkboxes.
    const overlayMaps = {};
    Object.keys(FILTERS).forEach(key => {
        // We associate the label with a dummy layer group for the control UI,
        // but the actual filtering logic will be handled separately.
        // We use the single 'allMarkersLayer' here, but the control's checkboxes
        // will toggle the 'active' state in the FILTERS object.
        overlayMaps[FILTERS[key].label] = allMarkersLayer; // Link UI checkbox to the single layer
    });

    // Add layer control
    const layerControl = L.control.layers(baseLayers, overlayMaps, {
        collapsed: false,
        hideSingleBase: true
    }).addTo(map);

    // --- IMPORTANT ---
    // The layer control checkboxes now need to update the FILTERS state
    // and trigger the marker visibility update function (which we'll define in map-v3.js).
    // This connection needs to be established after the control is added.
    // We'll handle this in map-v3.js after defining the update function.
    // For now, the checkboxes will visually toggle the 'allMarkersLayer',
    // which isn't the desired filtering behavior yet.
    
    // Add Select All / Deselect All buttons to the layer control
    const layerControlContainer = layerControl.getContainer();
    const selectAllContainer = document.createElement('div');
    selectAllContainer.className = 'leaflet-control-layers-select-all';
    selectAllContainer.style.padding = '6px 10px 6px 6px';
    selectAllContainer.style.borderTop = '1px solid #ddd';
    selectAllContainer.style.marginTop = '5px';
    selectAllContainer.style.textAlign = 'center';
    
    // Create Select All button
    const selectAllButton = document.createElement('button');
    selectAllButton.innerHTML = '<span class="fas fa-check-square"></span>';
    selectAllButton.title = 'Select All Layers';
    selectAllButton.style.marginRight = '10px';
    selectAllButton.style.padding = '4px 6px';
    selectAllButton.style.cursor = 'pointer';
    selectAllButton.style.background = 'none';
    selectAllButton.style.border = 'none';
    selectAllButton.style.fontSize = '16px';
    selectAllButton.style.color = '#555';
    
    // Create Deselect All button
    const deselectAllButton = document.createElement('button');
    deselectAllButton.innerHTML = '<span class="fas fa-square"></span>';
    deselectAllButton.title = 'Deselect All Layers';
    deselectAllButton.style.padding = '4px 6px';
    deselectAllButton.style.cursor = 'pointer';
    deselectAllButton.style.background = 'none';
    deselectAllButton.style.border = 'none';
    deselectAllButton.style.fontSize = '16px';
    deselectAllButton.style.color = '#555';
    
    // Add event listeners
    selectAllButton.addEventListener('click', function() {
        Object.keys(FILTERS).forEach(key => FILTERS[key].active = true);
        // Update checkboxes in the layer control
        const checkboxes = layerControlContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = true);
        // Trigger map update (function to be defined in map-v3.js)
        if (typeof window.updateMarkerVisibility === 'function') {
            window.updateMarkerVisibility();
        } else {
             console.warn("updateMarkerVisibility function not found yet.");
        }
        // Ensure the main layer is on the map if it wasn't (might happen if all were deselected)
        if (!map.hasLayer(allMarkersLayer)) {
             map.addLayer(allMarkersLayer);
        }
    });
    
    deselectAllButton.addEventListener('click', function() {
        Object.keys(FILTERS).forEach(key => FILTERS[key].active = false);
        // Update checkboxes in the layer control
        const checkboxes = layerControlContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
        // Trigger map update (function to be defined in map-v3.js)
         if (typeof window.updateMarkerVisibility === 'function') {
            window.updateMarkerVisibility();
        } else {
             console.warn("updateMarkerVisibility function not found yet.");
        }
        // Note: We don't remove allMarkersLayer from the map here,
        // updateMarkerVisibility will handle removing individual markers.
    });
    
    // Add buttons to container
    selectAllContainer.appendChild(selectAllButton);
    selectAllContainer.appendChild(deselectAllButton);
    
    // Add container to layer control
    layerControlContainer.appendChild(selectAllContainer);

    // Add wiki back button if coming from the wiki
    if (document.referrer.indexOf("stalburg.arctar.us") > -1 || (document.referrer.indexOf("stalburg.net") > -1 && document.referrer.indexOf(".stalburg.net") == -1)) {
        const backToWiki = L.control({
            position: 'topcenter'
        });
        backToWiki.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'backToWikiControl');
            this._div.innerHTML = '<a href="' + document.referrer + '">back to Stalburg Wiki</a>';
            return this._div;
        };
        backToWiki.addTo(map);
    }

    return map;
}

// Export all needed constants and functions
window.MAP_CONFIG = {
    DEFAULT_ZOOM,
    DEFAULT_CENTER,
    MAX_ZOOM,
    MIN_ZOOM,
    allMarkersLayer, // Export the single layer
    FILTERS,         // Export filters state
    CATEGORY_MAPPING,
    LAYER_LABELS,    // Keep for potential backward compatibility
    API_ENDPOINTS,
    initializeMap
};