<?php

$config = [];
$db = null;

require 'helpers.php';

function response($values,$code = 200) {
    header("Content-Type: application/json");
    http_response_code($code);
    echo json_encode($values);
}

function get_config() {
    global $config;
    require_once('config.php');
    $config['db_host'] = $db_host;
    $config['db_user'] = $db_user;
    $config['db_pass'] = $db_pass;
    $config['db_name'] = $db_name;
    $config['jwt_key'] = $jwt_key;
}

function db_init() {
    global $db,$config;
    if (!$db) {
        $db = new mysqli($config['db_host'],$config['db_user'],$config['db_pass'],$config['db_name']);
        if ($db->connect_errno) {
            error_log("Failed to connect to the database: ".$db->connect_error);
            response(["error" => "internal server error"],500);
            die();
        }
    }
}

function db_close() {
    global $db;
    if ($db) {
        $db->close();
        $db = null;
    }
}

get_config();

if (isset($_GET['login'])) {
    if ($_GET['user'] && $_GET['pw']) {
        db_init();
        $user = $db->real_escape_string($_GET['user']);
        $pw = $db->real_escape_string($_GET['pw']);
        $result = $db->query("SELECT id FROM users where user = '{$user}' and pw = '{$pw}'");
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            $token = gen_jwt($config['jwt_key'],$user['id']);
            response(["token" => $token]);
        } else {
            response(["error" => "gtfo"],403);
        }
    }
} else {
    response(["error" => "not found"],404);
}

db_close();