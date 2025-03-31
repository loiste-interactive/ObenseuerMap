let logindialog;
let button_save_all;
let button_logout;
let movedLocations = new Set(); // Track which locations have been moved
const notyf = new Notyf({
    duration: 2000,
    position: {
        x: 'center',
        y: 'bottom',
    },
    ripple: false
});

function editorLogin() {
    console.log("editor init");
    if (sessionStorage.getItem('token')) {
        checkToken();
    } else {
        loginform = '<form id="loginForm">' +
            '<label for="username">Username:</label><br><input type="text" id="user" name="user"><br>' +
            '<label for="password">Password:</label><br><input type="password" id="pw" name="pw"><br><br>' +
            '<button type="submit" id="loginButton">Submit</button>' +
            '</form>';
        logindialog = L.control.dialog({ size: [400, 300], position: 'topleft' }).setContent(loginform).addTo(map);

        document.getElementById('loginForm').addEventListener('submit', function (e) {
            e.preventDefault();
            login();
        });
    }
}

function editorInit() {
    // Add a small delay to ensure all markers are loaded before making them draggable
    setTimeout(() => {
        makeMarkersMovable();
    }, 1000);

    L.button_save_all = L.Control.extend({
        options: {
            name: 'Save All',
            position: 'topleft',
            html: '<span class="fas fa-save"></span>',
            callback: saveAll
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
                link = L.DomUtil.create('a', '', container);

            link.href = '#';
            link.title = this.options.name;
            link.innerHTML = this.options.html;
            link.style.opacity = '0.5';
            link.style.pointerEvents = 'none';
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', function () {
                    this.options.callback.call();
                }, this);

            return container;
        }
    });

    L.button_logout = L.Control.extend({
        options: {
            name: 'Log Out',
            position: 'topleft',
            html: '<span class="fas fa-sign-out-alt"></span>',
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar'),
                link = L.DomUtil.create('a', '', container);

            link.href = '#';
            link.title = this.options.name;
            link.innerHTML = this.options.html;
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                .on(link, 'click', function () {
                    sessionStorage.removeItem('token');
                    location.reload();
                }, this);

            return container;
        }
    });

    button_save_all = new L.button_save_all();
    button_logout = new L.button_logout();
    map.addControl(button_save_all);
    map.addControl(button_logout);
}

function checkToken() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/locations/checktoken', true);
    xhr.setRequestHeader('X-Token', sessionStorage.getItem('token'));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log('Token valid');
                editorInit();
            } else {
                console.error('Token invalid');
                sessionStorage.removeItem('token');
                notyf.error('Session expired. Please login again.');
            }
        }
    };

    xhr.send();
}

// thanks chatgpt
async function login() {
    const username = document.getElementById('user');
    const password = document.getElementById('pw');
    const button = document.getElementById('loginButton');
    const errorDiv = document.getElementById('loginError');

    username.disabled = true;
    password.disabled = true;
    button.disabled = true;
    const hashedPassword = await sha256(password.value);

    const formData = {
        user: username.value,
        pw: hashedPassword
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/locations/login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            username.disabled = false;
            password.disabled = false;
            button.disabled = false;

            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                const token = data.token;
                sessionStorage.setItem('token', token);
                console.log('Token:', token);
                logindialog.close();
                notyf.success('Login successful');
                editorLogin();
            } else {
                notyf.error('Login failed. Please try again.');
                console.error('Failed to login');
            }
        }
    };

    xhr.send(JSON.stringify(formData));
}

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function saveLocation(location) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/locations/save', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('X-Token', sessionStorage.getItem('token'));

        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    notyf.success('Location saved successfully');
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    notyf.error('Failed to save location');
                    reject(new Error('Failed to save location'));
                }
            }
        };

        xhr.send(JSON.stringify(location));
    });
}

// Make all markers draggable and track which ones have been moved
function makeMarkersMovable() {
    console.log("Making markers movable...");
    let markerCount = 0;
    
    locations.eachLayer(function(layer) {
        if (layer.options && layer.options.location_data) {
            markerCount++;
            // Make the marker draggable
            layer.dragging.enable();
            
            // Add event listener for when dragging ends
            layer.on('dragend', function(event) {
                const marker = event.target;
                const position = marker.getLatLng();
                
                // Update the location data with the new position
                marker.options.location_data.latlng = [position.lat, position.lng];
                
                // Add this location to the set of moved locations
                movedLocations.add(marker.options.id);
                
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
    });

    if (markerCount === 0) {
        // If no markers were found, try again after a short delay
        setTimeout(makeMarkersMovable, 1000);
    } else {
        notyf.success(`Editor functionality enabled.`);
    }
}

async function saveAll() {
    // Get only the moved locations from the map
    const locationsToSave = [];
    locations.eachLayer(function (layer) {
        if (layer.options && layer.options.location_data && movedLocations.has(layer.options.id)) {
            locationsToSave.push(layer.options.location_data);
        }
    });

    if (locationsToSave.length === 0) {
        notyf.error('No moved locations to save');
        return;
    }

    if (!confirm(`Save ${locationsToSave.length} moved locations?`)) {
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
            // Make sure location has category field (derived from icon if needed)
            if (location.icon && !location.category) {
                location.category = location.icon;
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
        notyf.success('All moved locations saved successfully');
        // Clear the moved locations set after successful save
        movedLocations.clear();
        // Disable save button
        saveButton.style.opacity = '0.5';
        saveButton.style.pointerEvents = 'none';
    } else {
        notyf.error(`Saved with ${failureCount} failures out of ${locationsToSave.length} locations`);
        console.error('Save failures:', results.filter(r => !r.success));
    }
}