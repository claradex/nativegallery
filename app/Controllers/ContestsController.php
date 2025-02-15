<?php
namespace App\Controllers;

use \App\Services\{Router, Auth, DB, Json};
use \App\Controllers\ExceptionRegister;
use \App\Core\Page;

class ContestsController
{
    public static function results()
    {
       Page::set('Contests/VotingResults');
       
    }
    public static function index()
    {
       Page::set('Contests/VotingIndex');
       
    }
    public static function waiting()
    {
       Page::set('Contests/VotingWaiting');
       
    }
    public static function sendpretend()
    {
       Page::set('Contests/VotingSendPretend');
       
    }

}