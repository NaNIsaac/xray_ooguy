/**
 * BEAMLINE TOOLKIT — Beamline Physical Quantities & Geometry Engine
 * Academic Print Specification: Consolas/Mono outputs, sup tags (no unicode superscripts), zero emojis.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  // Result strings are built here, so they have to go through i18n like the markup does.
  function TXT(key) {
    return (window.i18n && window.i18n.t) ? window.i18n.t(key) : key;
  }

  // --- 2.1 Beam Footprint Calculator & Geometric Diagram ---
  function renderFootprintDiagram(beamV_um, beamH_um, incAngleDeg, sampleL_mm, footprint_mm, spilloverPct) {
    var container = document.getElementById("fp-diagram-box");
    if (!container) return;

    if (isNaN(beamV_um) || beamV_um <= 0 || isNaN(incAngleDeg) || incAngleDeg <= 0) {
      container.innerHTML = "";
      return;
    }

    var clAngle = Math.min(90, Math.max(0.001, incAngleDeg));
    var isVertical = (clAngle >= 89.99);

    var hasSample = !isNaN(sampleL_mm) && sampleL_mm > 0;
    var sampleLengthVal = hasSample ? sampleL_mm : 15;
    var isSpill = hasSample && (footprint_mm > sampleLengthVal);
    var coveragePct = hasSample ? Math.min(999, ((footprint_mm / sampleLengthVal) * 100)).toFixed(1) : "-";

    var badgeClass = isSpill ? "fp-diagram-badge spill" : "fp-diagram-badge ok";
    var badgeText = isSpill
      ? "SPILLOVER (" + spilloverPct.toFixed(1) + "% LOSS)"
      : (hasSample ? "100% IN SAMPLE (" + coveragePct + "%)" : "CALCULATED");

    // Geometric mapping coordinates
    var svgW = 380, svgH = 115;
    var sampleX1 = 70, sampleX2 = 330, sampleW = 260;
    var sampleY = 72, sampleH = 8;
    var sampleCenter = 200;

    // Footprint width mapping
    var ratio = footprint_mm / sampleLengthVal;
    var fpW_px;
    if (ratio <= 1) {
      fpW_px = Math.max(8, ratio * sampleW);
    } else {
      fpW_px = Math.min(360, sampleW + Math.min(100, (ratio - 1) * 70));
    }

    var fpX1 = Math.max(10, sampleCenter - fpW_px / 2);
    var fpX2 = Math.min(370, sampleCenter + fpW_px / 2);

    // Visual angle mapping: exactly 90 deg when 90, exact 1:1 above 15 deg, smooth grazing scale below 15 deg
    var visAngleDeg;
    if (isVertical) {
      visAngleDeg = 90;
    } else if (clAngle >= 15) {
      visAngleDeg = clAngle;
    } else {
      visAngleDeg = 6 + clAngle * 0.6;
    }
    var visAngleRad = (visAngleDeg * Math.PI) / 180;

    // Beam rays
    var beamH_px = 46;
    var beamTopY = sampleY - beamH_px;
    var srcX1, srcX2;
    if (isVertical) {
      srcX1 = fpX1;
      srcX2 = fpX2;
    } else {
      var beamShiftX = beamH_px / Math.tan(visAngleRad);
      srcX1 = Math.max(5, fpX1 - beamShiftX);
      srcX2 = Math.max(15, fpX2 - beamShiftX);
    }

    var svg = [];
    svg.push('<svg class="fp-diagram-svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="xMidYMid meet">');
    
    // Grid reference line
    svg.push('<line x1="10" y1="' + sampleY + '" x2="370" y2="' + sampleY + '" stroke="var(--line-soft)" stroke-width="0.5" stroke-dasharray="2,2"/>');

    // Incident Beam Cone Polygon
    svg.push('<polygon points="' + srcX1 + ',' + beamTopY + ' ' + srcX2 + ',' + beamTopY + ' ' + fpX2 + ',' + sampleY + ' ' + fpX1 + ',' + sampleY + '" fill="var(--accent-ink)" fill-opacity="0.16" stroke="var(--accent-ink)" stroke-width="1" stroke-dasharray="3,2"/>');

    // Center beam ray with direction
    var srcMidX = (srcX1 + srcX2) / 2;
    svg.push('<line x1="' + srcMidX + '" y1="' + beamTopY + '" x2="' + sampleCenter + '" y2="' + sampleY + '" stroke="var(--accent-ink)" stroke-width="1.5"/>');

    // Incidence Angle indicator arc & text
    if (isVertical) {
      // Right angle square indicator
      var sqSize = 10;
      svg.push('<path d="M ' + (sampleCenter - sqSize) + ' ' + sampleY + ' L ' + (sampleCenter - sqSize) + ' ' + (sampleY - sqSize) + ' L ' + sampleCenter + ' ' + (sampleY - sqSize) + '" fill="none" stroke="var(--ink-secondary)" stroke-width="1.2"/>');
      svg.push('<text x="' + (sampleCenter - sqSize - 4) + '" y="' + (sampleY - 14) + '" text-anchor="end" font-family="var(--font-mono)" font-size="9.5" fill="var(--ink-primary)" font-weight="700">θ=90° (수직 입사)</text>');
    } else {
      var arcR = 24;
      var arcStartX = sampleCenter - arcR;
      var arcEndX = sampleCenter - arcR * Math.cos(visAngleRad);
      var arcEndY = sampleY - arcR * Math.sin(visAngleRad);
      svg.push('<path d="M ' + arcStartX + ' ' + sampleY + ' A ' + arcR + ' ' + arcR + ' 0 0 1 ' + arcEndX + ' ' + arcEndY + '" fill="none" stroke="var(--ink-secondary)" stroke-width="1.2"/>');
      svg.push('<text x="' + (sampleCenter - arcR - 4) + '" y="' + (sampleY - 8) + '" text-anchor="end" font-family="var(--font-mono)" font-size="9.5" fill="var(--ink-primary)" font-weight="700">θ=' + clAngle.toFixed(2) + '°</text>');
    }

    // Beam thickness callout
    svg.push('<text x="' + Math.min(360, Math.max(10, srcMidX)) + '" y="' + (beamTopY - 4) + '" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--ink-secondary)">X-ray Beam (V=' + beamV_um + 'μm)</text>');

    // Sample Stage Substrate
    svg.push('<rect x="' + sampleX1 + '" y="' + sampleY + '" width="' + sampleW + '" height="' + sampleH + '" fill="var(--bg-paper-hover)" stroke="var(--ink-primary)" stroke-width="1.2"/>');
    // Sample Stage mounting ticks
    for (var tx = sampleX1 + 20; tx < sampleX2; tx += 20) {
      svg.push('<line x1="' + tx + '" y1="' + (sampleY + sampleH) + '" x2="' + (tx - 5) + '" y2="' + (sampleY + sampleH + 4) + '" stroke="var(--line-soft)" stroke-width="0.8"/>');
    }

    // Footprint Layer on sample surface
    if (isSpill) {
      // Left spill
      if (fpX1 < sampleX1) {
        svg.push('<rect x="' + fpX1 + '" y="' + (sampleY - 3) + '" width="' + (sampleX1 - fpX1) + '" height="4" fill="#d32f2f" fill-opacity="0.35" stroke="#d32f2f" stroke-width="1" stroke-dasharray="2,2"/>');
      }
      // Right spill
      if (fpX2 > sampleX2) {
        svg.push('<rect x="' + sampleX2 + '" y="' + (sampleY - 3) + '" width="' + (fpX2 - sampleX2) + '" height="4" fill="#d32f2f" fill-opacity="0.35" stroke="#d32f2f" stroke-width="1" stroke-dasharray="2,2"/>');
      }
      // Inside sample portion
      var inX1 = Math.max(sampleX1, fpX1);
      var inX2 = Math.min(sampleX2, fpX2);
      svg.push('<rect x="' + inX1 + '" y="' + (sampleY - 3) + '" width="' + (inX2 - inX1) + '" height="4" fill="var(--accent-ink)" stroke="var(--accent-ink)" stroke-width="1.2"/>');
    } else {
      svg.push('<rect x="' + fpX1 + '" y="' + (sampleY - 3) + '" width="' + (fpX2 - fpX1) + '" height="4" fill="var(--accent-ink)" stroke="var(--accent-ink)" stroke-width="1.2"/>');
    }

    // Footprint Dimension Bracket & Text (above sample)
    var fpDimY = sampleY - 6;
    svg.push('<line x1="' + fpX1 + '" y1="' + fpDimY + '" x2="' + fpX2 + '" y2="' + fpDimY + '" stroke="var(--ink-primary)" stroke-width="1"/>');
    svg.push('<line x1="' + fpX1 + '" y1="' + (fpDimY - 3) + '" x2="' + fpX1 + '" y2="' + (fpDimY + 3) + '" stroke="var(--ink-primary)" stroke-width="1"/>');
    svg.push('<line x1="' + fpX2 + '" y1="' + (fpDimY - 3) + '" x2="' + fpX2 + '" y2="' + (fpDimY + 3) + '" stroke="var(--ink-primary)" stroke-width="1"/>');
    svg.push('<text x="' + sampleCenter + '" y="' + (fpDimY - 4) + '" text-anchor="middle" font-family="var(--font-mono)" font-size="9.5" font-weight="700" fill="' + (isSpill ? '#d32f2f' : 'var(--ink-primary)') + '">Footprint L = ' + footprint_mm.toFixed(3) + ' mm</text>');

    // Sample Length Dimension Bracket & Text (below sample)
    var sampleDimY = sampleY + sampleH + 8;
    svg.push('<line x1="' + sampleX1 + '" y1="' + sampleDimY + '" x2="' + sampleX2 + '" y2="' + sampleDimY + '" stroke="var(--ink-secondary)" stroke-width="1"/>');
    svg.push('<line x1="' + sampleX1 + '" y1="' + (sampleDimY - 3) + '" x2="' + sampleX1 + '" y2="' + (sampleDimY + 3) + '" stroke="var(--ink-secondary)" stroke-width="1"/>');
    svg.push('<line x1="' + sampleX2 + '" y1="' + (sampleDimY - 3) + '" x2="' + sampleX2 + '" y2="' + (sampleDimY + 3) + '" stroke="var(--ink-secondary)" stroke-width="1"/>');
    svg.push('<text x="' + sampleCenter + '" y="' + (sampleDimY + 11) + '" text-anchor="middle" font-family="var(--font-mono)" font-size="9" fill="var(--ink-secondary)">Sample Length = ' + (hasSample ? sampleL_mm.toFixed(1) + ' mm' : '15.0 mm (Default)') + '</text>');

    svg.push('</svg>');

    var html = '<div class="fp-diagram-header">' +
      '<span class="fp-diagram-title">GEOMETRIC BEAM FOOTPRINT SCHEMATIC</span>' +
      '<span class="' + badgeClass + '">' + badgeText + '</span>' +
      '</div>' +
      svg.join('');

    container.innerHTML = html;
  }

  function calcFootprint() {
    var beamH_um = parseFloat(document.getElementById("fp-beam-h").value);
    var beamV_um = parseFloat(document.getElementById("fp-beam-v").value);
    var incAngleDeg = parseFloat(document.getElementById("fp-inc-angle").value);
    var sampleL_mm = parseFloat(document.getElementById("fp-sample-len").value);

    if (isNaN(beamV_um) || isNaN(incAngleDeg) || incAngleDeg <= 0) return;

    var clAngle = Math.min(90, Math.max(0.001, incAngleDeg));
    var thetaRad = (clAngle * Math.PI) / 180;
    var sinTheta = Math.sin(thetaRad);

    var footprint_mm = (beamV_um / 1000) / sinTheta;
    var spilloverPct = 0;

    if (sampleL_mm > 0 && footprint_mm > sampleL_mm) {
      spilloverPct = ((footprint_mm - sampleL_mm) / footprint_mm) * 100;
    }

    var resFp = document.getElementById("fp-res-len");
    var resSpill = document.getElementById("fp-res-spill");
    var resH = document.getElementById("fp-res-h");

    if (resFp) resFp.innerHTML = footprint_mm.toFixed(3) + " mm (" + (footprint_mm * 1000).toFixed(0) + " μm)";
    if (resH) resH.innerHTML = beamH_um.toFixed(1) + " μm";

    if (resSpill) {
      if (sampleL_mm > 0) {
        if (spilloverPct > 0) {
          resSpill.innerHTML = TXT("res_fp_spill") + " (" + spilloverPct.toFixed(1) + "%)";
          resSpill.style.color = "var(--ink-primary)";
        } else {
          resSpill.innerHTML = TXT("res_fp_ok") + " (" + ((footprint_mm / sampleL_mm) * 100).toFixed(1) + "%)";
          resSpill.style.color = "var(--accent-ink)";
        }
      } else {
        resSpill.innerHTML = TXT("res_fp_nolen");
        resSpill.style.color = "var(--ink-muted)";
      }
    }

    // Render Geometric Schematic
    renderFootprintDiagram(beamV_um, beamH_um, clAngle, sampleL_mm, footprint_mm, spilloverPct);

    if (window.recordCalculation) {
      window.recordCalculation("2.1 Beam Footprint", "V = " + beamV_um + " μm @ " + clAngle + "°", "L = " + footprint_mm.toFixed(3) + " mm");
    }
  }

  // --- 2.2 Beam Flux & Attenuation Calculator ---
  function calcBeamFlux() {
    var ringCurrent_mA = parseFloat(document.getElementById("flux-current").value);
    var baseFlux_per_mA = parseFloat(document.getElementById("flux-source-base").value);
    var monoEff = parseFloat(document.getElementById("flux-mono-eff").value) / 100;
    var mirrorEff = parseFloat(document.getElementById("flux-mirror-eff").value) / 100;
    var windowTrans = parseFloat(document.getElementById("flux-window-trans").value) / 100;

    if (isNaN(ringCurrent_mA) || isNaN(baseFlux_per_mA)) return;

    var totalEff = monoEff * mirrorEff * windowTrans;
    var deliveredFlux = ringCurrent_mA * baseFlux_per_mA * totalEff;

    document.getElementById("flux-res-total").innerHTML = deliveredFlux.toExponential(3) + " ph·s<sup>-1</sup>";
    document.getElementById("flux-res-eff").innerHTML = (totalEff * 100).toFixed(2) + "%";

    if (window.recordCalculation) {
      window.recordCalculation("2.2 Beam Flux", ringCurrent_mA + " mA, η = " + (totalEff * 100).toFixed(1) + "%", deliveredFlux.toExponential(2) + " ph·s<sup>-1</sup>");
    }
  }

  // --- 2.3 Energy Resolution (ΔE / E) ---
  function calcEnergyResolution() {
    var crystalType = document.getElementById("res-crystal").value;
    var energy_keV = parseFloat(document.getElementById("res-energy").value);
    var beamDiv_urad = parseFloat(document.getElementById("res-div").value);

    if (isNaN(energy_keV) || energy_keV <= 0) return;

    var darwin_de_over_e = 1.33e-4;
    var d_spacing_A = 3.1356;

    if (crystalType === "si311") {
      darwin_de_over_e = 2.8e-5;
      d_spacing_A = 1.6375;
    } else if (crystalType === "ge111") {
      darwin_de_over_e = 3.2e-4;
      d_spacing_A = 3.2664;
    }

    var lambda_A = CONSTANTS.hc_keV_nm * 10 / energy_keV;
    var sinTheta = lambda_A / (2 * d_spacing_A);
    if (sinTheta > 1) {
      document.getElementById("res-res-de-over-e").innerHTML = TXT("res_out_of_range");
      return;
    }

    var thetaRad = Math.asin(sinTheta);
    var tanTheta = Math.tan(thetaRad);

    var divRad = (beamDiv_urad || 0) * 1e-6;
    var div_contrib = divRad / tanTheta;
    var total_de_over_e = Math.sqrt(Math.pow(darwin_de_over_e, 2) + Math.pow(div_contrib, 2));
    var delta_E_eV = total_de_over_e * energy_keV * 1000;

    document.getElementById("res-res-de-over-e").innerHTML = total_de_over_e.toExponential(3) + " (ΔE/E)";
    document.getElementById("res-res-delta-e").innerHTML = delta_E_eV.toFixed(3) + " eV (" + (delta_E_eV * 1000).toFixed(1) + " meV)";
    document.getElementById("res-res-theta").innerHTML = ((thetaRad * 180) / Math.PI).toFixed(3) + "° (θ)";

    if (window.recordCalculation) {
      window.recordCalculation("2.3 Resolution", crystalType + " @ " + energy_keV + " keV", "ΔE = " + delta_E_eV.toFixed(2) + " eV (ΔE/E = " + total_de_over_e.toExponential(2) + ")");
    }
  }

  // --- 2.4 Angular Resolution (Δθ = Pixel / Distance) ---
  function calcAngularResolution() {
    var pixelSize_um = parseFloat(document.getElementById("ang-pixel").value);
    var distance_mm = parseFloat(document.getElementById("ang-dist").value);

    if (isNaN(pixelSize_um) || isNaN(distance_mm) || distance_mm <= 0) return;

    var pixel_mm = pixelSize_um / 1000;
    var deltaTheta_rad = pixel_mm / distance_mm;
    var deltaTheta_mrad = deltaTheta_rad * 1000;
    var deltaTheta_deg = (deltaTheta_rad * 180) / Math.PI;
    var deltaTheta_arcsec = deltaTheta_deg * 3600;

    document.getElementById("ang-res-mrad").innerHTML = deltaTheta_mrad.toFixed(4) + " mrad";
    document.getElementById("ang-res-deg").innerHTML = deltaTheta_deg.toFixed(5) + "° (" + deltaTheta_arcsec.toFixed(2) + " arcsec)";

    if (window.recordCalculation) {
      window.recordCalculation("2.4 Angular Res", "Pixel=" + pixelSize_um + " μm, Dist=" + distance_mm + " mm", "Δθ = " + deltaTheta_mrad.toFixed(4) + " mrad (" + deltaTheta_arcsec.toFixed(1) + " arcsec)");
    }
  }

  // --- 2.5 CDI / BCDI Oversampling Calculator ---
  function calcCDIOversampling() {
    var energy_keV = parseFloat(document.getElementById("cdi-energy").value);
    var dist_m = parseFloat(document.getElementById("cdi-dist").value);
    var pixel_um = parseFloat(document.getElementById("cdi-pixel").value);
    var sampleSize_nm = parseFloat(document.getElementById("cdi-sample-size").value);

    if (isNaN(energy_keV) || isNaN(dist_m) || isNaN(pixel_um) || isNaN(sampleSize_nm) || sampleSize_nm <= 0) return;

    var lambda_nm = CONSTANTS.hc_keV_nm / energy_keV;
    var dist_nm = dist_m * 1e9;
    var pixel_nm = pixel_um * 1000;

    var speckle_um = ((lambda_nm * dist_nm) / sampleSize_nm) / 1000;
    var sigma = speckle_um / pixel_um;

    var resSigma = document.getElementById("cdi-res-sigma");
    var resSpeckle = document.getElementById("cdi-res-speckle");
    var resVerdict = document.getElementById("cdi-res-verdict");

    resSigma.innerHTML = sigma.toFixed(2) + " (σ)";
    resSpeckle.innerHTML = speckle_um.toFixed(2) + " μm";

    if (sigma >= 2.0) {
      resVerdict.innerHTML = TXT("res_cdi_pass");
    } else if (sigma >= 1.5) {
      resVerdict.innerHTML = TXT("res_cdi_marginal");
    } else {
      resVerdict.innerHTML = TXT("res_cdi_fail");
    }

    if (window.recordCalculation) {
      window.recordCalculation("2.5 CDI Oversampling", sampleSize_nm + " nm @ " + energy_keV + " keV", "σ = " + sigma.toFixed(2) + " (" + (sigma >= 2 ? "Pass" : "Fail") + ")");
    }
  }

  // --- 2.6 Slit Size & Geometric Acceptance ---
  function calcSlitAcceptance() {
    var sourceSize_um = parseFloat(document.getElementById("slit-source").value);
    var distSourceToSlit_m = parseFloat(document.getElementById("slit-dist").value);
    var beamDiv_urad = parseFloat(document.getElementById("slit-div").value);
    var sigmaMult = parseFloat(document.getElementById("slit-sig-mult").value);

    if (isNaN(sourceSize_um) || isNaN(distSourceToSlit_m) || isNaN(beamDiv_urad)) return;

    var source_mm = sourceSize_um / 1000;
    var expansion_mm = (distSourceToSlit_m * 1000) * (beamDiv_urad * 1e-6);
    var beamFWHM_mm = Math.sqrt(Math.pow(source_mm, 2) + Math.pow(expansion_mm, 2));

    var recommendedOpening_mm = beamFWHM_mm * (sigmaMult / 2.355);

    document.getElementById("slit-res-fwhm").innerHTML = beamFWHM_mm.toFixed(3) + " mm (" + (beamFWHM_mm * 1000).toFixed(0) + " μm)";
    document.getElementById("slit-res-opening").innerHTML = recommendedOpening_mm.toFixed(3) + " mm (" + (recommendedOpening_mm * 1000).toFixed(0) + " μm, " + sigmaMult + "σ)";

    if (window.recordCalculation) {
      window.recordCalculation("2.6 Slit Opening", "Dist=" + distSourceToSlit_m + " m, Div=" + beamDiv_urad + " μrad", "Opening = " + recommendedOpening_mm.toFixed(3) + " mm");
    }
  }

  // --- 2.7 Thermal Expansion Correction ---
  function calcThermalShift() {
    var matSelect = document.getElementById("therm-mat").value;
    var deltaTemp_C = parseFloat(document.getElementById("therm-temp").value);
    var energy_keV = parseFloat(document.getElementById("therm-energy").value);

    if (isNaN(deltaTemp_C) || isNaN(energy_keV) || energy_keV <= 0) return;

    var alpha = 2.6e-6; // Silicon at 300K
    var d_spacing_A = 3.1356; // Si(111)

    if (matSelect === "diamond") {
      alpha = 1.0e-6;
      d_spacing_A = 2.0594;
    } else if (matSelect === "ge") {
      alpha = 5.9e-6;
      d_spacing_A = 3.2664;
    }

    var lambda_A = CONSTANTS.hc_keV_nm * 10 / energy_keV;
    var sinTheta = lambda_A / (2 * d_spacing_A);
    if (sinTheta > 1) return;

    var thetaRad = Math.asin(sinTheta);
    var tanTheta = Math.tan(thetaRad);

    var deltaTheta_rad = -alpha * deltaTemp_C * tanTheta;
    var deltaTheta_urad = deltaTheta_rad * 1e6;
    var deltaTheta_arcsec = (deltaTheta_rad * 180 / Math.PI) * 3600;
    var deltaE_eV = alpha * deltaTemp_C * energy_keV * 1000;

    document.getElementById("therm-res-urad").innerHTML = deltaTheta_urad.toFixed(3) + " μrad (" + deltaTheta_arcsec.toFixed(3) + " arcsec)";
    document.getElementById("therm-res-de").innerHTML = deltaE_eV.toFixed(3) + " eV";

    if (window.recordCalculation) {
      window.recordCalculation("2.7 Thermal Drift", matSelect + ", ΔT=" + deltaTemp_C + "°C", "Δθ = " + deltaTheta_urad.toFixed(2) + " μrad (" + deltaE_eV.toFixed(2) + " eV)");
    }
  }

  // Export functions
  window.calcFootprint = calcFootprint;
  window.calcBeamFlux = calcBeamFlux;
  window.calcEnergyResolution = calcEnergyResolution;
  window.calcAngularResolution = calcAngularResolution;
  window.calcCDIOversampling = calcCDIOversampling;
  window.calcSlitAcceptance = calcSlitAcceptance;
  window.calcThermalShift = calcThermalShift;

  function initBeamlineView() {
    calcFootprint();
    calcBeamFlux();
    calcEnergyResolution();
    calcAngularResolution();
    calcCDIOversampling();
    calcSlitAcceptance();
    calcThermalShift();
  }

  window.initBeamlineView = initBeamlineView;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBeamlineView);
  } else {
    initBeamlineView();
  }
})();
