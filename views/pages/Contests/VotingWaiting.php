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
					<h1>Претенденты на участие в конкурсе</h1>
					<script>
						var self_p = false;
						var pid = 0;
					</script>
					<p class="narrow" style="font-size:19px"><a href="/voting">Голосование</a> &nbsp;·&nbsp; <a href="/voting/results">Победители</a> &nbsp;·&nbsp; <a href="/voting/rating">Рейтинг</a> &nbsp;·&nbsp; <b>Претенденты</b></p>
					<p style="margin:20px">На этой странице собраны фотографии, предложенные для участия в конкурсе их авторами либо пользователями сайта, для того, чтобы Вы проголосовали за их участие или против. Снимки отсортированы по времени публикации.<br><br>Пожалуйста, не стесняйтесь нажимать синюю кнопку.</p>
					<div class="p20p">
						<table>
							<tbody>
								
								<?php
								if (DB::query('SELECT status FROM contests WHERE status=1')[0]['status'] === 1) {
								} else {
									echo '<h2><b>Следующего конкурса нет. Пожалуйста, заходите сюда позже.</b></h2>';
								}
								?>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2068639">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2068639" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2068639">+137</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2068639"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2068639"><a href="/photo/2068639/" target="_blank" class="prw"><img class="f" src="/photo/20/68/63/2068639_s.jpg" alt="661 КБ" style="display: inline;">
											<div class="hpshade">
												<div class="com-icon">7</div>
												<div class="eye-icon">805</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/129/" target="_blank">Краснодар</a></b>, &nbsp;71-623-02 &nbsp;<span class="nw">№ <b><a href="/vehicle/339356/#n389025" target="_blank">252</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=129&amp;type=1&amp;route=8" class="route">8</a></b></span></p>
										<p><b class="pw-place">Клиническая улица</b></p>
										<p class="sm"><b>1 февраля 2025 г., суббота</b><br>Автор: <a href="/author/33351/">Nikita_Finko</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072294">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072294" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072294">+119</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072294"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072294"><a href="/photo/2072294/" target="_blank" class="prw"><img class="f" src="/photo/20/72/29/2072294_s.jpg" alt="597 КБ" style="display: inline;">
											<div class="hpshade">
												<div class="com-icon">4</div>
												<div class="eye-icon">1070</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/2/" target="_blank">Санкт-Петербург</a></span>, &nbsp;71-638-02 «Поларис» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/604225/#n803377" target="_blank">5810</a></span></span></span></span><br><a href="/city/2/" target="_blank">Санкт-Петербург</a> — <a href="/articles/3587/" target="_blank">Трамвайный парк № 5</a></p>
										<p><b class="pw-place">Трамвайный парк №5</b></p>
										<p class="sm"><b>7 февраля 2025 г., пятница</b><br>Автор: <a href="/author/31542/">andr</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2061995">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2061995" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2061995">+111</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2061995"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2061995"><a href="/photo/2061995/" target="_blank" class="prw"><img class="f" src="/photo/20/61/99/2061995_s.jpg" alt="3025 КБ" style="display: inline;">
											<div class="hpshade">
												<div class="com-icon">17</div>
												<div class="eye-icon">1291</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/2/" target="_blank">Санкт-Петербург</a></span>, &nbsp;71-923М «Богатырь-М» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/598204/#n795447" target="_blank">7880</a></span></span></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/2/" target="_blank">Санкт-Петербург</a></span>, &nbsp;71-431Р «Достоевский» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/594653/#n791069" target="_blank">3110</a></span></span></span></span><br><a href="/city/2/" target="_blank">Санкт-Петербург</a> — <a href="/articles/9566/" target="_blank">Презентация первого вагона «Невский» для системы «Славянка» — 01.09.2024</a></p>
										<p><b class="pw-place">Октябрьский электровагоноремонтный завод (ОЭВРЗ)</b></p>
										<p class="sm"><b>1 сентября 2024 г., воскресенье</b><br>Автор: <a href="/author/26446/">imgetawaycar</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2070864">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2070864" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2070864">+62</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2070864"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2070864"><a href="/photo/2070864/" target="_blank" class="prw"><img class="f" src="/photo/20/70/86/2070864_s.jpg" alt="11878 КБ" style="display: inline;">
											<div class="hpshade">
												<div class="com-icon">3</div>
												<div class="eye-icon">290</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><a href="/articles/3/" target="_blank">Фотозарисовки</a></p>
										<p><b><a href="/city/101/">Харьков</a></b>, <b class="pw-place">Кільце "Вулиця Рудика"</b> | Кольцо "Улица Рудика"</p>
										<p class="sm"><b>31 января 2025 г., пятница</b><br>Автор: <a href="/author/25433/">468_andrey_383</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2070229">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2070229" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2070229">+57</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2070229"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2070229"><a href="/photo/2070229/" target="_blank" class="prw"><img class="f" src="/photo/20/70/22/2070229_s.jpg" alt="666 КБ" style="display: inline;">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">256</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/60/" target="_blank">Красноярск</a></b>, &nbsp;ВМЗ-5298.01 «Авангард» &nbsp;<span class="nw">№ <b><a href="/vehicle/552976/#n731384" target="_blank">2074</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=60&amp;type=2&amp;route=5" class="route">5</a></b></span><br><a href="/city/60/" target="_blank">Красноярск</a> — <a href="/articles/9866/" target="_blank">Вечерние фотографии</a></p>
										<p><b class="pw-place">Улица Партизана Железняка</b></p>
										<p class="sm"><b>4 февраля 2025 г., вторник</b><br>Автор: <a href="/author/25000/">Æther</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2014293">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2014293" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2014293">+56</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2014293"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2014293"><a href="/photo/2014293/" target="_blank" class="prw"><img class="f" src="/photo/20/14/29/2014293_s.jpg" alt="859 КБ" style="display: inline;">
											<div class="hpshade">
												<div class="eye-icon">354</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/96/" target="_blank">Киев</a></b>, &nbsp;К1Т306 &nbsp;<span class="nw">№ <b><a href="/vehicle/554185/#n733419" target="_blank">5010</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=96&amp;type=1&amp;route=33" class="route">33</a></b></span></p>
										<p><b class="pw-place">Вулиця Алматинська</b> | Алматинская улица<br><br><span class="pw-descr">Жаркий осенний закат...</span></p>
										<p class="sm"><b>28 сентября 2024 г., суббота</b><br>Автор: <a href="/author/17434/">Levis</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2070750">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2070750" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2070750">+56</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2070750"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2070750"><a href="/photo/2070750/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/70/75/2070750_s.jpg" alt="696 КБ">
											<div class="hpshade">
												<div class="com-icon">3</div>
												<div class="eye-icon">220</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/1/" target="_blank">Москва</a></b>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/462138/#n573716" target="_blank">31145</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1&amp;type=1&amp;route=3" class="route">3</a></b></span></p>
										<p><b class="pw-place">Донбасская эстакада</b></p>
										<p class="sm"><b>4 февраля 2025 г., вторник</b><br>Автор: <a href="/author/34773/">Krezot</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076313">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076313" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076313">+51</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076313"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076313"><a href="/photo/2076313/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/31/2076313_s.jpg" alt="713 КБ">
											<div class="hpshade">
												<div class="com-icon">8</div>
												<div class="eye-icon">232</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;БКМ 32100D &nbsp;<span class="nw">№ <b><a href="/vehicle/459059/#n567716" target="_blank">3122</a></b></span> &nbsp;—&nbsp; служебная развозка</span></p>
										<p><b class="pw-place">Исаакиевская площадь</b><br><br><span class="pw-descr">____!!__/**2000**\__!!____<br>
												~~~~||~~~~~~~~~~||~~~~</span></p>
										<p class="sm"><b>29 января 2025 г., среда</b><br>Автор: <a href="/author/22182/">NeVa</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2069925">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2069925" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2069925">+49</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2069925"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
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
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2062832">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2062832" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2062832">+48</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2062832"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2062832"><a href="/photo/2062832/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/62/83/2062832_s.jpg" alt="692 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">293</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/102/" target="_blank">Уфа</a></b>, &nbsp;Tatra T3R.P &nbsp;<span class="nw">№ <b><a href="/vehicle/24131/#n23777" target="_blank">2056</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=102&amp;type=1&amp;route=8" class="route">8</a></b></span></p>
										<p><b class="pw-place">Улица Богдана Хмельницкого</b></p>
										<p class="sm"><b>8 июня 2023 г., четверг</b><br>Автор: <a href="/author/28976/">MatchingPine</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072185">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072185" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072185">+45</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072185"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072185"><a href="/photo/2072185/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/18/2072185_s.jpg" alt="689 КБ">
											<div class="hpshade">
												<div class="com-icon">4</div>
												<div class="eye-icon">189</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;БКМ 321 &nbsp;<span class="nw">№ <b><a href="/vehicle/496549/#n625889" target="_blank">2450</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=2&amp;route=5" class="route">5</a></b></span></p>
										<p><b class="pw-place">Малая Морская улица</b></p>
										<p class="sm"><b>4 июля 2024 г., четверг</b><br>Автор: <a href="/author/12294/">Александр Заикин</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2071178">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2071178" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2071178">+44</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2071178"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2071178"><a href="/photo/2071178/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/71/17/2071178_s.jpg" alt="649 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">273</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-923М «Богатырь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/556871/#n736847" target="_blank">7813</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=7" class="route">7</a></b></span></p>
										<p><b class="pw-place">Проспект Обуховской Обороны</b></p>
										<p class="sm"><b>5 февраля 2025 г., среда</b><br>Автор: <a href="/author/11619/">Николай Кармаевский</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2067089">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2067089" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2067089">+43</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2067089"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2067089"><a href="/photo/2067089/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/67/08/2067089_s.jpg?1" alt="980 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">230</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/82/" target="_blank">Прага</a></b>, &nbsp;Tatra T3M2-DVC &nbsp;<span class="nw">№ <b><a href="/vehicle/79770/#n77344" target="_blank">8076</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=82&amp;type=1&amp;route=23" class="route">23</a></b></span></p>
										<p><b class="pw-place">Mariánské hradby</b><br><br><span class="pw-descr">Зелёный туннель</span></p>
										<p class="sm"><b>5 октября 2024 г., суббота</b><br>Автор: <a href="/author/29132/">Бутенко Максим</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2068176">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2068176" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2068176">+43</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2068176"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2068176"><a href="/photo/2068176/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/68/17/2068176_s.jpg" alt="630 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">182</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/237/" target="_blank">Гота</a></span>, &nbsp;Schindler/Siemens Be 4/8 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/97221/#n586477" target="_blank">222</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=237&amp;type=1&amp;route=4" class="route">4</a></span></span><br><a href="/city/237/" target="_blank">Гота</a> — <a href="/articles/166/" target="_blank">Разные фотографии</a></p>
										<p><b class="pw-place">Boxberg <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Leina</b><br><br><span class="pw-descr">Настоящий немецкий Сайлент Хилл!<br>
												<br>
												Echtes deutsches Silent Hill!</span></p>
										<p class="sm"><b>26 декабря 2024 г., четверг</b><br>Автор: <a href="/author/24525/">KIA-Trainz</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2062199">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2062199" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2062199">+42</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2062199"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2062199"><a href="/photo/2062199/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/62/19/2062199_s.jpg" alt="6806 КБ">
											<div class="hpshade">
												<div class="eye-icon">177</div>
											</div>
											<div class="temp" style="background-image:url('/img/cond.png')"></div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/9/" target="_blank">Будапешт</a></b>, &nbsp;Duewag TW6000 &nbsp;<span class="nw">№ <b><a href="/vehicle/29615/#n190520" target="_blank">1586</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=9&amp;type=1&amp;route=52" class="route">52</a></b></span></p>
										<p><b class="pw-place">Határ út</b></p>
										<p class="sm"><b>19 декабря 2024 г., четверг</b><br>Автор: <a href="/author/32414/">bb4346</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2067219">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2067219" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2067219">+39</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2067219"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2067219"><a href="/photo/2067219/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/67/21/2067219_s.jpg" alt="14390 КБ">
											<div class="hpshade">
												<div class="com-icon">5</div>
												<div class="eye-icon">264</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/455567/#n562186" target="_blank">31115</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=1&amp;type=1&amp;route=13" class="route">13</a></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/441831/#n543248" target="_blank">31051</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=1&amp;type=1&amp;route=13" class="route">13</a></span></span><br><a href="/city/1/" target="_blank">Москва</a> — <a href="/articles/4168/" target="_blank">Трамвайные линии: ВАО</a></p>
										<p><b class="pw-place">Улица Стромынка</b><br><br><span class="pw-descr">Новогодний мрачный снегопад</span></p>
										<p class="sm"><b>31 декабря 2024 г., вторник</b><br>Автор: <a href="/author/21169/">stikel11</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2065093">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2065093" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2065093">+38</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2065093"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2065093"><a href="/photo/2065093/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/65/09/2065093_s.jpg" alt="543 КБ">
											<div class="hpshade">
												<div class="com-icon">6</div>
												<div class="eye-icon">1142</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/129/" target="_blank">Краснодар</a></span>, &nbsp;Т811-Синара &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/604808/#n804093" target="_blank">636</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=129&amp;type=1&amp;route=3" class="route">3</a></span></span><br><a href="/articles/6006/" target="_blank">Транспорт и животные</a></p>
										<p><b><a href="/city/129/">Краснодар</a></b>, <b class="pw-place">Крайняя улица</b></p>
										<p class="sm"><b>24 января 2025 г., пятница</b><br>Автор: <a href="/author/33351/">Nikita_Finko</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2070488">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2070488" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2070488">+38</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2070488"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2070488"><a href="/photo/2070488/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/70/48/2070488_s.jpg" alt="656 КБ">
											<div class="hpshade">
												<div class="com-icon">5</div>
												<div class="eye-icon">325</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, <span class="s5">&nbsp;71-134А (ЛМ-99АВ) &nbsp;<span class="nw">№ <b><a href="/vehicle/5784/#n5890" target="_blank">8318</a></b></span>&nbsp;</span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=41" class="route">41</a></b></span></p>
										<p><b class="pw-place">Садовая улица</b></p>
										<p class="sm"><b>31 января 2025 г., пятница</b><br>Автор: <a href="/author/31083/">Yastrebov Nikolay</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072863">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072863" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072863">+37</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072863"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072863"><a href="/photo/2072863/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/86/2072863_s.jpg" alt="978 КБ">
											<div class="hpshade">
												<div class="com-icon">14</div>
												<div class="eye-icon">164</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/1/" target="_blank">Москва</a></b>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/528127/#n686197" target="_blank">31397</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1&amp;type=1&amp;route=30" class="route">30</a></b></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;71-911ЕМ «Львёнок» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/533308/#n696526" target="_blank">30628</a></span></span> &nbsp;—&nbsp; учебный</span></span></p>
										<p><b class="pw-place">Строгинский мост</b></p>
										<p class="sm"><b>7 февраля 2025 г., пятница</b><br>Автор: <a href="/author/17384/">Странник 03</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2064996">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2064996" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2064996">+36</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2064996"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2064996"><a href="/photo/2064996/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/64/99/2064996_s.jpg" alt="8997 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">377</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/101/" target="_blank">Харьков</a></b>, &nbsp;Tatra T6A5 &nbsp;<span class="nw">№ <b><a href="/vehicle/15915/#n742508" target="_blank">8731</a></b></span></span></p>
										<p><b class="pw-place">Проспект Героїв Харкова</b> | Проспект Героев Харькова</p>
										<p class="sm"><b>24 декабря 2024 г., вторник</b><br>Автор: <a href="/author/20463/">FoŘeverBoūnd</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2044756">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2044756" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2044756">+35</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2044756"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2044756"><a href="/photo/2044756/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/44/75/2044756_s.jpg?2" alt="1162 КБ">
											<div class="hpshade">
												<div class="eye-icon">351</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><a href="/articles/3/" target="_blank">Фотозарисовки</a></p>
										<p><b class="pw-place">Линия 5</b> | Линия 5</p>
										<p class="sm"><b>16 января 2021 г., суббота</b><br>Автор: <a href="/author/17434/">Levis</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074959">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074959" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074959">+34</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074959"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074959"><a href="/photo/2074959/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/95/2074959_s.jpg" alt="8397 КБ">
											<div class="hpshade">
												<div class="com-icon">5</div>
												<div class="eye-icon">267</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/101/" target="_blank">Харьков</a></b>, &nbsp;PTS 12 &nbsp;<span class="nw">№ <b><a href="/vehicle/538854/#n707422" target="_blank">2746</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=101&amp;type=2&amp;route=52" class="route">52</a></b></span></p>
										<p><b class="pw-place">Вулиця Зубарєва <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Вулиця 92-ї бригади</b><br><br><span class="pw-descr">На краю света</span></p>
										<p class="sm"><b>11 февраля 2025 г., вторник</b><br>Автор: <a href="/author/29132/">Бутенко Максим</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2073219">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2073219" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2073219">+34</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2073219"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2073219"><a href="/photo/2073219/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/73/21/2073219_s.jpg" alt="12765 КБ">
											<div class="hpshade">
												<div class="eye-icon">209</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/101/" target="_blank">Харьков</a></b>, &nbsp;Tatra T3SUCS &nbsp;<span class="nw">№ <b><a href="/vehicle/561737/#n744287" target="_blank">7144</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=101&amp;type=1&amp;route=8" class="route">8</a></b>, следует измененным маршрутом</span></p>
										<p><b class="pw-place">Кільце "Вулиця Мухачова"</b> | Кольцо "Улица Мухачёва"</p>
										<p class="sm"><b>19 ноября 2024 г., вторник</b><br>Автор: <a href="/author/29132/">Бутенко Максим</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075167">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075167" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075167">+32</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075167"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075167"><a href="/photo/2075167/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/16/2075167_s.jpg" alt="677 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">331</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/45/" target="_blank">Минск</a></b>, &nbsp;БКМ 333 &nbsp;<span class="nw">№ <b><a href="/vehicle/346659/#n400700" target="_blank">3634</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=45&amp;type=2&amp;route=64" class="route">64</a></b></span></p>
										<p><b class="pw-place">Вуліца Чыгуначная</b> | Улица Железнодорожная<br><br><span class="pw-descr">В связи с проведением РЦЭ и подвоза абитуриентов до ближайших университетов на 64 и 16 маршруты было отправлено по одному троллейбусу ОБВ</span></p>
										<p class="sm"><b>8 февраля 2025 г., суббота</b><br>Автор: <a href="/author/28995/">Александр Александр</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2049040">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2049040" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2049040">+32</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2049040"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2049040"><a href="/photo/2049040/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/49/04/2049040_s.jpg" alt="617 КБ">
											<div class="hpshade">
												<div class="eye-icon">276</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/150/" target="_blank">Пльзень</a></b>, &nbsp;Tatra KT8D5R.N2P &nbsp;<span class="nw">№ <b><a href="/vehicle/95316/#n92147" target="_blank">297</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=150&amp;type=1&amp;route=4" class="route">4</a></b></span><br><a href="/city/150/" target="_blank">Пльзень</a> — <a href="/articles/9817/" target="_blank">Рождественский трамвай</a></p>
										<p><b class="pw-place">Sady Pětatřicátníků</b></p>
										<p class="sm"><b>14 декабря 2024 г., суббота</b><br>Автор: <a href="/author/20146/">Dozenazer</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075330">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075330" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075330">+31</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075330"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075330"><a href="/photo/2075330/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/33/2075330_s.jpg" alt="517 КБ">
											<div class="hpshade">
												<div class="com-icon">6</div>
												<div class="eye-icon">251</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/38/" target="_blank">Донецк</a></b>, &nbsp;ЛАЗ E183A1 &nbsp;<span class="nw">№ <b><a href="/vehicle/197932/#n210701" target="_blank">2326</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=38&amp;type=2&amp;route=4" class="route">4</a></b></span></p>
										<p><b class="pw-place">Проспект Ілліча</b> | Проспект Ильича</p>
										<p class="sm"><b>19 сентября 2024 г., четверг</b><br>Автор: <a href="/author/21841/">Георгий Лисин</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2073198">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2073198" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2073198">+31</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2073198"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2073198"><a href="/photo/2073198/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/73/19/2073198_s.jpg" alt="526 КБ">
											<div class="hpshade">
												<div class="eye-icon">245</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/2/" target="_blank">Санкт-Петербург</a></span>, <span class="s5">&nbsp;ЛВС-86К &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/4653/#n4758" target="_blank">8200</a></span></span>&nbsp;</span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=2&amp;type=1&amp;route=52" class="route">52</a></span></span><br><a href="/city/2/" target="_blank">Санкт-Петербург</a> — <a href="/articles/1129/" target="_blank">Трамвайные линии и инфраструктура</a></p>
										<p><b class="pw-place">Проспект Маршала Жукова</b></p>
										<p class="sm"><b>18 ноября 2023 г., суббота</b><br>Автор: <a href="/author/19181/">Матвей Батуро</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2064273">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2064273" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2064273">+30</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2064273"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2064273"><a href="/photo/2064273/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/64/27/2064273_s.jpg" alt="631 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">194</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/244/" target="_blank">Дармштадт</a></b>, &nbsp;Stadler ST15 &nbsp;<span class="nw">№ <b><a href="/vehicle/580933/#n770926" target="_blank">22112</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=244&amp;type=1&amp;route=6" class="route">6</a></b></span></p>
										<p><b class="pw-place">Seeheim, Heidelberger Straße</b></p>
										<p class="sm"><b>10 октября 2024 г., четверг</b><br>Автор: <a href="/author/20146/">Dozenazer</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2069807">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2069807" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2069807">+29</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2069807"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2069807"><a href="/photo/2069807/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/69/80/2069807_s.jpg" alt="577 КБ">
											<div class="hpshade">
												<div class="com-icon">3</div>
												<div class="eye-icon">196</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/473812/#n592969" target="_blank">0119</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=100" class="route">100</a></b></span></p>
										<p><b class="pw-place">Придорожная аллея <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> проспект Энгельса</b></p>
										<p class="sm"><b>17 января 2025 г., пятница</b><br>Автор: <a href="/author/29943/">Spuik</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072605">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072605" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072605">+29</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072605"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072605"><a href="/photo/2072605/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/60/2072605_s.jpg" alt="8246 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">133</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/139/" target="_blank">Ижевск</a></b>, &nbsp;Tatra T3K &nbsp;<span class="nw">№ <b><a href="/vehicle/62576/#n239370" target="_blank">2308</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=139&amp;type=1&amp;route=8" class="route">8</a></b></span></p>
										<p><b class="pw-place">Улица Халтурина</b></p>
										<p class="sm"><b>20 января 2025 г., понедельник</b><br>Автор: <a href="/author/31172/">olezhek</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074736">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074736" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074736">+28</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074736"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074736"><a href="/photo/2074736/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/73/2074736_s.jpg" alt="663 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">115</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-431Р «Достоевский» &nbsp;<span class="nw">№ <b><a href="/vehicle/594653/#n791069" target="_blank">3110</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=40" class="route">40</a></b></span></p>
										<p><b class="pw-place">Улица Куйбышева</b></p>
										<p class="sm"><b>18 января 2025 г., суббота</b><br>Автор: <a href="/author/36016/">bo1ng10</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2044495">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2044495" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2044495">+27</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2044495"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2044495"><a href="/photo/2044495/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/44/49/2044495_s.jpg" alt="895 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">225</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/96/" target="_blank">Киев</a></b>, <span class="s4">&nbsp;К1 &nbsp;<span class="nw">№ <b><a href="/vehicle/174056/#n239458" target="_blank">320</a></b></span>&nbsp;</span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=96&amp;type=1&amp;route=22" class="route">22</a></b></span></p>
										<p><b class="pw-place">Вулиця Сулеймана Стальського</b> | Улица Сулеймана Стальского</p>
										<p class="sm"><b>20 октября 2017 г., пятница</b><br>Автор: <a href="/author/17434/">Levis</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2071233">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2071233" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2071233">+25</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2071233"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2071233"><a href="/photo/2071233/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/71/23/2071233_s.jpg" alt="446 КБ">
											<div class="hpshade">
												<div class="eye-icon">115</div>
											</div>
											<div class="temp" style="background-image:url('/img/cond.png')"></div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/1405/" target="_blank">Хакодате</a></b>, &nbsp;Hakodate snowplug (排) series &nbsp;<span class="nw">№ <b><a href="/vehicle/560968/#n743023" target="_blank">排3</a></b></span></span></p>
										<p><b class="pw-place">Aoyagi-cho(青柳町)</b></p>
										<p class="sm"><b>6 февраля 2025 г., четверг</b><br>Автор: <a href="/author/32109/">pukkuri_heart</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2068523">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2068523" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2068523">+25</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2068523"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2068523"><a href="/photo/2068523/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/68/52/2068523_s.jpg" alt="394 КБ">
											<div class="hpshade">
												<div class="com-icon">3</div>
												<div class="eye-icon">255</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/49/" target="_blank">Ярославль</a></span>, &nbsp;ЛиАЗ-6274 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/587277/#n779896" target="_blank">35</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=49&amp;type=9&amp;route=50" class="route">50</a></span></span><br><a href="/city/49/" target="_blank">Ярославль</a> — <a href="/articles/81/" target="_blank">Разные фотографии</a></p>
										<p><b class="pw-place">Улица Волгоградская</b><br><br><span class="pw-descr">"Год в пути"</span></p>
										<p class="sm"><b>20 января 2025 г., понедельник</b><br>Автор: <a href="/author/14444/">Ahtung_23</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2068191">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2068191" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2068191">+25</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2068191"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2068191"><a href="/photo/2068191/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/68/19/2068191_s.jpg?2" alt="683 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">157</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/1153/" target="_blank">Наумбург</a></b>, &nbsp;Gotha T57 &nbsp;<span class="nw">№ <b><a href="/vehicle/102844/#n175704" target="_blank">38</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1153&amp;type=1&amp;route=4" class="route">4</a></b></span></p>
										<p><b class="pw-place">Endstelle Hauptbahnhof (after/nach 14.09.2018)</b><br><br><span class="pw-descr">Закат.<br>
												<br>
												Sonnenuntergang.</span></p>
										<p class="sm"><b>24 декабря 2024 г., вторник</b><br>Автор: <a href="/author/24525/">KIA-Trainz</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="1988196">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="1988196" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="1988196">+25</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="1988196"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p1988196"><a href="/photo/1988196/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/19/88/19/1988196_s.jpg" alt="685 КБ">
											<div class="hpshade">
												<div class="com-icon">4</div>
												<div class="eye-icon">435</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-923М «Богатырь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/584461/#n775537" target="_blank">7869</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=7" class="route">7</a></b></span></p>
										<p><b class="pw-place">Амбарная улица</b></p>
										<p class="sm"><b>5 августа 2024 г., понедельник</b><br>Автор: <a href="/author/11619/">Николай Кармаевский</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2059967">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2059967" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2059967">+25</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2059967"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2059967"><a href="/photo/2059967/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/59/96/2059967_s.jpg" alt="696 КБ">
											<div class="hpshade">
												<div class="com-icon">14</div>
												<div class="eye-icon">2226</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><a href="/city/45/" target="_blank">Минск</a> — <a href="/articles/275/" target="_blank">Завод "БКМ Холдинг"</a><br><a href="/city/45/" target="_blank">Минск</a> — <a href="/articles/7248/" target="_blank">Новые трамваи</a></p>
										<p><b class="pw-place">Лагойскі тракт</b> | Логойский тракт<br><br><span class="pw-descr">Новые трамваи уже на улицах города!</span></p>
										<p class="sm"><b>13 января 2025 г., понедельник</b><br>Автор: <a href="/author/18647/">tralik_v_stepyanku</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2044049">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2044049" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2044049">+24</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2044049"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2044049"><a href="/photo/2044049/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/44/04/2044049_s.jpg" alt="880 КБ">
											<div class="hpshade">
												<div class="eye-icon">250</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/96/" target="_blank">Киев</a></b>, <span class="s3">&nbsp;Tatra T3SUCS &nbsp;<span class="nw">№ <b><a href="/vehicle/45620/#n400440" target="_blank">5546</a></b></span>&nbsp;</span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=96&amp;type=1&amp;route=17" class="route">17</a></b></span></p>
										<p><b class="pw-place">Пуща-Водиця, лісова траса</b> | Пуща-Водица, лесная трасса</p>
										<p class="sm"><b>Февраль 2018 г.</b><br>Автор: <a href="/author/17434/">Levis</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2051553">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2051553" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2051553">+23</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2051553"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2051553"><a href="/photo/2051553/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/51/55/2051553_s.jpg" alt="893 КБ">
											<div class="hpshade">
												<div class="eye-icon">479</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/96/" target="_blank">Киев</a></b>, &nbsp;К1Т306 &nbsp;<span class="nw">№ <b><a href="/vehicle/529585/#n705761" target="_blank">5001</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=96&amp;type=1&amp;route=33" class="route">33</a></b></span></p>
										<p><b class="pw-place">К/ст "ДВРЗ"</b></p>
										<p class="sm"><b>8 апреля 2024 г., понедельник</b><br>Автор: <a href="/author/17434/">Levis</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074411">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074411" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074411">+22</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074411"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074411"><a href="/photo/2074411/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/41/2074411_s.jpg" alt="658 КБ">
											<div class="hpshade">
												<div class="eye-icon">81</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/195/" target="_blank">Набережные Челны</a></b>, &nbsp;71-605А &nbsp;<span class="nw">№ <b><a href="/vehicle/108112/#n104150" target="_blank">0125</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=195&amp;type=1&amp;route=8" class="route">8</a></b></span></p>
										<p><b class="pw-place">Узел Хасана Туфана</b></p>
										<p class="sm"><b>10 февраля 2025 г., понедельник</b><br>Автор: <a href="/author/25342/">matsur_04_photo</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2050503">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2050503" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2050503">+22</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2050503"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2050503"><a href="/photo/2050503/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/50/50/2050503_s.jpg" alt="695 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">581</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/143/" target="_blank">Макеевка</a></b>, &nbsp;ЗиУ-682В-013 [В0В] &nbsp;<span class="nw">№ <b><a href="/vehicle/16189/#n15848" target="_blank">225</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=143&amp;type=2&amp;route=4" class="route">4</a></b>, В депо</span><br><a href="/articles/114/" target="_blank">Фотомонтаж</a></p>
										<p><b><a href="/city/143/">Макеевка</a></b>, <b class="pw-place">Волгоградська вулиця</b> | Волгоградская улица</p>
										<p class="sm"><b>9 октября 2024 г., среда</b><br>Автор: <a href="/author/32931/">Даниил Кравченко</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072063">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072063" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072063">+21</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072063"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072063"><a href="/photo/2072063/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/06/2072063_s.jpg" alt="674 КБ">
											<div class="hpshade">
												<div class="eye-icon">224</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, <span class="s3">&nbsp;81-717 (ЛВЗ) &nbsp;<span class="nw">№ <b><a href="/vehicle/258072/#n614988" target="_blank">8451</a></b></span>&nbsp;</span></span></p>
										<p><b class="pw-place">Электродепо "Московское" (ТЧ-3)</b><br><br><span class="pw-descr">Маневровые передвижения</span></p>
										<p class="sm"><b>7 февраля 2025 г., пятница</b><br>Автор: <a href="/author/20006/">frunzenecc</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074129">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074129" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074129">+20</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074129"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074129"><a href="/photo/2074129/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/12/2074129_s.jpg" alt="506 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">150</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/1/" target="_blank">Москва</a></b>, &nbsp;КАМАЗ-6282 &nbsp;<span class="nw">№ <b><a href="/vehicle/495452/#n623753" target="_blank">410157</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1&amp;type=9&amp;route=266" class="route">266</a></b></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;КАМАЗ-6282 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/561416/#n743687" target="_blank">411116</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=1&amp;type=9&amp;route=%D0%BC17" class="route">м17</a></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;КАМАЗ-6282 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/550360/#n727244" target="_blank">411106</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=1&amp;type=9&amp;route=266" class="route">266</a>, на зарядке</span></span></p>
										<p><b class="pw-place">Площадь Киевского вокзала</b></p>
										<p class="sm"><b>8 февраля 2025 г., суббота</b><br>Автор: <a href="/author/27431/">Transport_moscow</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2071234">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2071234" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2071234">+19</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2071234"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2071234"><a href="/photo/2071234/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/71/23/2071234_s.jpg" alt="467 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">122</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/82/" target="_blank">Прага</a></span>, &nbsp;Tatra T3M2-DVC &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/79770/#n77344" target="_blank">8076</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=82&amp;type=1&amp;route=23" class="route">23</a></span></span><br><a href="/city/82/" target="_blank">Прага</a> — <a href="/articles/765/" target="_blank">Мосты</a></p>
										<p><b class="pw-place">Most Legií</b></p>
										<p class="sm"><b>28 декабря 2024 г., суббота</b><br>Автор: <a href="/author/13466/">Иван Шишкин</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072466">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072466" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072466">+18</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072466"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072466"><a href="/photo/2072466/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/46/2072466_s.jpg" alt="699 КБ">
											<div class="hpshade">
												<div class="eye-icon">65</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/82/" target="_blank">Прага</a></b>, &nbsp;Tatra K2 &nbsp;<span class="nw">№ <b><a href="/vehicle/20352/#n692721" target="_blank">7000</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=82&amp;type=1&amp;route=23" class="route">23</a></b></span></p>
										<p><b class="pw-place">Letenská</b><br><br><span class="pw-descr">Výjimečné nasazení na linku 23<br>
												<br>
												Exceptionally on line 23</span></p>
										<p class="sm"><b>26 января 2025 г., воскресенье</b><br>Автор: <a href="/author/9886/">Zxs91</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076012">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076012" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076012">+18</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076012"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076012"><a href="/photo/2076012/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/01/2076012_s.jpg" alt="420 КБ">
											<div class="hpshade">
												<div class="eye-icon">200</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;МС-4 &nbsp;<span class="nw">№ <b><a href="/vehicle/12175/#n12187" target="_blank">2642</a></b></span></span><br><a href="/city/2/" target="_blank">Санкт-Петербург</a> — <a href="/articles/9892/" target="_blank">Памятный рейс в честь 81-й годовщины полного снятия блокады Ленинграда — 27.01.2025</a></p>
										<p><b class="pw-place">Суворовская площадь</b><br><br><span class="pw-descr">Выезд в рамках Рейса Памяти</span></p>
										<p class="sm"><b>27 января 2025 г., понедельник</b><br>Автор: <a href="/author/26871/">Kr1p</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2038227">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2038227" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2038227">+17</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2038227"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2038227"><a href="/photo/2038227/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/38/22/2038227_s.jpg" alt="875 КБ">
											<div class="hpshade">
												<div class="eye-icon">253</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/96/" target="_blank">Киев</a></b>, &nbsp;Tatra T6A5 &nbsp;<span class="nw">№ <b><a href="/vehicle/39882/#n587597" target="_blank">315</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=96&amp;type=1&amp;route=22" class="route">22</a></b></span></p>
										<p><b class="pw-place">Вулиця Сулеймана Стальського</b> | Улица Сулеймана Стальского</p>
										<p class="sm"><b>16 ноября 2024 г., суббота</b><br>Автор: <a href="/author/17434/">Levis</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2042474">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2042474" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2042474">+17</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2042474"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2042474"><a href="/photo/2042474/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/42/47/2042474_s.jpg" alt="884 КБ">
											<div class="hpshade">
												<div class="eye-icon">239</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/96/" target="_blank">Киев</a></span>, <span class="s3">&nbsp;Tatra T3SU &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/26017/#n25647" target="_blank">5817</a></span></span>&nbsp;</span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=96&amp;type=1&amp;route=17" class="route">17</a></span></span><br><a href="/city/96/" target="_blank">Киев</a> — <a href="/articles/1379/" target="_blank">Трамвайные линии: Подольская сеть — север</a></p>
										<p><b class="pw-place">Пуща-Водиця, лісова траса</b> | Пуща-Водица, лесная трасса</p>
										<p class="sm"><b>31 октября 2024 г., четверг</b><br>Автор: <a href="/author/17434/">Levis</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075209">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075209" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075209">+16</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075209"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075209"><a href="/photo/2075209/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/20/2075209_s.jpg" alt="567 КБ">
											<div class="hpshade">
												<div class="eye-icon">141</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/492149/#n618980" target="_blank">8912</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=60" class="route">60</a></b></span></p>
										<p><b class="pw-place">К/ст "Завод "Северная Верфь"</b></p>
										<p class="sm"><b>5 марта 2024 г., вторник</b><br>Автор: <a href="/author/19181/">Матвей Батуро</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072052">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072052" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072052">+16</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072052"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072052"><a href="/photo/2072052/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/05/2072052_s.jpg" alt="19353 КБ">
											<div class="hpshade">
												<div class="eye-icon">107</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/9/" target="_blank">Будапешт</a></span>, &nbsp;Tatra T5C5K2 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/193515/#n501766" target="_blank">4130</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=9&amp;type=1&amp;route=41" class="route">41</a>, 4229+4130</span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/9/" target="_blank">Будапешт</a></span>, &nbsp;Tatra T5C5K2 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/47237/#n501767" target="_blank">4229</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=9&amp;type=1&amp;route=41" class="route">41</a>, 4229+4130</span></span><br><a href="/city/9/" target="_blank">Будапешт</a> — <a href="/articles/182/" target="_blank">Разные фотографии</a></p>
										<p><b class="pw-place">Susulyka utca</b></p>
										<p class="sm"><b>15 января 2025 г., среда</b><br>Автор: <a href="/author/32414/">bb4346</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076011">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076011" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076011">+15</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076011"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076011"><a href="/photo/2076011/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/01/2076011_s.jpg" alt="609 КБ">
											<div class="hpshade">
												<div class="eye-icon">143</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/49/" target="_blank">Ярославль</a></b>, &nbsp;ЛиАЗ-6274 &nbsp;<span class="nw">№ <b><a href="/vehicle/586300/#n778590" target="_blank">26</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=49&amp;type=9&amp;route=50" class="route">50</a></b></span></p>
										<p><b class="pw-place">Улица Волгоградская</b><br><br><span class="pw-descr">«На замерзшей улице»</span></p>
										<p class="sm"><b>9 февраля 2025 г., воскресенье</b><br>Автор: <a href="/author/14444/">Ahtung_23</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074412">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074412" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074412">+15</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074412"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074412"><a href="/photo/2074412/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/41/2074412_s.jpg" alt="499 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">65</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/195/" target="_blank">Набережные Челны</a></b>, &nbsp;71-605 (КТМ-5М3) &nbsp;<span class="nw">№ <b><a href="/vehicle/20378/#n20002" target="_blank">0110</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=195&amp;type=1&amp;route=6" class="route">6</a></b></span></p>
										<p><b class="pw-place">Узел Хасана Туфана</b></p>
										<p class="sm"><b>10 февраля 2025 г., понедельник</b><br>Автор: <a href="/author/25342/">matsur_04_photo</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075802">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075802" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075802">+15</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075802"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075802"><a href="/photo/2075802/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/80/2075802_s.jpg" alt="492 КБ">
											<div class="hpshade">
												<div class="eye-icon">89</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/63/" target="_blank">Орёл</a></b>, &nbsp;Tatra T3SU &nbsp;<span class="nw">№ <b><a href="/vehicle/27510/#n27047" target="_blank">029</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=63&amp;type=1&amp;route=1" class="route">1</a></b></span></p>
										<p><b class="pw-place">К/ст "Железнодорожный вокзал" (трамвайная)</b></p>
										<p class="sm"><b>11 января 2025 г., суббота</b><br>Автор: <a href="/author/36400/">TTF_71</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074205">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074205" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074205">+15</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074205"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074205"><a href="/photo/2074205/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/20/2074205_s.jpg" alt="665 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">122</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/27/" target="_blank">Нижний Новгород</a></b>, &nbsp;71-605 (КТМ-5М3) &nbsp;<span class="nw">№ <b><a href="/vehicle/44315/#n631264" target="_blank">3488</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=27&amp;type=1&amp;route=417" class="route">417</a></b></span></p>
										<p><b class="pw-place">Улица Переходникова</b></p>
										<p class="sm"><b>12 января 2025 г., воскресенье</b><br>Автор: <a href="/author/20552/">fegeffeuer</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074457">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074457" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074457">+14</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074457"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074457"><a href="/photo/2074457/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/45/2074457_s.jpg" alt="608 КБ">
											<div class="hpshade">
												<div class="eye-icon">103</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/82/" target="_blank">Прага</a></b>, &nbsp;Škoda 15T3 ForCity Alfa Praha &nbsp;<span class="nw">№ <b><a href="/vehicle/173830/#n178775" target="_blank">9241</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=82&amp;type=1&amp;route=18" class="route">18</a></b></span></p>
										<p><b class="pw-place">Nábřeží Kapitána Jaroše</b></p>
										<p class="sm"><b>9 февраля 2025 г., воскресенье</b><br>Автор: <a href="/author/20146/">Dozenazer</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="1828263">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="1828263" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="1828263">+13</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="1828263"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p1828263"><a href="/photo/1828263/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/18/28/26/1828263_s.jpg" alt="6502 КБ">
											<div class="hpshade">
												<div class="eye-icon">306</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/251/" target="_blank">Верхнесилезская агломерация</a></b>, &nbsp;PESA Twist 2017N &nbsp;<span class="nw">№ <b><a href="/vehicle/529804/#n689091" target="_blank">1046</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=251&amp;type=1&amp;route=14" class="route">14</a></b></span><br><a href="/city/251/" target="_blank">Верхнесилезская агломерация</a> — <a href="/articles/489/" target="_blank">Разные фотографии</a></p>
										<p><b class="pw-place">Katowice, ulica Wiosny Ludów</b><br><br><span class="pw-descr">Одно из самых живописных мест трамвайной Силезии</span></p>
										<p class="sm"><b>Август 2023 г.</b><br>Автор: <a href="/author/10032/">Романенков Дмитрий</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2073998">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2073998" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2073998">+13</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2073998"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2073998"><a href="/photo/2073998/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/73/99/2073998_s.jpg" alt="5302 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">221</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-134А (ЛМ-99АВН) &nbsp;<span class="nw">№ <b><a href="/vehicle/7135/#n796978" target="_blank">1742</a></b></span></span></p>
										<p><b class="pw-place">Кольцо "Площадь Стачек"</b></p>
										<p class="sm"><b>8 февраля 2025 г., суббота</b><br>Автор: <a href="/author/31120/">AlexG20</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076109">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076109" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076109">+12</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076109"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076109"><a href="/photo/2076109/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/10/2076109_s.jpg" alt="408 КБ">
											<div class="hpshade">
												<div class="eye-icon">56</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/195/" target="_blank">Набережные Челны</a></b>, &nbsp;ВТК-24 &nbsp;<span class="nw">№ <b><a href="/vehicle/115211/#n111010" target="_blank">ГС-7</a></b></span></span></p>
										<p><b class="pw-place">Кольцо "25 комплекс"</b><br><br><span class="pw-descr">Снегочист, раздувающий снежное облако, застыл в сказочном тумане</span></p>
										<p class="sm"><b>11 января 2025 г., суббота</b><br>Автор: <a href="/author/25342/">matsur_04_photo</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2060153">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2060153" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2060153">+12</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2060153"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2060153"><a href="/photo/2060153/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/60/15/2060153_s.jpg" alt="486 КБ">
											<div class="hpshade">
												<div class="eye-icon">204</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/35/" target="_blank">Рига</a></span>, &nbsp;Tatra T3MR (T6B5-R) &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/53599/#n101864" target="_blank">35098</a></span></span> &nbsp;—&nbsp; 35098+35108</span></span><br><a href="/city/35/" target="_blank">Рига</a> — <a href="/articles/7271/" target="_blank">Мосты</a></p>
										<p><b class="pw-place">Slokas iela</b> | Улица Слокас</p>
										<p class="sm"><b>28 октября 2024 г., понедельник</b><br>Автор: <a href="/author/18598/">Tučňák</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074413">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074413" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074413">+12</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074413"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074413"><a href="/photo/2074413/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/41/2074413_s.jpg" alt="639 КБ">
											<div class="hpshade">
												<div class="eye-icon">55</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/195/" target="_blank">Набережные Челны</a></b>, &nbsp;71-605 (КТМ-5М3) &nbsp;<span class="nw">№ <b><a href="/vehicle/109266/#n105293" target="_blank">092</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=195&amp;type=1&amp;route=6" class="route">6</a></b></span></p>
										<p><b class="pw-place">Узел Хасана Туфана</b></p>
										<p class="sm"><b>10 февраля 2025 г., понедельник</b><br>Автор: <a href="/author/25342/">matsur_04_photo</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="1335663">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="1335663" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="1335663">+11</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="1335663"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p1335663"><a href="/photo/1335663/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/13/35/66/1335663_s.jpg" alt="365 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">205</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/348/" target="_blank">Лейпциг</a></span>, &nbsp;Tatra T4D-S / P &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/99539/#n96210" target="_blank">5091</a></span></span></span></span><br><a href="/city/348/" target="_blank">Лейпциг</a> — <a href="/articles/7081/" target="_blank">Креативные фотографии</a></p>
										<p><b class="pw-place">Straßenbahnhof Wittenberger Straße</b></p>
										<p class="sm"><b>15 сентября 2019 г., воскресенье</b><br>Автор: <a href="/author/9886/">Zxs91</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076110">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076110" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076110">+11</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076110"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076110"><a href="/photo/2076110/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/11/2076110_s.jpg" alt="631 КБ">
											<div class="hpshade">
												<div class="eye-icon">32</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/195/" target="_blank">Набережные Челны</a></b>, &nbsp;ВТК-24 &nbsp;<span class="nw">№ <b><a href="/vehicle/115211/#n111010" target="_blank">ГС-7</a></b></span></span></p>
										<p><b class="pw-place">Московский проспект</b></p>
										<p class="sm"><b>11 января 2025 г., суббота</b><br>Автор: <a href="/author/25342/">matsur_04_photo</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074414">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074414" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074414">+10</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074414"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074414"><a href="/photo/2074414/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/41/2074414_s.jpg" alt="679 КБ">
											<div class="hpshade">
												<div class="eye-icon">50</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/195/" target="_blank">Набережные Челны</a></b>, &nbsp;71-605 (КТМ-5М3) &nbsp;<span class="nw">№ <b><a href="/vehicle/49185/#n47964" target="_blank">087</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=195&amp;type=1&amp;route=9" class="route">9</a></b></span></p>
										<p><b class="pw-place">Московский проспект</b></p>
										<p class="sm"><b>10 февраля 2025 г., понедельник</b><br>Автор: <a href="/author/25342/">matsur_04_photo</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076523">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076523" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076523">+10</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076523"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076523"><a href="/photo/2076523/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/52/2076523_s.jpg" alt="676 КБ">
											<div class="hpshade">
												<div class="eye-icon">83</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><a href="/articles/3/" target="_blank">Фотозарисовки</a></p>
										<p><b><a href="/city/368/">Пекин</a></b>, <b class="pw-place">香山 (Fragrant Hills)</b></p>
										<p class="sm"><b>30 марта 2024 г., суббота</b><br>Автор: <a href="/author/9886/">Zxs91</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="228100">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="228100" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="228100">+10</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="228100"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p228100"><a href="/photo/228100/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/02/28/10/228100_s.jpg" alt="339 КБ">
											<div class="hpshade">
												<div class="com-icon">21</div>
												<div class="eye-icon">1147</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, <span class="s8">&nbsp;К-1 &nbsp;<span class="nw">№ <b><a href="/vehicle/43566/#n42497" target="_blank">К-1</a></b></span>&nbsp;</span></span></p>
										<p><b class="pw-place">Трамвайный парк Службы пути</b></p>
										<p class="sm"><b>20 сентября 2009 г., воскресенье</b><br>Автор: <a href="/author/589/">Slava</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074052">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074052" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074052">+10</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074052"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074052"><a href="/photo/2074052/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/05/2074052_s.jpg" alt="500 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">189</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;ЛиАЗ-6274 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/487054/#n612512" target="_blank">430181</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=1&amp;type=9&amp;route=538" class="route">538</a></span></span><br><a href="/city/1/" target="_blank">Москва</a> — <a href="/articles/51/" target="_blank">Разные фотографии</a></p>
										<p><b class="pw-place">Москворецкая улица</b></p>
										<p class="sm"><b>8 февраля 2025 г., суббота</b><br>Автор: <a href="/author/21303/">vse_o_transporte</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2068192">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2068192" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2068192">+10</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2068192"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2068192"><a href="/photo/2068192/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/68/19/2068192_s.jpg" alt="669 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">322</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><a href="/articles/6006/" target="_blank">Транспорт и животные</a></p>
										<p><b><a href="/city/1/">Москва</a></b>, <b class="pw-place">Электродепо "Красная Пресня" (ТЧ-4)</b><br><br><span class="pw-descr">Пушистая бригада в мотодепо</span></p>
										<p class="sm"><b>31 января 2025 г., пятница</b><br>Автор: <a href="/author/36151/">FastProjectile</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075848">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075848" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075848">+9</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075848"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075848"><a href="/photo/2075848/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/84/2075848_s.jpg" alt="610 КБ">
											<div class="hpshade">
												<div class="com-icon">3</div>
												<div class="eye-icon">164</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/95/" target="_blank">Томск</a></b>, &nbsp;71-605 (КТМ-5М3) &nbsp;<span class="nw">№ <b><a href="/vehicle/74587/#n72753" target="_blank">ГС-283</a></b></span></span></p>
										<p><b class="pw-place">Площадь Батенькова <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Советская улица</b></p>
										<p class="sm"><b>13 февраля 2025 г., четверг</b><br>Автор: <a href="/author/25444/">Stopcat</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2071881">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2071881" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2071881">+9</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2071881"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2071881"><a href="/photo/2071881/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/71/88/2071881_s.jpg" alt="3992 КБ">
											<div class="hpshade">
												<div class="eye-icon">86</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/96/" target="_blank">Киев</a></b>, &nbsp;Tatra T3SU &nbsp;<span class="nw">№ <b><a href="/vehicle/26169/#n25807" target="_blank">5952</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=96&amp;type=1&amp;route=12" class="route">12</a></b></span></p>
										<p><b class="pw-place">Пуща-Водиця, лісова траса</b> | Пуща-Водица, лесная трасса<br><br><span class="pw-descr">Єдиний прикрашений вагон у місті.</span></p>
										<p class="sm"><b>11 января 2025 г., суббота</b><br>Автор: <a href="/author/35938/">andrijmovcan29</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076031">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076031" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076031">+8</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076031"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076031"><a href="/photo/2076031/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/03/2076031_s.jpg" alt="567 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">127</div>
											</div>
											<div class="temp" style="background-image:url('/img/cond.png')"></div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/1/" target="_blank">Москва</a></b>, &nbsp;КАМАЗ-6282 &nbsp;<span class="nw">№ <b><a href="/vehicle/510025/#n742144" target="_blank">410551</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1&amp;type=9&amp;route=%D1%81929" class="route">с929</a></b></span><br><a href="/city/1/" target="_blank">Москва</a> — <a href="/articles/51/" target="_blank">Разные фотографии</a></p>
										<p><b class="pw-place">Черноморский бульвар</b></p>
										<p class="sm"><b>13 февраля 2025 г., четверг</b><br>Автор: <a href="/author/37115/">better_call_frog</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075765">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075765" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075765">+8</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075765"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075765"><a href="/photo/2075765/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/76/2075765_s.jpg" alt="6774 КБ">
											<div class="hpshade">
												<div class="eye-icon">173</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/101/" target="_blank">Харьков</a></b>, &nbsp;Tatra T3SUCS &nbsp;<span class="nw">№ <b><a href="/vehicle/561736/#n744286" target="_blank">7191</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=101&amp;type=1&amp;route=6" class="route">6</a></b></span></p>
										<p><b class="pw-place">Салтівський провулок <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Салтівське шосе</b> | Салтовский переулок <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Салтовское шоссе</p>
										<p class="sm"><b>12 февраля 2025 г., среда</b><br>Автор: <a href="/author/29132/">Бутенко Максим</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076570">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076570" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076570">+8</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076570"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076570"><a href="/photo/2076570/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/57/2076570_s.jpg" alt="700 КБ">
											<div class="hpshade">
												<div class="eye-icon">69</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/49/" target="_blank">Ярославль</a></b>, &nbsp;Тролза-5275.03 «Оптима» &nbsp;<span class="nw">№ <b><a href="/vehicle/374959/#n664180" target="_blank">52</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=49&amp;type=2&amp;route=4" class="route">4</a></b></span><br><a href="/city/49/" target="_blank">Ярославль</a> — <a href="/articles/5706/" target="_blank">Конечные станции и разворотные кольца — троллейбус</a></p>
										<p><b class="pw-place">Торговый переулок</b></p>
										<p class="sm"><b>14 февраля 2025 г., пятница</b><br>Автор: <a href="/author/32909/">w0ri</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072421">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072421" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072421">+8</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072421"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072421"><a href="/photo/2072421/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/42/2072421_s.jpg" alt="7189 КБ">
											<div class="hpshade">
												<div class="eye-icon">39</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/396/" target="_blank">София</a></b>, &nbsp;Duewag GT8 &nbsp;<span class="nw">№ <b><a href="/vehicle/115730/#n111528" target="_blank">4410</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=396&amp;type=1&amp;route=23" class="route">23</a></b></span></p>
										<p><b class="pw-place">Булевард Искърско шосе</b></p>
										<p class="sm"><b>11 января 2025 г., суббота</b><br>Автор: <a href="/author/38625/">Kalin Bogdanov</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2076045">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2076045" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2076045">+7</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2076045"><img src="/img/star_author.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2076045"><a href="/photo/2076045/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/76/04/2076045_s.jpg" alt="698 КБ">
											<div class="hpshade">
												<div class="eye-icon">149</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><a href="/articles/3/" target="_blank">Фотозарисовки</a></p>
										<p><b><a href="/city/129/">Краснодар</a></b>, <b class="pw-place">Улица Достоевского</b></p>
										<p class="sm"><b>17 октября 2024 г., четверг</b><br>Автор: <a href="/author/33351/">Nikita_Finko</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="1950515">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="1950515" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="1950515">+6</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="1950515"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p1950515"><a href="/photo/1950515/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/19/50/51/1950515_s.jpg" alt="712 КБ">
											<div class="hpshade">
												<div class="com-icon">41</div>
												<div class="eye-icon">3122</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/49/" target="_blank">Ярославль</a></b>, &nbsp;Синара 6254.01 &nbsp;<span class="nw">№ <b><a href="/vehicle/592722/#n787846" target="_blank">999</a></b></span></span><br><span style="word-spacing:-1px"><b><a href="/city/49/" target="_blank">Ярославль</a></b>, &nbsp;Синара 6254.01 &nbsp;<span class="nw">№ <b><a href="/vehicle/592837/#n788033" target="_blank">555</a></b></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/49/" target="_blank">Ярославль</a></span>, &nbsp;Синара 6254.01 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/592838/#n788034" target="_blank">888</a></span></span></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/49/" target="_blank">Ярославль</a></span>, &nbsp;Синара 6254.01 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/592839/#n788035" target="_blank">333</a></span></span></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/49/" target="_blank">Ярославль</a></span>, &nbsp;Синара 6254.01 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/592841/#n788040" target="_blank">777</a></span></span></span></span><br><a href="/city/49/" target="_blank">Ярославль</a> — <a href="/articles/604/" target="_blank">Новые троллейбусы</a></p>
										<p><b class="pw-place">Троллейбусное депо № 2</b><br><br><span class="pw-descr">Презентация новых троллейбусов</span></p>
										<p class="sm"><b>24 мая 2024 г., пятница</b><br>Автор: <a href="/author/14444/">Ahtung_23</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2065751">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2065751" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2065751">+6</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2065751"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2065751"><a href="/photo/2065751/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/65/75/2065751_s.jpg?1" alt="886 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">304</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/1/" target="_blank">Москва</a></b>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/509965/#n654346" target="_blank">31353</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1&amp;type=1&amp;route=50" class="route">50</a></b></span></p>
										<p><b class="pw-place">Красноказарменная улица</b></p>
										<p class="sm"><b>7 января 2025 г., вторник</b><br>Автор: <a href="/author/478/">ARTём</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2024627">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2024627" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2024627">+4</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2024627"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2024627"><a href="/photo/2024627/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/24/62/2024627_s.jpg" alt="6680 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">235</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/74/" target="_blank">Омск</a></b>, &nbsp;71-605 (КТМ-5М3) &nbsp;<span class="nw">№ <b><a href="/vehicle/64279/#n62709" target="_blank">54</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=74&amp;type=1&amp;route=2" class="route">2</a></b></span></p>
										<p><b class="pw-place">2-я Транспортная улица</b></p>
										<p class="sm"><b>9 октября 2024 г., среда</b><br>Автор: <a href="/author/22759/">ФиСтАшКиН</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075705">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075705" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075705">+4</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075705"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075705"><a href="/photo/2075705/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/70/2075705_s.jpg" alt="690 КБ">
											<div class="hpshade">
												<div class="eye-icon">46</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/82/" target="_blank">Прага</a></b>, &nbsp;Ringhoffer/Tatra JSM &nbsp;<span class="nw">№ <b><a href="/vehicle/577215/#n766459" target="_blank">3098</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=82&amp;type=1&amp;route=42" class="route">42</a></b>, 3098-1419</span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/82/" target="_blank">Прага</a></span>, &nbsp;Ringhoffer серии 1301-1580 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/107429/#n103485" target="_blank">1419</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=82&amp;type=1&amp;route=42" class="route">42</a>, 3098-1419</span></span></p>
										<p><b class="pw-place">Klárov <img src="/img/place_arrow.gif" alt="/" width="15" height="11" style="position:relative; top:-1px; margin:0 3px"> Mánesův most</b></p>
										<p class="sm"><b>26 января 2025 г., воскресенье</b><br>Автор: <a href="/author/9886/">Zxs91</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="1989875">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="1989875" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="1989875">+3</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="1989875"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p1989875"><a href="/photo/1989875/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/19/89/87/1989875_s.jpg" alt="640 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">290</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/2/" target="_blank">Санкт-Петербург</a></span>, &nbsp;ЛВС-86К-М &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/6797/#n6924" target="_blank">5203</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=2&amp;type=1&amp;route=48" class="route">48</a></span></span><br><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-628-02 &nbsp;<span class="nw">№ <b><a href="/vehicle/580919/#n770908" target="_blank">5512</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=19" class="route">19</a></b></span><br><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-628-02 &nbsp;<span class="nw">№ <b><a href="/vehicle/576511/#n765461" target="_blank">5502</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=48" class="route">48</a></b></span></p>
										<p><b class="pw-place">К/ст "Лахтинский разлив"</b></p>
										<p class="sm"><b>28 июля 2024 г., воскресенье</b><br>Автор: <a href="/author/9383/">Дмитрий Денисенко</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2054263">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2054263" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2054263">+3</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2054263"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2054263"><a href="/photo/2054263/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/54/26/2054263_s.jpg?1" alt="680 КБ">
											<div class="hpshade">
												<div class="eye-icon">186</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;71-623-02 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/324821/#n666097" target="_blank">2605</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=1&amp;type=1&amp;route=32" class="route">32</a></span></span><br><span style="word-spacing:-1px"><b><a href="/city/1/" target="_blank">Москва</a></b>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/451490/#n557087" target="_blank">31106</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1&amp;type=1&amp;route=43" class="route">43</a></b></span></p>
										<p><b class="pw-place">Андроньевский проезд</b></p>
										<p class="sm"><b>31 декабря 2024 г., вторник</b><br>Автор: <a href="/author/10632/">Guaglione</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2045262">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2045262" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2045262">+2</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2045262"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2045262"><a href="/photo/2045262/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/45/26/2045262_s.jpg" alt="605 КБ">
											<div class="hpshade">
												<div class="com-icon">1</div>
												<div class="eye-icon">437</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/1/" target="_blank">Москва</a></span>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/435677/#n798877" target="_blank">31020</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=1&amp;type=1&amp;route=2" class="route">2</a></span></span><br><span style="word-spacing:-1px"><b><a href="/city/1/" target="_blank">Москва</a></b>, &nbsp;71-931М «Витязь-М» &nbsp;<span class="nw">№ <b><a href="/vehicle/484378/#n609127" target="_blank">31256</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=1&amp;type=1&amp;route=2" class="route">2</a></b></span><br><a href="/city/1/" target="_blank">Москва</a> — <a href="/articles/597/" target="_blank">Трамвайные линии: ЦАО</a></p>
										<p><b class="pw-place">Улица Сергия Радонежского</b></p>
										<p class="sm"><b>23 ноября 2024 г., суббота</b><br>Автор: <a href="/author/25745/">Gerdenshman</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075409">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075409" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075409">+2</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075409"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075409"><a href="/photo/2075409/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/40/2075409_s.jpg" alt="3121 КБ">
											<div class="hpshade">
												<div class="eye-icon">165</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/114/" target="_blank">Вильнюс</a></b>, &nbsp;Škoda 32Tr SOR &nbsp;<span class="nw">№ <b><a href="/vehicle/599934/#n797708" target="_blank">1847</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=114&amp;type=2&amp;route=10" class="route">10</a></b></span></p>
										<p><b class="pw-place">Antakalnio gatvė</b></p>
										<p class="sm"><b>14 декабря 2024 г., суббота</b><br>Автор: <a href="/author/35026/">RaSoL</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2075467">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2075467" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2075467">+1</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2075467"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2075467"><a href="/photo/2075467/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/75/46/2075467_s.jpg" alt="628 КБ">
											<div class="hpshade">
												<div class="eye-icon">51</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/82/" target="_blank">Прага</a></b>, &nbsp;Ringhoffer/Tatra JSM &nbsp;<span class="nw">№ <b><a href="/vehicle/577215/#n766459" target="_blank">3098</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=82&amp;type=1&amp;route=42" class="route">42</a></b>, 3098-1562</span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/82/" target="_blank">Прага</a></span>, &nbsp;Ringhoffer серии 1301-1580 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/109206/#n105235" target="_blank">1562</a></span></span> &nbsp;—&nbsp; маршрут <a href="/search.php?cid=82&amp;type=1&amp;route=42" class="route">42</a>, 3098-1562</span></span></p>
										<p><b class="pw-place">Nábřeží Kapitána Jaroše</b></p>
										<p class="sm"><b>9 февраля 2025 г., воскресенье</b><br>Автор: <a href="/author/20146/">Dozenazer</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2067100">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2067100" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2067100">+1</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2067100"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2067100"><a href="/photo/2067100/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/67/10/2067100_s.jpg" alt="477 КБ">
											<div class="hpshade">
												<div class="eye-icon">143</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/15/" target="_blank">Владимир</a></b>, &nbsp;ЗиУ-682Г-016.04 &nbsp;<span class="nw">№ <b><a href="/vehicle/107143/#n432174" target="_blank">266</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=15&amp;type=2&amp;route=10" class="route">10</a></b></span></p>
										<p><b class="pw-place">Лыбедская магистраль</b></p>
										<p class="sm"><b>26 октября 2024 г., суббота</b><br>Автор: <a href="/author/11829/">Melodiaz</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2069407">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2069407" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2069407">0</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2069407"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2069407"><a href="/photo/2069407/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/69/40/2069407_s.jpg" alt="12149 КБ">
											<div class="hpshade">
												<div class="eye-icon">133</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/9/" target="_blank">Будапешт</a></b>, &nbsp;Tatra T5C5K2 &nbsp;<span class="nw">№ <b><a href="/vehicle/47077/#n390374" target="_blank">4024</a></b></span></span></p>
										<p><b class="pw-place">Hűvösvölgy</b></p>
										<p class="sm"><b>15 января 2025 г., среда</b><br>Автор: <a href="/author/32414/">bb4346</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2072670">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2072670" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2072670">0</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2072670"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2072670"><a href="/photo/2072670/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/72/67/2072670_s.jpg" alt="557 КБ">
											<div class="hpshade">
												<div class="eye-icon">90</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/91/" target="_blank">Йошкар-Ола</a></b>, &nbsp;Тролза-5275.03 «Оптима» &nbsp;<span class="nw">№ <b><a href="/vehicle/347463/#n402145" target="_blank">291</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=91&amp;type=2&amp;route=%D0%BC8" class="route">м8</a></b></span></p>
										<p><b class="pw-place">Улица Пушкина</b></p>
										<p class="sm"><b>17 января 2025 г., пятница</b><br>Автор: <a href="/author/28146/">Egorych193</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div class="p20p">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="1773528">
										<a href="#" vote="1" class="konk_btn"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="1773528" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="1773528">–2</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="1773528"></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p1773528"><a href="/photo/1773528/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/17/73/52/1773528_s.jpg" alt="581 КБ">
											<div class="hpshade">
												<div class="com-icon">2</div>
												<div class="eye-icon">1055</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/102/" target="_blank">Уфа</a></span>, <span class="s3">&nbsp;Tatra T3D &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/24226/#n23869" target="_blank">2143</a></span></span>&nbsp;</span></span></span><br><span style="word-spacing:-1px"><b><a href="/city/102/" target="_blank">Уфа</a></b>, &nbsp;Tatra T3D &nbsp;<span class="nw">№ <b><a href="/vehicle/24681/#n24325" target="_blank">2006</a></b></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/102/" target="_blank">Уфа</a></span>, <span class="s4">&nbsp;МТТЧ &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/321/#n755330" target="_blank">2014</a></span></span>&nbsp;</span></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/102/" target="_blank">Уфа</a></span>, <span class="s5">&nbsp;71-402 &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/103658/#n92339" target="_blank">2176</a></span></span>&nbsp;</span></span></span><br><span style="word-spacing:-1px"><b><a href="/city/102/" target="_blank">Уфа</a></b>, <span class="s5">&nbsp;Tatra T3SU &nbsp;<span class="nw">№ <b><a href="/vehicle/24162/#n23808" target="_blank">2081</a></b></span>&nbsp;</span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/102/" target="_blank">Уфа</a></span>, <span class="s5">&nbsp;Tatra T3D &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/24253/#n23896" target="_blank">2051</a></span></span>&nbsp;</span></span></span><br><span style="word-spacing:-1px"><span class="sec"><span class="nf"><a href="/city/102/" target="_blank">Уфа</a></span>, <span class="s5">&nbsp;Tatra T3R.P &nbsp;<span class="nw">№ <span class="nf"><a href="/vehicle/96943/#n93688" target="_blank">2082</a></span></span>&nbsp;</span></span></span><br><a href="/city/102/" target="_blank">Уфа</a> — <a href="/articles/2915/" target="_blank">Трамвайное депо № 2 (ранее № 3)</a></p>
										<p><b class="pw-place">Трамвайное депо № 2</b></p>
										<p class="sm"><b>5 июня 2023 г., понедельник</b><br>Автор: <a href="/author/28976/">MatchingPine</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div style="padding:6px 6px 5px">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2068361">
										<a href="#" vote="1" class="konk_btn voted"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2068361" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2068361">+162</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2068361"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2068361"><a href="/photo/2068361/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/68/36/2068361_s.jpg" alt="557 КБ">
											<div class="hpshade">
												<div class="com-icon">22</div>
												<div class="eye-icon">2035</div>
											</div>
											<div class="temp" style="background-image:url('/img/cond.png')"></div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-638-02 «Поларис» &nbsp;<span class="nw">№ <b><a href="/vehicle/604225/#n803377" target="_blank">5810</a></b></span> &nbsp;—&nbsp; обкатка</span></p>
										<p><b class="pw-place">Улица Савушкина</b><br><br><span class="pw-descr">Обкатка нового трамвая 71-638-02 «Поларис»</span></p>
										<p class="sm"><b>1 февраля 2025 г., суббота</b><br>Автор: <a href="/author/26699/">Qwerty_qwertovich</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div style="padding:6px 6px 5px">
						<table>
							<tbody>
								<tr>
									<td class="pb_pre vote" style="padding-left:15px; padding-right:10px; display:table-cell" pid="2074014">
										<a href="#" vote="1" class="konk_btn voted"><span>Красиво, на&nbsp;конкурс!</span></a>
										<table style="margin:5px 0 7px; width:100px">
											<tbody>
												<tr>
													<td style="width:20px"><img class="loader" pid="2074014" src="/img/loader.gif"></td>
													<td align="center" style="padding:2px"><b class="s_rating" pid="2074014">+138</b></td>
													<td style="width:20px; display:table-cell" class="star" pid="2074014"><img src="/img/star_people.png" alt=""></td>
												</tr>
											</tbody>
										</table>
										<a href="#" vote="0" class="konk_btn"><span>Неконкурсное фото</span></a>
									</td>
									<td class="pb_photo" id="p2074014"><a href="/photo/2074014/" target="_blank" class="prw"><img class="f" src="/img/prw-loader.gif" data-src="/photo/20/74/01/2074014_s.jpg" alt="555 КБ">
											<div class="hpshade">
												<div class="com-icon">16</div>
												<div class="eye-icon">1282</div>
											</div>
										</a></td>
									<td class="pb_descr">
										<p><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;ЛВС-86К &nbsp;<span class="nw">№ <b><a href="/vehicle/135069/#n130294" target="_blank">5117</a></b></span> &nbsp;—&nbsp; маршрут <b><a href="/search.php?cid=2&amp;type=1&amp;route=19" class="route">19</a></b></span><br><span style="word-spacing:-1px"><b><a href="/city/2/" target="_blank">Санкт-Петербург</a></b>, &nbsp;71-638-02 «Поларис» &nbsp;<span class="nw">№ <b><a href="/vehicle/604225/#n803377" target="_blank">5810</a></b></span></span></p>
										<p><b class="pw-place">К/ст "Лахтинский разлив"</b></p>
										<p class="sm"><b>10 февраля 2025 г., понедельник</b><br>Автор: <a href="/author/26699/">Qwerty_qwertovich</a></p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
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