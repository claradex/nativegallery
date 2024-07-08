<?php
use \App\Services\DB;
?>

<td class="footer">
            <p>Aloha, Hawaii! | PHP <?=phpversion()?> | MySQL <?=DB::query('SELECT VERSION()')[0]['VERSION()']?></p>
            <b><a href="/">Главная</a> &nbsp; &nbsp; <a href="/lk/">Личный кабинет</a> &nbsp; &nbsp; <a href="/rules">Правила</a> &nbsp; &nbsp; <a href="/about">О сервере</a></b><br>
            
          
          

        </td>