<?php
namespace App\Services;
class APIResponse {
    private array $data;
    private int $httpCode;

    public function __construct() {
        $this->data = [];
        $this->httpCode = 200;
    }

    public static function data(array $data, int $httpCode = 200): self {
        $instance = new self();
        $instance->data = $data;
        $instance->httpCode = $httpCode;
        return $instance;
    }

    public function setData(array $data): self {
        $this->data = $data;
        return $this;
    }

    public function setHttpCode(int $httpCode): self {
        $this->httpCode = $httpCode;
        return $this;
    }

    public function addField(string $key, mixed $value): self {
        $this->data[$key] = $value;
        return $this;
    }

    public function toJson(): string {
        return json_encode($this->data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }

    public function send(): void {
        http_response_code($this->httpCode);
        header('Content-Type: application/json');
        echo $this->toJson();
        exit;
    }
}

