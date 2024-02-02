<?php

function response($values,$code = 200) {
    header("Content-Type: application/json");
    http_response_code($code);
    echo json_encode($values);
}

function denied() {
    response(["error" => "gtfo"],403);
    db_close();
    die();
}

function get_config() {
    global $config;
    require_once('config.php');
    $config['db_host'] = $db_host;
    $config['db_user'] = $db_user;
    $config['db_pass'] = $db_pass;
    $config['db_name'] = $db_name;
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

function require_post() {
     $data = file_get_contents('php://input');
     if ($data) {
        $data = json_decode($data,true);
        return $data;
     }
     denied();
}

function gen_jwt($key,$id) {
    $header = [ 
        "alg" => "HS256", 
        "typ" => "JWT" 
    ];
    $header = base64_url_encode(json_encode($header));
    $payload =  [
        "id" => $id,
    ];
    $payload = base64_url_encode(json_encode($payload));
    $signature = base64_url_encode(hash_hmac('sha256', "$header.$payload", $key, true));
    $jwt = "$header.$payload.$signature";
    return $jwt;    
}

/**
 * per https://stackoverflow.com/questions/2040240/php-function-to-generate-v4-uuid/15875555#15875555
 */
function base64_url_encode($text):String{
    return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($text));
}
function base64_url_decode($text):String{
    return base64_decode(str_replace(['-', '_'], ['+', '/'], $text));
}

function check_token() {
    global $db;
    if (isset($_SERVER['HTTP_X_TOKEN'])) {
        $token_data = explode('.',$_SERVER['HTTP_X_TOKEN']);
        if (isset($token_data[1])) {
            $payload = $token_data[1];
            $user = json_decode(base64_url_decode($payload));
            if ($user->id) {
                db_init();
                $id = $db->real_escape_string($user->id);
                $result = $db->query("SELECT id,pw FROM users where id = '{$id}'");
                if ($result->num_rows === 1) {
                    $valid_user = $result->fetch_assoc();
                    $valid_token = gen_jwt($valid_user['pw'],$valid_user['id']);
                    if ($valid_token === $_SERVER['HTTP_X_TOKEN']) {
                        return true;
                    }
                }
                $result->free();
            }
        }
    }
    denied();
}