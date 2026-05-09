(function () {
  var storageKey = "withintech-docs-theme";
  var root = document.documentElement;

  function getStoredTheme() {
    try {
      return localStorage.getItem(storageKey);
    } catch (_error) {
      return null;
    }
  }

  function getPreferredTheme() {
    var stored = getStoredTheme();
    if (stored === "dark" || stored === "light") return stored;
    return "dark";
  }

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    var button = document.querySelector("[data-theme-toggle]");
    if (!button) return;
    var isDark = theme === "dark";
    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute("title", isDark ? "Use light mode" : "Use dark mode");
    button.querySelector("[data-theme-toggle-label]").textContent = isDark
      ? "Light"
      : "Dark";
    button.querySelector("[data-theme-toggle-icon]").textContent = isDark
      ? "☀"
      : "◐";
  }

  function createBrand() {
    var sidebar = document.querySelector(".book-summary");
    if (!sidebar || sidebar.querySelector(".wt-docs-brand")) return;

    var brand = document.createElement("div");
    brand.className = "wt-docs-brand";
    brand.innerHTML =
      '<img class="wt-docs-logo wt-docs-logo-light" src="assets/brand/logo.png" alt="WithinTech Learn" />' +
      '<img class="wt-docs-logo wt-docs-logo-dark" src="assets/brand/logo-dark-mode.png" alt="WithinTech Learn" />' +
      '<div><div class="wt-docs-title">WithinTech Learn</div>' +
      '<div class="wt-docs-subtitle">Product & engineering docs</div></div>';
    sidebar.insertBefore(brand, sidebar.firstChild);
  }

  function createThemeToggle() {
    if (document.querySelector("[data-theme-toggle]")) return;

    var header = document.querySelector(".book-header");
    var target = header || document.querySelector(".book-body");
    if (!target) return;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "wt-theme-toggle";
    button.setAttribute("data-theme-toggle", "");
    button.innerHTML =
      '<span data-theme-toggle-icon aria-hidden="true">◐</span>' +
      '<span data-theme-toggle-label>Dark</span>';
    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(storageKey, next);
      } catch (_error) {}
      applyTheme(next);
    });

    target.appendChild(button);
  }

  function createHeaderBrand() {
    var header = document.querySelector(".book-header");
    if (!header || header.querySelector(".wt-header-brand")) return;

    var brand = document.createElement("a");
    brand.className = "wt-header-brand";
    brand.href = "./";
    brand.innerHTML =
      '<img class="wt-header-logo wt-header-logo-light" src="assets/brand/logo.png" alt="" />' +
      '<img class="wt-header-logo wt-header-logo-dark" src="assets/brand/logo-dark-mode.png" alt="" />' +
      '<span class="wt-header-title">WithinTech Learn</span>';
    header.appendChild(brand);
  }

  function removeDefaultChrome() {
    var summaryLinks = document.querySelectorAll(".book-summary a");
    for (var i = 0; i < summaryLinks.length; i += 1) {
      if (summaryLinks[i].textContent.indexOf("Published with HonKit") !== -1) {
        var item = summaryLinks[i].closest("li");
        if (item) item.remove();
      }
    }

    var headerLinks = document.querySelectorAll(".book-header a");
    for (var j = 0; j < headerLinks.length; j += 1) {
      var label = headerLinks[j].getAttribute("aria-label") || "";
      var text = headerLinks[j].textContent || "";
      if (label.indexOf("Font Settings") !== -1 || text.indexOf("") !== -1) {
        headerLinks[j].remove();
      }
    }
  }

  function enhanceTables() {
    var tables = document.querySelectorAll(".markdown-section table");
    for (var i = 0; i < tables.length; i += 1) {
      var table = tables[i];
      var headers = table.querySelectorAll("thead th");
      var rows = table.querySelectorAll("tbody tr");

      for (var rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
        var cells = rows[rowIndex].querySelectorAll("td");
        for (var cellIndex = 0; cellIndex < cells.length; cellIndex += 1) {
          var header = headers[cellIndex];
          if (header) {
            cells[cellIndex].setAttribute(
              "data-label",
              header.textContent.trim()
            );
          }
        }
      }

      if (table.parentElement && table.parentElement.className === "wt-table") {
        continue;
      }
      var wrapper = document.createElement("div");
      wrapper.className = "wt-table";
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  }

  function getPageTitle() {
    var section = document.querySelector(".markdown-section");
    var heading = section ? section.querySelector("h1") : null;
    return heading ? heading.textContent.trim() : "WithinTech Learn docs";
  }

  function aiPrompt(provider) {
    var title = getPageTitle();
    var url = window.location.href.split("#")[0];
    return (
      "Use this WithinTech Learn docs page to help me understand " +
      title +
      ": " +
      url +
      (provider ? " Prefer a concise, practical answer for the team." : "")
    );
  }

  function createAIOptions() {
    var section = document.querySelector(".markdown-section");
    if (!section || section.querySelector(".wt-ai-options")) return;

    var heading = section.querySelector("h1");
    if (!heading || heading.textContent.trim().indexOf("Everything the team needs") === 0) {
      return;
    }

    var encodedPrompt = encodeURIComponent(aiPrompt(true));
    var panel = document.createElement("div");
    panel.className = "wt-ai-options";
    panel.innerHTML =
      '<button class="wt-ai-trigger" type="button" aria-expanded="false">' +
      '<span class="wt-ai-mark" aria-hidden="true">AI</span>' +
      '<span>Open in AI</span>' +
      '<span class="wt-ai-caret" aria-hidden="true">⌄</span>' +
      "</button>" +
      '<div class="wt-ai-menu" role="menu">' +
      '<a role="menuitem" target="_blank" rel="noreferrer" href="https://chatgpt.com/?q=' +
      encodedPrompt +
      '"><strong>ChatGPT</strong><span>Ask about this page</span></a>' +
      '<a role="menuitem" target="_blank" rel="noreferrer" href="https://claude.ai/new?q=' +
      encodedPrompt +
      '"><strong>Claude</strong><span>Open with context</span></a>' +
      '<a role="menuitem" target="_blank" rel="noreferrer" href="https://www.perplexity.ai/search/new?q=' +
      encodedPrompt +
      '"><strong>Perplexity</strong><span>Search with this page</span></a>' +
      '<a role="menuitem" href="llms.txt"><strong>LLMs index</strong><span>Docs map for AI tools</span></a>' +
      "</div>";

    var trigger = panel.querySelector(".wt-ai-trigger");
    trigger.addEventListener("click", function () {
      var isOpen = panel.classList.toggle("is-open");
      trigger.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target)) {
        panel.classList.remove("is-open");
        trigger.setAttribute("aria-expanded", "false");
      }
    });

    heading.insertAdjacentElement("afterend", panel);
  }

  function pageGroup(title) {
    var groups = {
      Product: ["Product", "Features", "Workflows"],
      System: ["Architecture", "Data Model", "API", "Routes"],
      Runbook: ["Security", "Infrastructure", "Environment", "Scaling", "Operations"],
      Standards: ["Code Style", "Design System"]
    };

    for (var group in groups) {
      if (groups[group].indexOf(title) !== -1) return group;
    }
    return "";
  }

  function createBreadcrumbs() {
    var section = document.querySelector(".markdown-section");
    if (!section) return;

    var heading = section.querySelector("h1");
    var title = heading ? heading.textContent.trim() : "Overview";
    if (!title || title.indexOf("Everything the team needs") === 0) return;

    var existing = section.querySelector(".wt-breadcrumbs");
    if (existing) existing.remove();

    var group = pageGroup(title);
    var crumbs = document.createElement("nav");
    crumbs.className = "wt-breadcrumbs";
    crumbs.setAttribute("aria-label", "Breadcrumb");
    crumbs.innerHTML =
      '<a href="./">Docs</a>' +
      (group ? '<span>/</span><span>' + group + '</span>' : "") +
      '<span>/</span><strong>' + title + '</strong>';

    section.insertBefore(crumbs, section.firstChild);
  }

  function boot() {
    createBrand();
    createHeaderBrand();
    createThemeToggle();
    removeDefaultChrome();
    window.setTimeout(removeDefaultChrome, 50);
    window.setTimeout(removeDefaultChrome, 250);
    createBreadcrumbs();
    createAIOptions();
    enhanceTables();
    applyTheme(getPreferredTheme());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  if (window.gitbook && window.gitbook.events) {
    window.gitbook.events.bind("page.change", boot);
  }
})();
