<?php

use App\Services\{RuntimeInfo, ThumbUrl};

if (!function_exists('ng_asset_query')) {
    function ng_asset_query(): string
    {
        static $query = null;
        if ($query !== null) {
            return $query;
        }
        $query = RuntimeInfo::gitShortHash();
        if (defined('NGALLERY') && NGALLERY['root']['cloudflare-caching'] === true) {
            $query .= '.' . time();
        }
        return $query;
    }

    function ng_asset(string $path): string
    {
        return $path . '?' . ng_asset_query();
    }
}

if (!function_exists('ng_photo_thumb')) {
    function ng_photo_thumb(string $url, int $quality = 20): string
    {
        return ThumbUrl::resolve($url, $quality);
    }
}