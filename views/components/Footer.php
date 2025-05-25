<?php
use \App\Services\DB;

function get_current_git_commit($branch = 'main')
{
    if ($hash = file_get_contents(sprintf($_SERVER['DOCUMENT_ROOT'] . '/.git/refs/heads/%s', $branch))) {
        return mb_strimwidth($hash, 0, 7, "");
    } else {
        return false;
    }
}

?>



<td class="footer">
            <p>Aloha, Hawaii! | PHP <?=phpversion()?> | MySQL <?=DB::query('SELECT VERSION()')[0]['VERSION()']?> | Версия <?=get_current_git_commit ()?></p>
            <b><a href="/">Главная</a> &nbsp; &nbsp; <a href="/lk/">Личный кабинет</a> &nbsp; &nbsp; <a href="/rules">Правила</a> &nbsp; &nbsp; <a href="/about">О сервере</a></b><br>
            
          
          



        </td>

