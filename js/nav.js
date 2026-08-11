/**
 * BEAMLINE TOOLKIT — Sidebar section tree
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

  var JUMP = /jumpToSection\(\s*'([a-z]+)'\s*,\s*'([a-z0-9-]+)'\s*\)/;
  var groups = {};        // route -> [{ card, num, key, text }]
  var cardRoutes = {};    // card id -> route
  var subLists = {};      // route -> container element
  var spyTimer = null;

  function readTableOfContents() {
    var links = document.querySelectorAll(".toc-item-link");
    for (var i = 0; i < links.length; i++) {
      var onclick = links[i].getAttribute("onclick") || "";
      var m = JUMP.exec(onclick);
      if (!m) continue;

      var nameEl = links[i].querySelector(".toc-item-name");
      var numEl = links[i].querySelector(".toc-item-num");
      if (!nameEl) continue;

      if (!groups[m[1]]) groups[m[1]] = [];
      cardRoutes[m[2]] = m[1];
      groups[m[1]].push({
        card: m[2],
        // Bare numeral: the § sign belongs on the card and in the table of
        // contents, but repeated down a narrow column it is just noise.
        num: numEl ? numEl.textContent.replace(/[^0-9.]/g, "").replace(/\.$/, "") : "",
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
    window.addEventListener("scroll", onScroll);

    window.addEventListener("hashchange", function () {
      syncExpanded();
      if (currentCard()) markCurrentCard(currentCard());
      setTimeout(highlightVisibleCard, 80);   // after the router has scrolled
    });
  }

  window.renderSidebarTree = init;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
