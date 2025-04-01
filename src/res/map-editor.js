/**
 * Map Editor Logic
 * Handles authentication, marker editing, and saving functionality for map editors
 */

// Editor state
let logindialog;
let button_save_all;
let button_logout;
let button_toggle_mode;
let editedLocations = new Set(); // Track which locations have been edited
let isEditingMode = false; // Default to viewing mode for logged-in users

// Initialize notification system (assuming Notyf is included in the main HTML)
const notyf = new Notyf({
    duration: 2000,
    position: {
        x: 'center',
        y: 'bottom',
    },
    ripple: false
});

/**
 * Initializes the editor login process
 * Either validates existing token or shows login dialog
 */
function editorLogin() {
    console.log("Editor initialization started");
    
    if (sessionStorage.getItem('token')) {
        checkToken();
    } else {
        showLoginDialog();
    }
}

/**
 * Shows the login dialog
 */
function showLoginDialog() {
    // Get the login form from the DOM
    const loginFormContainer = document.getElementById('loginFormContainer');
    const loginForm = document.getElementById('loginForm');
    
    // Create a dialog and add the login form to it
    logindialog = L.control.dialog({
        size: [400, 300],
        position: 'topleft',
        'min-width': '350px'
    }).addTo(map);
    
    // Move the login form into the dialog
    logindialog._container.querySelector('.leaflet-control-dialog-contents').appendChild(loginForm);
    
    // Show the dialog
    logindialog.open();
    
    // Add event listener to the form
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        login();
    });
}

/**
 * Checks if the current token is valid
 */
function checkToken() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', MAP_CONFIG.API_ENDPOINTS.checkToken, true);
    xhr.setRequestHeader('X-Token', sessionStorage.getItem('token'));
    
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log('Token valid');
                initializeEditorInterface();
            } else {
                console.error('Token invalid');
                sessionStorage.removeItem('token');
                notyf.error('Session expired. Please login again.');
                showLoginDialog();
            }
        }
    };

    xhr.send();
}

/**
 * Handles user login
 */
async function login() {
    const username = document.getElementById('user');
    const password = document.getElementById('pw');
    const button = document.getElementById('loginButton');
    const errorDiv = document.getElementById('loginError');

    // Disable form during login
    username.disabled = true;
    password.disabled = true;
    button.disabled = true;
    
    try {
        // Hash password for security
        const hashedPassword = await MAP_UTILS.sha256(password.value);

        const formData = {
            user: username.value,
            pw: hashedPassword
        };

        const xhr = new XMLHttpRequest();
        xhr.open('POST', MAP_CONFIG.API_ENDPOINTS.login, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                // Re-enable form fields
                username.disabled = false;
                password.disabled = false;
                button.disabled = false;

                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    const token = data.token;
                    sessionStorage.setItem('token', token);
                    logindialog.close();
                    notyf.success('Login successful');
                    initializeEditorInterface();
                } else {
                    notyf.error('Login failed. Please try again.');
                    console.error('Failed to login');
                }
            }
        };

        xhr.send(JSON.stringify(formData));
    } catch (error) {
        console.error('Login error:', error);
        username.disabled = false;
        password.disabled = false;
        button.disabled = false;
        notyf.error('Login error: ' + error.message);
    }
}

/**
 * Initializes the editor interface after successful login
 */
function initializeEditorInterface() {
    // Create toggle mode button control
    L.button_toggle_mode = L.Control.extend({
        options: {
            name: 'Toggle Edit Mode',
            position: 'topleft',
            html: '<span class="fas fa-eye"></span>', // Default icon for viewing mode
            callback: toggleEditMode
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
                link = L.DomUtil.create('a', '', container);

            link.href = '#';
            link.title = this.options.name;
            link.innerHTML = this.options.html;
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', function() {
                    this.options.callback.call();
                }, this);

            return container;
        }
    });

    // Create save button control
    L.button_save_all = L.Control.extend({
        options: {
            name: 'Save All',
            position: 'topleft',
            html: '<span class="fas fa-save"></span>',
            callback: saveAllLocations
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
                link = L.DomUtil.create('a', '', container);

            link.href = '#';
            link.title = this.options.name;
            link.innerHTML = this.options.html;
            link.style.opacity = '0.5';
            link.style.pointerEvents = 'none';
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', function() {
                    this.options.callback.call();
                }, this);

            return container;
        }
    });

    // Create logout button control
    L.button_logout = L.Control.extend({
        options: {
            name: 'Log Out',
            position: 'topleft',
            html: '<span class="fas fa-sign-out-alt"></span>',
        },
        onAdd: function(map) {
            var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
                link = L.DomUtil.create('a', '', container);

            link.href = '#';
            link.title = this.options.name;
            link.innerHTML = this.options.html;
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', function() {
                    sessionStorage.removeItem('token');
                    location.reload();
                }, this);

            return container;
        }
    });

    // Add the controls to the map
    button_toggle_mode = new L.button_toggle_mode();
    button_save_all = new L.button_save_all();
    button_logout = new L.button_logout();
    map.addControl(button_toggle_mode);
    map.addControl(button_save_all);
    map.addControl(button_logout);
    
    // Set up marker dragging functionality
    makeMarkersMovable();
    
    notyf.success('Locations are locked. Click the eye icon to switch to editing mode.');
}

/**
 * Toggles between editing and viewing modes
 */
function toggleEditMode() {
    isEditingMode = !isEditingMode;
    
    // Update the button icon
    const modeButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Toggle Edit Mode"]');
    if (modeButton) {
        if (isEditingMode) {
            modeButton.innerHTML = '<span class="fas fa-edit"></span>'; // Edit icon
            notyf.success('Editing mode enabled. You can now move and edit locations.');
            enableMarkerDragging();
        } else {
            modeButton.innerHTML = '<span class="fas fa-eye"></span>'; // View icon
            notyf.success('View mode enabled. Locations are now locked.');
            disableMarkerDragging();
        }
    }
}

/**
 * Applies a callback function to all location markers across all layer groups
 * @param {Function} callback - Function to call for each marker
 * @returns {number} Number of markers processed
 */
function forEachLocationMarker(callback) {
    let count = 0;
    
    // Process all layer groups
    Object.values(MAP_CONFIG.LAYER_GROUPS).forEach(function(layerGroup) {
        layerGroup.eachLayer(function(marker) {
            if (marker.options && marker.options.location_data) {
                callback(marker);
                count++;
            }
        });
    });
    
    return count;
}

/**
 * Sets up markers with event listeners but keeps dragging disabled by default
 */
function makeMarkersMovable() {
    console.log("Setting up markers for editing...");
    
    const markerCount = forEachLocationMarker(function(marker) {
        // Add event listener for when dragging ends (only once)
        if (!marker._hasSetupDragend) {
            marker._hasSetupDragend = true;
            marker.on('dragend', function(event) {
                const marker = event.target;
                const position = marker.getLatLng();
                
                // Update the location data with the new position
                marker.options.location_data.latlng = [position.lat, position.lng];
                
                // Add this location to the set of moved locations
                editedLocations.add(marker.options.id);
                
                // Enable save button
                const saveButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Save All"]');
                if (saveButton) {
                    saveButton.style.opacity = '1';
                    saveButton.style.pointerEvents = 'auto';
                }

                console.log(`Marker ${marker.options.id} moved to [${position.lat}, ${position.lng}]`);
                notyf.success(`Location "${marker.options.location_data.name}" moved`);
            });
        }
        
        // Start with dragging disabled (viewing mode)
        marker.dragging.disable();
    });

    if (markerCount === 0) {
        // If no markers were found, try again after a short delay
        console.log("No markers found, will retry in 500ms");
        setTimeout(makeMarkersMovable, 500);
    } else {
        console.log(`${markerCount} markers set up successfully.`);
    }
}

/**
 * Enables dragging for all markers
 */
function enableMarkerDragging() {
    console.log("Enabling marker dragging...");
    forEachLocationMarker(function(marker) {
        marker.dragging.enable();
    });
}

/**
 * Disables dragging for all markers
 */
function disableMarkerDragging() {
    console.log("Disabling marker dragging...");
    forEachLocationMarker(function(marker) {
        marker.dragging.disable();
    });
}

/**
 * Saves a single location to the server
 * @param {Object} location - The location data to save
 * @returns {Promise} Promise resolving to the server response
 */
async function saveLocation(location) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', MAP_CONFIG.API_ENDPOINTS.saveLocation, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Token', sessionStorage.getItem('token'));

        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(xhr.responseText || 'Failed to save location'));
                }
            }
        };

        xhr.send(JSON.stringify(location));
    });
}

/**
 * Saves all edited locations
 */
async function saveAllLocations() {
    // Get only the moved locations from the map
    const locationsToSave = [];
    forEachLocationMarker(function(marker) {
        if (editedLocations.has(marker.options.id)) {
            locationsToSave.push(marker.options.location_data);
        }
    });

    if (locationsToSave.length === 0) {
        notyf.error('No locations to save');
        return;
    }

    if (!confirm(`Save ${locationsToSave.length} changed locations?`)) {
        return;
    }

    // Show loading indicator
    const saveButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Save All"]');
    const originalHTML = saveButton.innerHTML;
    saveButton.innerHTML = '<span class="fas fa-spinner fa-spin"></span>';
    saveButton.style.backgroundColor = '#f0ad4e';

    // Save each location individually
    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const location of locationsToSave) {
        try {
            // Make sure location has category field (legacy support)
            if (location.icon && !location.category) {
                // Remove .png extension if present
                location.category = location.icon.replace('.png', '');
            }
            
            // Save the location
            const result = await saveLocation(location);
            results.push({ id: location.id, success: true });
            successCount++;
        } catch (error) {
            console.error(`Error saving location ${location.id}:`, error);
            results.push({ id: location.id, success: false, error: error.message });
            failureCount++;
        }
    }

    // Reset button
    saveButton.innerHTML = originalHTML;
    saveButton.style.backgroundColor = '';

    // Show result notification
    if (failureCount === 0) {
        notyf.success('All changed locations saved successfully');
        // Clear the moved locations set after successful save
        editedLocations.clear();
        // Disable save button
        saveButton.style.opacity = '0.5';
        saveButton.style.pointerEvents = 'none';
    } else {
        notyf.error(`Saved with ${failureCount} failures out of ${locationsToSave.length} locations`);
        console.error('Save failures:', results.filter(r => !r.success));
    }
}

// Make editor functions globally available
window.editorLogin = editorLogin;