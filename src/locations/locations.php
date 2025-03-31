<?php

class Locations
{
    private static $db;
    private static $config;

    public static function connect_db()
    {
        if (!self::$db) {
            self::get_config();
            self::$db = new mysqli(
                self::$config['db_host'],
                self::$config['db_user'],
                self::$config['db_pass'],
                self::$config['db_name']
            );

            if (self::$db->connect_errno) {
                self::response(["error" => "Database connection failed"], 500);
            }
        }
    }

    public static function query($sql)
    {
        self::connect_db();
        $result = self::$db->query($sql);

        if (!$result) {
            self::response([
                "error" => "Database query failed",
                "details" => [
                    "sql" => $sql,
                    "error" => self::$db->error
                ]
            ], 500);
        }

        return $result;
    }

    public static function escape($string)
    {
        self::connect_db();
        return self::$db->real_escape_string($string);
    }

    public static function check_token()
    {
        if (!isset($_SERVER['HTTP_X_TOKEN'])) {
            self::denied();
        }

        $token_parts = explode('.', $_SERVER['HTTP_X_TOKEN']);
        if (count($token_parts) < 3)
            self::denied();

        try {
            self::connect_db();
            $payload = json_decode(self::base64_url_decode($token_parts[1]));
            $user_id = self::$db->real_escape_string($payload->id);

            $result = self::query("SELECT id,pw FROM users WHERE id = '$user_id'");
            if ($result->num_rows !== 1)
                self::denied();

            $user = $result->fetch_assoc();
            $expected_token = self::gen_jwt($user['pw'], $user['id']);

            if ($_SERVER['HTTP_X_TOKEN'] !== $expected_token) {
                self::denied();
            }
        } catch (Exception $e) {
            self::denied();
        }
    }

    public static function response($data, $code = 200)
    {
        header("Content-Type: application/json");
        http_response_code($code);
        echo json_encode($data);

        if (self::$db) {
            self::$db->close();
            self::$db = null;
        }
        exit();
    }

    public static function get_locations()
    {
        self::connect_db();
        
        // Get main locations
        $locations = [];
        $result = self::query("
            SELECT id, name, category, lat, lng, image, description
            FROM oslocations.locations
        ");

        while ($row = $result->fetch_assoc()) {
            $loc = [
                'id' => $row['id'],
                'name' => $row['name'],
                'icon' => $row['category'] . '.png',
                'latlng' => [(float)$row['lat'], (float)$row['lng']],
                'image' => $row['image'],
                'description' => $row['description']
            ];

            // Get sublocations
            $subResult = self::query("
                SELECT name, category, image, description
                FROM oslocations.sublocations
                WHERE location_id = '" . self::escape($row['id']) . "'
            ");

            if ($subResult->num_rows > 0) {
                $loc['sublocs'] = [];
                while ($subRow = $subResult->fetch_assoc()) {
                    $loc['sublocs'][] = [
                        'name' => $subRow['name'],
                        'icon' => $subRow['category'] . '.png',
                        'image' => $subRow['image'],
                        'description' => $subRow['description']
                    ];
                }
            }

            $locations[] = $loc;
        }

        return $locations;
    }

    public static function denied()
    {
        self::response(["error" => "gtfo"], 403);
    }

    public static function require_post()
    {
        $data = file_get_contents('php://input');
        if ($data) {
            $data = json_decode($data, true);
            return $data;
        }
        self::denied();
    }

    private static function get_config()
    {
        if (!self::$config) {
            require_once('config.php');
            self::$config = [
                'db_host' => $db_host,
                'db_user' => $db_user,
                'db_pass' => $db_pass,
                'db_name' => $db_name
            ];
        }
    }

    public static function gen_jwt($key, $id)
    {
        $header = self::base64_url_encode(json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]));

        $payload = self::base64_url_encode(json_encode([
            'id' => $id
        ]));

        $signature = self::base64_url_encode(
            hash_hmac('sha256', "$header.$payload", $key, true)
        );

        return "$header.$payload.$signature";
    }

    private static function base64_url_encode($data)
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64_url_decode($data)
    {
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}