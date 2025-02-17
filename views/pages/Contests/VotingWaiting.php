<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{User, VoteContest};

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
					<h1>Претенденты на участие в конкурсе</h1>
					<script>
						var self_p = false;
						var pid = 0;
					</script>
					<p class="narrow" style="font-size:19px"><a href="/voting">Голосование</a> &nbsp;·&nbsp; <a href="/voting/results">Победители</a> &nbsp;·&nbsp; <a href="/voting/rating">Рейтинг</a> &nbsp;·&nbsp; <b>Претенденты</b></p>
					<p style="margin:20px">На этой странице собраны фотографии, предложенные для участия в конкурсе их авторами либо пользователями сайта, для того, чтобы Вы проголосовали за их участие или против. Снимки отсортированы по времени публикации.<br><br>Пожалуйста, не стесняйтесь нажимать синюю кнопку.</p>
					<?php
					if (DB::query('SELECT status FROM contests WHERE status=1')[0]['status'] === 1) {
						$contest = DB::query('SELECT * FROM contests WHERE status=1')[0];
                        $photos_contest = DB::query('SELECT p.*, COUNT(prc.photo_id) AS rates_count
FROM photos p
LEFT JOIN photos_rates_contest prc ON p.id = prc.photo_id
WHERE p.on_contest = 1 AND p.contest_id = :id
GROUP BY p.id
ORDER BY rates_count DESC;
', array(':id'=>$contest['id']));
                        foreach ($photos_contest as $pc) {
							$user = new User($pc['user_id']);
                         echo '<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" cid="'.$contest['id'].'" pid="'.$pc['id'].'">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072294" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="'.$pc['id'].'">'.VoteContest::count($pc['id'], $contest['id']).'</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072294"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072294"><a href="/photo/'.$pc['id'].'" target="_blank" class="prw"><img class="f" src="/api/photo/compress?url='.$pc['photourl'].'" alt="597 КБ" style="display: inline;">
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
							</tbody>
						</table>
					</div>';
                        }
                        
								} else {
									echo '<h2><b>Следующего конкурса нет. Пожалуйста, заходите сюда позже.</b></h2>';
								}
								?>
								
								
							
				
					<br>
					<p class="narrow" style="font-size:19px"><a href="/voting.php">Голосование</a> &nbsp;·&nbsp; <a href="?show=results">Победители</a> &nbsp;·&nbsp; <a href="?show=rating">Рейтинг</a> &nbsp;·&nbsp; <b>Претенденты</b></p>
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