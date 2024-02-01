<?php

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