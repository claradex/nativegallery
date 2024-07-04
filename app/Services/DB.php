<?php
namespace App\Services;

use \PDO;

class DB {
    private static $pdoInstance = null;
    private static $cache = [];

    public static function connect() {
        if (self::$pdoInstance === null) {
            $dsn = 'mysql:host=127.127.126.50;dbname=ngallery;charset=utf8mb4';
            $username = 'root';
            $password = '';

            try {
                self::$pdoInstance = new PDO($dsn, $username, $password);
                self::$pdoInstance->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            } catch (PDOException $ex) {
                die("Connection failed: " . $ex->getMessage());
            }
        }

        return self::$pdoInstance;
    }

    public static function query($query, $params = array(), $useCache = false) {
        if ($useCache && isset(self::$cache[$query])) {
            return self::$cache[$query];
        }

        $statement = self::connect()->prepare($query);

        try {
            $statement->execute($params);

            if (explode(' ', $query)[0] === 'SELECT' || explode(' ', $query)[0] === 'SHOW' || explode(' ', $query)[0] === 'DESCRIBE') {
                $data = $statement->fetchAll(PDO::FETCH_ASSOC);
                if ($useCache) {
                    self::$cache[$query] = $data;
                }
                return $data;
            }
        } catch (PDOException $ex) {
            die("Query failed: " . $ex->getMessage());
        }
    }
}
?>
