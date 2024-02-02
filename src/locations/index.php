<?php

$config = [];
$db = null;

require 'func.php';

get_config();

if (isset($_GET['login'])) {
    $creds = require_post();
    db_init();
    $user = $db->real_escape_string($creds['user']);
    $pw = $db->real_escape_string($creds['pw']);
    $result = $db->query("SELECT id FROM users where user = '{$user}' and pw = '{$pw}'");
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        $token = gen_jwt($pw,$user['id']);
        response(["token" => $token]);
    } else {
        response(["error" => "gtfo"],403);
    }
} elseif (isset($_GET['checktoken'])) {
    check_token();
    response(["result" => "ok"]);
} elseif (isset($_GET['saveall'])) {
    check_token();
    $locations = require_post();
    if ($locations) {
        foreach ($locations as $location) {
            save($location);
        }
    } else {
        response(["error" => "malformed data"],400);
    }
} else {
    response(["error" => "not found"],404);
}
