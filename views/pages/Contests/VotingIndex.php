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
        <script>

var kid = 2119;
var tipTimeout = null;


function hideTip()
{
	$('#tip').fadeOut('fast', function()
	{
		$(this).attr('lock', 0);
		$('#img').html('');
	});
}


$(document).ready(function()
{
	$('.contestBtn').click(function()
	{
		var pid = $(this).attr('pid');
		var savedClass = $(this).attr('class');
		$(this).addClass('loading');

		$.getJSON('/api.php', { action: 'vote-contest', kid: kid, pid: pid }, function (data)
		{
			if (data[0])
			{
				for (var pid in data[0])
					$('.contestBtn[pid="' + pid + '"]').attr('class', 'contestBtn' + (data[0][pid] == 0 ? '' : ' voted'));
			}
			else $('.contestBtn[pid="' + pid + '"]').attr('class', savedClass);

			if (data[1]) alert(data[1]);
		})
		.fail(function(jx) { alert(jx.responseText); });

		return false;
	});


	$(document).on('mouseenter', '.f', function()
	{
		var hidden_img = $(this).closest('.p20p').prev('img');
		$('#img').html('<a href="/photo/' + hidden_img.attr('pid') + '/" target="_blank"><img src="' + (hidden_img.length ? hidden_img.attr('src') : this.src.replace('_s', '')) + '"></a>');
		$('#tip').css('top', $(window).scrollTop() + 20).show();
	})
    .on('mouseenter', '.f, #tip', function()
    {
        clearTimeout(tipTimeout);
        var lock = Math.min(parseInt($('#tip').attr('lock')) + 1, 2);
        $('#tip').attr('lock', lock);
    })
    .on('mouseleave', '.f, #tip', function()
    {
        var lock = Math.max(parseInt($('#tip').attr('lock')) - 1, 0);
        $('#tip').attr('lock', lock);
        tipTimeout = setTimeout(function() { if ($('#tip').attr('lock') == 0) hideTip(); }, 100);
    })
    .on('mousemove', '.f, #tip', function(e)
    {
        if (e.pageX > $(document).width() * 0.5) hideTip();
    });
});
</script>
        <tr>
            <td class="main">

                <center>
                    <h1>Фотоконкурс</h1>

                    <p class="narrow" style="font-size:19px"><b>Голосование</b> &nbsp;&middot;&nbsp; <a href="results">Победители</a> &nbsp;&middot;&nbsp; <a href="/voting/rating">Рейтинг</a> &nbsp;&middot;&nbsp; <a href="/voting/waiting">Претенденты</a></p>
                    <div style="margin-top:20px">Чтобы проголосовать, отметьте одну, две или три фотографии, которые Вам понравились</div><br><br>
                    <?php
                    if (DB::query('SELECT status FROM contests WHERE status=2')[0]['status'] != 2) {
                        $contest = DB::query('SELECT * FROM contests WHERE status=0')[0];
                        echo '<div class="p20">
                        <h4>Сейчас конкурс не проводится. Пожалуйста, заходите позже.</h4>
                    </div>    
                    <script>startCountdown(' . $contest['openpretendsdate'] . ');</script>
    <h2>Следующий Фотоконкурс будет через:</h2>
    <h1 id="countdown"></h1>';
                    } else { ?>
                        <div id="tip" lock="0"><span id="img"></span></div>
                        <?php
                        $photos_contest = DB::query('SELECT * FROM photos WHERE on_contest=1');
                        foreach ($photos_contest as $pc) {
                            echo '<img pid="2068176" src="/photo/20/68/17/2068176.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2068176" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2068176"><a href="/photo/2068176/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/68/17/2068176_s.jpg" alt="630 КБ">
                                            <div class="hpshade">
                                                <div class="com-icon">2</div>
                                                <div class="eye-icon">182</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/237/" target="_blank">Гота</a></span>, &nbsp;Schindler/Siemens Be 4/8 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/97221/#n586477" target="_blank">222</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=237&amp;type=1&amp;route=4" class="route">4</a></span></span><br><a href="/city/237/" target="_blank">Гота</a> &mdash; <a href="/articles/166/" target="_blank">Разные фотографии</a></p>
                                        <p><b class="pw-place">Boxberg <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Leina</b><br><br><span class="pw-descr">Настоящий немецкий Сайлент Хилл!<br />
                                                <br />
                                                Echtes deutsches Silent Hill!</span></p>
                                        <p class="sm"><b>26 декабря 2024 г., четверг</b><br>Автор: <a href="/author/24525/">KIA-Trainz</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>';
                        }
                        ?>
                        <img pid="2073198" src="/photo/20/73/19/2073198.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2073198" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2073198"><a href="/photo/2073198/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/73/19/2073198_s.jpg" alt="526 КБ">
                                            <div class="hpshade">
                                                <div class="eye-icon">246</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/2/" target="_blank">Санкт-Петербург</a></span>, <span class="s5">&nbsp;ЛВС-86К &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/4653/#n4758" target="_blank">8200</a></span></span>&nbsp;</span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=2&amp;type=1&amp;route=52" class="route">52</a></span></span><br><a href="/city/2/" target="_blank">Санкт-Петербург</a> &mdash; <a href="/articles/1129/" target="_blank">Трамвайные линии и инфраструктура</a></p>
                                        <p><b class="pw-place">Проспект Маршала Жукова</b></p>
                                        <p class="sm"><b>18 ноября 2023 г., суббота</b><br>Автор: <a href="/author/19181/">Матвей Батуро</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <img pid="2069925" src="/photo/20/69/92/2069925.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2069925" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2069925"><a href="/photo/2069925/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/69/92/2069925_s.jpg" alt="797 КБ">
                                            <div class="hpshade">
                                                <div class="com-icon">5</div>
                                                <div class="eye-icon">251</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/2/" target="_blank">Санкт-Петербург</a></span>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/562421/#n745611" target="_blank">7903</a></span></span> &nbsp;—&nbsp; перегонка</span></span><br><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;ПР (18М) &nbsp;<span class="nw">№ <b><a href="/vehicle/5073/#n5182" target="_blank">С-7116</a></b></span> &nbsp;—&nbsp; перегонка</span></p>
                                        <p><b class="pw-place">Улица Куйбышева</b></p>
                                        <p class="sm"><b>18 января 2025 г., суббота</b><br>Автор: <a href="/author/36016/">bo1ng10</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <img pid="2070488" src="/photo/20/70/48/2070488.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2070488" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2070488"><a href="/photo/2070488/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/70/48/2070488_s.jpg" alt="656 КБ">
                                            <div class="hpshade">
                                                <div class="com-icon">5</div>
                                                <div class="eye-icon">328</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, <span class="s5">&nbsp;71-134А (ЛМ-99АВ) &nbsp;<span class="nw">№ <b><a href="/vehicle/5784/#n5890" target="_blank">8318</a></b></span>&nbsp;</span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=41" class="route">41</a></b></span></p>
                                        <p><b class="pw-place">Садовая улица</b></p>
                                        <p class="sm"><b>31 января 2025 г., пятница</b><br>Автор: <a href="/author/31083/">Yastrebov Nikolay</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <img pid="1456406" src="/photo/14/56/40/1456406.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="1456406" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p1456406"><a href="/photo/1456406/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/14/56/40/1456406_s.jpg" alt="481 КБ">
                                            <div class="hpshade">
                                                <div class="com-icon">1</div>
                                                <div class="eye-icon">582</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/101/" target="_blank">Харьков</a></span>, &nbsp;T3-ВПСт &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/452625/#n558420" target="_blank">3011</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=101&amp;type=1&amp;route=3" class="route">3</a>, СМЕ 3011+3012</span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/101/" target="_blank">Харьков</a></span>, &nbsp;T3-ВПСт &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/452626/#n558421" target="_blank">3012</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=101&amp;type=1&amp;route=3" class="route">3</a>, СМЕ 3011+3012</span></span><br><a href="/city/101/" target="_blank">Харьков</a> &mdash; <a href="/articles/5380/" target="_blank">Трамвайные линии</a></p>
                                        <p><b class="pw-place">Сергіївський майдан <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Павлівська площа</b> | Сергиевская площадь <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Павловская площадь</p>
                                        <p class="sm"><b>6 марта 2021 г., суббота</b><br>Автор: <a href="/author/21015/">Moon_Expedition</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <img pid="2074014" src="/photo/20/74/01/2074014.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2074014" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2074014"><a href="/photo/2074014/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/01/2074014_s.jpg" alt="555 КБ">
                                            <div class="hpshade">
                                                <div class="com-icon">16</div>
                                                <div class="eye-icon">1286</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;ЛВС-86К &nbsp;<span class="nw">№ <b><a href="/vehicle/135069/#n130294" target="_blank">5117</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=19" class="route">19</a></b></span><br><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-638-02 «Поларис» &nbsp;<span class="nw">№ <b><a href="/vehicle/604225/#n803377" target="_blank">5810</a></b></span></span></p>
                                        <p><b class="pw-place">К/ст &quot;Лахтинский разлив&quot;</b></p>
                                        <p class="sm"><b>10 февраля 2025 г., понедельник</b><br>Автор: <a href="/author/26699/">Qwerty_qwertovich</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <img pid="2072063" src="/photo/20/72/06/2072063.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2072063" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2072063"><a href="/photo/2072063/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/06/2072063_s.jpg" alt="674 КБ">
                                            <div class="hpshade">
                                                <div class="eye-icon">224</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, <span class="s3">&nbsp;81-717 (ЛВЗ) &nbsp;<span class="nw">№ <b><a href="/vehicle/258072/#n614988" target="_blank">8451</a></b></span>&nbsp;</span></span></p>
                                        <p><b class="pw-place">Электродепо &quot;Московское&quot; (ТЧ-3)</b><br><br><span class="pw-descr">Маневровые передвижения</span></p>
                                        <p class="sm"><b>7 февраля 2025 г., пятница</b><br>Автор: <a href="/author/20006/">frunzenecc</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <img pid="2068816" src="/photo/20/68/81/2068816.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2068816" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2068816"><a href="/photo/2068816/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/68/81/2068816_s.jpg" alt="675 КБ">
                                            <div class="hpshade">
                                                <div class="com-icon">3</div>
                                                <div class="eye-icon">322</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><b><a href="/city/89/" target="_blank">Брест</a></b>, &nbsp;МАЗ-ЭТОН Т103 &nbsp;<span class="nw">№ <b><a href="/vehicle/54899/#n53610" target="_blank">118</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=89&amp;type=2&amp;route=102" class="route">102</a></b></span></p>
                                        <p><b class="pw-place">Вуліца Гаўрылава</b> | Улица Гаврилова</p>
                                        <p class="sm"><b>29 января 2025 г., среда</b><br>Автор: <a href="/author/28158/">Ivan Tkachenko</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <img pid="2060153" src="/photo/20/60/15/2060153.jpg" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="2060153" class="contestBtn"></a></td>
                                    <td class="pb_photo" id="p2060153"><a href="/photo/2060153/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/60/15/2060153_s.jpg" alt="486 КБ">
                                            <div class="hpshade">
                                                <div class="eye-icon">204</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
                                        <p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/35/" target="_blank">Рига</a></span>, &nbsp;Tatra T3MR (T6B5-R) &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/53599/#n101864" target="_blank">35098</a></span></span> &nbsp;—&nbsp; 35098+35108</span></span><br><a href="/city/35/" target="_blank">Рига</a> &mdash; <a href="/articles/7271/" target="_blank">Мосты</a></p>
                                        <p><b class="pw-place">Slokas iela</b> | Улица Слокас</p>
                                        <p class="sm"><b>28 октября 2024 г., понедельник</b><br>Автор: <a href="/author/18598/">Tučňák</a></p>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <br>Число проголосовавших: <b>3</b><br>Число голосов: <b>6</b><br><br>
                       
                </center>
           

    <?php }
    ?>

    <br>

    </center>
    </td>
    </tr>

    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


    </tr>
    </table>
    <script>
        // Установите дату и время, до которого нужно отсчитывать
        const countdownDate = new Date("Mar 1, 2025 00:00:00").getTime();

        // Обновляем отсчет каждую секунду
        const x = setInterval(function() {

            // Получаем текущее время
            const now = new Date().getTime();

            // Вычисляем разницу между целевой датой и текущим временем
            const distance = countdownDate - now;

            // Вычисляем дни, часы, минуты и секунды
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Отображаем результат в элементе с id "countdown"
            document.getElementById("countdown").innerHTML =
                days + ":" + hours + ":" + minutes + ":" + seconds;

            // Если отсчет завершен, выводим сообщение
            if (distance < 0) {
                clearInterval(x);
                document.getElementById("countdown").innerHTML = "Время истекло!";
            }
        }, 1000);
    </script>
</body>

</html>