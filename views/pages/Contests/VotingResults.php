<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

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
        <tr>
            <td class="main">
                <center>
                    <h1>Победители фотоконкурса</h1>
                    <p class="narrow" style="font-size:19px"><a href="/voting">Голосование</a> &nbsp;&middot;&nbsp; <b>Победители</b> &nbsp;&middot;&nbsp; <a href="/voting/rating">Рейтинг</a> &nbsp;&middot;&nbsp; <a href="/voting/waiting">Претенденты</a></p>
                    <div style="margin:20px">Для вывода подробного отчёта о конкурсе нажмите на интересующую вас дату.</div>
                    <div class="pages"><span class="pg">&laquo;&laquo;</span><span class="ps">1</span><a href="?show=results&amp;st=10" class="pg">2</a><a href="?show=results&amp;st=20" class="pg">3</a><a href="?show=results&amp;st=30" class="pg">4</a> &middot;&middot;&middot; <a href="?show=results&amp;st=2090" class="pg">210</a><a href="?show=results&amp;st=10" class="pg" id="NextLink">&raquo;&raquo;</a></div>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-02-04" title="Подробный отчёт о конкурсе">04.02.2025</a></b></span><br><span class="sm">Линии и пейзажи</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2066028/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/66/02/2066028_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2065380/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/65/38/2065380_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2064449/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/64/44/2064449_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-02-03" title="Подробный отчёт о конкурсе">03.02.2025</a></b></span><br><span class="sm">Линии и пейзажи</span></p>
                    <table>
                        <tr>
                            <a href="/photo/1894111/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/18/94/11/1894111_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2063989/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/63/98/2063989_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2061805/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/61/80/2061805_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-02-02" title="Подробный отчёт о конкурсе">02.02.2025</a></b></span><br><span class="sm">Фотографии транспорта</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2065272/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/65/27/2065272_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2064912/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/64/91/2064912_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2026071/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/26/07/2026071_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-02-01" title="Подробный отчёт о конкурсе">01.02.2025</a></b></span><br><span class="sm">Фотографии транспорта</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2064843/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/64/84/2064843_s.jpg?1" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2065143/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/65/14/2065143_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2063982/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/63/98/2063982_s.jpg?1" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-01-31" title="Подробный отчёт о конкурсе">31.01.2025</a></b></span><br><b class="sm">Итоговое голосование</b></p>
                    <table>
                        <tr>
                            <a href="/photo/2042060/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/42/06/2042060_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs5.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-01-30" title="Подробный отчёт о конкурсе">30.01.2025</a></b></span><br><span class="sm">Линии и пейзажи</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2058534/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/58/53/2058534_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2057575/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/57/57/2057575_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2058630/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/58/63/2058630_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-01-29" title="Подробный отчёт о конкурсе">29.01.2025</a></b></span><br><span class="sm">Фотографии транспорта</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2064029/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/64/02/2064029_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2065381/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/65/38/2065381_s.jpg?1" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2065050/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/65/05/2065050_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2065800/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/65/80/2065800_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-01-28" title="Подробный отчёт о конкурсе">28.01.2025</a></b></span><br><span class="sm">Фотографии транспорта</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2062445/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/62/44/2062445_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2048251/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/48/25/2048251_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2062446/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/62/44/2062446_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-01-26" title="Подробный отчёт о конкурсе">26.01.2025</a></b></span><br><span class="sm">Фотографии транспорта</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2061877/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/61/87/2061877_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs3.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2047310/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/47/31/2047310_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2060964/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/60/96/2060964_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <p><span class="narrow" style="font-size:21px"><b><a href="?show=table&amp;date=2025-01-25" title="Подробный отчёт о конкурсе">25.01.2025</a></b></span><br><span class="sm">Фотографии транспорта</span></p>
                    <table>
                        <tr>
                            <a href="/photo/2061294/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/61/29/2061294_s.jpg?2" class="f" style="margin-bottom:7px"><br><img src="/img/vs4.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2061425/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/61/42/2061425_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs2.png" style="position:relative; top:-2px"> &nbsp;</a>
                            <a href="/photo/2048649/" class="p20" style="display:table-cell; text-align:center; vertical-align:bottom; padding:20px 20px 10px; font-size:17px"><img src="/img/prw-loader.gif" data-src="/photo/20/48/64/2048649_s.jpg" class="f" style="margin-bottom:7px"><br><img src="/img/vs1.png" style="position:relative; top:-2px"> &nbsp;</a>
                        </tr>
                    </table><br>
                    <div class="pages"><span class="pg">&laquo;&laquo;</span><span class="ps">1</span><a href="?show=results&amp;st=10" class="pg">2</a><a href="?show=results&amp;st=20" class="pg">3</a><a href="?show=results&amp;st=30" class="pg">4</a> &middot;&middot;&middot; <a href="?show=results&amp;st=2090" class="pg">210</a><a href="?show=results&amp;st=10" class="pg" id="NextLink">&raquo;&raquo;</a></div>
                    <p class="narrow" style="font-size:19px"><a href="/voting.php">Голосование</a> &nbsp;&middot;&nbsp; <b>Победители</b> &nbsp;&middot;&nbsp; <a href="?show=rating">Рейтинг</a> &nbsp;&middot;&nbsp; <a href="?show=waiting">Претенденты</a></p>
                </center>
            </td>
        </tr>

        <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>