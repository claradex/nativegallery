<?php

namespace App\Controllers;

use \App\Services\{DB, Json};
use \App\Core\Router;
use \App\Core\Page;

class ExceptionRegister extends NGController
{

    public function notfound()
    {
        http_response_code(404);
        $this->render('Errors/404');
    }
}
