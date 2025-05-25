document.addEventListener("DOMContentLoaded", () => {
  const DEBUG = true;
  const cache = new Map();
  const CACHE_TTL = 300000; // 5 минут
  let loadingTimeout;

  const loadedScriptSrcs = new Set();

  function reloadExternalScripts(doc) {
    const scripts = Array.from(doc.querySelectorAll("script[src]"));
    const loadedUrls = new Set(Array.from(document.scripts).map((s) => s.src));

    // Загрузка скриптов последовательно
    const loadScript = (index) => {
      if (index >= scripts.length) return;

      const script = scripts[index];
      const src = script.src;

      if (!loadedUrls.has(src)) {
        const newScript = document.createElement("script");
        newScript.src = src;
        newScript.async = false; // Важно для порядка

        // Копируем все атрибуты
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        newScript.onload = () => {
          loadedUrls.add(src);
          loadScript(index + 1); // Следующий скрипт
        };

        newScript.onerror = () => {
          console.error(`Failed to load: ${src}`);
          loadScript(index + 1); // Продолжаем цепочку
        };

        document.body.appendChild(newScript);
      } else {
        loadScript(index + 1); // Пропускаем уже загруженный
      }
    };

    loadScript(0);
  }

  document.querySelectorAll("script[src]").forEach((script) => {
    const src = script.getAttribute("src");
    if (src) loadedScriptSrcs.add(src);
  });

  // Текущий путь страницы
  let lastPath = location.pathname;

  // Элементы интерфейса
  const loader = createLoader();
  const contentContainers = ["td.main", "#pmain"];

  initNavigation();

  function initNavigation() {
    document.body.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);
  }

  function handleClick(e) {
    const link = e.target.closest("a");
    if (link && shouldIntercept(link)) {
      e.preventDefault();
      navigateTo(link.href);
    }
  }

  function handlePopState() {
    navigateTo(window.location.href, true);
  }

  function shouldIntercept(link) {
    try {
      const url = new URL(link.href);
      return (
        url.origin === location.origin && !link.dataset.noAjax && !link.hash
      );
    } catch {
      return false;
    }
  }

  async function navigateTo(url, isHistoryNavigation = false) {
    try {
      showLoader();

      window.commentsCleanup?.();
      delete window.commentsInitialized;
      const cached = cache.get(url);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        updatePage(cached.html, url, isHistoryNavigation);
        return;
      }

      const html = await fetchContent(url);
      cache.set(url, { html, timestamp: Date.now() });
      updatePage(html, url, isHistoryNavigation);
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = url;
    } finally {
      hideLoader();
    }
  }

  async function fetchContent(url) {
    const response = await fetch(url, {
      headers: { "X-Requested-With": "XMLHttpRequest" },
    });
    return await response.text();
  }

  function updatePage(html, url, isHistoryNavigation) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    const newTitle = doc.title;
    const newPath = new URL(url).pathname;

    // Обновление контента
    contentContainers.forEach((selector) => {
      const container = document.querySelector(selector);
      const newContent = doc.querySelector(selector);
      if (container && newContent) {
        container.innerHTML = newContent.innerHTML;
      }
    });

    // Обновление pmain: добавление/удаление
    const currPmain = document.querySelector("#pmain");
    const newPmain = doc.querySelector("#pmain");
    if (!currPmain && newPmain) {
      document.body.appendChild(newPmain.cloneNode(true));
    } else if (currPmain && !newPmain) {
      currPmain.remove();
    }

    // Управление navbar и title-small
    const navbar = document.querySelector("#navbard");
    const titleSmall = document.querySelector("#title-small");
    const isPhoto = /\/photo\/\d+/.test(newPath);
    if (isPhoto) {
      if (navbar) navbar.style.display = "none";
      if (titleSmall) titleSmall.style.display = "";
    } else {
      if (navbar) navbar.style.display = "";
      if (titleSmall) titleSmall.style.display = "none";
    }

    // Обработка footer: удаляем дубликаты и ставим единственный в конец
    const footers = Array.from(document.querySelectorAll("footer"));
    if (footers.length > 1) footers.slice(1).forEach((f) => f.remove());
    const footer = document.querySelector("footer");
    if (footer) document.body.appendChild(footer);

    // Обработка td.footer: оставляем только один и помещаем внутрь таблицы в #pmain
    const tdFooters = Array.from(document.querySelectorAll("td.footer"));
    if (tdFooters.length > 1) tdFooters.slice(1).forEach((td) => td.remove());
    const singleTdFooter = document.querySelector("td.footer");
    if (singleTdFooter) {
      let tableWrapper = document.querySelector("#pmain table.footer-wrapper");
      if (!tableWrapper) {
        const tbl = document.createElement("table");
        tbl.className = "footer-wrapper";
        tbl.width = "100%";
        tbl.style.marginTop = "30px";
        const tbody = document.createElement("tbody");
        const tr = document.createElement("tr");
        tbody.appendChild(tr);
        tbl.appendChild(tbody);
        document.querySelector("#pmain").appendChild(tbl);
        tableWrapper = tbl;
      }
      const tr = tableWrapper.querySelector("tr");
      tr.innerHTML = "";
      tr.appendChild(singleTdFooter);
    }

    // Обновление истории
    if (!isHistoryNavigation) window.history.pushState({}, "", url);

    // Обновление title
    document.title = newTitle;

    // Перезагрузка inline-скриптов
    reloadExternalScripts(doc); // Только новые внешние скрипты
    reloadInlineScripts(); // Inline-скрипты, кроме Tracy       // Инициализация логики

    // Прокрутка наверх
    window.scrollTo({ top: 0, behavior: "smooth" });

    lastPath = newPath;
  }

  const executedInlineScripts = new Set();

  function reloadInlineScripts() {
    document.querySelectorAll("script:not([src])").forEach((oldScript) => {
      const code = oldScript.textContent.trim();
      if (!code || /^Tracy\.Debug\.init/.test(code)) return;

      const hash = simpleHash(code);
      if (executedInlineScripts.has(hash)) return;

      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = code;
      oldScript.parentNode.replaceChild(newScript, oldScript);

      executedInlineScripts.add(hash);
    });
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0; // Преобразование в 32-битное целое
    }
    return hash;
  }

  function createLoader() {
    const loader = document.createElement("div");
    loader.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            background: #fff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-radius: 5px;
            display: none;
            z-index: 9999;
        `;
    loader.innerHTML = "🔄 Загрузка...";
    document.body.appendChild(loader);
    return loader;
  }

  function showLoader() {
    clearTimeout(loadingTimeout);
    loadingTimeout = setTimeout(() => (loader.style.display = "block"), 300);
  }

  function hideLoader() {
    clearTimeout(loadingTimeout);
    loader.style.display = "none";
  }
});
