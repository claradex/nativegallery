<?php

namespace App\Services;

/**
 * Cross-request file cache for expensive bootstrap reads (YAML/JSON on HDD).
 */
class ConfigCache
{
    private static function cacheDir(): string
    {
        return dirname(__DIR__, 2) . '/storage/cache/bootstrap';
    }

    private static function sourcesMtime(array $sources): int
    {
        $mtime = 0;
        foreach ($sources as $path) {
            if (is_readable($path)) {
                $mtime = max($mtime, (int) filemtime($path));
            }
        }
        return $mtime;
    }

    /**
     * @template T
     * @param array<int, string> $sources
     * @param callable(): T $builder
     * @return T
     */
    public static function remember(string $key, array $sources, callable $builder): mixed
    {
        $mtime = self::sourcesMtime($sources);
        $apcuKey = 'ng_cfg_' . $key . '_' . $mtime;

        if (function_exists('apcu_fetch')) {
            $cached = apcu_fetch($apcuKey, $ok);
            if ($ok) {
                return $cached;
            }
        }

        $dir = self::cacheDir();
        $cacheFile = $dir . '/' . $key . '.' . $mtime . '.php';

        if (is_readable($cacheFile)) {
            /** @var T $data */
            $data = include $cacheFile;
            if (function_exists('apcu_store')) {
                apcu_store($apcuKey, $data, 86400);
            }
            return $data;
        }

        if (is_dir($dir)) {
            foreach (glob($dir . '/' . $key . '.*.php') ?: [] as $old) {
                if ($old !== $cacheFile) {
                    @unlink($old);
                }
            }
        } else {
            @mkdir($dir, 0755, true);
        }

        $data = $builder();
        file_put_contents($cacheFile, '<?php return ' . var_export($data, true) . ';', LOCK_EX);

        if (function_exists('apcu_store')) {
            apcu_store($apcuKey, $data, 86400);
        }

        return $data;
    }
}