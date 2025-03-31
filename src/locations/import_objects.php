<?php
require_once 'config.php';
require_once 'func.php';

get_config();
db_init();

// Begin transaction for atomic imports
$db->begin_transaction();

try {
    // Read and parse JavaScript objects file
    $jsData = file_get_contents('../res/objects.js');
    $jsData = str_replace(['var objects = ', "\t", "';"], '', $jsData);
    $locations = json_decode($jsData, true, JSON_INVALID_UTF8_SUBSTITUTE);

    if(json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('JSON parse error: '.json_last_error_msg());
    }

    // Prepare statements
    $locationStmt = $db->prepare("
        INSERT INTO locations
        (id, name, category, lat, lng, image, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ");

    $sublocStmt = $db->prepare("
        INSERT INTO sublocations
        (location_id, name, category, image, description)
        VALUES (?, ?, ?, ?, ?)
    ");

    $totalLocations = 0;
    $totalSublocs = 0;

    foreach($locations as $loc) {
        // Process main location
        $category = str_replace(['LM_', '.png'], '', $loc['icon']);
        
        $locationStmt->bind_param('sssddss',
            $loc['id'],
            $loc['name'],
            $category,
            $loc['latlng'][0],
            $loc['latlng'][1],
            $loc['image'],
            $loc['description']
        );
        
        if(!$locationStmt->execute()) {
            throw new Exception("Location insert failed: ".$locationStmt->error);
        }
        $totalLocations++;

        // Process sublocations if any
        if(!empty($loc['sublocs'])) {
            foreach($loc['sublocs'] as $subloc) {
                $subCategory = str_replace(['LM_', '.png'], '', $subloc['icon']);
                
                $sublocStmt->bind_param('sssss',
                    $loc['id'],
                    $subloc['name'],
                    $subCategory,
                    $subloc['image'],
                    $subloc['description']
                );
                
                if(!$sublocStmt->execute()) {
                    throw new Exception("Sublocation insert failed: ".$sublocStmt->error);
                }
                $totalSublocs++;
            }
        }
    }

    $db->commit();
    
    echo "Import completed successfully!\n";
    echo "Locations imported: $totalLocations\n";
    echo "Sublocations imported: $totalSublocs\n";

} catch(Exception $e) {
    $db->rollback();
    echo "Import failed: ".$e->getMessage()."\n";
    exit(1);
}

$locationStmt->close();
$sublocStmt->close();
$db->close();
