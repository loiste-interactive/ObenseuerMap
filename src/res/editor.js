let logindialog;

function editorInit() {
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

function checkToken() {

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/?checktoken', true);
    xhr.setRequestHeader('X-Token', sessionStorage.getItem('token'));

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                console.log('Token valid');
            } else {
                console.error('Token invalid');
                sessionStorage.removeItem('token');
                editorInit();
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
    xhr.open('POST', '/api/?login', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                const token = data.token;
                sessionStorage.setItem('token', token);
                console.log('Token:', token);
                logindialog.close();
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