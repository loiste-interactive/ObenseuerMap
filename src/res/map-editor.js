/**
 * Map Editor Logic
 * Handles authentication, marker editing, and saving functionality for map editors
 */

// Editor state
let logindialog;
let button_save_all;
let button_logout;
let button_toggle_mode;
let button_create_location;
let button_media_editor;
let editedLocations = new Set(); // Track which locations have been edited
let isEditingMode = false; // Default to viewing mode for logged-in users
let isCreatingLocation = false; // Flag to track if we're in location creation mode
let categories = []; // Store available categories
let images = []; // Store available images
let notyf; // Will be initialized in editorLogin

/**
 * Initializes the editor login process
 * Either validates existing token or shows login dialog
 */
function editorLogin() {
    console.log("Editor initialization started");
    
    // Initialize notification system now that Notyf is loaded
    notyf = new Notyf({
        duration: 3000,
        position: {
            x: 'center',
            y: 'bottom',
        },
        ripple: false
    });
    
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
    // Fetch categories and images
    fetchCategories();
    fetchImages();

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

    // Create media editor button control
    L.button_media_editor = L.Control.extend({
        options: {
            name: 'Media Editor',
            position: 'topleft',
            html: '<span class="fas fa-images"></span>',
            callback: function() {
                window.location.href = '/locations/media';
            }
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

    // Create "Create Location" button control
    L.button_create_location = L.Control.extend({
        options: {
            name: 'Create Location',
            position: 'topleft',
            html: '<span class="fas fa-plus"></span>',
            callback: startLocationCreation
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

    // Create logout button control
    L.button_logout = L.Control.extend({
        options: {
            name: 'Log Out',
            position: 'bottomleft',
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
    button_create_location = new L.button_create_location();
    button_media_editor = new L.button_media_editor();
    button_logout = new L.button_logout();
    map.addControl(button_toggle_mode);
    map.addControl(button_logout);
    
    // Buttons below will be added/removed based on edit mode
    
    // Set up marker dragging functionality
    makeMarkersMovable();
    
    // Set up edit form event listeners
    setupEditFormListeners();
    
    notyf.success('Locations are locked. Click the eye icon to switch to editing mode.');
}

/**
 * Fetches available categories from the server
 */
function fetchCategories() {
    fetch(MAP_CONFIG.API_ENDPOINTS.getCategories, {
        method: 'GET',
        headers: {
            'X-Token': sessionStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        categories = data;
        console.log('Categories loaded:', categories);
    })
    .catch(error => {
        console.error('Error fetching categories:', error);
    });
}

/**
 * Fetches available images from the server
 */
function fetchImages() {
    fetch(MAP_CONFIG.API_ENDPOINTS.getImages, {
        method: 'GET',
        headers: {
            'X-Token': sessionStorage.getItem('token')
        }
    })
    .then(response => response.json())
    .then(data => {
        images = data;
        console.log('Images loaded:', images);
    })
    .catch(error => {
        console.error('Error fetching images:', error);
    });
}

/**
 * Toggles between editing and viewing modes
 */
function toggleEditMode() {
    isEditingMode = !isEditingMode;
    
    // Cancel location creation if active
    if (isCreatingLocation) {
        cancelLocationCreation();
    }
    
    // Update the button icon
    const modeButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Toggle Edit Mode"]');
    if (modeButton) {
        if (isEditingMode) {
            modeButton.innerHTML = '<span class="fas fa-edit"></span>'; // Edit icon
            notyf.success('Editing mode enabled. You can now move and edit locations.');
            enableMarkerDragging();
            updateMarkerClickBehavior();
            
            // Add edit mode buttons
            map.addControl(button_create_location);
            map.addControl(button_media_editor);
            map.addControl(button_save_all);
            
            // Update save button state based on whether there are edited locations
            const saveButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Save All"]');
            if (saveButton) {
                if (editedLocations.size > 0) {
                    saveButton.style.opacity = '1';
                    saveButton.style.pointerEvents = 'auto';
                } else {
                    saveButton.style.opacity = '0.5';
                    saveButton.style.pointerEvents = 'none';
                }
            }
        } else {
            modeButton.innerHTML = '<span class="fas fa-eye"></span>'; // View icon
            notyf.success('View mode enabled. Locations are now locked.');
            disableMarkerDragging();
            updateMarkerClickBehavior();
            
            // Remove edit mode buttons
            map.removeControl(button_save_all);
            map.removeControl(button_media_editor);
            map.removeControl(button_create_location);
        }
    }
}

/**
 * Updates the click behavior of all markers based on the current mode
 */
function updateMarkerClickBehavior() {
    forEachLocationMarker(function(marker) {
        // Remove existing click listeners
        marker.off('click');
        
        // Add appropriate click listener based on mode
        if (isEditingMode) {
            marker.on('click', function() {
                try {
                    // In editing mode, show the edit form
                    showLocationEditForm(marker.options.location_data);
                    MAP_UTILS.setHash(marker.options.id);
                } catch (error) {
                    console.error("Error showing edit form:", error);
                    notyf.error("Error showing edit form: " + error.message);
                }
            });
        } else {
            // In viewing mode, show the standard popup
            marker.on('click', function() {
                MAP_UTILS.setHash(marker.options.id);
                marker.togglePopup();
            });
        }
    });
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
        // Set up appropriate click handlers for all markers
        updateMarkerClickBehavior();
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

/**
 * Sets up event listeners for the location edit form
 */
function setupEditFormListeners() {
    const editForm = document.getElementById('locationEditForm');
    const hasSublocationsCheckbox = document.getElementById('has-sublocations');
    const sublocationsContainer = document.getElementById('sublocations-container');
    const imageContainer = document.getElementById('location-image-container');
    const addSublocationButton = document.getElementById('add-sublocation');
    const cancelButton = document.getElementById('cancel-edit');
    const deleteButton = document.getElementById('delete-location');
    
    // Toggle sublocations container when checkbox is clicked
    hasSublocationsCheckbox.addEventListener('change', function() {
        if (this.checked) {
            sublocationsContainer.style.display = 'block';
            imageContainer.style.display = 'none';
        } else {
            sublocationsContainer.style.display = 'none';
            imageContainer.style.display = 'block';
        }
    });
    
    // Add new sublocation when button is clicked
    addSublocationButton.addEventListener('click', function() {
        addNewSublocation();
    });
    
    // Cancel button closes the form
    cancelButton.addEventListener('click', function() {
        closeLocationEditForm();
    });
    
    // Delete button removes the location
    deleteButton.addEventListener('click', async function() {
        const locationId = document.getElementById('location-id').value;
        if (!locationId) return;
        
        if (confirm(`Are you sure you want to delete the location "${document.getElementById('location-name').value}"? This action is irreversible.`)) {
            await deleteLocation(locationId);
        }
    });
    
    // Handle form submission
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveLocationFromForm();
    });
}

/**
 * Shows the location edit form with the provided location data
 * @param {Object} location - The location data to edit
 */
function showLocationEditForm(location) {
    const formContainer = document.getElementById('locationEditFormContainer');
    const form = document.getElementById('locationEditForm');
    const idField = document.getElementById('location-id');
    const nameField = document.getElementById('location-name');
    const categoryField = document.getElementById('location-category');
    const categoryPreview = document.getElementById('location-category-preview');
    const imageField = document.getElementById('location-image');
    const imagePreview = document.getElementById('location-image-preview');
    const descriptionField = document.getElementById('location-description');
    const hasSublocationsCheckbox = document.getElementById('has-sublocations');
    const sublocationsContainer = document.getElementById('sublocations-container');
    const sublocationsListContainer = document.getElementById('sublocations-list');
    const deleteButton = document.getElementById('delete-location');
    
    // Clear previous form data
    form.reset();
    sublocationsListContainer.innerHTML = '';
    
    // Check if we're editing an existing location or creating a new one
    const isNewLocation = !location.id || location.id === 'new';
    
    // Set up category options
    categoryField.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.replace('LM_', '');
        categoryField.appendChild(option);
    });
    
    // Set up image options
    imageField.innerHTML = '';
    images.forEach(image => {
        const option = document.createElement('option');
        option.value = image;
        option.textContent = image.replace('preview_', '').replace('.jpg', '').replace('.png', '');
        imageField.appendChild(option);
    });
    
    // Set up event listeners for preview updates
    categoryField.addEventListener('change', function() {
        updateCategoryPreview(this.value, categoryPreview);
    });
    
    imageField.addEventListener('change', function() {
        updateImagePreview(this.value, imagePreview);
    });
    
    // Populate form with location data
    if (!isNewLocation) {
        idField.value = location.id;
        nameField.value = location.name || '';
        
        // Set category
        if (location.category) {
            categoryField.value = location.category;
        } else if (location.icon) {
            // Backward compatibility
            categoryField.value = location.icon.replace('.png', '');
        }
        // Update category preview
        updateCategoryPreview(categoryField.value, categoryPreview);
        
        descriptionField.value = location.description || '';
        
        // Handle sublocations
        if (Array.isArray(location.sublocs) && location.sublocs.length > 0) {
            hasSublocationsCheckbox.checked = true;
            sublocationsContainer.style.display = 'block';
            document.getElementById('location-image-container').style.display = 'none';
            
            // Add each sublocation to the form
            location.sublocs.forEach(subloc => {
                addNewSublocation(subloc);
            });
        } else {
            hasSublocationsCheckbox.checked = false;
            sublocationsContainer.style.display = 'none';
            document.getElementById('location-image-container').style.display = 'block';
            
            // Set image for location without sublocations
            if (location.image) {
                imageField.value = location.image;
                // Update image preview
                updateImagePreview(imageField.value, imagePreview);
            }
        }
        
        // Enable delete button for existing locations
        deleteButton.style.display = 'block';
    } else {
        // Set defaults for new location
        idField.value = '';
        nameField.value = '';
        categoryField.value = 'LM_Unknown';
        descriptionField.value = '';
        
        hasSublocationsCheckbox.checked = false;
        sublocationsContainer.style.display = 'none';
        document.getElementById('location-image-container').style.display = 'block';
        
        // Hide delete button for new locations
        deleteButton.style.display = 'none';
    }
    
    // Show the form
    formContainer.style.display = 'block';
    // Add form container as Leaflet dialog
    const editDialog = L.control.dialog({
        size: [1024, 'auto'],
        position: 'topleft',
        'min-width': '600px',
        'max-width': '90%',
        minSize: [600, 'auto'],
        maxSize: [1200, 'auto']
    }).addTo(map);
    
    // Move the form into the dialog
    editDialog._container.querySelector('.leaflet-control-dialog-contents').appendChild(formContainer);
    
    // Show the dialog
    editDialog.open();
    
    // Store dialog reference for closing later
    form._dialog = editDialog;
}

/**
 * Adds a new sublocation to the form
 * @param {Object} sublocation - Optional existing sublocation data
 */
function addNewSublocation(sublocation = null) {
    const template = document.getElementById('sublocation-template');
    const sublocationsListContainer = document.getElementById('sublocations-list');
    
    // Clone the template
    const newSublocation = template.cloneNode(true);
    newSublocation.id = '';
    newSublocation.style.display = 'block';
    
    // Get form elements
    const nameField = newSublocation.querySelector('.sublocation-name');
    const categoryField = newSublocation.querySelector('.sublocation-category');
    const categoryPreview = newSublocation.querySelector('.sublocation-category-preview');
    const imageField = newSublocation.querySelector('.sublocation-image');
    const imagePreview = newSublocation.querySelector('.sublocation-image-preview');
    const descriptionField = newSublocation.querySelector('.sublocation-description');
    const removeButton = newSublocation.querySelector('.remove-sublocation');
    
    // Set up category options
    categoryField.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.replace('LM_', '');
        categoryField.appendChild(option);
    });
    
    // Set up image options
    imageField.innerHTML = '';
    images.forEach(image => {
        const option = document.createElement('option');
        option.value = image;
        option.textContent = image.replace('preview_', '').replace('.jpg', '').replace('.png', '');
        imageField.appendChild(option);
    });
    
    // Set up event listeners for preview updates
    categoryField.addEventListener('change', function() {
        updateCategoryPreview(this.value, categoryPreview);
    });
    
    imageField.addEventListener('change', function() {
        updateImagePreview(this.value, imagePreview);
    });
    
    // Populate with sublocation data if provided
    if (sublocation) {
        nameField.value = sublocation.name || '';
        
        // Set category
        if (sublocation.category) {
            categoryField.value = sublocation.category;
        } else if (sublocation.icon) {
            // Backward compatibility
            categoryField.value = sublocation.icon.replace('.png', '');
        }
        
        // Update category preview
        updateCategoryPreview(categoryField.value, categoryPreview);
        
        if (sublocation.image) {
            imageField.value = sublocation.image;
            // Update image preview
            updateImagePreview(imageField.value, imagePreview);
        }
        
        descriptionField.value = sublocation.description || '';
    } else {
        // Initialize previews with default values
        updateCategoryPreview(categoryField.value, categoryPreview);
        updateImagePreview(imageField.value, imagePreview);
    }
    
    // Add event listener for remove button
    removeButton.addEventListener('click', function() {
        sublocationsListContainer.removeChild(newSublocation);
    });
    
    // Add to the container
    sublocationsListContainer.appendChild(newSublocation);
}

/**
 * Closes the location edit form
 */
function closeLocationEditForm() {
    const form = document.getElementById('locationEditForm');
    
    if (form._dialog) {
        form._dialog.close();
        form._dialog = null;
    }
    
    // Reset form
    form.reset();
    
    // If we were creating a new location, remove it
    if (isCreatingLocation) {
        cancelLocationCreation();
    }
}

/**
 * Saves the location data from the form
 */
function saveLocationFromForm() {
    const form = document.getElementById('locationEditForm');
    const idField = document.getElementById('location-id');
    const nameField = document.getElementById('location-name');
    const categoryField = document.getElementById('location-category');
    const imageField = document.getElementById('location-image');
    const descriptionField = document.getElementById('location-description');
    const hasSublocationsCheckbox = document.getElementById('has-sublocations');
    
    // Validate required fields
    if (!idField.value.trim()) {
        notyf.error('Location ID is required');
        return;
    }
    
    if (idField.value.includes(' ')) {
        notyf.error('Location ID cannot contain spaces');
        return;
    }
    
    if (!nameField.value.trim()) {
        notyf.error('Location name is required');
        return;
    }
    
    if (!categoryField.value) {
        notyf.error('Category is required');
        return;
    }
    
    // Build location object
    const location = {
        id: idField.value.trim(),
        name: nameField.value.trim(),
        category: categoryField.value,
        description: descriptionField.value.trim()
    };
    
    // Get coordinates - find if this location exists on the map already
    let existingMarker = null;
    forEachLocationMarker(function(marker) {
        if (marker.options.id === location.id) {
            existingMarker = marker;
        }
    });
    
    // Get coordinates from existing marker or from the new marker if creating
    if (existingMarker) {
        const latLng = existingMarker.getLatLng();
        location.latlng = [latLng.lat, latLng.lng];
    } else if (isCreatingLocation && tempMarker) {
        const latLng = tempMarker.getLatLng();
        location.latlng = [latLng.lat, latLng.lng];
    } else {
        notyf.error('Cannot determine location coordinates');
        return;
    }
    
    // Handle sublocations or image
    if (hasSublocationsCheckbox.checked) {
        // Get all sublocation elements
        const sublocationElements = document.querySelectorAll('#sublocations-list > div');
        const sublocs = [];
        
        // Validate each sublocation
        for (let i = 0; i < sublocationElements.length; i++) {
            const elem = sublocationElements[i];
            const subName = elem.querySelector('.sublocation-name').value.trim();
            const subCategory = elem.querySelector('.sublocation-category').value;
            const subImage = elem.querySelector('.sublocation-image').value;
            
            if (!subName) {
                notyf.error(`Sublocation #${i+1} name is required`);
                return;
            }
            
            if (!subCategory) {
                notyf.error(`Sublocation #${i+1} category is required`);
                return;
            }
            
            if (!subImage) {
                notyf.error(`Sublocation #${i+1} image is required`);
                return;
            }
            
            sublocs.push({
                name: subName,
                category: subCategory,
                image: subImage,
                description: elem.querySelector('.sublocation-description').value.trim()
            });
        }
        
        if (sublocs.length === 0) {
            notyf.error('At least one sublocation is required');
            return;
        }
        
        location.sublocs = sublocs;
    } else {
        // Validate image for location without sublocations
        if (!imageField.value) {
            notyf.error('Image is required for locations without sublocations');
            return;
        }
        
        location.image = imageField.value;
    }
    
    // Add location to edited locations
    editedLocations.add(location.id);
    
    // Update existing marker or create a new one
    if (existingMarker) {
        // Store the old category before updating location data
        const oldCategory = existingMarker.options.location_data.category;
        
        // Update location data
        existingMarker.options.location_data = location;
        
        // Update popup content
        existingMarker.setPopupContent(MAP_UTILS.createLocationHTML(location));
        
        // Update icon if category changed
        if (oldCategory !== location.category) {
            existingMarker.setIcon(MAP_UTILS.createLocationIcon(location.category));
        }
    } else if (isCreatingLocation && tempMarker) {
        // If we're creating a new location, add it to the appropriate layer
        let layerKey = 'pois'; // Default to POIs
        
        if (location.category && MAP_CONFIG.CATEGORY_MAPPING[location.category]) {
            layerKey = MAP_CONFIG.CATEGORY_MAPPING[location.category];
        }
        
        // Remove temporary marker
        tempMarker.remove();
        tempMarker = null;
        
        // Add the real marker
        MAP_UTILS.addLocationMarker(MAP_CONFIG.LAYER_GROUPS[layerKey], location);
        
        // Reset creation mode
        isCreatingLocation = false;
        
        // Reset the create button
        const createButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Create Location"]');
        if (createButton) {
            createButton.style.backgroundColor = '';
        }
    }
    
    // Enable save button
    const saveButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Save All"]');
    if (saveButton) {
        saveButton.style.opacity = '1';
        saveButton.style.pointerEvents = 'auto';
    }
    
    // Close the form
    closeLocationEditForm();
    
    // Show success message
    notyf.success(`Location "${location.name}" changed`);
    
    // Update marker click behavior
    updateMarkerClickBehavior();
}

// Temporary marker for new location creation
let tempMarker = null;

/**
 * Starts the location creation process
 */
function startLocationCreation() {
    // If already in creation mode, cancel it
    if (isCreatingLocation) {
        cancelLocationCreation();
        return;
    }
    
    // Must be in editing mode
    if (!isEditingMode) {
        notyf.error('Switch to editing mode first');
        return;
    }
    
    // Set creation mode
    isCreatingLocation = true;
    
    // Highlight the create button
    const createButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Create Location"]');
    if (createButton) {
        createButton.style.backgroundColor = '#4CAF50';
    }
    
    // Show notification
    notyf.success('Click on the desired point on the map to create a new location');
    
    // Set up click handler for the map
    map.once('click', function(e) {
        // Create a temporary marker at the clicked location
        tempMarker = L.marker(e.latlng, {
            icon: MAP_UTILS.createLocationIcon('LM_Unknown'),
            opacity: 0.7,
            draggable: true
        }).addTo(map);
        
        // Create new location object
        const newLocation = {
            id: 'new',
            name: 'New Location',
            category: 'LM_Unknown',
            latlng: [e.latlng.lat, e.latlng.lng],
            description: ''
        };
        
        // Show the edit form for the new location
        showLocationEditForm(newLocation);
    });
}

/**
 * Cancels the location creation process
 */
function cancelLocationCreation() {
    // Reset creation mode
    isCreatingLocation = false;
    
    // Reset the create button
    const createButton = document.querySelector('.leaflet-control.leaflet-bar a[title="Create Location"]');
    if (createButton) {
        createButton.style.backgroundColor = '';
    }
    
    // Remove temporary marker if it exists
    if (tempMarker) {
        tempMarker.remove();
        tempMarker = null;
    }
    
    // Remove map click handler
    map.off('click');
}

/**
 * Deletes a location by ID
 * @param {string} locationId - The ID of the location to delete
 */
async function deleteLocation(locationId) {
    try {
        // Send delete request to server
        const response = await fetch(MAP_CONFIG.API_ENDPOINTS.deleteLocation + locationId, {
            method: 'DELETE',
            headers: {
                'X-Token': sessionStorage.getItem('token')
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete location: ${response.statusText}`);
        }
        
        // Remove the marker from the map
        let markerFound = false;
        forEachLocationMarker(function(marker) {
            if (marker.options.id === locationId) {
                marker.remove();
                markerFound = true;
            }
        });
        
        if (!markerFound) {
            throw new Error('Marker not found on map');
        }
        
        // Close the form
        closeLocationEditForm();
        
        // Show success message
        notyf.success(`Location deleted successfully`);
        
        // Remove from edited locations if it was there
        editedLocations.delete(locationId);
        
    } catch (error) {
        console.error('Error deleting location:', error);
        notyf.error(`Failed to delete location: ${error.message}`);
    }
}

/**
 * Updates the category preview image
 * @param {string} category - The category value
 * @param {HTMLElement} previewElement - The preview element to update
 */
function updateCategoryPreview(category, previewElement) {
    if (!category || !previewElement) return;
    
    const iconUrl = `res/images/icons/${category}.png`;
    previewElement.src = iconUrl;
    previewElement.style.display = 'inline-block';
}

/**
 * Updates the image preview
 * @param {string} image - The image value
 * @param {HTMLElement} previewElement - The preview element to update
 */
function updateImagePreview(image, previewElement) {
    if (!image || !previewElement) return;
    
    // Handle both local and external URLs
    const imagePath = image.startsWith('http')
        ? image
        : `res/images/locations/${image}`;
    
    previewElement.src = imagePath;
    previewElement.style.display = 'inline-block';
}

// Make editor functions globally available
window.editorLogin = editorLogin;