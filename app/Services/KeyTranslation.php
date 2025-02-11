<?php

namespace App\Services;

class KeyTranslation
{

    public static function key($key)
    {
        switch ($key) {
            case 'title':
                return 'Название сервера';
                break;
            case 'adminemail':
                return 'Почта Администратора';
                break;
            case 'showtitle':
                return 'Отображать название в заголовке';
                break;
            case 'logo':
                return 'Расположение логотипа';
                break;
            case 'description':
                return 'Описание сервера';
                break;
            case 'keywords':
                return 'Ключевые слова (для SEO)';
                break;
            case 'maintenance':
                return 'Режим технических работ';
                break;
            case 'debug':
                return 'Дебаг';
                break;
            case 'access':
                return 'Доступ к сайту';
                break;
            case 'type':
                return 'Тип';
                break;
            case 'countries':
                return 'Страны';
                break;
            case 'cloudflare-caching':
                return 'Кэширование Cloudflare (и прочих CDN)';
                break;
            default:
                return $key;
                break;
        }
    }
}
