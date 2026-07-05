<?php

namespace App\Services;

/**
 * Resolves photo preview URLs with minimal disk/PHP overhead on HDD hosts.
 */
class ThumbUrl
{
    private const COMPRESS_QUALITY = 20;
    private const RESIZE_PERCENT = 35;
    private const CACHE_DIR = '/cdn/imgcache/';

    public static function resolve(string $url, int $quality = self::COMPRESS_QUALITY): string
    {
        $url = trim($url);
        if ($url === '') {
            return '';
        }

        $direct = self::localPublicUrl($url);
        if ($direct !== null) {
            return $direct;
        }

        $cached = self::compressCachePublicUrl($url, $quality);
        if ($cached !== null) {
            return $cached;
        }

        return '/api/photo/compress?url=' . rawurlencode($url)
            . ($quality !== self::COMPRESS_QUALITY ? '&quality=' . $quality : '');
    }

    public static function compressCachePath(string $sourceUrl, int $quality = self::COMPRESS_QUALITY): string
    {
        $docRoot = rtrim((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''), '/\\');
        $publicPath = self::compressCachePublicPath($sourceUrl, $quality);
        return $docRoot . $publicPath;
    }

    public static function compressCachePublicPath(string $sourceUrl, int $quality = self::COMPRESS_QUALITY): string
    {
        $resolved = self::resolveSourceForCache($sourceUrl);
        $params = [
            'url' => $resolved,
            'q' => $quality,
            'w' => 0,
            'h' => 0,
            'strip' => true,
            'resizePct' => self::RESIZE_PERCENT,
        ];
        $hash = md5(serialize($params));
        return self::CACHE_DIR . substr($hash, 0, 2) . '/' . $hash . '.jpg';
    }

    private static function compressCachePublicUrl(string $url, int $quality): ?string
    {
        $path = self::compressCachePath($url, $quality);
        if (is_readable($path) && filesize($path) > 0) {
            return self::compressCachePublicPath($url, $quality);
        }
        return null;
    }

    private static function resolveSourceForCache(string $url): string
    {
        if (str_contains($url, '://')) {
            return $url;
        }

        $docRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
        if ($docRoot === false) {
            return $url;
        }

        $path = ltrim(parse_url($url, PHP_URL_PATH) ?? $url, '/');
        $local = realpath($docRoot . '/' . $path);
        if ($local !== false && is_file($local) && str_starts_with($local, $docRoot)) {
            return $local;
        }

        return $url;
    }

    private static function localPublicUrl(string $url): ?string
    {
        if (str_contains($url, '://')) {
            $host = $_SERVER['HTTP_HOST'] ?? $_SERVER['SERVER_NAME'] ?? '';
            $parsed = parse_url($url);
            if (($parsed['host'] ?? '') !== $host) {
                return null;
            }
            $path = $parsed['path'] ?? '';
        } else {
            $path = $url;
        }

        $docRoot = realpath((string) ($_SERVER['DOCUMENT_ROOT'] ?? ''));
        if ($docRoot === false) {
            return null;
        }

        $rel = ltrim($path, '/');
        $full = realpath($docRoot . '/' . $rel);
        if ($full === false || !is_file($full) || !str_starts_with($full, $docRoot)) {
            return null;
        }

        $ext = strtolower(pathinfo($full, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true)) {
            return null;
        }

        return '/' . str_replace('\\', '/', $rel);
    }
}