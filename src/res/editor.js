let logindialog;
let button_save_all;

function editorLogin() {
    console.log("editor init");
    if (sessionStorage.getItem('token')) {
        checkToken();
    } else {
        loginform = '<form id="loginForm">' +
        '<label for="username">Username:</label><br><input type="text" id="user" name="user"><br>' + 
        '<label for="password">Password:</label><br><input type="password" id="pw" name="pw"><br><br>' +
        '<button type="button" onclick="login()">Submit</button>' +
        '</form>';
        logindialog = L.control.dialog({size: [400,300],position: 'topleft'}).setContent(loginform).addTo(map);
    }
}

function editorInit() {
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
            L.DomEvent.on(link, 'click', L.DomEvent.stop)
                      .on(link, 'click', function () {
                        this.options.callback.call();
                      }, this);

            return container;
        }

    });

    button_save_all = new L.button_save_all();
    map.addControl(button_save_all);
}

function saveAll() {
    button_save_all.remove();

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/locations/?saveall', true);
    xhr.setRequestHeader('X-Token', sessionStorage.getItem('token'));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log('Save successful');
            } else {
                console.error('Save failed');
            }
            map.addControl(button_save_all);
        }
    };

    let locations_data = [];
    locations.eachLayer(function(layer){
        locations_data.push(layer.options.location_data);
    });
    xhr.send(JSON.stringify(locations_data));

}

function checkToken() {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/locations/?checktoken', true);
    xhr.setRequestHeader('X-Token', sessionStorage.getItem('token'));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log('Token valid');
                editorInit();
            } else {
                console.error('Token invalid');
                sessionStorage.removeItem('token');
            }
        }
    };

    xhr.send();
}

// thanks chatgpt
async function login() {
    const username = document.getElementById('user').value;
    const password = document.getElementById('pw').value;

    // Hashing password using SHA256
    const hashedPassword = await sha256(password);

    const formData = {
        user: username,
        pw: hashedPassword
    };

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/locations/?login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                const token = data.token;
                sessionStorage.setItem('token', token);
                console.log('Token:', token);
                logindialog.close();
                editorLogin();
            } else {
                console.error('Failed to login');
            }
        }
    };

    xhr.send(JSON.stringify(formData));
}

// SHA256 hashing function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}