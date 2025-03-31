<?php

require 'locations.php';

if (isset($_GET['login'])) {
    $creds = Locations::require_post();
    $result = Locations::query("SELECT id FROM users WHERE user = '".Locations::escape($creds['user'])."' AND pw = '".Locations::escape($creds['pw'])."'");
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        $token = Locations::gen_jwt($creds['pw'], $user['id']);
        Locations::response(["token" => $token]);
    } else {
        Locations::denied();
    }
} elseif (isset($_GET['checktoken'])) {
    Locations::check_token();
    Locations::response(["result" => "ok"]);
} elseif (isset($_GET['getall'])) {
    $locations = Locations::get_locations();
    Locations::response($locations);
} else {
    Locations::response(["error" => "not found"], 404);
}
