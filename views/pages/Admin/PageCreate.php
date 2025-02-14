
<script>
    function submitUpload() {
        $('#buttonUpload').html('<button style="border-radius: 10px 0px 0px 10px !important;" type="submit" id="createpost" class="btn btn-primary mb-3 mt-3" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загружаем...</button>');
        $('#buttonUploadModal').html('<button type="submit" id="createpost" class="btn btn-primary" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загружаем...</button>');
        $('#buttonPreView').html('<button style="border-radius: 0px 10px 10px 0px !important;" type="submit" id="createpost" class="btn btn-primarynew mb-3 mt-3" disabled>Предпросмотр</button>');
        $.ajax({
            
                type: "POST",
                url: '/exapi/dialogs/create',
                data: JSON.stringify( { "bodypost":$("#bodypost").val(), "title": $("#title").val(),  "did": '00000' } ),
                dataType: "json",
                success: function(response) {
                    var jsonData = JSON.parse(JSON.stringify(response));

                    console.log(jsonData);
                    if (jsonData.errorcode == "1") {
                        $('#buttonUpload').html('<button href="#" data-bs-toggle="modal" data-bs-target="#createDialogModal" style="border-radius: 10px 0px 0px 10px !important;" type="submit" id="createpost" class="btn btn-primary mb-3 mt-3">Опубликовать</button>');
                        $('#buttonPreView').html('<button onclick="submitPreview()" style="border-radius: 0px 10px 10px 0px !important;" type="submit" id="createpost" class="btn btn-primarynew mb-3 mt-3">Предпросмотр</button>');
                        $('#buttonUploadModal').html('<button onclick="submitUpload()"type="submit" class="btn btn-primary">Да, я уверен</button>');
                        Notify.noty('danger', 'Мало контента!');
                    } else {
                        $('#buttonUpload').html('<button href="#" data-bs-toggle="modal" data-bs-target="#createDialogModal" style="border-radius: 10px 0px 0px 10px !important;" type="submit" id="createpost" class="btn btn-primary mb-3 mt-3">Опубликовать</button>');
                        $('#buttonPreView').html('<button onclick="submitPreview()" style="border-radius: 0px 10px 10px 0px !important;" type="submit" id="createpost" class="btn btn-primarynew mb-3 mt-3">Предпросмотр</button>');
                        $('#buttonUploadModal').html('<button onclick="submitUpload()"type="submit" class="btn btn-primary">Да, я уверен</button>');
                        window.location.replace("/dialogs/<?=$id_dialog?>/topic/<?=$id_topic?>/post/"+jsonData.id);
                    }
                }
            });
    }
    function submitPreview() {
        $('#buttonUpload').html('<button style="border-radius: 10px 0px 0px 10px !important;" type="submit" id="createpost" class="btn btn-primary mb-3 mt-3" disabled>Опубликовать</button>');
        $('#buttonPreView').html('<button style="border-radius: 0px 10px 10px 0px !important;" type="submit" id="createpost" class="btn btn-primarynew mb-3 mt-3" disabled><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Загружаем...</button>');
        $.ajax({
            
                type: "POST",
                url: '/exapi/dialogs/createPreview',
                data: JSON.stringify( { "bodypost":$("#bodypost").val(), "title": $("#title").val() } ),
                dataType: "json",
                success: function(response) {
                    var jsonData = JSON.parse(JSON.stringify(response));

                    console.log(response);
                    console.log(jsonData);
                    if (jsonData.errorcode == "1") {
                        $('#buttonUpload').html('<button href="#" data-bs-toggle="modal" data-bs-target="#createDialogModal" style="border-radius: 10px 0px 0px 10px !important;" type="submit" id="createpost" class="btn btn-primary mb-3 mt-3">Опубликовать</button>');
                        $('#buttonPreView').html('<button onclick="submitPreview()" style="border-radius: 0px 10px 10px 0px !important;" type="submit" id="createpost" class="btn btn-primarynew mb-3 mt-3">Предпросмотр</button>');
                        $("#result").html("<div class='alert alert-dangernew container' role='alert'>Может, что-нибудь напишите в свой пост?</div>");
                    } else {
                        $('#buttonUpload').html('<button href="#" data-bs-toggle="modal" data-bs-target="#createDialogModal" style="border-radius: 10px 0px 0px 10px !important;" type="submit" id="createpost" class="btn btn-primary mb-3 mt-3">Опубликовать</button>');
                        $('#buttonPreView').html('<button onclick="submitPreview()" style="border-radius: 0px 10px 10px 0px !important;" type="submit" id="createpost" class="btn btn-primarynew mb-3 mt-3">Предпросмотр</button>');
                        window.open('/dialogs/preview?id='+jsonData.preid, '_blank');
                    }
                }
            });
    }

</script>

<div class="mb-3">
  <label for="exampleFormControlInput1" class="form-label">Заголовок</label>
  <input name="title" id="title" type="text" class="form-control" id="exampleFormControlInput1">
</div>
        <div class="col-md-auto d-flex align-items-center">
        <button onclick="document.getElementById('bodypost').value += '[b] [/b]';" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 6px;"><i class="bx bx-bold"></i></button>
        <button onclick="document.getElementById('bodypost').value += '[i] [/i]';" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 6px;"><i class="bx bx-italic"></i></button>
        <button onclick="document.getElementById('bodypost').value += '[u] [/u]';" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 6px;"><i class="bx bx-underline"></i></button>
        <button onclick="document.getElementById('bodypost').value += '[s] [/s]';" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 6px;"><i class="bx bx-strikethrough"></i></button>
        <button onclick="document.getElementById('bodypost').value += '[link=] [/link]';" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 36px;"><i class="bx bx-link"></i></button>
        <button href="#" data-bs-toggle="modal" data-bs-target="#pickImageModal" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 6px;"><i class="bx bx-image-alt"></i></button>
        <button href="#" data-bs-toggle="modal" data-bs-target="#pickVideoModal" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 6px;"><i class="bx bx-video"></i></button>
        <button href="#" data-bs-toggle="modal" data-bs-target="#pickMusicModal" type="button" class="btn btn-primary btn-sm mb-2" style="margin-right: 6px;"><i class="bx bx-music"></i></button>
        </div>
        <textarea id="bodypost" class="form-control" name="bodypost" placeholder="Вы можете написать свою историю" cols="30" rows="10"></textarea>
        <div class="btn-group" role="group" aria-label="Basic example">
        <div id="buttonUpload">
        <button href="#" data-bs-toggle="modal" data-bs-target="#createDialogModal" style="border-radius: 10px 0px 0px 10px !important;" type="submit" id="createpost" class="btn btn-primary mb-3 mt-3">Опубликовать</button>
        </div>
        <div id="buttonPreView">
        <button onclick="submitPreview()" style="border-radius: 0px 10px 10px 0px !important;" type="submit" id="createpost" class="btn btn-outline-primary mb-3 mt-3">Предпросмотр</button>
        </div>
</div>
        
        </form>



        <div class="modal fade" id="pickImageModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Прикрепление фотографии</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form enctype="multipart/form-data" id="pickImageForm">
      <div class="modal-body">
      <div class="mb-3">
                <input id="filebody" type="file" name="filebodyImage" class="form-control" type="file">
            </div>
      </div>
      <div class="modal-footer">
        <div><button type="button" class="btn-r btn-secondary" data-bs-dismiss="modal">Отмена</button></div>
        <div id="r"><button id="t" type="submit" class="btn btn-primary" data-bs-dismiss="modal">Прикрепить</button></div>
            
      </div>
      </form>
    </div>
  </div>
</div>
<div class="modal fade" id="pickMusicModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Прикрепление музыки</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
      <div class="mb-3">
                <input id="filebody" type="file" name="filebody" class="form-control" type="file">
            </div>
      </div>
      <div class="modal-footer">
        <div><button type="button" class="btn-r btn-secondary" data-bs-dismiss="modal">Отмена</button></div>
        <div id="r"><button id="t" type="submit" class="btn btn-primary">Прикрепить</button></div>
            
      </div>
    </div>
  </div>
</div>
<div class="modal fade" id="pickVideoModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Прикрепление видео</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <form enctype="multipart/form-data" id="pickVideoForm">
      <div class="modal-body">
      <div class="mb-3">
                <input id="filebody" type="file" name="filebodyVideo" class="form-control" type="file">
            </div>
      </div>
      <div class="modal-footer">
        <div><button type="button" class="btn-r btn-secondary" data-bs-dismiss="modal">Отмена</button></div>
        <div id="r"><button id="t" type="submit" class="btn btn-primary" data-bs-dismiss="modal">Прикрепить</button></div>
            
      </div>
</form>
    </div>
  </div>
</div>