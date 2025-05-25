<?php
require __DIR__.'/../../../../vendor/autoload.php';

use App\Services\Image;

try {
    error_log("BlurNewImage process started");
    
    $input = json_decode(file_get_contents('php://stdin'), true);
    
    if (!is_array($input)) {
        throw new \RuntimeException("Invalid input format");
    }

    $result = [];
    foreach ($input as $item) {
        try {
            if (!isset($item['id'], $item['photourl'], $item['content'])) {
                throw new \RuntimeException("Invalid item format");
            }
            
            $content = json_decode($item['content'], true, 512, JSON_THROW_ON_ERROR);
            
            $result[] = [
                'id' => $item['id'],
                'photourl_small' => Image::generateBlurredPlaceholder($item['photourl']),
                'photourl' => $item['photourl'],
                'lat' => (float)$content['lat'],
                'lng' => (float)$content['lng']
            ];
            
        } catch (\Throwable $e) {
            error_log("Error processing item {$item['id']}: " . $e->getMessage());
        }
    }
    
    echo json_encode($result);
    
} catch (\Throwable $e) {
    error_log("Critical error in BlurNewImage: " . $e->getMessage());
    echo json_encode([]);
    exit(1);
}