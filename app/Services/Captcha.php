<?php
namespace App\Services;
use Exception;
class Captcha
{
    private $secretKey;
    private $token;
    private $remoteIp;
    private $expectedAction;
    private $expectedCdata;

    public function __construct(string $secretKey)
    {
        $this->secretKey = $secretKey;
    }

    public function setToken(string $token): void
    {
        $this->token = $token;
    }

    public function setRemoteIp(string $ip): void
    {
        $this->remoteIp = $ip;
    }

    public function setExpectedAction(string $action): void
    {
        $this->expectedAction = $action;
    }

    public function setExpectedCdata(string $cdata): void
    {
        $this->expectedCdata = $cdata;
    }

    public function verify(): array
    {
        if (empty($this->token)) {
            throw new Exception('Turnstile token is missing');
        }

        if (empty($this->secretKey)) {
            throw new Exception('Secret key is not configured');
        }

        $data = [
            'secret' => $this->secretKey,
            'response' => $this->token
        ];

        if ($this->remoteIp) {
            $data['remoteip'] = $this->remoteIp;
        }

        $url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        $options = [
            'http' => [
                'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                'method' => 'POST',
                'content' => http_build_query($data)
            ]
        ];

        $context = stream_context_create($options);
        $response = file_get_contents($url, false, $context);
        
        if ($response === false) {
            throw new Exception('Failed to verify Turnstile token');
        }

        $result = json_decode($response, true);

        if (!is_array($result)) {
            throw new Exception('Invalid response from Turnstile server');
        }

        if (!$result['success']) {
            $errorCodes = $result['error-codes'] ?? ['unknown-error'];
            throw new Exception('Turnstile verification failed: ' . implode(', ', $errorCodes));
        }

        $this->validateAdditionalParameters($result);

        return $result;
    }

    private function validateAdditionalParameters(array $response): void
    {
        if ($this->expectedAction && ($response['action'] ?? '') !== $this->expectedAction) {
            throw new Exception("Action mismatch. Expected: {$this->expectedAction}, Received: {$response['action']}");
        }

        if ($this->expectedCdata && ($response['cdata'] ?? '') !== $this->expectedCdata) {
            throw new Exception("Cdata mismatch. Expected: {$this->expectedCdata}, Received: {$response['cdata']}");
        }
    }
}