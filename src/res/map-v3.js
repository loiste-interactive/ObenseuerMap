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
            // Determine all relevant filter keys for this location
            const locationFilterKeys = new Set();
            
            // Get filter key from main category
            let mainCategory = location.category;
            if (!mainCategory && location.icon) { // Backward compatibility
                 mainCategory = location.icon.replace('.png', '');
            }
            const mainFilterKey = MAP_CONFIG.CATEGORY_MAPPING[mainCategory] || MAP_CONFIG.CATEGORY_MAPPING['default'];
            if (mainFilterKey) {
                locationFilterKeys.add(mainFilterKey);
            }

            // Get filter keys from sublocation categories
            if (Array.isArray(location.sublocs) && location.sublocs.length > 0) {
                location.sublocs.forEach(subloc => {
                    let sublocCategory = subloc.category;
                    if (!sublocCategory && subloc.icon) { // Backward compatibility
                        sublocCategory = subloc.icon.replace('.png', '');
                    }
                    const subFilterKey = MAP_CONFIG.CATEGORY_MAPPING[sublocCategory];
                    if (subFilterKey) {
                        locationFilterKeys.add(subFilterKey);
                    }
                });
            }

            // Add the location marker ONCE to the single layer group
            // Store the collected filter keys in the marker's options
            const markerOptions = {
                categories: Array.from(locationFilterKeys) // Store filter keys
            };
            MAP_UTILS.addLocationMarker(MAP_CONFIG.allMarkersLayer, location, markerOptions);
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
        // Pass FILTERS state instead of LAYER_GROUPS for hash update
        MAP_UTILS.updateLocationHash(map, MAP_CONFIG.FILTERS);
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
    
    // First load all CSS and non-PathDrag JS resources
    const initialResources = editorResources.filter(r => r.type === 'css' || (r.type === 'js' && !r.url.includes('PathDrag')));
    const pathDragResource = editorResources.find(r => r.url.includes('PathDrag'));
    const editorJsResource = editorResources.find(r => r.url.includes('map-editor.js'));
    
    // Load resources in a specific order to ensure dependencies are ready
    Promise.all(
        initialResources.map(resource => {
            return loadResource(resource.url, resource.type)
                .then(() => {
                    loadedCount++;
                    const percentage = Math.round((loadedCount / editorResources.length) * 100);
                    loadingIndicator.textContent = `Loading editor resources (${percentage}%)...`;
                });
        })
    )
    .then(() => {
        // Load PathDrag specifically and wait for it to be fully initialized
        return loadResource(pathDragResource.url, pathDragResource.type)
            .then(() => {
                loadedCount++;
                const percentage = Math.round((loadedCount / editorResources.length) * 100);
                loadingIndicator.textContent = `Loading editor resources (${percentage}%)...`;
                
                // Give some time for PathDrag to initialize
                return new Promise(resolve => setTimeout(resolve, 200));
            });
    })
    .then(() => {
        // Load the editor JS last to ensure all dependencies are loaded
        return loadResource(editorJsResource.url, editorJsResource.type)
            .then(() => {
                loadedCount++;
                const percentage = Math.round((loadedCount / editorResources.length) * 100);
                loadingIndicator.textContent = `Loading editor resources (${percentage}%)...`;
                
                // Give some time for the editor to initialize
                return new Promise(resolve => setTimeout(resolve, 200));
            });
    })
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
 * Updates the visibility of markers based on the active filters.
 */
function updateMarkerVisibility() {
    const activeFilterKeys = Object.entries(MAP_CONFIG.FILTERS)
                                .filter(([key, value]) => value.active)
                                .map(([key, value]) => key);

    MAP_CONFIG.allMarkersLayer.eachLayer(marker => {
        const markerCategories = marker.options.categories || [];
        
        // Check if any of the marker's categories match any active filter key
        const isVisible = markerCategories.some(category => activeFilterKeys.includes(category));

        if (isVisible) {
            // Ensure the marker is on the map
            if (!map.hasLayer(marker)) {
                map.addLayer(marker);
            }
        } else {
            // Ensure the marker is removed from the map
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        }
    });
}
// Make the function globally accessible so map-config can call it initially
window.updateMarkerVisibility = updateMarkerVisibility;


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
        // Initial visibility update based on default filters
        updateMarkerVisibility();
        // Pass FILTERS state instead of LAYER_GROUPS for hash processing
        MAP_UTILS.processLocationHash(map, MAP_CONFIG.FILTERS);
    });
    
    // Check if editor should be loaded
    checkEditorMode();
    // Connect layer control checkboxes to filter state and update function
    const layerControlContainer = document.querySelector('.leaflet-control-layers');
    if (layerControlContainer) {
        const checkboxes = layerControlContainer.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            // Find the corresponding filter key based on the label text or value
            const labelElement = checkbox.nextElementSibling; // Assuming label follows input
            const labelText = labelElement ? labelElement.innerHTML.trim() : '';
            
            const filterKey = Object.keys(MAP_CONFIG.FILTERS).find(key =>
                MAP_CONFIG.FILTERS[key].label === labelText
            );

            if (filterKey) {
                // Set initial checked state based on filter
                checkbox.checked = MAP_CONFIG.FILTERS[filterKey].active;

                // Add event listener
                checkbox.addEventListener('change', function() {
                    MAP_CONFIG.FILTERS[filterKey].active = this.checked;
                    updateMarkerVisibility();
                    // Update hash after filter change
                    MAP_UTILS.updateLocationHash(map, MAP_CONFIG.FILTERS);
                });
            } else {
                console.warn("Could not link checkbox to filter for label:", labelText);
            }
        });
    } else {
        console.error("Layer control container not found to attach filter listeners.");
    }
}
 
 // Initialize the map when the document is ready
 docReady(initialize);