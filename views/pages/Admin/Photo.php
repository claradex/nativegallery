<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

//$userprofile = new User(explode('/', $_SERVER['REQUEST_URI'])[2]);
?>


<tr>
    <style>
    #sbmt {
        display: inline-block;
    box-sizing: border-box;
    vertical-align: middle;
    cursor: pointer;
    position: relative;
    padding: 2px 15px 3px;
    height: auto;
    text-align: center;
    font-family: var(--narrow-font);
    font-size: 17px;
    font-weight: bold;
    color: var(--theme-fg-color);
    background-color: #777;
    background-color: var(--theme-bg-color);
    transition: none;
    border: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
    -ms-user-select: none;
    border-radius: 0;
    -webkit-border-radius: 0;
    }
    </style>
                <td class="main">
                    <h1><b>Фотографии</b></h1>
                    <script src="/js/diff.js"></script>
                    <script src="/js/pwrite-compare.js"></script>
                  <br clear="all"><br>
                    <div class="p20w" style="display:block">
                        <table class="table">
                            <tbody>
                                <tr>
                                    <th width="100">Изображение</th>
                                    <th width="50%">Информация</th>
                                    <th>Действия</th>
                                </tr>
                                
                               <?php
                               $photos = DB::query('SELECT * FROM photos WHERE moderated=0 ORDER BY id DESC');
                               foreach ($photos as $p) {
                                    if ($p['moderated'] === 0) {
                                        $color = 's0';
                                    } else if ($p['moderated'] === 2) {
                                        $color = 's15';
                                    } else {
                                        $color = 's12';
                                    }
                                    $author = new User($p['user_id']);
                                    echo ' <tr id="pht'.$p['id'].'" class="'.$color.'">
                                    <td>
                                        <a href="/photo/'.$p['id'].'/" target="_blank" class="prw">
                                            <img src="'.$p['photourl'].'" class="f">
                                            
                                        </a>
                                    </td>
                                    <td>
                                        <p><span style="word-spacing:-1px"><b>'.htmlspecialchars($p['place']).'</b></span></p>
                                        <p class="sm"><b>'.Date::zmdate($p['posted_at']).'</b><br>Автор: <a href="/author/'.$p['user_id'].'/">'.htmlspecialchars($author->i('username')).'</a></p>
                                       
                                    </td>
                                    <td class="c">
                                   ';
                                   if ($p['moderated'] === 0) {
                                    echo '<a data-bs-toggle="modal" data-bs-target="#acceptPhotoModal'.$p['id'].'" href="#" class="btn btn-primary">Принять</a>
                                    <a data-bs-toggle="modal" data-bs-target="#declinePhotoModal'.$p['id'].'" href="#" class="btn btn-danger">Отклонить</a>';
                                   }
                                   echo '
                                    </td>';
                                    if ($p['endmoderation'] === -1) {
                                        $endm = 'На модерации';
                                    }
                                   echo '
                                </tr>

   <div class="modal fade" id="acceptPhotoModal'.$p['id'].'" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel"><b>Принятие фотографии</b></h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
       <div class="form-check">
  <input name="accept'.$p['id'].'" value="0" class="form-check-input" type="radio" name="flexRadioDefault" id="acceptReason1" checked>
  <label class="form-check-label" for="acceptReason1">
    Нормальная публикация
  </label>
</div>
<div class="form-check">
  <input name="accept'.$p['id'].'" value="1" class="form-check-input" type="radio" name="flexRadioDefault" id="acceptReason3">
  <label class="form-check-label" for="acceptReason3">
    Условная публикация
  </label>
</div>
<div class="form-check">
  <input name="accept'.$p['id'].'" value="2" class="form-check-input" type="radio" name="flexRadioDefault" id="acceptReason2">
  <label class="form-check-label" for="acceptReason2">
    Временная публикация
  </label>
</div>
<div class="form-check">
  <input name="accept'.$p['id'].'" value="3" class="form-check-input" type="radio" name="flexRadioDefault" id="acceptReason4">
  <label class="form-check-label" for="acceptReason4">
    Техническая публикация
  </label>
</div>
<h6 class="mt-3">Другие действия</h6>
<div class="form-check">
  <input name="anotheraccept'.$p['id'].'[]" class="form-check-input" type="checkbox" value="1" id="flexCheckDefault">
  <label class="form-check-label" for="flexCheckDefault">
    Отключить комментарии
  </label>
</div>
<div class="form-check">
  <input name="anotheraccept'.$p['id'].'[]" class="form-check-input" type="checkbox" value="2" id="flexCheckDefault">
  <label class="form-check-label" for="flexCheckDefault">
    Отключить рейтинг
  </label>
</div>
<div class="mb-3">
  <label for="exampleFormControlTextarea1" class="form-label">Дополнительный комментарий</label>
  <textarea class="form-control" id="exampleFormControlTextarea1" name="comment" rows="3"></textarea>
</div>
      </div>
      <div class="modal-footer">
        <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</a>'; ?>
        <a href="#" onclick="photoAction(<?=$p['id']?>, document.querySelector(`input[name='accept<?=$p['id']?>']:checked`).value, 1); return false;" data-bs-dismiss="modal" class="btn btn-primary">Сохранить</a>
        <?php echo '
      </div>
    </div>
  </div>
</div>



                                
                                <div class="modal fade" id="declinePhotoModal'.$p['id'].'" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel"><b>Причина отклонения</b></h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
       <div class="form-check">
  <input name="decline'.$p['id'].'" value="1" class="form-check-input" type="radio" name="flexRadioDefault" id="declineReason1">
  <label class="form-check-label" for="declineReason1">
    Малоинформативный бред
  </label>
</div>
<div class="form-check">
  <input name="decline'.$p['id'].'" checked value="2" class="form-check-input" type="radio" name="flexRadioDefault" id="declineReason2">
  <label class="form-check-label" for="declineReason2">
    Не подходит для сайта
  </label>
</div>
<div class="form-check">
  <input name="decline'.$p['id'].'" value="3" class="form-check-input" type="radio" name="flexRadioDefault" id="declineReason3">
  <label class="form-check-label" for="declineReason3">
    Порнография
  </label>
</div>
<div class="form-check">
  <input name="decline'.$p['id'].'" value="4" class="form-check-input" type="radio" name="flexRadioDefault" id="declineReason4">
  <label class="form-check-label" for="declineReason4">
    Травля/издевательство над человеком
  </label>
</div>
<div class="form-check">
  <input name="decline'.$p['id'].'" value="5" class="form-check-input" type="radio" name="flexRadioDefault" id="declineReason5">
  <label class="form-check-label" for="declineReason5">
    Расчленёнка
  </label>
</div>
<div class="form-check">
  <input name="decline'.$p['id'].'" value="6" class="form-check-input" type="radio" name="flexRadioDefault" id="declineReason6">
  <label class="form-check-label" for="declineReason6">
    Файл сломан
  </label>
</div>

<div class="mb-3">
  <label for="exampleFormControlTextarea1" class="form-label">Дополнительный комментарий</label>
  <textarea class="form-control" id="exampleFormControlTextarea1" name="comment" rows="3"></textarea>
</div>
      </div>
      <div class="modal-footer">
        <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</a>'; ?>
        <a href="#" onclick="photoAction(<?=$p['id']?>, document.querySelector(`input[name='decline<?=$p['id']?>']:checked`).value, 2); return false;" data-bs-dismiss="modal" class="btn btn-primary">Сохранить</a>
        <?php echo '
      </div>
    </div>
  </div>
</div>
                                
                                ';
                               }
                               ?>
                             

                            </tbody>
                        </table>
                    </div><br>

                </td>
            </tr>
            <script>
function photoAction(photo_id, decline_reason, mod) {
   $.ajax({
                type: "GET",
                url: '/api/admin/images/setvisibility?id='+photo_id+'&mod='+mod+'&reason='+decline_reason,
                data: $(this).serialize(),
                success: function(response) {
                $('#pht'+photo_id).remove();
                        Notify.noty('success', 'OK!');
                        //$("#result").html("<div class='alert alert-successnew container mt-5' role='alert'>Успешный вход!</div>");
                      
                        
                    }
                
            });
}
</script>
           