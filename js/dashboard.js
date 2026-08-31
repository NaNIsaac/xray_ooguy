/**
 * XRAY.OOGUY — Dashboard: the toolkit sorted by what you are trying to do
 *
 * The Index sorts 31 calculators the way the physics does — radiometry, optics,
 * geometry, coherence. That is the right map for someone who already knows
 * which discipline their question belongs to, and the wrong first screen for
 * everyone else: it asks the reader to classify their problem before it will
 * help them with it.
 *
 * So the two live side by side and answer different questions:
 *
 *   #dashboard   four things a beamtime actually does, three tools each
 *   #index       every tool, by suite, with formulas — the full contents
 *   sidebar      the suites, for the reader who knows where they are going
 *   search       the name, for the reader who knows what it is called
 *
 * Nothing here is a second copy of the tool list. GROUPS holds card ids only;
 * every label, href and formula is read out of the contents markup at render
 * time, which is the same source nav.js builds the sidebar and the search
 * index from. A tool renamed or moved to another suite follows here with no
 * edit, and tools/check.js fails the build if a card exists in one and not the
 * other.
 *
 * The action wording is the one thing this file adds: "Find a Bragg angle"
 * rather than "Bragg's Law Solver". Both are shown — the verb to read, the
 * name to recognise.
 *
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70) — ES5 syntax only.
 */

(function () {
  "use strict";

  // Three per group on arrival. The rest are in the DOM behind "view N more":
  // present for search and for a crawler, folded so the first screen stays a
  // choice between four things rather than thirty-one.
  var LEAD_COUNT = 3;

  // The four questions a shift is made of, in the order it asks them: can this
  // measurement work at all, where does everything go, what is actually hitting
  // the sample, and what happens to the numbers afterwards.
  var GROUPS = [
    {
      key: "plan",
      cards: [
        "card-rad-scantime",
        "card-rad-dose",
        "card-rad-absorber",
        "card-beamline-footprint",
        "card-beamline-cdi",
        "card-coh-resolution",
        "card-coh-length"
      ]
    },
    {
      key: "geometry",
      cards: [
        "card-lattice-dspacing",
        "card-optics-scaling",
        "card-beamline-detector",
        "card-optics-bragg",
        "card-optics-energy",
        "card-optics-qspace",
        "card-optics-euler",
        "card-opt-calibration"
      ]
    },
    {
      key: "beam",
      cards: [
        "card-optics-refraction",
        "card-beamline-flux",
        "card-beamline-slit",
        "card-optics-reflection",
        "card-beamline-resolution",
        "card-beamline-drift",
        "card-optics-grating"
      ]
    },
    {
      key: "result",
      cards: [
        "card-data-plot",
        "card-data-stitch",
        "card-record-headers",
        "card-data-load",
        "card-data-kiessig",
        "card-geo-pixelq",
        "card-geo-strain",
        "card-record-snippets"
      ]
    }
  ];

  // The four that get opened over and over during a shift. They sit above the
  // groups as bare links: a returning reader should not have to read a heading
  // to convert an energy.
  var QUICK = [
    "card-optics-energy",
    "card-optics-bragg",
    "card-optics-qspace",
    "card-beamline-footprint"
  ];

  // How many past calculations to look through for the recently-used line.
  var RECENT_SCAN = 40;
  var RECENT_SHOW = 3;

  function t(key) {
    if (window.i18n && window.i18n.t) {
      var s = window.i18n.t(key);
      if (s !== key) return s;
    }
    return "";
  }

  // card-rad-scantime -> dash_act_rad_scantime
  function actionKey(cardId) {
    return "dash_act_" + cardId.replace(/^card-/, "").replace(/-/g, "_");
  }

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ------------------------------------------------------------------
  // The tool list, read from the contents block
  // ------------------------------------------------------------------
  // Same source nav.js uses. The names it returns are already translated,
  // because applyTranslations has run over that markup by the time this does.
  function tocIndex() {
    var map = {};
    var links = document.querySelectorAll(".toc-item-link");

    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute("href") || "";
      var slash = href.indexOf("/");
      if (slash < 0) continue;

      var name = links[i].querySelector(".toc-item-name");
      var formula = links[i].querySelector(".toc-item-formula");

      map[href.slice(slash + 1)] = {
        href: href,
        name: name ? name.textContent : "",
        formula: formula ? formula.textContent : ""
      };
    }
    return map;
  }

  function itemHtml(cardId, entry, hidden) {
    var action = t(actionKey(cardId)) || entry.name;

    return '<a class="dash-tool' + (hidden ? " dash-tool-extra" : "") + '" href="' + esc(entry.href) + '"' +
      (hidden ? ' style="display:none;"' : "") + ">" +
      '<span class="dash-tool-action">' + esc(action) + "</span>" +
      '<span class="dash-tool-tech">' + esc(entry.name) +
      (entry.formula ? ' <span class="dash-tool-formula">' + esc(entry.formula) + "</span>" : "") +
      "</span></a>";
  }

  function groupHtml(group, index) {
    var extra = group.cards.length - LEAD_COUNT;
    var html = '<div class="col-6"><div class="dash-group" data-group="' + group.key + '">' +
      '<div class="dash-group-head">' +
      '<span class="dash-group-title">' + esc(t("dash_g_" + group.key)) + "</span>" +
      '<span class="dash-group-count">' + esc(t("dash_count").replace("{n}", group.cards.length)) + "</span>" +
      "</div>" +
      '<span class="dash-group-ask">' + esc(t("dash_q_" + group.key)) + "</span>" +
      '<div class="dash-group-items">';

    for (var i = 0; i < group.cards.length; i++) {
      var entry = index[group.cards[i]];
      if (!entry) continue;                       // check.js fails on this too
      html += itemHtml(group.cards[i], entry, i >= LEAD_COUNT);
    }

    html += "</div>";

    if (extra > 0) {
      html += '<button type="button" class="dash-more" data-group="' + group.key + '"' +
        ' aria-expanded="false">' +
        '<span class="dash-more-label">' + esc(t("dash_more").replace("{n}", extra)) + "</span>" +
        "</button>";
    }

    return html + "</div></div>";
  }

  function quickHtml(index) {
    var html = '<div class="dash-quick-head">' + esc(t("dash_quick")) + "</div>" +
      '<div class="dash-quick-row">';

    for (var i = 0; i < QUICK.length; i++) {
      var entry = index[QUICK[i]];
      if (!entry) continue;
      html += '<a class="dash-quick-item" href="' + esc(entry.href) + '">' +
        esc(t(actionKey(QUICK[i])) || entry.name) + "</a>";
    }

    return html + "</div>";
  }

  // ------------------------------------------------------------------
  // Recently used
  // ------------------------------------------------------------------
  // Read out of the list every calculator writes to when it runs, rather than
  // kept as its own: a second store would be a second thing to keep in step.
  function recentHtml(index) {
    var list = [];
    try {
      list = (window.Storage && window.Storage.get("recent_cards", [])) || [];
    } catch (e) {
      list = [];
    }

    var seen = {};
    var cards = [];

    for (var i = 0; i < list.length && i < RECENT_SCAN && cards.length < RECENT_SHOW; i++) {
      var card = list[i] && list[i].card;
      if (!card || seen[card] || !index[card]) continue;
      seen[card] = true;
      cards.push(card);
    }

    if (!cards.length) return "";

    var html = '<div class="dash-recent"><span class="dash-recent-label">' +
      esc(t("dash_recent")) + "</span>";

    for (var c = 0; c < cards.length; c++) {
      var entry = index[cards[c]];
      html += (c ? '<span class="dash-recent-sep">&middot;</span>' : "") +
        '<a class="dash-recent-item" href="' + esc(entry.href) + '">' +
        esc(t(actionKey(cards[c])) || entry.name) + "</a>";
    }

    return html + "</div>";
  }

  // ------------------------------------------------------------------
  // Render
  // ------------------------------------------------------------------
  function renderDashboard() {
    var quick = document.getElementById("dash-quick");
    var groups = document.getElementById("dash-groups");
    var recent = document.getElementById("dash-recent-slot");
    if (!groups) return;

    var index = tocIndex();
    var html = "";

    for (var i = 0; i < GROUPS.length; i++) {
      html += groupHtml(GROUPS[i], index);
    }

    if (quick) quick.innerHTML = quickHtml(index);
    groups.innerHTML = html;
    if (recent) recent.innerHTML = recentHtml(index);

    bindMore(groups);
  }

  function bindMore(root) {
    var buttons = root.querySelectorAll(".dash-more");

    for (var i = 0; i < buttons.length; i++) {
      (function (button) {
        button.addEventListener("click", function () {
          var group = button.parentNode;
          var extras = group.querySelectorAll(".dash-tool-extra");
          var open = button.getAttribute("aria-expanded") === "true";
          var label = button.querySelector(".dash-more-label");

          for (var e = 0; e < extras.length; e++) {
            extras[e].style.display = open ? "none" : "";
          }

          button.setAttribute("aria-expanded", open ? "false" : "true");
          if (label) {
            label.textContent = open
              ? t("dash_more").replace("{n}", extras.length)
              : t("dash_less");
          }
        });
      })(buttons[i]);
    }
  }

  window.renderDashboard = renderDashboard;
})();
