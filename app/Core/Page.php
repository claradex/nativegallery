<?php

namespace App\Core;

use Latte\Engine;
use Exception;
use App\Services\Auth;
use App\Models\User;
use App\Services\DB;

class Page
{
    private $latte;
    private $layouts = [
        'dashboard' => 'dashboard.latte',
        'login' => null,
    ];
    private $defaultLayout = '@layout.latte';
    private $user;

    public function __construct()
    {
        $this->latte = new Engine;
        $this->latte->setTempDirectory($_SERVER['DOCUMENT_ROOT'] . '/cdn/lattecache');
        $this->user = new User(Auth::userid());
    }



    private function get_current_git_commit($branch = 'main')
    {
        if ($hash = file_get_contents(sprintf($_SERVER['DOCUMENT_ROOT'] . '/.git/refs/heads/%s', $branch))) {
            return mb_strimwidth($hash, 0, 7, "");
        } else {
            return false;
        }
    }



    public function render($template, $params = [])
    {
        $templatePath = $_SERVER['DOCUMENT_ROOT'] . "/views/pages/" . $template . ".latte";
        if (!file_exists($templatePath)) {
            throw new Exception("Template not found: " . $templatePath);
        }
        $params['ngallery'] = NGALLERY;
        $params['user_id'] = Auth::userid();
        $params['user'] = $this->user;
        $params['nonreviewedimgs'] = DB::query('SELECT COUNT(*) FROM photos WHERE moderated=0')[0]['COUNT(*)'];
        $params['lastcommit'] = self::get_current_git_commit();
        $params['mysqlversion'] = DB::query('SELECT VERSION()')[0]['VERSION()'];
        $params['db'] = \App\Services\DB::class;

        $layout = $this->layouts[$template] ?? $this->defaultLayout;
        if ($layout) {
            $params['layout'] = $_SERVER['DOCUMENT_ROOT'] . "/views/components/" . $layout;
        }

        $this->latte->render($templatePath, $params);
    }
}
