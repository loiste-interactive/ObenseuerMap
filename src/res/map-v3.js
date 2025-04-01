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
            // Track which layers this location has been added to
            const addedLayers = new Set();
            
            // Determine which layer group this location belongs to based on its main category
            let mainLayerKey = 'pois'; // Default to POIs
            
            if (location.category && MAP_CONFIG.CATEGORY_MAPPING[location.category]) {
                mainLayerKey = MAP_CONFIG.CATEGORY_MAPPING[location.category];
            } else if (location.icon) {
                // Try to match by icon for backward compatibility
                const category = location.icon.replace('.png', '');
                if (MAP_CONFIG.CATEGORY_MAPPING[category]) {
                    mainLayerKey = MAP_CONFIG.CATEGORY_MAPPING[category];
                }
            }
            
            // Add the location to its main layer group
            MAP_UTILS.addLocationMarker(MAP_CONFIG.LAYER_GROUPS[mainLayerKey], location);
            addedLayers.add(mainLayerKey);
            
            // Check if location has sublocations with different categories
            if (Array.isArray(location.sublocs) && location.sublocs.length > 0) {
                location.sublocs.forEach(subloc => {
                    let sublocCategory = subloc.category;
                    
                    // Ensure backward compatibility
                    if (!sublocCategory && subloc.icon) {
                        sublocCategory = subloc.icon.replace('.png', '');
                    }
                    
                    // If sublocation has a valid category that maps to a different layer
                    if (sublocCategory &&
                        MAP_CONFIG.CATEGORY_MAPPING[sublocCategory] &&
                        !addedLayers.has(MAP_CONFIG.CATEGORY_MAPPING[sublocCategory])) {
                        
                        const subLayerKey = MAP_CONFIG.CATEGORY_MAPPING[sublocCategory];
                        
                        // Add the parent location to this additional layer
                        MAP_UTILS.addLocationMarker(MAP_CONFIG.LAYER_GROUPS[subLayerKey], location);
                        addedLayers.add(subLayerKey);
                    }
                });
            }
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
 * Resource loader utility to dynamically load CSS and JS files
 * @param {string} url - URL of the resource to load
 * @param {string} type - Type of resource ('css' or 'js')
 * @returns {Promise} Promise that resolves when the resource is loaded
 */
function loadResource(url, type) {
    return new Promise((resolve, reject) => {
        let element;
        
        if (type === 'css') {
            // Check if the CSS is already loaded
            const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
            for (let i = 0; i < existingLinks.length; i++) {
                if (existingLinks[i].href.includes(url)) {
                    resolve(); // Already loaded
                    return;
                }
            }
            
            element = document.createElement('link');
            element.rel = 'stylesheet';
            element.href = url;
        } else if (type === 'js') {
            // Check if the script is already loaded
            const existingScripts = document.querySelectorAll('script');
            for (let i = 0; i < existingScripts.length; i++) {
                if (existingScripts[i].src.includes(url)) {
                    resolve(); // Already loaded
                    return;
                }
            }
            
            element = document.createElement('script');
            element.src = url;
        } else {
            reject(new Error(`Unsupported resource type: ${type}`));
            return;
        }
        
        element.onload = () => resolve();
        element.onerror = () => reject(new Error(`Failed to load ${url}`));
        
        document.head.appendChild(element);
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
 * Loads all editor-specific resources and initializes the editor
 */
function loadEditor() {
    console.log("Loading editor resources...");
    
    // Define all resources needed for the editor
    const editorResources = [
        { url: 'res/Leaflet.Dialog.css', type: 'css' },
        { url: 'https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css', type: 'css' },
        { url: 'res/Leaflet.Dialog.js', type: 'js' },
        { url: 'res/Leaflet.PathDrag.js', type: 'js' },
        { url: 'https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js', type: 'js' },
        { url: 'res/map-editor.js', type: 'js' }
    ];
    
    // Create a loading indicator to show progress
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'editor-loading-indicator';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.padding = '15px 20px';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    loadingIndicator.style.color = 'white';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.zIndex = '1000';
    loadingIndicator.style.fontFamily = 'Arial, sans-serif';
    loadingIndicator.textContent = 'Loading editor resources (0%)...';
    document.body.appendChild(loadingIndicator);
    
    // Load all resources and track progress
    let loadedCount = 0;
    
    Promise.all(
        editorResources.map(resource => {
            return loadResource(resource.url, resource.type)
                .then(() => {
                    loadedCount++;
                    const percentage = Math.round((loadedCount / editorResources.length) * 100);
                    loadingIndicator.textContent = `Loading editor resources (${percentage}%)...`;
                });
        })
    )
    .then(() => {
        console.log("All editor resources loaded successfully");
        // Remove the loading indicator
        document.body.removeChild(loadingIndicator);
        
        // Initialize the editor
        if (typeof editorLogin === 'function') {
            editorLogin();
        } else {
            console.error('Editor loaded but editorLogin function not found');
        }
    })
    .catch(error => {
        console.error('Error loading editor resources:', error);
        loadingIndicator.textContent = 'Failed to load editor resources. Please refresh the page and try again.';
        loadingIndicator.style.backgroundColor = 'rgba(220, 53, 69, 0.8)';
        setTimeout(() => {
            document.body.removeChild(loadingIndicator);
        }, 5000);
    });
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