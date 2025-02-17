<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User};

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

var kid = <?=DB::query('SELECT id FROM contests WHERE status=2')[0]['id']?>;
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

		$.getJSON('/api/photo/contests/rate', { action: 'vote-contest', kid: kid, pid: pid }, function (data)
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
                        $contest = DB::query('SELECT * FROM contests WHERE status=1')[0];
                        echo '<div class="p20">
                        <h4>Сейчас конкурс не проводится. Пожалуйста, заходите позже.</h4>
                    </div>
                    <script>startCountdown(' . $contest['openpretendsdate'] . ');</script>
    <h2>Следующий Фотоконкурс будет через:</h2>
    <h1 id="countdown"></h1>';
                    } else { ?>
                        <div id="tip" lock="0"><span id="img"></span></div>
                        <?php
                        $contest = DB::query('SELECT * FROM contests WHERE status=2')[0];
                        $photos_contest = DB::query('SELECT * FROM photos WHERE on_contest=2 AND contest_id=:id', array(':id'=>$contest['id']));
                        foreach ($photos_contest as $pc) {
                            $class = '';
                            if ((int)DB::query('SELECT photo_id FROM contests_rates WHERE photo_id=:pid AND user_id=:uid AND contest_id=:cid', array(':uid' => Auth::userid(), ':pid' => $pc['id'], ':cid' => $contest['id']))[0]['photo_id'] === (int)$pc['id']) {
                                $class = ' voted';
                            }
                            echo '<img pid="'.$pc['id'].'" src="'.$pc['photourl'].'" style="display:none">
                        <div class="p20p">
                            <table>
                                <tr>
                                    <td><a href="#" pid="'.$pc['id'].'" class="contestBtn'.$class.'"></a></td>
                                    <td class="pb_photo" id="p2068176"><a href="/photo/'.$pc['id'].'/" target="_blank" class="prw"><img class="f" src="/api/photo/compress?url='.$pc['photourl'].'" data-src="/api/photo/compress?url='.$pc['photourl'].'" alt="630 КБ">
                                            <div class="hpshade">
                                                <div class="eye-icon">'.DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$p['id']))[0]['COUNT(*)'].'</div>
                                            </div>
                                        </a></td>
                                    <td class="pb_descr">
										<p>'.htmlspecialchars($pc['postbody']).'</p>
                                		<p><b class="pw-place">'.htmlspecialchars($pc['place']).'</b></p>
                                		<p class="sm"><b>'.Date::zmdate($pc['posted_at']).'</b><br>Автор: <a href="/author/'.$pc['user_id'].'/">'.$user->i('username').'</a></p>
									</td>
                                </tr>
                            </table>
                        </div>';
                        }
                        ?>
                      
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