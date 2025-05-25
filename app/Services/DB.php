<?php

namespace App\Services;

use PDO;
use PDOException;
use RuntimeException;
use InvalidArgumentException;

class DB
{
    const DRIVERS = ['mysql', 'pgsql', 'sqlite'];

    private static $config = [];
    private static $queryLog = [];
    private static $logger;
    private static $connectionPool = [];
    private static $poolSize = 5;

    /* Инициализация и конфигурация */
    public static function init(array $config): void
    {
        self::validateConfig($config);
        self::$config = array_merge([
            'driver' => 'mysql',
            'host' => 'localhost',
            'database' => '',
            'username' => '',
            'password' => '',
            'prefix' => '',
            'log_file' => null,
            'cache' => null,
            'benchmark' => false,
            'pool_size' => 5
        ], $config);

        self::$poolSize = self::$config['pool_size'];

        if (self::$config['log_file']) {
            self::$logger = new class(self::$config['log_file']) {
                private $file;

                public function __construct(string $path)
                {
                    $this->file = fopen($path, 'a');
                }

                public function log(string $message): void
                {
                    fwrite($this->file, date('[Y-m-d H:i:s] ') . $message . PHP_EOL);
                }

                public function __destruct()
                {
                    fclose($this->file);
                }
            };
        }
    }

    public static function lastInsertId() {
        return self::getConnection()->lastInsertId();
    }

    private static function validateConfig(array $config): void
    {
        if (!in_array($config['driver'], self::DRIVERS)) {
            throw new InvalidArgumentException('Invalid database driver');
        }
    }

    /* Пул соединений */
    private static function getConnection(): PDO
    {
        if (!empty(self::$connectionPool)) {
            return array_shift(self::$connectionPool);
        }

        $dsn = match (self::$config['driver']) {
            'mysql' => "mysql:host=" . self::$config['host'] . ";dbname=" . self::$config['database'] . ";charset=utf8mb4",
            'pgsql' => "pgsql:host=" . self::$config['host'] . ";dbname=" . self::$config['database'] . "",
            'sqlite' => "sqlite:" . self::$config['database'] . ""
        };

        try {
            $pdo = new PDO($dsn, self::$config['username'], self::$config['password'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true
            ]);

            if (self::$config['driver'] === 'mysql') {
                $pdo->exec("SET SQL_MODE='STRICT_ALL_TABLES'");
            }

            return $pdo;
        } catch (PDOException $e) {
            self::logError($e);
            throw new RuntimeException("Connection failed: " . $e->getMessage());
        }
    }

    private static function releaseConnection(PDO $connection): void
    {
        if (count(self::$connectionPool) < self::$poolSize) {
            self::$connectionPool[] = $connection;
        }
    }

    /* Основные методы */
    public static function query(string $sql, array $params = []): array
    {
        $start = microtime(true);
        $conn = self::getConnection();

        try {
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if (self::$config['benchmark']) {
                self::$queryLog[] = [
                    'query' => $sql,
                    'params' => $params,
                    'time' => microtime(true) - $start
                ];
            }

            self::releaseConnection($conn);
            return $result;
        } catch (PDOException $e) {
            self::logError($e);
            throw new RuntimeException("Query failed: " . $e->getMessage());
        }
    }

    /* Транзакции */
    public static function transaction(callable $callback)
    {
        $conn = self::getConnection();
        try {
            $conn->beginTransaction();
            $result = $callback();
            $conn->commit();
            self::releaseConnection($conn);
            return $result;
        } catch (\Exception $e) {
            $conn->rollBack();
            self::releaseConnection($conn);
            throw $e;
        }
    }


    /* Построитель запросов */
    public static function table(string $table): QueryBuilder
    {
        return new QueryBuilder(
            self::$config['prefix'] . $table,
            self::$config['driver']
        );
    }


    private static function logError(\Throwable $e): void
    {
        if (self::$logger) {
            self::$logger->log("ERROR: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
        }
    }






}

class QueryBuilder
{
    private $wheres = [];
    private $joins = [];
    private $columns = ['*'];
    private $bindings = [];

    public function __construct(
        private string $table,
        private string $driver 
    ) {
        // Добавляем проверку
        if (empty($this->driver)) {
            throw new RuntimeException('Database driver not configured');
        }
    }

    public function select(array $columns): self
    {
        $this->columns = $columns;
        return $this;
    }

    public function join(string $table, string $first, string $operator, string $second, string $type = 'INNER'): self
    {
        $this->joins[] = "$type JOIN $table ON $first $operator $second";
        return $this;
    }

    public function where(string $column, string $operator, $value): self
    {
        $param = 'where_' . count($this->bindings);
        $this->wheres[] = "$column $operator :$param";
        $this->bindings[$param] = $value;
        return $this;
    }

    public function get(): array
    {
        $sql = "SELECT " . implode(', ', $this->columns) . " FROM $this->table";

        if (!empty($this->joins)) {
            $sql .= " " . implode(' ', $this->joins);
        }

        if (!empty($this->wheres)) {
            $sql .= " WHERE " . implode(' AND ', $this->wheres);
        }

        return DB::query($sql, $this->bindings);
    }

    public function create(array $columns): void
    {
        $definitions = [];
        foreach ($columns as $name => $type) {
            $definitions[] = "$name $type";
        }

        $sql = "CREATE TABLE $this->table (" . implode(', ', $definitions) . ")";
        DB::query($sql);
    }
}
