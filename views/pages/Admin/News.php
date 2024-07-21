<?php

use \App\Services\{Auth, DB, Date};
use \App\Models\User;

//$userprofile = new User(explode('/', $_SERVER['REQUEST_URI'])[2]);
?>


<h1><b>Новости сайта</b></h1>
<a data-bs-toggle="modal" data-bs-target="#createNewsModal" href="#" class="btn btn-primary">Создать</a>

<div class="modal fade" id="createNewsModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel"><b>Создать новость</b></h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
     
<div class="mb-3">
  <label for="body" class="form-label">Содержание</label>
  <textarea class="form-control" id="body" name="body" rows="3"></textarea>
</div>
      </div>
      <div class="modal-footer">
        <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</a>
        <a href="#" onclick="createNews(); return false;" data-bs-dismiss="modal" class="btn btn-primary">Создать</a>
       
      </div>
    </div>
  </div>
</div>
<?php
$news = DB::query('SELECT * FROM news ORDER BY id');
foreach ($news as $n) {
    echo '<div class="card"><div class="card-body">'.Date::zmdate($n['time']).'<br>'.$n['body'].'</div></div>';
}
?>

<script>
function photoAction(photo_id, decline_reason, mod) {
   $.ajax({
                type: "GET",
                url: '/api/admin/createnews',
                data: {
                    body: $('#body').val()
                },
                success: function(response) {
                $('#pht'+photo_id).remove();
                        Notify.noty('success', 'OK!');
                        //$("#result").html("<div class='alert alert-successnew container mt-5' role='alert'>Успешный вход!</div>");
                      
                        
                    }
                
            });
}
</script>
                  