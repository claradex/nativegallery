(function () {
  var navLock = false;
  var lastQuoteLinkBlock = true;

  $(document).ready(function () {
    // Изменение рейтинга комментария (с учётом форматирования)
    function setComVote(cell, rating) {
      if (rating > 0)
        cell
          .removeClass("con")
          .addClass("pro")
          .html("+" + rating);
      else if (rating < 0)
        cell
          .removeClass("pro")
          .addClass("con")
          .html("&ndash;" + parseInt(-rating));
      else cell.removeClass("pro con").html(0);
    }

    // Голосование за комментарии
    $(document)
      .on("click", ".w-btn", function () {
        var vote = $(this).attr("vote");
        if (vote != 0 && vote != 1) return false;

        var voted = $(this).is(".voted");
        $(this).toggleClass("voted");

        var diff = (vote == 1 && !voted) || (vote == 0 && voted) ? 1 : -1;

        var otherButton = $(this).siblings(".w-btn");
        var votedOther = otherButton.is(".voted");

        if (votedOther) {
          otherButton.removeClass("voted");
          diff *= 2;
        }

        var cell = $(this).siblings(".w-rating");
        var rating = parseInt(
          cell.is(".con") ? -cell.html().substring(1) : cell.html()
        );

        setComVote(cell, rating + diff);

        var cell_ext = $(this).siblings(".w-rating-ext");
        cell_ext.addClass("active-locked");

        var pro = $(".pro", cell_ext);
        var con = $(".con", cell_ext);

        if (vote == 1 || (vote == 0 && votedOther))
          pro.html(
            "+" +
              (parseInt(pro.text().substr(1)) + (vote == 1 && !voted ? 1 : -1))
          );
        if (vote == 0 || (vote == 1 && votedOther))
          con.html(
            "–" +
              (parseInt(con.text().substr(1)) + (vote == 0 && !voted ? 1 : -1))
          );

        var wvote = $(this).closest(".wvote");
        setTimeout(function () {
          $(".w-btn", wvote).removeClass("active");
        }, 200);
        setTimeout(function () {
          cell_ext.removeClass("active active-locked");
        }, 1000);

        $.getJSON(
          "/api/photo/comment/rate",
          { action: "vote-comment", wid: wvote.attr("wid"), vote: vote },
          function (data) {
            if (data && !data[3]) {
              $('.w-btn[vote="1"]', wvote)[
                data[0][1] ? "addClass" : "removeClass"
              ]("voted");
              $('.w-btn[vote="0"]', wvote)[
                data[0][0] ? "addClass" : "removeClass"
              ]("voted");

              pro.html("+" + data[1][1]);
              con.html("" + data[1][0]);

              setComVote(cell, data[2]);
            } else if (data[3]) alert(data[3]);
          }
        ).fail(function (jx) {
          if (jx.responseText != "") alert(jx.responseText);
        });

        return false;
      })
      // Отображение кнопок
      .on("mouseenter mouseleave", '.w-btn[vote="1"]', function () {
        $(this).toggleClass("s2 s12");
      })
      .on("mouseenter mouseleave", '.w-btn[vote="0"]', function () {
        $(this).toggleClass("s5 s15");
      })
      .on("mouseenter touchstart", ".wvote", function () {
        $(".w-btn, .w-rating-ext", this).addClass("active");
      })
      .on("mouseleave", ".wvote", function () {
        $(".w-btn, .w-rating-ext", this).removeClass("active");
      })
      .on("touchstart", function (e) {
        if (
          !$(e.target).is(".wvote") &&
          $(e.target).closest(".wvote").length == 0
        )
          $(".w-btn, .w-rating-ext").removeClass("active");
      });

    // Подсветка комментария, если дана ссылка на комментарий
    var anchorTestReg = /#(\d+)$/;
    var arr = anchorTestReg.exec(window.location.href);
    if (arr != null) $('.comment[wid="' + arr[1] + '"]').addClass("s2");

    // Ссылка на комментарий
    $(".cmLink").on("click", function () {
      var comment = $(this).closest(".comment");
      comment.siblings().removeClass("s2");
      comment.addClass("s2");
    });

    // Удаление комментария
    $(".delLink").on("click", function () {
      return confirm(_text["P_DEL_CONF"]);
    });

    // Цитирование
    $(".quoteLink").on("click", function () {
      var comment = $(this).closest(".comment"),
        mText,
        mTextArray;
      var selection = window.getSelection();

      var selectedText = selection.toString();
      var quotedText =
        selectedText == "" ? $(".message-text", comment).text() : selectedText;
      var msg = "";

      if (selectedText == "" && comment.next(".comment").length == 0)
        msg = _text["P_QUOTE_MSG"];
      else if (quotedText.length > 600) msg = _text["P_QUOTE_LEN"];

      if (msg != "") {
        if ($(".no-quote-last", comment).length == 0)
          comment.append('<div class="no-quote-last">' + msg + "</div>");

        if (lastQuoteLinkBlock) {
          lastQuoteLinkBlock = false;
          return false;
        }
      } else $(".no-quote-last").remove();

      if (selectedText == "") mText = $(".message-text", comment).html();
      else
        mText = $("<div>")
          .append(selection.getRangeAt(0).cloneContents())
          .html();

      mText = mText
        .replace(/<\/?i[^>]*>/gi, "")
        .replace(/<\/?u>/gi, "")
        .replace(/<\/?span[^>]*>/gi, "")
        .replace(/<\/?div[^>]*>/gi, "");
      mText = mText
        .replace(new RegExp('<a href="', "ig"), "")
        .replace(new RegExp('" target="_blank">[^>]*</a>', "ig"), "");
      mText = mText
        .replace(/<br/gi, "[br]")
        .replace(/(<([^>]+)>)/gi, "")
        .replace(/\[br\]/gi, "<br");
      mText = mText
        .replace(/&gt;/gi, ">")
        .replace(/&lt;/gi, "<")
        .replace(/&quote;/gi, '"')
        .replace(/&amp;/gi, "&");
      mTextArray = mText.split(/<br\s*\/?>\s*/i);

      var mText2 = "";
      for (var i = 0; i < mTextArray.length; ++i)
        mText2 += "> " + mTextArray[i] + "\n";

      var txtField = $("#wtext");
      if (txtField.length) {
        var messageText = txtField.val();
        var insertText =
          (messageText == "" ? "" : "\n") +
          _text["P_QUOTE_TXT"] +
          " (" +
          $(".message_author", comment).text() +
          ", " +
          $(".message_date", comment).text() +
          "):\n" +
          mText2 +
          "\n";

        txtField.val(messageText + insertText);
        txtField[0].focus();
      }

      return false;
    });

    // Отправка комментария

    // Окно ввода комментария
    $("#wtext")
      .on("keypress", function (e) {
        if ((e.which == 10 || e.which == 13) && e.ctrlKey) $("#f1").submit();
      })
      .on("focus", function () {
      navLock = true;
      saveSelection();
    })
    .on("blur", function () {
      navLock = false;
    })
      .on("blur", function () {
        navLock = false;
      });
  });

  let lastSelection = null;
  let autocompleteType = null; // 'emoji' или 'mention'
  let currentMentions = [];

  // Сохраняем позицию курсора
  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      lastSelection = sel.getRangeAt(0);
    }
  }

  // Восстанавливаем позицию курсора
  function restoreSelection() {
    if (lastSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(lastSelection);
    }
  }

  // Вставка смайла
  function insertEmoji(emojiElement) {
    const editor = document.getElementById("wtext");
    if (!editor) return;

    // Принудительно фокусируем редактор
    editor.focus();

    // Создаем новый диапазон, если выделение потеряно
    let sel = window.getSelection();
    if (!sel.rangeCount || !editor.contains(sel.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false); // Курсор в конец
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Сохраняем текущее выделение
    saveSelection();

    // Создаем элемент эмодзи
    const img = document.createElement("img");
    img.className = "editor-emoji";
    img.src = emojiElement.src;
    img.dataset.code = `[${emojiElement.dataset.code}]`;
    img.contentEditable = "false";

    // Вставляем в сохраненную позицию
    if (lastSelection) {
      lastSelection.insertNode(img);
      
      // Обновляем позицию курсора
      const newRange = document.createRange();
      newRange.setStartAfter(img);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);
    } else {
      editor.appendChild(img);
    }

    // Форсируем обновление состояния
    editor.dispatchEvent(new Event('input', { bubbles: true }));
  }


  // Обработчики событий
   const showPickerElement = document.getElementById("showPicker");

   if (showPickerElement) {
    showPickerElement.addEventListener("click", function (e) {
      e.stopPropagation();
      const picker = document.getElementById("picker");
      const rect = this.getBoundingClientRect();

      picker.style.top = `${rect.bottom + window.scrollY - 450}px`;
      picker.style.left = `${rect.left + window.scrollX}px`;
      picker.classList.toggle("active");
    });
  }

   document.querySelectorAll(".emoji-option").forEach((emoji) => {
    emoji.addEventListener("mousedown", function(e) { // Используем mousedown вместо click
      e.preventDefault();
      e.stopPropagation();
      
      // Фокусируем редактор перед вставкой
      const editor = document.getElementById("wtext");
      if (editor) editor.focus();
      
      insertEmoji(emoji);
      document.getElementById("picker").classList.remove("active");
    });
  });

  document.addEventListener('selectionchange', () => {
    const editor = document.getElementById("wtext");
    const sel = window.getSelection();
    
    if (editor && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer)) {
        saveSelection();
      }
    }
  });

const picker = document.getElementById("picker");
const showPicker = document.getElementById("showPicker");

if (picker) {
  document.addEventListener("click", function(e) {
    const isClickInsidePicker = picker.contains(e.target);
    const isClickOnShowButton = showPicker?.contains(e.target);
    
    if (!isClickInsidePicker && !isClickOnShowButton) {
      picker.classList.remove("active");
    }
  });
}

  // Обновленный JavaScript для работы с новым форматом
  document.addEventListener("click", function (e) {
    if (e.target.classList.contains("toggle-message")) {
      e.preventDefault();
      const container = e.target.closest(".message-text");
      const isExpanded = container.classList.contains("show-all");

      container.classList.toggle("show-all", !isExpanded);
      e.target.textContent = isExpanded ? "показать больше" : "скрыть";
    }
  });

  // Обработка отправки формы
  const formElement = document.querySelector("form");
  const editorElement = document.getElementById("wtext");
  const hiddenContentElement = document.getElementById("hiddenContent");

  if (formElement && editorElement && hiddenContentElement) {
    formElement.addEventListener("submit", function (e) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = editorElement.innerHTML;

      // Обработка смайлов
      tempDiv.querySelectorAll("img.editor-emoji").forEach((img) => {
        const textNode = document.createTextNode(img.dataset.code);
        img.replaceWith(textNode);
      });

      // Обработка упоминаний
      tempDiv.querySelectorAll(".user-mention").forEach((mention) => {
        const textNode = document.createTextNode(
          `@[${mention.dataset.userId}:${mention.innerText.replace("@", "")}]`
        );
        mention.replaceWith(textNode);
      });

      hiddenContentElement.value = tempDiv.innerHTML;
    });
  }
  let allSmileys = [];
  function removeFirstLast(str) {
    return str.slice(1, -1);
  }

  async function loadSmileys() {
    try {
      const response = await fetch("/api/emoji/load");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      allSmileys = (data.data || []).map((smiley) => {
        let code = smiley.code
          .replace(/\\(.)/g, "$1")
          .replace(/^\[/, "") // Удалить первую [ если есть
          .replace(/\]$/, ""); // Удалить последнюю ] если есть

        code = `${code}`; // Обернуть снова в одну пару []

        return {
          ...smiley,
          code: code,
        };
      });

      console.log(
        "Processed codes:",
        allSmileys.map((s) => s.code)
      );
      return allSmileys;
    } catch (error) {
      console.error("Error loading smileys:", error);
      return [];
    }
  }

  async function initEditor() {
    const editor = document.getElementById("wtext");
    if (!editor) return;

    await loadSmileys();

    let html = editor.innerHTML;

    // Заменяем шорткоды с точным совпадением
    allSmileys.forEach(({ code, url }) => {
      // Удаляем одну [ слева и одну ] справа, если они есть
      const trimmed = code
        .replace(/^\[/, "") // удаляет ПЕРВУЮ [
        .replace(/\]$/, ""); // удаляет ПОСЛЕДНЮЮ ]

      const cleanedCode = `${trimmed}`; // Добавляем одну пару скобок

      const escapedCode = cleanedCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escapedCode, "g");
      console.log(cleanedCode);

      html = html.replace(
        regex,
        `<img src="${url}" 
             class="editor-emoji" 
             data-code="${cleanedCode}">`
      );
    });

    editor.innerHTML = html;
  }

  // Обработчик клавиш
  const wtextElement = document.getElementById("wtext");

  if (wtextElement) {
    // Обработчик Backspace для удаления смайлов
    wtextElement.addEventListener("keydown", function (e) {
      if (e.key === "Backspace") {
        const selection = window.getSelection();
        if (selection && selection.isCollapsed) {
          const range = selection.getRangeAt(0);
          const node = range.startContainer;

          if (node.previousSibling?.classList?.contains("editor-emoji")) {
            node.previousSibling.remove();
            e.preventDefault();
          }
        }
      }
    });

    // Обработчик вставки текста
    wtextElement.addEventListener("paste", function (e) {
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData(
        "text/plain"
      );
      document.execCommand("insertText", false, text);
    });
  }

  // Автодополнение
  // Автодополнение
  function setupAutocomplete() {
    const editor = document.getElementById("wtext");
    let currentWord = "";
    let startPos = 0;
    let selectedIndex = -1;
    let isAutocompleteOpen = false;

    const acContainer = document.createElement("div");
    acContainer.className = "autocomplete";
    document.body.appendChild(acContainer);

    // Обработчик клавиш
    function handleKeyDown(e) {
      if (!isAutocompleteOpen) return;

      const items = acContainer.querySelectorAll(".autocomplete-item");
      if (items.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
          updateSelection();
          break;
        case "ArrowUp":
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, -1);
          updateSelection();
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            insertSuggestion(items[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          closeAutocomplete();
          break;
      }
    }

    function updateSelection() {
      const items = acContainer.querySelectorAll(".autocomplete-item");
      items.forEach((item, index) => {
        item.classList.toggle("selected", index === selectedIndex);
      });
    }

    function insertSuggestion(item) {
      const code = item.dataset.code;
      const sel = window.getSelection();
      const range = sel.getRangeAt(0);

      range.setStart(range.startContainer, startPos);
      range.deleteContents();

      const textNode = document.createTextNode(`[${code}]`);
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.collapse(true);

      closeAutocomplete();
      editor.focus();
    }

    function closeAutocomplete() {
      acContainer.style.display = "none";
      acContainer.style.top = "-9999px";
      acContainer.style.left = "-9999px";
      acContainer.innerHTML = "";

      // Сброс состояний
      selectedIndex = -1;
      isAutocompleteOpen = false;
      autocompleteType = null;
    }

    // Предполагаем, что editor получен через getElementById

    if (editor) {
      let isAutocompleteOpen = false; // Добавляем инициализацию переменных
      let autocompleteType = "";
      let startPos = 0;
      let currentWord = "";

      // Объявляем функции для безопасного использования
      const handleKeyDown = (e) => {
        /* ... */
      };
      const showAutocomplete = (word, range) => {
        /* ... */
      };
      const closeAutocomplete = () => {
        /* ... */
      };

      // Обработчик нажатия клавиш
      editor.addEventListener("keydown", function (e) {
        const isAtSymbol =
          e.key === "@" ||
          (e.key === "2" && e.shiftKey) ||
          (e.key === "Quote" && e.shiftKey);

        if (e.key === ":" && !isAutocompleteOpen) {
          autocompleteType = "emoji";
          isAutocompleteOpen = true;
          editor.addEventListener("keydown", handleKeyDown);
        } else if (isAtSymbol && !isAutocompleteOpen) {
          autocompleteType = "mention";
          isAutocompleteOpen = true;
          editor.addEventListener("keydown", handleKeyDown);
        }
      });

      // Обработчик ввода
      editor.addEventListener("input", function (e) {
        if (!isAutocompleteOpen) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        const text = range.startContainer?.textContent || "";
        const pos = range.startOffset;

        let i = pos - 1;
        const stopChar = autocompleteType === "emoji" ? ":" : "@";

        while (i >= 0 && text[i] !== stopChar && text[i] !== " ") i--;

        if (text[i] === stopChar) {
          startPos = i;
          currentWord = text.slice(i + 1, pos).toLowerCase();
          showAutocomplete(currentWord, range);
        } else {
          closeAutocomplete();
        }
      });
    }

    // Показать подсказки
    function showAutocomplete(query, range) {
      if (autocompleteType === "emoji") {
        const suggestions = allSmileys
          .filter((smiley) =>
            smiley.code.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10);

        if (suggestions.length === 0) {
          closeAutocomplete();
          return;
        }

        const rect = range.getBoundingClientRect();
        acContainer.style.top = `${rect.bottom + window.scrollY}px`;
        acContainer.style.left = `${rect.left + window.scrollX}px`;

        acContainer.innerHTML = suggestions
          .map(
            (smiley, index) => `
                                <div class="autocomplete-item" 
                                    data-code="${smiley.code}">
                                    <img src="${smiley.url}" 
                                        style="width:24px;height:24px">
                                    <span>${smiley.code}</span>
                                </div>
                            `
          )
          .join("");

        acContainer.style.display = "block";
        selectedIndex = 0;
        updateSelection();
      } else if (autocompleteType === "mention") {
        fetch(`/api/users/search?q=${encodeURIComponent(query)}`)
          .then((response) => response.json())
          .then((users) => {
            currentMentions = users;
            const rect = range.getBoundingClientRect();
            acContainer.style.top = `${rect.bottom + window.scrollY}px`;
            acContainer.style.left = `${rect.left + window.scrollX}px`;

            acContainer.innerHTML = users
              .map(
                (user, index) => `
                    <div class="autocomplete-item" 
                        data-user-id="${user.id}"
                        data-username="${user.username}">
                        <img src="${user.photourl}" 
                            style="width:24px;height:24px;border-radius:50%">
                        <span>${user.username}</span>
                    </div>
                `
              )
              .join("");

            acContainer.style.display = "block";
            selectedIndex = 0;
            updateSelection();
          });
      }
    }

    // Обновленный обработчик клика
    acContainer.addEventListener("mousedown", function (e) {
      // Используем mousedown вместо click
      const item = e.target.closest(".autocomplete-item");
      if (item) {
        insertSuggestion(item);
        e.preventDefault();
      }
    });

    // Скрыть при клике вне
    document.addEventListener("click", function (e) {
      if (!e.target.closest(".autocomplete")) {
        acContainer.style.display = "none";
      }
    });

    function insertSuggestion(item) {
      if (autocompleteType === "emoji") {
        const code = item.dataset.code;
        const sel = window.getSelection();
        const range = sel.getRangeAt(0);

        range.setStart(range.startContainer, startPos);
        range.deleteContents();

        // Создаем элемент изображения вместо текстового узла
        const img = document.createElement("img");
        img.className = "editor-emoji";
        img.src = item.querySelector("img").src;
        img.dataset.code = `[${code}]`;
        img.contentEditable = "false";

        range.insertNode(img);

        // Сдвигаем курсор после изображения
        const newRange = document.createRange();
        newRange.setStartAfter(img);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        closeAutocomplete();
        editor.focus();
      } else if (autocompleteType === "mention") {
        const userId = item.dataset.userId;
        const username = item.dataset.username;
        const sel = window.getSelection();

        if (sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0).cloneRange();
        range.setStart(range.startContainer, startPos);
        range.deleteContents();

        // Создаем основной элемент упоминания
        const mentionSpan = document.createElement("span");
        mentionSpan.className = "user-mention";
        mentionSpan.dataset.userId = userId;
        mentionSpan.textContent = `@${username}`;
        mentionSpan.contentEditable = "false";

        // Создаем пробел после упоминания
        const spaceSpan = document.createTextNode("\u00A0");

        // Вставляем элементы
        const fragment = document.createDocumentFragment();
        fragment.appendChild(mentionSpan);
        fragment.appendChild(spaceSpan);
        range.insertNode(fragment);

        // Обновляем позицию курсора
        const newRange = document.createRange();
        newRange.setStartAfter(spaceSpan);
        newRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(newRange);

        // Обновляем редактор
        closeAutocomplete();
        editor.focus();
      }
      closeAutocomplete();
      editor.focus();
      window.addEventListener("scroll", () => closeAutocomplete(), true);
    }

    function closeAutocomplete(immediate = false) {
      if (immediate) {
        // Немедленное удаление из DOM
        acContainer.style.display = "none";
        acContainer.innerHTML = "";
        acContainer.style.top = "-9999px"; // Убираем за пределы видимости
        selectedIndex = -1;
        isAutocompleteOpen = false;
        autocompleteType = null;
        return;
      }

      // Анимация исчезновения (опционально)
      acContainer.classList.add("closing");
      setTimeout(() => {
        acContainer.style.display = "none";
        acContainer.innerHTML = "";
        acContainer.classList.remove("closing");
        selectedIndex = -1;
        isAutocompleteOpen = false;
        autocompleteType = null;
      }, 200);
    }

    document.addEventListener("mouseover", async function (e) {
      const mention = e.target.closest(".user-mention");
      if (mention && !mention.dataset.loaded) {
        const userId = mention.dataset.userId;

        const response = await fetch(`/api/users/load/${userId}`);
        const userInfo = await response.json();
      }
    });

    function updateSelection() {
      const items = acContainer.querySelectorAll(".autocomplete-item");
      items.forEach((item, index) => {
        item.classList.toggle("selected", index === selectedIndex);
      });

      // Прокрутка к выбранному элементу
      if (selectedIndex >= 0 && items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({
          behavior: "auto",
          block: "nearest",
        });
      }
    }
  }

  // Инициализация после загрузки
  window.addEventListener("DOMContentLoaded", setupAutocomplete);

  function setupImageValidation() {
    const editor = document.getElementById("wtext");
    if (!editor) return;

    // Блокировка вставки через CTRL+V
    editor.addEventListener("paste", function (e) {
      const clipboardData = e.clipboardData || window.clipboardData;
      if (!clipboardData?.items) return;

      for (let i = 0; i < clipboardData.items.length; i++) {
        if (clipboardData.items[i].type.indexOf("image") !== -1) {
          e.preventDefault();
          alert("Разрешена вставка только смайликов через пикер!");
          return;
        }
      }
    });

    // Блокировка drag-and-drop изображений
    editor.addEventListener("dragover", (e) => e.preventDefault());
    editor.addEventListener("drop", function (e) {
      e.preventDefault();
      if (e.dataTransfer?.files?.length > 0) {
        alert("Загрузка собственных изображений запрещена!");
      }
    });

    // Запрет ручного добавления изображений
    editor.addEventListener("DOMNodeInserted", function (e) {
      if (
        e.target?.tagName === "IMG" &&
        !e.target?.classList?.contains("editor-emoji")
      ) {
        e.target.remove();
        alert("Разрешены только смайлики из пикера!");
      }
    });
  }

  // Объединенный обработчик загрузки
  document.addEventListener("DOMContentLoaded", async () => {
    // Инициализация редактора
    const editor = document.getElementById("wtext");

    if (editor) {
      setupImageValidation();
      await loadSmileys().catch(console.error);
      initEditor();
      setupAutocomplete();
    } else {
      console.warn("Editor element (#wtext) not found");
    }
  });

  const form = document.getElementById("f1");
  if (!form) {
    console.error("Форма #f1 не найдена!");
    return;
  }

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.name = "filebody"; // Устанавливаем имя filebody
  fileInput.style.display = "none";

  form.appendChild(fileInput); // Добавляем input внутрь формы

  const button = document.getElementById("attachFile");
  const fileList = document.getElementById("fileList");

  button.addEventListener("click", function () {
    fileInput.click();
  });

  fileInput.addEventListener("change", function () {
    const file = fileInput.files[0];
    if (!file) return;

    const maxSize = 100 * 1024 * 1024; // 100 MB
    const forbiddenExtensions = [
      ".html",
      ".php",
      ".htm",
      ".exe",
      ".com",
      ".cmd",
      ".bash",
      ".sh",
    ];

    const fileName = file.name.toLowerCase();
    const fileSize = file.size;

    if (fileSize > maxSize) {
      alert("Файл превышает 100 МБ.");
      return;
    }

    if (forbiddenExtensions.some((ext) => fileName.endsWith(ext))) {
      alert("Расширение не поддерживается.");
      return;
    }

    const fileItem = document.createElement("div");
    fileItem.setAttribute(
      "style",
      "border:solid 1px #bbb; width:max-content; font-size: 12px; padding:3px 10px 3px; margin-bottom:13px; background-color:#e2e2e2"
    );
    fileItem.textContent = file.name;

    const removeBtn = document.createElement("a");
    removeBtn.classList.add("compl");
    removeBtn.setAttribute(
      "style",
      "display: inline-block; margin-left: 5px; color:#292929; cursor: pointer;"
    );
    removeBtn.textContent = "✖";
    removeBtn.addEventListener("click", function () {
      fileItem.remove();
      fileInput.value = "";
    });

    fileItem.appendChild(removeBtn);
    fileList.appendChild(fileItem);
  });
})();
