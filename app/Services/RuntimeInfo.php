<?php

namespace App\Services;

class RuntimeInfo
{
    private static ?string $gitShort = null;
    private static ?string $mysqlVersion = null;

    public static function gitShortHash(string $branch = 'main'): string
    {
        if (self::$gitShort !== null) {
            return self::$gitShort;
        }

        $docRoot = (string) ($_SERVER['DOCUMENT_ROOT'] ?? '');
        $refFile = $docRoot . '/.git/refs/heads/' . $branch;
        $cacheFile = dirname(__DIR__, 2) . '/storage/cache/git-head.txt';

        if (is_readable($refFile)) {
            $hash = trim((string) file_get_contents($refFile));
            if ($hash !== '') {
                self::$gitShort = substr($hash, 0, 7);
                @file_put_contents($cacheFile, self::$gitShort, LOCK_EX);
                return self::$gitShort;
            }
        }

        if (is_readable($cacheFile)) {
            $cached = trim((string) file_get_contents($cacheFile));
            if ($cached !== '') {
                self::$gitShort = $cached;
                return self::$gitShort;
            }
        }

        self::$gitShort = 'dev';
        return self::$gitShort;
    }

    public static function mysqlVersion(): string
    {
        if (self::$mysqlVersion !== null) {
            return self::$mysqlVersion;
        }

        $cacheFile = dirname(__DIR__, 2) . '/storage/cache/mysql-version.txt';
        if (is_readable($cacheFile) && time() - filemtime($cacheFile) < 86400) {
            self::$mysqlVersion = trim((string) file_get_contents($cacheFile));
            if (self::$mysqlVersion !== '') {
                return self::$mysqlVersion;
            }
        }

        try {
            $row = DB::query('SELECT VERSION() AS v')[0] ?? [];
            self::$mysqlVersion = (string) ($row['v'] ?? $row['VERSION()'] ?? 'unknown');
        } catch (\Throwable) {
            self::$mysqlVersion = 'unknown';
        }

        @file_put_contents($cacheFile, self::$mysqlVersion, LOCK_EX);
        return self::$mysqlVersion;
    }
}