<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User, Photo};

?>
<!DOCTYPE html>
<html lang="ru">

<head>
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/LoadHead.php'); ?>


</head>


<body>
    <div id="backgr"></div>
    <table class="tmain">
    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Navbar.php'); ?>
    <?php

?>
        <tr>
            <td class="main">
                <center>
                    <h1>Победители фотоконкурса</h1>
                    <p class="narrow" style="font-size:19px"><a href="/voting">Голосование</a> &nbsp;&middot;&nbsp; <b>Победители</b> &nbsp;&middot;&nbsp; <a href="/voting/rating">Рейтинг</a> &nbsp;&middot;&nbsp; <a href="/voting/waiting">Претенденты</a></p>
                    <?php
                     $photos = DB::query("SELECT * FROM contests_winners
                     WHERE place BETWEEN 1 AND 3
                     ORDER BY contest_id, place;
                     
                     ");

                    $grouped = [];
                    foreach ($photos as $row) {
                        $grouped[$row['contest_id']][] = $row;
                    }

                    // Разбиваем на блоки по 3 элемента
                    $final_result = [];
                    foreach ($grouped as $contest_id => $rows) {
                        $chunks = array_chunk($rows, 3);
                        foreach ($chunks as $chunk) {
                            $final_result[] = $chunk;
                        }
                    }

                    foreach ($final_result as $fc) {
                        $themeid = DB::query('SELECT themeid FROM contests WHERE id=:id', array(':id'=>$fc[0]['contest_id']))[0]['themeid'];
                        $theme = DB::query('SELECT title FROM contests_themes WHERE id=:id', array(':id'=>$themeid))[0]['title'];
                        echo '<p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-02-04" title="Подробный отчёт о конкурсе">'.date('d.m.Y', $fc[0]['date']).'</a></b></span><br><span class="sm">'.$theme.'</span></p>
                        <table>
                            <tr>';
                                foreach ($fc as $f) {
                                    $photo = new Photo($f['photo_id']);
                                    if ($f['place'] === 1) {
                                        $img = 'vs3';
                                    } else if ($f['place'] === 2) {
                                        $img = 'vs2';
                                    } else if ($f['place'] === 3) {
                                        $img = 'vs1';
                                    }
                                    echo '<a href="/photo/'.$f['photo_id'].'/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="'.$photo->i('photourl').'" class="f" style="margin-bottom:7px"><br><img src="/static/img/'.$img.'.png" style="position:relative; top:-2px"> &nbsp;</a>';
                                }
                                echo '
                            </tr>
                        </table><br>';
                    }

                   
                  
                    ?>
                     
                
                   
                    <p class="narrow" style="font-size:19px"><a href="/voting">Голосование</a> &nbsp;&middot;&nbsp; <b>Победители</b> &nbsp;&middot;&nbsp; <a href="/voting/rating">Рейтинг</a> &nbsp;&middot;&nbsp; <a href="/voting/waiting">Претенденты</a></p>
                </center>
            </td>
        </tr>

        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>