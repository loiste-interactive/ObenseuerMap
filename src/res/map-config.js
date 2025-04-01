/**
 * Map Configuration and Initialization
 * Contains all configuration settings, constants, and initialization logic for the map
 */

// Constants
const DEFAULT_ZOOM = 2;
const DEFAULT_CENTER = [0, 0];
const MAX_ZOOM = 4;
const MIN_ZOOM = 1;

// Layer group definitions
const LAYER_GROUPS = {
    people: L.layerGroup(),
    services: L.layerGroup(),
    resources: L.layerGroup(),
    toilets: L.layerGroup(),
    shops: L.layerGroup(),
    vending: L.layerGroup(),
    jobs: L.layerGroup(),
    tenements: L.layerGroup(),
    pois: L.layerGroup()
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

// Layer labels for the control panel
const LAYER_LABELS = {
    people: '<span class="fas fa-user"></span> People',
    services: '<span class="fas fa-concierge-bell"></span> Services',
    resources: '<span class="fas fa-cubes"></span> Resources',
    toilets: '<span class="fas fa-toilet"></span> Toilets',
    shops: '<span class="fas fa-shopping-cart"></span> Shops',
    vending: '<span class="fas fa-cookie-bite"></span> Vending Machines',
    tenements: '<span class="fas fa-home"></span> Tenements',
    jobs: '<span class="fas fa-briefcase"></span> Jobs',
    pois: '<span class="fas fa-map-marker-alt"></span> Points of Interest'
};

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

    // Define map layers (base layer + all layer groups)
    const allLayers = [baseLayer];
    Object.values(LAYER_GROUPS).forEach(layer => allLayers.push(layer));

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

    const overlayMaps = {};
    Object.keys(LAYER_LABELS).forEach(key => {
        overlayMaps[LAYER_LABELS[key]] = LAYER_GROUPS[key];
    });

    // Add layer control
    const layerControl = L.control.layers(baseLayers, overlayMaps, {
        collapsed: false,
        hideSingleBase: true
    }).addTo(map);
    
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
        Object.values(LAYER_GROUPS).forEach(layer => {
            if (!map.hasLayer(layer)) {
                map.addLayer(layer);
            }
        });
        
        // Update checkboxes in the layer control
        const checkboxes = layerControlContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    });
    
    deselectAllButton.addEventListener('click', function() {
        Object.values(LAYER_GROUPS).forEach(layer => {
            if (map.hasLayer(layer)) {
                map.removeLayer(layer);
            }
        });
        
        // Update checkboxes in the layer control
        const checkboxes = layerControlContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
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
    LAYER_GROUPS,
    CATEGORY_MAPPING,
    LAYER_LABELS,
    API_ENDPOINTS,
    initializeMap
};