<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\{Vehicle, User};


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
        <tr><td class="main">
<h1>Внесение изменений в БД</h1>
<p>На этой странице Вы можете ввести данные о Сущности, которые отсутствуют в базе данных сайта, либо требуют уточнения.<br />Информация добавляется в базу после проверки редактором.</p>
<script src="/js/jquery-ui.js?1633005526"></script>
<script src="/js/selector.js?1730197663"></script>
<form action="dbedit" id="mform" method="get" class="p20" style="float:left">
	<input type="hidden" name="action" value="add">
	<h4>Добавить/редактировать Сущность</h4>
	<table>
		<tr>
			<td class="lcol">Вид сущности:</td>
			<td><select name="type" id="type">
			<?php
                                            $entities = DB::query('SELECT * FROM entities');
                                            foreach ($entities as $e) {
                                                echo ' <option value="' . $e['id'] . '" style="background-color: ' . $e['color'] . '">' . $e['title'] . '</option>';
                                            }
                                            ?>
</select></td>
		</tr>
		<tr>
			<td class="lcol">
				<input type="radio" name="link_gos" id="link_gos0" value="0" checked="checked">
				<label for="link_gos0">ID:</label>
			</td>
			<td style="padding-right:10px">
				<input type="text" name="num" id="num" maxlength="20" style="width:80px" value=''> &nbsp;
				<input type="radio" name="link_gos" id="link_gos1" value="1">
				<label for="link_gos1">Название:</label>
				<input type="text" name="gos" id="gos" maxlength="20" style="width:120px" value=''>
			</td>
		</tr>
		<tr>
			<td></td>
			<td><input type="submit" id="submit" style="width:100px; margin-top:15px" value="Далее &gt;&gt;" disabled="disabled"></td>
		</tr>
	</table>
	<input type="hidden" name="mid" value="0">
</form>
<br clear="all">
<br>

<script>

function numKeyUp()
{
	$('#submit').prop('disabled', $('#num').val().trim() + $('#gos').val().trim() == '');
}

function radioClick()
{
	$('#num').prop('disabled', $('#link_gos1').is(':checked'));
	$('#gos').prop('disabled', $('#link_gos0').is(':checked'));
}


$(document).ready(function()
{
	$('#cname').citySelector('cid', { params: { with_null: true } });
	$('#type').change(function() { $(this).attr('class', $('option:selected', this).attr('class')); }).change();

	$('#num, #gos').on('keyup', numKeyUp);
	$('input[name="link_gos"]').on('click', radioClick);

	numKeyUp();
	radioClick();
});

</script>
</td></tr>

        <tr>

            <?php include($_SERVER['DOCUMENT_ROOT'] . '/views/components/Footer.php'); ?>


        </tr>
    </table>

</body>

</html>