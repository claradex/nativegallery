function createModal(id, type, value) {
  if (type === 'EDIT_COMMENT') {
      var modal = `
      <div id="modal`+id+`" class="modal" style="display: block;">
          <div class="modal-content">
              <span data-modal-id="`+id+`" class="close">&times;</span>
              <h3><b>Отредактировать комментарий</b></h3>
              <div style="padding:0 11px 11px">
                  <textarea name="wtext" id="bodypost__commedit`+id+`">`+value+`</textarea><br>
                  <p id="statusSend" style="display: none;">Ошибка</p>
                  <div class="cmt-submit">
                      <button type="submit" onclick="editComment('` + id + `', document.getElementById('bodypost__commedit` + id + `').value)" id="sbmt">Отредактировать</button>&ensp;&emsp;Ctrl + Enter
                  </div>
              </div>
          </div>
      </div>`;
  }
  document.body.innerHTML += modal;
}


document.addEventListener("click", function(event) {
  if (event.target.classList.contains("close")) {
      var modalId = event.target.getAttribute("data-modal-id");
      document.getElementById("modal" + modalId).style.display = "none";
  }

  var modals = document.querySelectorAll(".modal");
  modals.forEach(function(modal) {
      if (event.target == modal) {
          modal.style.display = "none";
      }
  });
});




const editComment = (postId, body) => {
  $(document).ready(function() {
          $.ajax({
              type: "POST",
              url: '/api/photo/comment/'+postId+'/edit',
              data: JSON.stringify({ "value": body }),
              success: function(response) {
                  var jsonData = JSON.parse(response);

                  console.log(response);
                  if (jsonData.errorcode == "1") {
                      Notify.noty('danger', JSON.stringify(response));
                  } else {
                      document.getElementById("modal" + postId).style.display = "none";
                      
                      Notify.noty('success', 'Успешно отредактировано!');
                      const url = window.location.pathname;
                      const segments = url.split('/'); 
                      const id = segments[segments.length - 1];
                      $.ajax({


                        type: "POST",
                        url: "/api/photo/getcomments/"+id,
                        processData: false,
                        async: true,
                        success: function(r) {
                            $('#posts').html(r)


                        },
                        error: function(r) {
                            console.log(r)
                        }

                    });
                  }
              }
          });
      });
}
