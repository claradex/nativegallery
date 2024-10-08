function createModal(id, type, value) {
  if (type === 'EDIT_COMMENT') {
      var modal = `
      <div id="modal`+id+`" class="modal" style="display: block;">
          <div class="modal-content">
              <span data-close-modal-id="`+id+`" class="close">&times;</span>
              <h3><b>Отредактировать комментарий</b></h3>
              <div style="padding:0 11px 11px">
                  <textarea style="    width: 100%;
    height: 200px;" name="wtext" id="bodypost__commedit`+id+`">`+value+`</textarea><br>
                  <div class="cmt-submit">
                      <button type="submit" onclick="editComment('` + id + `', document.getElementById('bodypost__commedit` + id + `').value)" id="sbmt">Отредактировать</button>&ensp;&emsp;Ctrl + Enter
                  </div>
              </div>
          </div>
      </div>`;
  }
  if (type === 'DELETE_COMMENT') {
    var modal = `
    <div id="modal`+id+`" class="modal" style="display: block;">
        <div class="modal-content">
            <span data-close-modal-id="`+id+`" class="close">&times;</span>
            <h3><b>Удалить комментарий</b></h3>
            Вы действительно хотите удалить комментарий? Действие необратимо.
            <div style="margin-top: 35px;">
                
                <div class="cmt-submit">
                    <button type="submit" onclick="deleteComment('` + id + `')" id="sbmt">Удалить</button>
                    <button data-close-modal-id="`+id+`"  type="submit" id="sbmt">Отмена</button>
                </div>
            </div>
        </div>
    </div>`;
}
  document.body.innerHTML += modal;
}


document.addEventListener("click", function(event) {
    var modalId = event.target.getAttribute("data-close-modal-id");
    document.getElementById("modal" + modalId).style.display = "none";

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



const deleteComment = (postId) => {
    $(document).ready(function() {
            $.ajax({
                type: "POST",
                url: '/api/photo/comment/'+postId+'/delete',
                success: function(response) {
                    var jsonData = JSON.parse(response);
  
                    console.log(response);
                    if (jsonData.errorcode == "1") {
                        Notify.noty('danger', JSON.stringify(response));
                    } else {
                        document.getElementById("modal" + postId).style.display = "none";
                        
                        Notify.noty('success', 'Успешно удалено!');
                        const url = window.location.pathname;
                        const segments = url.split('/'); 
                        const id = segments[segments.length - 1];
                        const commcountElem = document.getElementById('commcount');
                        let innerHTML = commcountElem.innerHTML;
                        let match = innerHTML.match(/>(\d+)</);
                        console.log(match);
                        if (match) {
                            let count = parseInt(match[1], 10) - 1;
                            console.log(count);
                            let newHTML = innerHTML.replace(match[1], count);
                            commcountElem.innerHTML = newHTML;
                        }
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
  
