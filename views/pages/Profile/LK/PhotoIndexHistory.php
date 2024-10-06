<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>

    <body>
    <div id="backgr"></div>
    <table class="tmain">
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
        <tr>
            <td class="main">
                <center>
                    <h1>История изменения индекса загрузки</h1>
                    <table>
                        <tr>
                            <th>Дата и время</th>
                            <th class="r">Индекс</th>
                            <th class="r">Изменение</th>
                            <th>Действие</th>
                            <th>Фотография</th>
                        </tr>
                        <?php
                        $indexhistory = DB::query('SELECT * FROM uploadindex_history WHERE user_id=:uid ORDER BY id DESC', array(':uid'=>Auth::userid()));
                        foreach ($indexhistory as $ih) {
                            if ($ih['type'] === 1) {
                                $type = 'Публикация';
                                $class = 's12';
                            } else if ($ih['type'] === 2) {
                                $type = 'Отклонение';
                                $class = 's15';
                            }
                            echo '<tr class="'.$class.'">
                            <td class="ds">09.07.2024 15:39:10</td>
                            <td class="r"><b>2.5</b></td>
                            <td class="r">+0.5</td>
                            <td class="ds">'.$type.'</td>
                            <td class="d"><a href="/photo/'.$ih['photo_id'].'" target="_blank">/photo/'.$ih['photo_id'].'</a></td>
                        </tr>';
                        }
                        ?>
                       
                      
                    </table><br>
                </center>
            </td>
        </tr>
       
        <tr>
        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>
        </tr>
    </table>

  
</body>

</html>