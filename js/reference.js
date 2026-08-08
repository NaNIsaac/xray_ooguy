/**
 * BEAMLINE TOOLKIT — Reference Data, Unit Converters & Crystallography DB
 * Academic Print Specification: Booktabs tables, zero emojis, exact units.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  // --- 5.1 Comprehensive Unit Converter ---
  function convertUnits(category, source) {
    if (category === "length") {
      var valAng = parseFloat(document.getElementById("unit-len-ang").value);
      var valNm = parseFloat(document.getElementById("unit-len-nm").value);
      var valUm = parseFloat(document.getElementById("unit-len-um").value);
      var valMm = parseFloat(document.getElementById("unit-len-mm").value);

      var baseAng = 0;
      if (source === "ang" && !isNaN(valAng)) baseAng = valAng;
      else if (source === "nm" && !isNaN(valNm)) baseAng = valNm * 10;
      else if (source === "um" && !isNaN(valUm)) baseAng = valUm * 1e4;
      else if (source === "mm" && !isNaN(valMm)) baseAng = valMm * 1e7;

      if (baseAng <= 0 && isNaN(baseAng)) return;

      if (source !== "ang") document.getElementById("unit-len-ang").value = baseAng.toFixed(5);
      if (source !== "nm") document.getElementById("unit-len-nm").value = (baseAng / 10).toFixed(6);
      if (source !== "um") document.getElementById("unit-len-um").value = (baseAng / 1e4).toExponential(4);
      if (source !== "mm") document.getElementById("unit-len-mm").value = (baseAng / 1e7).toExponential(4);
    } else if (category === "pressure") {
      var valMbar = parseFloat(document.getElementById("unit-press-mbar").value);
      var valTorr = parseFloat(document.getElementById("unit-press-torr").value);
      var valPa = parseFloat(document.getElementById("unit-press-pa").value);

      var baseMbar = 0;
      if (source === "mbar" && !isNaN(valMbar)) baseMbar = valMbar;
      else if (source === "torr" && !isNaN(valTorr)) baseMbar = valTorr * 1.33322;
      else if (source === "pa" && !isNaN(valPa)) baseMbar = valPa / 100;

      if (baseMbar <= 0 && isNaN(baseMbar)) return;

      if (source !== "mbar") document.getElementById("unit-press-mbar").value = baseMbar.toExponential(4);
      if (source !== "torr") document.getElementById("unit-press-torr").value = (baseMbar * 0.750062).toExponential(4);
      if (source !== "pa") document.getElementById("unit-press-pa").value = (baseMbar * 100).toExponential(4);
    } else if (category === "angle") {
      var valDeg = parseFloat(document.getElementById("unit-ang-deg").value);
      var valRad = parseFloat(document.getElementById("unit-ang-rad").value);
      var valMrad = parseFloat(document.getElementById("unit-ang-mrad").value);
      var valArcsec = parseFloat(document.getElementById("unit-ang-arcsec").value);

      var baseDeg = 0;
      if (source === "deg" && !isNaN(valDeg)) baseDeg = valDeg;
      else if (source === "rad" && !isNaN(valRad)) baseDeg = (valRad * 180) / Math.PI;
      else if (source === "mrad" && !isNaN(valMrad)) baseDeg = (valMrad / 1000) * (180 / Math.PI);
      else if (source === "arcsec" && !isNaN(valArcsec)) baseDeg = valArcsec / 3600;

      if (isNaN(baseDeg)) return;

      if (source !== "deg") document.getElementById("unit-ang-deg").value = baseDeg.toFixed(5);
      if (source !== "rad") document.getElementById("unit-ang-rad").value = ((baseDeg * Math.PI) / 180).toExponential(5);
      if (source !== "mrad") document.getElementById("unit-ang-mrad").value = (((baseDeg * Math.PI) / 180) * 1000).toFixed(4);
      if (source !== "arcsec") document.getElementById("unit-ang-arcsec").value = (baseDeg * 3600).toFixed(2);
    }
  }

  // --- 5.2 Interactive Crystal d-spacing DB Table ---
  function renderCrystalDB() {
    var tbody = document.getElementById("crystal-db-body");
    var searchInput = document.getElementById("crystal-search-input");
    if (!tbody) return;

    var filterText = searchInput ? searchInput.value.toLowerCase().trim() : "";
    tbody.innerHTML = "";

    var matchCount = 0;
    for (var i = 0; i < CRYSTAL_D_SPACINGS.length; i++) {
      var item = CRYSTAL_D_SPACINGS[i];
      var matches = !filterText ||
        item.material.toLowerCase().indexOf(filterText) !== -1 ||
        item.hkl.toLowerCase().indexOf(filterText) !== -1 ||
        item.system.toLowerCase().indexOf(filterText) !== -1;

      if (matches) {
        matchCount++;
        var tr = document.createElement("tr");
        tr.innerHTML =
          '<td><strong>' + item.material + '</strong></td>' +
          '<td><span class="mono">(' + item.hkl + ')</span></td>' +
          '<td class="mono" style="font-weight:700; color:var(--accent-ink);">' + item.d_spacing_A.toFixed(5) + ' Å</td>' +
          '<td class="mono">' + (item.lattice_a ? 'a = ' + item.lattice_a.toFixed(4) + ' Å' : '-') + '</td>' +
          '<td>' + item.system + '</td>' +
          '<td>' +
            '<button class="btn btn-sm btn-secondary" style="padding:1px 6px;" onclick="sendDSpacingToBragg(' + item.d_spacing_A + ')">브래그 적용</button>' +
          '</td>';
        tbody.appendChild(tr);
      }
    }

    var counter = document.getElementById("crystal-db-count");
    if (counter) counter.textContent = matchCount + " / " + CRYSTAL_D_SPACINGS.length + " reflections";
  }

  function sendDSpacingToBragg(dVal) {
    window.location.hash = "#optics";
    setTimeout(function () {
      var braggD = document.getElementById("bragg-d");
      if (braggD) {
        braggD.value = dVal;
        if (window.calcBragg) window.calcBragg();
      }
    }, 100);
  }

  // --- 5.3 Render Useful Links ---
  function renderLinks() {
    var container = document.getElementById("useful-links-container");
    if (!container) return;

    container.innerHTML = "";

    for (var i = 0; i < USEFUL_LINKS.length; i++) {
      var cat = USEFUL_LINKS[i];
      var catDiv = document.createElement("div");
      catDiv.className = "card";
      catDiv.style.marginBottom = "14px";

      var linkItems = "";
      for (var j = 0; j < cat.links.length; j++) {
        var lnk = cat.links[j];
        linkItems +=
          '<div style="padding: 8px 0; border-bottom: 1px solid var(--rule-light);">' +
            '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">' +
              '<a href="' + lnk.url + '" target="_blank" rel="noopener noreferrer" style="font-size:12px; font-weight:700;">' + lnk.title + '</a>' +
              '<span class="mono" style="font-size:10px; color:var(--ink-muted);">' + lnk.url.split("/")[2] + '</span>' +
            '</div>' +
            '<div style="font-size:11px; color:var(--ink-secondary);">' + lnk.desc + '</div>' +
          '</div>';
      }

      catDiv.innerHTML =
        '<div class="card-header"><span class="card-title">' + cat.category + '</span></div>' +
        '<div class="card-body">' + linkItems + '</div>';

      container.appendChild(catDiv);
    }
  }

  window.convertUnits = convertUnits;
  window.renderCrystalDB = renderCrystalDB;
  window.sendDSpacingToBragg = sendDSpacingToBragg;
  window.renderLinks = renderLinks;

  function renderReference() {
    renderCrystalDB();
    renderLinks();
  }

  window.renderReference = renderReference;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderReference);
  } else {
    renderReference();
  }
})();
