<?php

namespace App\Controllers\Api\Images;

use \App\Services\{Auth, DB, Date, HTMLParser, Image};
use DOMDocument, DOMXPath;

class LoadRecent
{
    private const CACHE_DIR = __DIR__ . '/../../../../storage/cache/recent/';
    private const CACHE_TTL = 300;
    private const BATCH_SIZE = 30;

    public function __construct()
    {
        header('Content-Type: application/json');
        
        try {
            $this->ensureCacheDirExists();
            
            echo $this->handleLocalRequest();
        } catch (\Exception $e) {
            echo json_encode(['error' => $e->getMessage()]);
        }
    }

    private function ensureCacheDirExists(): void
    {
        if (!file_exists(self::CACHE_DIR)) {
            mkdir(self::CACHE_DIR, 0755, true);
        }
    }

    private function handleLocalRequest(): string
    {
        $cacheKey = 'recent_' . md5(serialize($_GET));
        $cacheFile = self::CACHE_DIR . $cacheKey;

        if (file_exists($cacheFile) && time() - filemtime($cacheFile) < self::CACHE_TTL) {
            return file_get_contents($cacheFile);
        }

        $photos = $this->fetchPhotos();
        $userIds = array_column($photos, 'user_id');
        $users = $this->fetchUsers($userIds);
        $commentsCount = $this->fetchCommentsCount(array_column($photos, 'id'));

        $response = [];
        foreach ($photos as $p) {
            $response[] = $this->formatPhotoData($p, $users[$p['user_id']] ?? [], $commentsCount[$p['id']] ?? 0);
        }

        $jsonResponse = json_encode($response);
        file_put_contents($cacheFile, $jsonResponse);

        return $jsonResponse;
    }

    private function fetchPhotos(): array
    {
        return DB::query(
            'SELECT * FROM photos 
            WHERE moderated = 1 AND id < :id 
            ORDER BY id DESC 
            LIMIT ' . self::BATCH_SIZE,
            [':id' => $_GET['lastpid'] ?? 0]
        );
    }

    private function fetchUsers(array $userIds): array
    {
        if (empty($userIds)) return [];

        $users = DB::query(
            'SELECT id, username FROM users 
            WHERE id IN (' . implode(',', array_map('intval', $userIds)) . ')'
        );

        return array_combine(array_column($users, 'id'), $users);
    }

    private function fetchCommentsCount(array $photoIds): array
    {
        if (empty($photoIds)) return [];

        $counts = DB::query(
            'SELECT photo_id, COUNT(*) as cnt 
            FROM photos_comments 
            WHERE photo_id IN (' . implode(',', array_map('intval', $photoIds)) . ') 
            GROUP BY photo_id'
        );

        return array_combine(array_column($counts, 'photo_id'), array_column($counts, 'cnt'));
    }

    private function formatPhotoData(array $photo, array $user, int $comments): array
    {
        return [
            'id' => $photo['id'],
            'place' => htmlspecialchars($photo['place']),
            'date' => $this->formatDate($photo['posted_at']),
            'user_name' => $user['username'] ?? 'Unknown',
            'user_id' => $photo['user_id'],
            'photourl' => $photo['photourl'],
            'photourl_small' => $this->generateSmallUrl($photo['photourl']),
            'photourl_extrasmall' => Image::generateBlurredPlaceholder($photo['photourl']),
            'ccnt' => $comments
        ];
    }

    private function formatDate(int $timestamp): string
    {
        if ($timestamp === 943909200 || Date::zmdate($timestamp) === '30 ноября 1999 в 00:00') {
            return 'дата не указана';
        }
        return Date::zmdate($timestamp);
    }

    private function generateSmallUrl(string $url): string
    {
        return 'https://' . $_SERVER['SERVER_NAME'] . '/api/photo/compress?url=' . urlencode($url);
    }

}