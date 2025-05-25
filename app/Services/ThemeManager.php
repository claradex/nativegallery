<?php

namespace App\Services;

use Symfony\Component\Yaml\Yaml;
use Symfony\Component\Yaml\Exception\ParseException;
use RuntimeException, InvalidArgumentException;


class ThemeManager
{
    private $themepacksPath;
    private $loadedThemes = [];
    private $defaultThemeId = 'standard';

    public function __construct(?string $themepacksPath = null)
    {
        $this->themepacksPath = $themepacksPath ?? $_SERVER['DOCUMENT_ROOT'] . '/static/themepacks';
    }

    public function loadThemes(): void
    {
        if (!is_dir($this->themepacksPath)) return;

        $folders = array_diff(scandir($this->themepacksPath), ['..', '.']);

        foreach ($folders as $folder) {
            $themePath = $this->themepacksPath . '/' . $folder;
            $configFile = $themePath . '/theme.yaml';
            $cssFile = $themePath . '/root.css';
            if (is_dir($themePath)) {
                try {
                    if (!file_exists($configFile)) {
                        throw new RuntimeException("Missing theme.yaml in {$folder}");
                    }
                    if (!file_exists($cssFile)) {
                        throw new RuntimeException("Missing root.css in {$folder}");
                    }

                    $config = Yaml::parseFile($configFile);
                    $this->validateThemeConfig($config, $folder);

                    $this->loadedThemes[$folder] = [
                        'id' => $folder,
                        'config' => $config,
                        'stylesheet' => '/static/themepacks/' . $folder . '/root.css'
                    ];
                } catch (ParseException | RuntimeException $e) {
                    error_log("Theme load error ({$folder}): " . $e->getMessage());
                }
            }
        }
    }

    public function getAllThemes(): array
    {
        $result = [];

        foreach ($this->loadedThemes as $theme) {
            $result[] = [
                'id' => $theme['id'],
                'name' => $theme['config']['name'],
                'version' => $theme['config']['version'],
                'author' => $theme['config']['author'],
                'supported_nativegallery' => $theme['config']['supported_nativegallery'],
                'stylesheet' => $theme['stylesheet']
            ];
        }

        return $result;
    }

    public function getThemeStylesheet(): ?string
    {
        $this->startSession();

        $themeId = $_SESSION['selected_theme'] ?? $this->defaultThemeId;

        if ($themeId === $this->defaultThemeId || !isset($this->loadedThemes[$themeId])) {
            return null;
        }

        return $this->loadedThemes[$themeId]['stylesheet'];
    }

    public function saveThemeToProfile(string $themeId): bool
    {
        if ($themeId !== $this->defaultThemeId && !isset($this->loadedThemes[$themeId])) {
            throw new InvalidArgumentException("Theme {$themeId} not found");
        }

        $this->startSession();
        $_SESSION['selected_theme'] = $themeId;
        return true;
    }

    public function getAvailableThemes(): array
    {
        return $this->loadedThemes;
    }

    private function validateThemeConfig(array $config, string $folder): void
    {
        $requiredFields = [
            'name',
            'version',
            'supported_nativegallery',
            'author'
        ];

        foreach ($requiredFields as $field) {
            if (!isset($config[$field])) {
                throw new RuntimeException(
                    "Missing required field '{$field}' in theme: {$folder}"
                );
            }
        }
    }

   public function getCurrentThemeId(): string {
        $this->startSession();
        return $_SESSION['selected_theme'] ?? $this->defaultThemeId;
    }

    public function getCurrentThemeName(): string {
        $themeId = $this->getCurrentThemeId();
        return $themeId === $this->defaultThemeId 
            ? 'Стандартная' 
            : $this->loadedThemes[$themeId]['config']['name'] ?? 'Неизвестная тема';
    }

    public function getThemeNameById(string $themeId): ?string
    {
        return $this->loadedThemes[$themeId]['config']['name'] ?? null;
    }

    private function startSession(): void
    {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
}
