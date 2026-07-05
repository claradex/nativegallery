<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User};
use \App\Controllers\Exec\Tasks\ExecContests;

ExecContests::tick();

$votingContest = DB::query('SELECT * FROM contests WHERE status=2 ORDER BY id DESC LIMIT 1');
$votingContest = !empty($votingContest) ? $votingContest[0] : null;
$contestKid = $votingContest ? (int) $votingContest['id'] : 0;

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

var kid = <?=$contestKid?>;
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
	$('.contestBtn').click(function(e)
	{
		e.preventDefault();
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
		var block = $(this).closest('.p20p');
		var pid = block.data('pid') || block.prevAll('img[pid]').first().attr('pid');
		if (!pid) {
			return;
		}
		var previewSrc = this.src.replace('_s', '');
		$('#img').html('<img src="' + previewSrc + '" alt="">');
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

                    <?php $contestNavActive = 'voting'; include $_SERVER['DOCUMENT_ROOT'] . '/views/components/ContestNav.php'; ?>
                    <div style="margin-top:20px">Чтобы проголосовать, отметьте одну, две или три фотографии, которые Вам понравились</div><br><br>
                    <?php
                    if ($votingContest) {
                        $contest = $votingContest; ?>
                        <div id="tip" lock="0"><span id="img"></span></div>
                        <?php
                        $photos_contest = DB::query('SELECT * FROM photos WHERE on_contest=2 AND contest_id=:id', array(':id'=>$contest['id']));

                        foreach ($photos_contest as $pc) {
                            $user = new User($pc['user_id']);
                            $class = '';
                            $userRate = DB::query(
                                'SELECT photo_id FROM contests_rates WHERE photo_id=:pid AND user_id=:uid AND contest_id=:cid',
                                [':uid' => Auth::userid(), ':pid' => $pc['id'], ':cid' => $contest['id']]
                            );
                            if (!empty($userRate)) {
                                $class = ' voted';
                            }
                            echo '<img pid="'.$pc['id'].'" src="'.$pc['photourl'].'" style="display:none">
                        <div class="p20p" data-pid="'.$pc['id'].'">
                            <table>
                                <tr>
                                    <td><a href="javascript:void(0)" role="button" pid="'.$pc['id'].'" class="contestBtn'.$class.'"></a></td>
                                    <td class="pb_photo" id="p2068176"><a href="/photo/'.$pc['id'].'/" target="_blank" class="prw"><img class="f" src="'.ng_photo_thumb($pc['photourl']).'" data-src="'.ng_photo_thumb($pc['photourl']).'" alt="630 КБ">
                                            <div class="hpshade">
                                                <div class="eye-icon">'.DB::query('SELECT COUNT(*) FROM photos_views WHERE photo_id=:id', array(':id'=>$pc['id']))[0]['COUNT(*)'].'</div>
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
                        <br>Число проголосовавших: <b><?=DB::query('SELECT COUNT(DISTINCT user_id) AS unique_user_count FROM contests_rates WHERE contest_id=:id', array(':id'=>$contest['id']))[0]['unique_user_count']?></b><br>Число голосов: <b><?=DB::query('SELECT COUNT(*) FROM contests_rates WHERE contest_id=:id', array(':id'=>$contest['id']))[0]['COUNT(*)']?></b><br><br>
                       
                </center>
           

    <?php } else {
                        $nextContest = DB::query('SELECT * FROM contests WHERE status IN (0, 1, 12) ORDER BY id ASC LIMIT 1');
                        if (!empty($nextContest)) {
                            $contest = $nextContest[0];
                            $status = (int) $contest['status'];
                            if ($status === 1) {
                                $countdownTs = (int) $contest['closepretendsdate'];
                                $message = 'Сейчас идёт отбор претендентов. Голосование за победителей начнётся позже.';
                            } elseif ($status === ExecContests::STATUS_WAITING_OPEN) {
                                $countdownTs = (int) $contest['opendate'];
                                $message = 'Отбор претендентов завершён. Голосование за победителей скоро начнётся.';
                            } else {
                                $countdownTs = (int) $contest['openpretendsdate'];
                                $message = 'Сейчас конкурс не проводится. Пожалуйста, заходите позже.';
                            }
                            echo '<div class="p20"><h4>' . $message . '</h4></div>';
                            if ($status === 1) {
                                echo '<p><a href="/voting/waiting">Перейти к голосованию за претендентов</a></p>';
                            }
                            echo '<h2>Следующий этап Фотоконкурса через:</h2>
    <h1 id="countdown"></h1>
    <script>startCountdown(' . $countdownTs . ');</script>';
                        } else {
                            echo '<div class="p20"><h4>Сейчас конкурс не проводится. Пожалуйста, заходите позже.</h4></div>';
                        }
                    }
    ?>

    <br>

    </center>
    </td>
    </tr>

    <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


    </tr>
    </table>
</body>

</html>