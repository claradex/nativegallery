<?php

use \App\Services\{Auth, DB};
use \App\Models\User;
?>
<h1><b>GeoDB</b></h1>
<a data-bs-toggle="modal" data-bs-target="#createGeoDB" href="#" class="btn btn-primary">Создать</a>
<table class="table" style="margin-top: 15px;">
    <thead>
        <tr>
            <th scope="col">ID</th>
            <th scope="col">Название</th>
            <th scope="col"></th>
        </tr>
    </thead>
    <tbody>
        <?php
        $geodb = DB::query('SELECT * FROM geodb');
        foreach ($geodb as $u) {
            echo '<tr id="geodb'.$u['id'].'">
      <th>' . $u['id'] . '</th>
      <td>' . $u['title'] . '</td>
      <td><div class="cmt-submit"><a style="margin-left: 15px;" class="btn btn-sm btn-danger" onclick="deleteGeoDB(`'.$u['id'].'`); return false;">Удалить</a></div></td>
    </tr>';
        }
        ?>
    </tbody>
</table>




<div class="modal fade" id="createGeoDB" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="exampleModalLabel"><b>Добавление элемента GeoDB</b></h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label for="exampleFormControlTextarea1" class="form-label">Содержание</label>
                    <textarea class="form-control" id="exampleFormControlTextarea1" name="body" rows="3"></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <a type="button" class="btn btn-secondary" data-bs-dismiss="modal">Отмена</a>
                <a href="#" onclick="createGeoDB(document.querySelector(`textarea[name='body']`).value); return false;" data-bs-dismiss="modal" class="btn btn-primary">Добавить</a>
            </div>
        </div>
    </div>
</div>


<script>
    function createGeoDB(body) {
        $.ajax({
            type: "POST",
            url: '/api/admin/geodb/create',
            data: {
                body: body
            },
            success: function(response) {
                Notify.noty('success', 'OK!');


            }

        });
    }

function deleteGeoDB(id) {
   $.ajax({
                type: "POST",
                url: '/api/admin/geodb/delete?id='+id,
                data: $(this).serialize(),
                success: function(response) {
                $('#geodb'+id).remove();
                        Notify.noty('success', 'OK!');
                        //$("#result").html("<div class='alert alert-successnew container mt-5' role='alert'>Успешный вход!</div>");
                      
                        
                    }
                
            });
}
</script>