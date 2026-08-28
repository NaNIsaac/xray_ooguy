/**
 * XRAY.OOGUY — Sidebar section tree
 *
 * The table of contents already lists every § item of every suite, with its
 * number, its translated name and the card it jumps to. This module reads that
 * markup and mirrors it into the sidebar, so the navigation gains a second
 * level without a second copy of the data:
 *
 *   - the TOC stays static markup, which is what makes it readable to a
 *     crawler that never runs a script;
 *   - the labels keep their data-i18n keys, so switching language updates the
 *     sidebar for free;
 *   - the links are plain #route/card hashes, which the router already
 *     understands and already scrolls to.
 *
 * Only the open suite is expanded, and the entry matching the card currently
 * under the top of the viewport is marked, so the sidebar doubles as a
 * position indicator while scrolling a long suite.
 *
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70) — ES5 syntax only.
 */

(function () {
  "use strict";

  // Labels come from the markup, so this module needed no translator until the
  // search grew headings of its own.
  function t(key) {
    return (window.i18n && window.i18n.t) ? window.i18n.t(key) : key;
  }

  // Every wording a key has. The interface may be in Korean while the user
  // types "footprint", or the other way round, so search never depends on the
  // language currently selected.
  function allText(key) {
    return (key && window.i18n && window.i18n.allText) ? window.i18n.allText(key) : "";
  }

  // The contents entries are real links, so the route and card are read from
  // the href the browser already follows — not from a handler attribute. One
  // source of truth: a typo in a href breaks the link visibly instead of
  // silently dropping the entry out of the sidebar.
  var JUMP = /^#?([a-z]+)\/([a-z0-9-]+)$/;
  var groups = {};        // route -> [{ card, num, key, text }]
  var cardRoutes = {};    // card id -> route
  var subLists = {};      // route -> container element
  var spyTimer = null;

  function readTableOfContents() {
    var links = document.querySelectorAll(".toc-item-link");
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      var m = JUMP.exec(href);
      if (!m) continue;

      var nameEl = links[i].querySelector(".toc-item-name");
      if (!nameEl) continue;

      if (!groups[m[1]]) groups[m[1]] = [];
      cardRoutes[m[2]] = m[1];
      groups[m[1]].push({
        card: m[2],
        // Straight from the numbering map, not off the contents markup: the
        // card's position in its view is the one source, and reading the
        // rendered text here would just be a second-hand copy of it.
        //
        // Bare numeral: the § sign belongs on the card and in the table of
        // contents, but repeated down a narrow column it is just noise.
        num: (window.cardNumber ? window.cardNumber(m[2]) : "").replace(/[^0-9.]/g, "").replace(/\.$/, ""),
        key: nameEl.getAttribute("data-i18n") || "",
        text: nameEl.textContent
      });
    }
  }

  function buildSubList(route, items) {
    var wrap = document.createElement("div");
    wrap.className = "nav-sub";
    wrap.setAttribute("data-route", route);

    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      var a = document.createElement("a");
      a.className = "nav-sub-item";
      a.setAttribute("data-card", it.card);
      if (it.key) a.setAttribute("data-key", it.key);
      a.href = "#" + route + "/" + it.card;

      var num = document.createElement("span");
      num.className = "nav-sub-num";
      num.textContent = it.num;

      var label = document.createElement("span");
      label.className = "nav-sub-name";
      if (it.key) label.setAttribute("data-i18n", it.key);
      label.textContent = it.text;

      a.appendChild(num);
      a.appendChild(label);
      wrap.appendChild(a);
    }
    return wrap;
  }

  function mount() {
    var navItems = document.querySelectorAll(".sidebar-nav .nav-item");
    for (var i = 0; i < navItems.length; i++) {
      var route = navItems[i].getAttribute("data-route");
      if (!route || !groups[route] || subLists[route]) continue;

      var list = buildSubList(route, groups[route]);
      if (navItems[i].parentNode) {
        navItems[i].parentNode.insertBefore(list, navItems[i].nextSibling);
        subLists[route] = list;
      }
    }
  }

  function currentRoute() {
    var hash = (window.location.hash || "").replace(/^#\/?/, "");
    return hash.split("/")[0] || (window.App ? window.App.currentRoute : "");
  }

  // Only the open suite stays expanded: all five at once would outrun the
  // sidebar on a short window.
  function syncExpanded() {
    var route = currentRoute();
    for (var r in subLists) {
      if (!subLists.hasOwnProperty(r)) continue;
      subLists[r].className = (r === route) ? "nav-sub nav-sub-open" : "nav-sub";
    }
  }

  // Marks the entry for the card being read: the first one still showing below
  // the top edge of the reading area. Keying off which cards have scrolled
  // *past* the edge instead left nothing marked at the top of a view, where
  // the banner pushes the first card down.
  //
  // The edge is a fixed offset from the top of the viewport. Measuring it from
  // the content area's own box was wrong: the page scrolls as a whole, so that
  // box travels upward with the content and the edge went negative, which
  // pinned the mark to the first entry no matter how far down you were.
  var TOP_EDGE = 90;

  function currentCard() {
    var hash = (window.location.hash || "").replace(/^#\/?/, "");
    return hash.split("/")[1] || "";
  }

  function highlightVisibleCard() {
    var route = currentRoute();
    var list = subLists[route];
    if (!list) return;

    var links = list.getElementsByTagName("a");
    var jumped = currentCard();
    var activeIdx = -1;

    for (var i = 0; i < links.length; i++) {
      var card = document.getElementById(links[i].getAttribute("data-card"));
      if (!card) continue;
      var box = card.getBoundingClientRect();

      // A card that was jumped to keeps the mark for as long as it is on
      // screen. The last card of a view can never reach the top edge — the
      // page runs out of scroll first — so the plain top-most rule would hand
      // the mark to a neighbour the moment you clicked it.
      if (jumped && links[i].getAttribute("data-card") === jumped) {
        if (box.bottom > 0 && box.top < (window.innerHeight || 900)) { activeIdx = i; break; }
      }

      if (activeIdx < 0 && box.bottom > TOP_EDGE) activeIdx = i;
      if (activeIdx >= 0 && !jumped) break;
    }

    // Scrolled past the last card: it stays the current one.
    if (activeIdx < 0 && links.length) activeIdx = links.length - 1;

    for (var j = 0; j < links.length; j++) {
      links[j].className = (j === activeIdx) ? "nav-sub-item active" : "nav-sub-item";
    }
  }

  function onScroll() {
    if (spyTimer) return;
    spyTimer = setTimeout(function () {
      spyTimer = null;
      highlightVisibleCard();
    }, 120);
  }

  // ------------------------------------------------------------------
  // Working on a card makes it the current one
  // ------------------------------------------------------------------
  // Clicking anywhere in a card marks it in the sidebar and names it in the
  // URL, so the address bar always points at what is being worked on. The hash
  // is rewritten in place rather than assigned: assigning it would send the
  // router after the card and scroll the page out from under the click.
  function markCurrentCard(cardId) {
    var previous = document.querySelectorAll(".card-current");
    for (var i = 0; i < previous.length; i++) {
      previous[i].className = previous[i].className.replace(/\s*card-current/, "");
    }

    var card = document.getElementById(cardId);
    if (card && card.className.indexOf("card-current") < 0) {
      card.className += " card-current";
    }
  }

  function selectCard(cardId, route) {
    markCurrentCard(cardId);

    var hash = "#" + route + "/" + cardId;
    if (window.location.hash !== hash) {
      try {
        history.replaceState(null, "", hash);
      } catch (e) {
        // Leaving the hash alone is better than a scroll the user did not ask for.
      }
    }
    highlightVisibleCard();
  }

  function onContentClick(e) {
    var node = e.target || e.srcElement;
    while (node && node !== document.body) {
      var id = node.id;
      if (id && cardRoutes[id]) {
        selectCard(id, cardRoutes[id]);
        return;
      }
      node = node.parentNode;
    }
  }


  // ------------------------------------------------------------------
  // Search
  // ------------------------------------------------------------------
  // The results are the tree itself: typing hides the entries that do not
  // match and opens the suites that do, so a hit is always read in the context
  // of the suite it belongs to, and no floating panel is needed to hold it.
  //
  // Things that are not tree entries — crystal presets, the materials table,
  // the constants in the appendix — join as a reference group at the foot of
  // the list. Those rows do the thing rather than just point at it: choosing a
  // preset opens the lattice card with that cell already applied.
  var refList = null;
  var searchActive = false;

  function normalise(text) {
    return String(text).toLowerCase().replace(/[\s()\[\]\-_/,]/g, "");
  }

  function matches(query, text) {
    return normalise(text).indexOf(query) >= 0;
  }

  // A route is searchable by the wording of its tab in either language.
  function routeHaystack(navItem) {
    var label = navItem.getElementsByTagName("span")[0];
    var key = label ? label.getAttribute("data-i18n") : null;
    return navItem.textContent + " " + allText(key) + " " + (navItem.getAttribute("data-route") || "");
  }

  // Reference results are read from the data the app already ships.
  function referenceEntries() {
    var out = [];
    var i;

    var presets = window.LATTICE_PRESETS || [];
    for (i = 0; i < presets.length; i++) {
      (function (index, p) {
        out.push({
          label: p.name,
          meta: "a = " + p.a + " Å",
          search: p.name + " " + p.system + " lattice preset 격자 프리셋",
          run: function () {
            window.location.hash = "#geometry/card-lattice-dspacing";
            if (window.applyLatticePreset) window.applyLatticePreset(index);
          }
        });
      })(i, presets[i]);
    }

    var materials = window.MATERIALS_DB || [];
    for (i = 0; i < materials.length; i++) {
      (function (index, m) {
        out.push({
          label: m.name,
          meta: "ρ = " + m.density_g_cm3 + " g/cm³",
          search: m.name + " " + m.symbol + " material 재료",
          run: function () {
            window.location.hash = "#optics/card-optics-refraction";
            var sel = document.getElementById("refract-mat");
            if (sel) {
              sel.value = String(index);
              if (window.calcRefractive) window.calcRefractive();
            }
          }
        });
      })(i, materials[i]);
    }

    var rows = document.querySelectorAll("#card-physical-constants tbody tr");
    for (i = 0; i < rows.length; i++) {
      if ((rows[i].className || "").indexOf("dt-group") >= 0) continue;
      var cells = rows[i].getElementsByTagName("td");
      if (cells.length < 3) continue;
      (function (symbol, quantity, value) {
        out.push({
          label: quantity,
          meta: symbol + " = " + value,
          search: quantity + " " + symbol + " constant 상수",
          run: function () { window.location.hash = "#dashboard/card-physical-constants"; }
        });
      })(cells[0].textContent.replace(/\s+/g, " ").trim(),
         cells[1].textContent.replace(/\s+/g, " ").trim(),
         cells[2].textContent.replace(/\s+/g, " ").trim());
    }

    return out;
  }

  function buildReferenceList() {
    if (refList) return refList;

    refList = document.createElement("div");
    refList.className = "nav-sub nav-ref";
    refList.style.display = "none";

    var nav = document.querySelector(".sidebar-nav");
    if (nav) nav.appendChild(refList);
    return refList;
  }

  function renderReferenceHits(query) {
    var list = buildReferenceList();
    list.innerHTML = "";

    if (!query) { list.style.display = "none"; return 0; }

    var entries = referenceEntries();
    var shown = 0;

    for (var i = 0; i < entries.length && shown < 8; i++) {
      if (!matches(query, entries[i].search)) continue;
      shown++;

      var row = document.createElement("a");
      row.className = "nav-sub-item nav-ref-item";
      row.href = "#";

      var label = document.createElement("span");
      label.className = "nav-sub-name";
      label.textContent = entries[i].label;

      var meta = document.createElement("span");
      meta.className = "nav-ref-meta mono";
      meta.textContent = entries[i].meta;

      row.appendChild(label);
      row.appendChild(meta);

      (function (entry) {
        row.onclick = function (e) {
          if (e && e.preventDefault) e.preventDefault();
          entry.run();
          clearSearch();
        };
      })(entries[i]);

      list.appendChild(row);
    }

    if (shown) {
      var head = document.createElement("div");
      head.className = "nav-ref-head";
      head.textContent = t("search_reference");
      list.insertBefore(head, list.firstChild);
    }

    list.style.display = shown ? "block" : "none";
    return shown;
  }

  function runNavSearch() {
    var input = document.getElementById("nav-search");
    var query = normalise(input ? input.value : "");
    searchActive = !!query;

    var hits = 0;
    var r;

    for (r in subLists) {
      if (!subLists.hasOwnProperty(r)) continue;

      var list = subLists[r];
      var links = list.getElementsByTagName("a");
      var groupHits = 0;

      for (var i = 0; i < links.length; i++) {
        var on = !query || matches(query, links[i].textContent + " " + allText(links[i].getAttribute("data-key")));
        links[i].style.display = on ? "" : "none";
        if (on && query) groupHits++;
      }

      hits += groupHits;

      // While searching, a suite with nothing in it is out of the way.
      var navItem = document.querySelector('.sidebar-nav .nav-item[data-route="' + r + '"]');

      // A suite title is a search target in its own right; when it matches,
      // the answer is the whole suite rather than none of it.
      if (query && navItem && matches(query, routeHaystack(navItem))) {
        for (var w = 0; w < links.length; w++) links[w].style.display = "";
        hits += links.length - groupHits;
        groupHits = links.length;
      }

      if (query) {
        list.className = groupHits ? "nav-sub nav-sub-open" : "nav-sub";
        if (navItem) navItem.style.display = groupHits ? "" : "none";
      } else {
        if (navItem) navItem.style.display = "";
      }
    }

    // Routes with no section tree — the index and the about page — are matched
    // on their own title.
    var plain = document.querySelectorAll(".sidebar-nav .nav-item");
    for (var p = 0; p < plain.length; p++) {
      var route = plain[p].getAttribute("data-route");
      if (route && subLists[route]) continue;
      var keep = !query || matches(query, routeHaystack(plain[p]));
      plain[p].style.display = keep ? "" : "none";
      if (query && keep) hits++;
    }

    hits += renderReferenceHits(query);

    if (!query) syncExpanded();

    var nav = document.querySelector(".sidebar-nav");
    if (nav) nav.className = query ? "sidebar-nav searching" : "sidebar-nav";

    var empty = document.getElementById("nav-search-empty");
    if (empty) empty.style.display = (query && !hits) ? "block" : "none";
  }

  function clearSearch() {
    var input = document.getElementById("nav-search");
    if (input) input.value = "";
    runNavSearch();
  }

  function firstHit() {
    var lists = document.querySelectorAll(".sidebar-nav .nav-sub");
    for (var i = 0; i < lists.length; i++) {
      var links = lists[i].getElementsByTagName("a");
      for (var j = 0; j < links.length; j++) {
        if (links[j].style.display !== "none") return links[j];
      }
    }
    return null;
  }

  function onSearchKey(e) {
    var key = e.key || "";

    if (key === "Escape") {
      clearSearch();
      if (e.target && e.target.blur) e.target.blur();
      return;
    }

    if (key === "Enter") {
      var hit = firstHit();
      if (!hit) return;
      if (hit.onclick) hit.onclick(e);
      else window.location.hash = hit.getAttribute("href") || "";
      clearSearch();
    }
  }

  // ------------------------------------------------------------------
  // The small-screen drawer
  // ------------------------------------------------------------------
  // Below 900px the sidebar is hidden, which also hides the only search box
  // there is — 31 tools reachable only by scrolling. The drawer gives it back.
  // Whether it is open is a class on <body>; the CSS decides what that means,
  // so above 900px it means nothing and the sidebar just stays where it is.
  function drawerAvailable() {
    var toggle = document.getElementById("nav-drawer-toggle");
    // offsetParent is null for a display:none element, which is how the media
    // query tells us the viewport is narrow without duplicating 900 in JS.
    return !!(toggle && toggle.offsetParent !== null);
  }

  function drawerOpen() {
    return document.body.className.indexOf("drawer-open") >= 0;
  }

  function setDrawer(open) {
    var body = document.body;
    var classes = body.className.replace(/\s*drawer-open\b/g, "");
    body.className = open ? classes + " drawer-open" : classes;

    var toggle = document.getElementById("nav-drawer-toggle");
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function openNavDrawer() {
    setDrawer(true);
    var input = document.getElementById("nav-search");
    if (input) input.focus();
  }

  function closeNavDrawer() {
    if (!drawerOpen()) return;
    setDrawer(false);
    // Focus goes back where it came from, or it lands on <body> and the next
    // Tab starts from the top of the page.
    var toggle = document.getElementById("nav-drawer-toggle");
    if (toggle && toggle.offsetParent !== null) toggle.focus();
  }

  function toggleNavDrawer() {
    if (drawerOpen()) closeNavDrawer();
    else openNavDrawer();
  }

  // The drawer covers the page but the page is still behind it, so Tab would
  // walk straight out of the drawer into content the reader cannot see. The
  // list is short and rebuilt per keypress: it changes as search filters it.
  function trapTab(e) {
    var sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    var focusable = [];
    var candidates = sidebar.querySelectorAll("a[href], button, input, select, textarea");
    for (var i = 0; i < candidates.length; i++) {
      if (candidates[i].offsetParent !== null && !candidates[i].disabled) focusable.push(candidates[i]);
    }
    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var here = document.activeElement;

    if (e.shiftKey && (here === first || !sidebar.contains(here))) {
      if (e.preventDefault) e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && here === last) {
      if (e.preventDefault) e.preventDefault();
      first.focus();
    }
  }

  // "/" reaches the box from anywhere that is not already a text field.
  function onGlobalKey(e) {
    var key = e.key || "";

    if (drawerOpen()) {
      if (key === "Escape") { closeNavDrawer(); return; }
      if (key === "Tab") { trapTab(e); return; }
    }

    if (key !== "/") return;
    var tag = ((e.target && e.target.tagName) || "").toUpperCase();
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

    var input = document.getElementById("nav-search");
    if (!input) return;
    if (e.preventDefault) e.preventDefault();

    // Narrow viewport: the box is inside the drawer, so the shortcut has to
    // open it first. It used to focus an element that was display:none, which
    // does nothing at all.
    if (drawerAvailable()) openNavDrawer();
    else input.focus();
  }

  function init() {
    readTableOfContents();
    mount();
    syncExpanded();
    if (currentCard()) markCurrentCard(currentCard());
    highlightVisibleCard();

    // Labels were copied with their keys, so the new nodes need one pass to
    // pick up the active language.
    if (window.i18n && window.i18n.applyTranslations) window.i18n.applyTranslations();

    // The scroll container here is <body>, not the viewport, and a scroll
    // event on an element does not bubble — a window listener would never
    // hear it. Capturing on the document catches whichever element moves.
    document.addEventListener("scroll", onScroll, true);
    document.addEventListener("click", onContentClick, false);

    var search = document.getElementById("nav-search");
    if (search) search.addEventListener("keydown", onSearchKey);
    document.addEventListener("keydown", onGlobalKey);
    window.addEventListener("scroll", onScroll);

    window.addEventListener("hashchange", function () {
      // Picking something in the drawer is the drawer's whole job, so it is
      // done once the route changes — including a link followed from search.
      closeNavDrawer();
      syncExpanded();
      if (currentCard()) markCurrentCard(currentCard());
      setTimeout(highlightVisibleCard, 80);   // after the router has scrolled
    });
  }

  window.renderSidebarTree = init;
  window.runNavSearch = runNavSearch;
  window.toggleNavDrawer = toggleNavDrawer;
  window.closeNavDrawer = closeNavDrawer;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
