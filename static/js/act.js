function createModal(id, type, value, modalid) {
  if (type === "EDIT_COMMENT") {
    var modal =
      `
      <div id="` +
      modalid +
      `" class="modal" style="display: block;">
          <div class="modal-content">
              <span data-close-modal-id="` +
      modalid +
      `" class="close">&times;</span>
              <h3><b>Отредактировать комментарий</b></h3>
              <div style="padding:0 11px 11px">
                  <textarea style="    width: 100%;
    height: 200px;" name="wtext" id="bodypost__commedit` +
      id +
      `">` +
      value +
      `</textarea><br>
                  <div class="cmt-submit">
                      <button type="submit" onclick="editComment('` +
      id +
      `', document.getElementById('bodypost__commedit` +
      id +
      `').value, '` +
      modalid +
      `')" id="sbmt">Отредактировать</button>&ensp;&emsp;Ctrl + Enter
                  </div>
              </div>
          </div>
      </div>`;
  }
  if (type === "DELETE_COMMENT") {
    var modal =
      `
    <div id="` +
      modalid +
      `" class="modal" style="display: block;">
        <div class="modal-content">
            <span data-close-modal-id="` +
      modalid +
      `" class="close">&times;</span>
            <h3><b>Удалить комментарий</b></h3>
            Вы действительно хотите удалить комментарий? Действие необратимо.
            <div style="margin-top: 35px;">
                
                <div class="cmt-submit">
                    <button type="submit" onclick="deleteComment('` +
      id +
      `', '` +
      modalid +
      `')" id="sbmt">Удалить</button>
                    <button data-close-modal-id="` +
      modalid +
      `"  type="submit" id="sbmt">Отмена</button>
                </div>
            </div>
        </div>
    </div>`;
  }
  document.body.innerHTML += modal;
}

document.addEventListener("click", function (event) {
  // Получаем ID модального окна, которое нужно закрыть
  var modalId = event.target.getAttribute("data-close-modal-id");

  // Удаляем модальное окно по его ID
  if (modalId) {
    var modalToClose = document.getElementById(modalId);
    if (modalToClose) {
      modalToClose.remove(); // Удаляем модальное окно из DOM
    }
  }

  // Проверяем, кликнули ли мы на само модальное окно
  var modals = document.querySelectorAll(".modal");
  modals.forEach(function (modal) {
    if (event.target === modal) {
      modal.remove(); // Удаляем модальное окно из DOM
    }
  });
});

const pinComment = (postId) => {
  $(document).ready(function () {
    $.ajax({
      type: "POST",
      url: "/api/photo/comment/" + postId + "/pin",
      success: function (response) {
        var jsonData = JSON.parse(response);

        console.log(response);
        if (jsonData.errorcode == "1") {
          Notify.noty("danger", JSON.stringify(response));
        } else {
          if (jsonData.action == "pin") {
            Notify.noty("success", "Успешно закреплено!");
          } else {
            Notify.noty("success", "Успешно откреплено!");
          }

          const url = window.location.pathname;
          const segments = url.split("/");
          const id = segments[2];
          console.log(segments);
          $.ajax({
            type: "POST",
            url: "/api/photo/getcomments/" + id,
            processData: false,
            async: true,
            success: function (r) {
              $("#posts").html(r);
            },
            error: function (r) {
              console.log(r);
            },
          });
        }
      },
    });
  });
};

const editComment = (postId, body, modalid) => {
  $(document).ready(function () {
    $.ajax({
      type: "POST",
      url: "/api/photo/comment/" + postId + "/edit",
      data: JSON.stringify({ value: body }),
      success: function (response) {
        var jsonData = JSON.parse(response);

        console.log(response);
        if (jsonData.errorcode == "1") {
          Notify.noty("danger", JSON.stringify(response));
        } else {
          document.getElementById(modalid).style.display = "none";

          Notify.noty("success", "Успешно отредактировано!");
          const url = window.location.pathname;
          const segments = url.split("/");
          const id = segments[2];
          $.ajax({
            type: "POST",
            url: "/api/photo/getcomments/" + id,
            processData: false,
            async: true,
            success: function (r) {
              $("#posts").html(r);
            },
            error: function (r) {
              console.log(r);
            },
          });
        }
      },
    });
  });
};

const deleteComment = (postId, modalid) => {
  $(document).ready(function () {
    $.ajax({
      type: "POST",
      url: "/api/photo/comment/" + postId + "/delete",
      success: function (response) {
        var jsonData = JSON.parse(response);

        console.log(response);
        if (jsonData.errorcode == "1") {
          Notify.noty("danger", JSON.stringify(response));
        } else {
          document.getElementById(modalid).style.display = "none";

          Notify.noty("success", "Успешно удалено!");
          const url = window.location.pathname;
          const segments = url.split("/");
          const id = segments[segments.length - 1];
          const commcountElem = document.getElementById("commcount");
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
            url: "/api/photo/getcomments/" + id,
            processData: false,
            async: true,
            success: function (r) {
              $("#posts").html(r);
            },
            error: function (r) {
              console.log(r);
            },
          });
        }
      },
    });
  });
};
const loadNews = () => {
  $.ajax({
    type: "GET",
    url: "/api/admin/loadnews",

    success: function (response) {
      $("#news").html(response);
    },
  });
};
const deleteNews = (postId) => {
  $.ajax({
    type: "POST",
    url: "/api/admin/news/" + postId + "/delete",
    success: function (response) {
      var jsonData = JSON.parse(response);

      if (jsonData.errorcode == "1") {
        Notify.noty("danger", JSON.stringify(response));
      } else {
        Notify.noty("success", "Успешно удалено!");

        loadNews();
      }
    },
  });
};
const createNews = () => {
  $.ajax({
    type: "POST",
    url: "/api/admin/news/create",
    data: {
      body: $("#body").val(),
    },
    success: function (response) {
      Notify.noty("success", "OK!");
      loadNews();
    },
  });
};

const handleModelRequest = (modelId, type) => {
  $.ajax({
    type: "POST",
    url: "/api/admin/models/requests/" + modelId + "/" + type,
    data: {
      body: $("#body").val(),
    },
    success: function (response) {
      Notify.noty("success", "OK!");
      const mdlNumElement = document.getElementById("mdlnum");

      if (mdlNumElement) {
        let currentNumber = parseInt(mdlNumElement.textContent, 10);
        if (!isNaN(currentNumber)) {
          currentNumber--;
          mdlNumElement.textContent = currentNumber.toString();
          if (currentNumber === 0) {
            mdlNumElement.remove();
          }
        }
      }
      $("#mdl" + modelId).remove();
    },
  });
};
