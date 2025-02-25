<?php
namespace App\Controllers;

use \App\Core\Page;

abstract class NGController
{
    protected $page;

    public function __construct()
    {
        $this->page = new Page();
    }

    protected function render(string $view, array $params = [])
    {
        $this->page->render($view, $params);
    }
}
