<?php

namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class MessagesController extends NGController
{
   public function i()
   {
      $this->render('Messages/Index');
   }
}
