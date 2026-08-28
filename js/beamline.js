/**
 * XRAY.OOGUY — Beamline Physical Quantities & Geometry Engine
 * Academic Print Specification: Consolas/Mono outputs, sup tags (no unicode superscripts), zero emojis.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  // Reads a field only if it is inside the min/max declared in the markup.
  function readField(id) {
    return window.readField ? window.readField(id) : parseFloat((document.getElementById(id) || {}).value);
  }

  // Result strings are built here, so they have to go through i18n like the markup does.
  function TXT(key) {
    return (window.i18n && window.i18n.t) ? window.i18n.t(key) : key;
  }

  // One customary unit per figure; exponent form when it runs long.
  function fmt(value, digits) {
    return window.fmt ? window.fmt(value, digits) : String(value);
  }

  // --- 2.1 Beam Footprint Calculator & Geometric Diagram ---
  //
  // Two things the schematic has to get right, and they pull against each other:
  //
  //   * A grazing beam must look grazing. Drawing the true angle is useless
  //     below ~2° (the beam collapses onto the surface), but inflating every
  //     small angle to a fixed floor made 0.1° and 5° look identical. The
  //     mapping below is monotonic and compresses rather than clamps, so the
  //     picture keeps its ordering: shallower input always draws shallower.
  //   * Nothing may sit on top of anything else. The beam owns the space above
  //     the sample, so every dimension label lives below it, and the incidence
  //     label sits on the far side of the impact point, which the beam never
  //     crosses (it always arrives from the left).
  //
  function visualAngle(deg) {
    // 1:1 from 20° up; below that, a 0.6 power curve — 0.5° draws as 2.2°,
    // 5° as 8.7°, 15° as 17°. Shallow still reads shallow, and two different
    // grazing angles never draw the same.
    if (deg >= 20) return deg;
    return 20 * Math.pow(deg / 20, 0.6);
  }

  function svgText(x, y, anchor, size, fill, weight, text) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor +
      '" font-family="var(--font-mono)" font-size="' + size + '" fill="' + fill +
      '" font-weight="' + weight + '" stroke="var(--bg-paper)" stroke-width="2.6"' +
      ' paint-order="stroke" stroke-linejoin="round">' + text + '</text>';
  }

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

    // Bands: beam caption / beam / sample / footprint dimension / sample length
    var svgW = 380, svgH = 152;
    var sampleX1 = 60, sampleX2 = 340, sampleW = 280, sampleCenter = 200;
    var sampleY = 86, sampleH = 8;
    var beamBandTop = 26;

    // Footprint bar width on the surface, relative to the sample
    var ratio = footprint_mm / sampleLengthVal;
    var fpW_px;
    if (ratio <= 1) {
      fpW_px = Math.max(8, ratio * sampleW);
    } else {
      fpW_px = Math.min(370, sampleW + Math.min(110, (ratio - 1) * 70));
    }
    var fpX1 = Math.max(6, sampleCenter - fpW_px / 2);
    var fpX2 = Math.min(374, sampleCenter + fpW_px / 2);

    var visRad = (isVertical ? 90 : visualAngle(clAngle)) * Math.PI / 180;

    // The beam is drawn as a band of fixed drawn height arriving at the
    // footprint. Its horizontal run follows from the angle, and at grazing
    // incidence that run leaves the canvas — which is exactly how a grazing
    // beam should read. The viewport clips it.
    // The run is bounded so the coordinates stay sane, but the rise is then
    // derived back from it: capping the run alone would have drawn every angle
    // below ~1° with the same slope, which is the flattening this replaces.
    var bandH = sampleY - beamBandTop;
    var RUN_MAX = 2400;
    var dy, runX;
    if (isVertical) {
      dy = bandH;
      runX = 0;
    } else {
      var tanVis = Math.tan(visRad);
      dy = Math.min(bandH, RUN_MAX * tanVis);
      if (dy < 3) dy = 3;               // keep a hairline visible at the extreme
      runX = dy / tanVis;
    }

    var beamTopY = sampleY - dy;
    var topX1 = fpX1 - runX;
    var topX2 = fpX2 - runX;

    var svg = [];
    svg.push('<svg class="fp-diagram-svg" viewBox="0 0 ' + svgW + ' ' + svgH + '" preserveAspectRatio="xMidYMid meet">');

    // Surface reference line
    svg.push('<line x1="6" y1="' + sampleY + '" x2="374" y2="' + sampleY + '" stroke="var(--line-soft)" stroke-width="0.5" stroke-dasharray="2,2"/>');

    // Incident beam band + central ray
    svg.push('<polygon points="' + topX1 + ',' + beamTopY + ' ' + topX2 + ',' + beamTopY + ' ' +
      fpX2 + ',' + sampleY + ' ' + fpX1 + ',' + sampleY +
      '" fill="var(--accent-ink)" fill-opacity="0.16" stroke="var(--accent-ink)" stroke-width="1" stroke-dasharray="3,2"/>');
    svg.push('<line x1="' + ((topX1 + topX2) / 2) + '" y1="' + beamTopY + '" x2="' + sampleCenter + '" y2="' + sampleY +
      '" stroke="var(--accent-ink)" stroke-width="1.5"/>');

    // Incidence marker, always on the side the beam does not occupy
    if (isVertical) {
      var sq = 10;
      svg.push('<path d="M ' + (sampleCenter + sq) + ' ' + sampleY + ' L ' + (sampleCenter + sq) + ' ' + (sampleY - sq) +
        ' L ' + sampleCenter + ' ' + (sampleY - sq) + '" fill="none" stroke="var(--ink-secondary)" stroke-width="1.2"/>');
    } else {
      var arcR = 30;
      var arcEndX = sampleCenter - arcR * Math.cos(visRad);
      var arcEndY = sampleY - arcR * Math.sin(visRad);
      svg.push('<path d="M ' + (sampleCenter - arcR) + ' ' + sampleY + ' A ' + arcR + ' ' + arcR + ' 0 0 1 ' +
        arcEndX + ' ' + arcEndY + '" fill="none" stroke="var(--ink-secondary)" stroke-width="1.2"/>');
    }
    svg.push(svgText(sampleCenter + 16, sampleY - 12, "start", 9.5, "var(--ink-primary)", 700,
      isVertical ? "&#952; = 90&#176; (normal)" : "&#952; = " + clAngle.toFixed(2) + "&#176;"));

    // Beam caption, pinned to the top-left so it can never be clipped
    svg.push(svgText(6, 14, "start", 9, "var(--ink-secondary)", 400,
      "X-ray beam &#183; V = " + beamV_um + " &#956;m" + (clAngle < 1 ? " &#183; grazing incidence" : "")));

    // Sample stage
    svg.push('<rect x="' + sampleX1 + '" y="' + sampleY + '" width="' + sampleW + '" height="' + sampleH +
      '" fill="var(--bg-paper-hover)" stroke="var(--ink-primary)" stroke-width="1.2"/>');
    for (var tx = sampleX1 + 20; tx < sampleX2; tx += 20) {
      svg.push('<line x1="' + tx + '" y1="' + (sampleY + sampleH) + '" x2="' + (tx - 5) + '" y2="' + (sampleY + sampleH + 4) +
        '" stroke="var(--line-soft)" stroke-width="0.8"/>');
    }

    // Illuminated strip on the surface, with the part that misses the sample
    if (isSpill) {
      if (fpX1 < sampleX1) {
        svg.push('<rect x="' + fpX1 + '" y="' + (sampleY - 3) + '" width="' + (sampleX1 - fpX1) +
          '" height="4" fill="var(--danger)" fill-opacity="0.35" stroke="var(--danger)" stroke-width="1" stroke-dasharray="2,2"/>');
      }
      if (fpX2 > sampleX2) {
        svg.push('<rect x="' + sampleX2 + '" y="' + (sampleY - 3) + '" width="' + (fpX2 - sampleX2) +
          '" height="4" fill="var(--danger)" fill-opacity="0.35" stroke="var(--danger)" stroke-width="1" stroke-dasharray="2,2"/>');
      }
      var inX1 = Math.max(sampleX1, fpX1);
      var inX2 = Math.min(sampleX2, fpX2);
      svg.push('<rect x="' + inX1 + '" y="' + (sampleY - 3) + '" width="' + (inX2 - inX1) +
        '" height="4" fill="var(--accent-ink)" stroke="var(--accent-ink)" stroke-width="1.2"/>');
    } else {
      svg.push('<rect x="' + fpX1 + '" y="' + (sampleY - 3) + '" width="' + (fpX2 - fpX1) +
        '" height="4" fill="var(--accent-ink)" stroke="var(--accent-ink)" stroke-width="1.2"/>');
    }

    // Both dimensions sit below the stage, where the beam never reaches
    var fpDimY = sampleY + sampleH + 14;
    svg.push('<line x1="' + fpX1 + '" y1="' + fpDimY + '" x2="' + fpX2 + '" y2="' + fpDimY + '" stroke="var(--ink-primary)" stroke-width="1"/>');
    svg.push('<line x1="' + fpX1 + '" y1="' + (fpDimY - 3) + '" x2="' + fpX1 + '" y2="' + (fpDimY + 3) + '" stroke="var(--ink-primary)" stroke-width="1"/>');
    svg.push('<line x1="' + fpX2 + '" y1="' + (fpDimY - 3) + '" x2="' + fpX2 + '" y2="' + (fpDimY + 3) + '" stroke="var(--ink-primary)" stroke-width="1"/>');
    svg.push(svgText(sampleCenter, fpDimY + 12, "middle", 9.5, isSpill ? "var(--danger)" : "var(--ink-primary)", 700,
      "Footprint L = " + footprint_mm.toFixed(3) + " mm"));

    var sampleDimY = fpDimY + 22;
    svg.push('<line x1="' + sampleX1 + '" y1="' + sampleDimY + '" x2="' + sampleX2 + '" y2="' + sampleDimY + '" stroke="var(--ink-secondary)" stroke-width="1"/>');
    svg.push('<line x1="' + sampleX1 + '" y1="' + (sampleDimY - 3) + '" x2="' + sampleX1 + '" y2="' + (sampleDimY + 3) + '" stroke="var(--ink-secondary)" stroke-width="1"/>');
    svg.push('<line x1="' + sampleX2 + '" y1="' + (sampleDimY - 3) + '" x2="' + sampleX2 + '" y2="' + (sampleDimY + 3) + '" stroke="var(--ink-secondary)" stroke-width="1"/>');
    svg.push(svgText(sampleCenter, sampleDimY + 11, "middle", 9, "var(--ink-secondary)", 400,
      "Sample length = " + (hasSample ? sampleL_mm.toFixed(1) + " mm" : "15.0 mm (default)")));

    svg.push('</svg>');

    var html = '<div class="fp-diagram-header">' +
      '<span class="fp-diagram-title">GEOMETRIC BEAM FOOTPRINT SCHEMATIC</span>' +
      '<span class="' + badgeClass + '">' + badgeText + '</span>' +
      '</div>' +
      svg.join('');

    container.innerHTML = html;
  }

  function calcFootprint() {
    var beamH_um = readField("fp-beam-h");
    var beamV_um = readField("fp-beam-v");
    var incAngleDeg = readField("fp-inc-angle");
    var sampleL_mm = readField("fp-sample-len");

    if (isNaN(beamV_um) || beamV_um <= 0 || isNaN(beamH_um) || beamH_um <= 0) return;
    if (isNaN(incAngleDeg) || incAngleDeg <= 0 || incAngleDeg > 90) return;

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
    var resMin = document.getElementById("fp-res-minangle");

    if (resFp) resFp.innerHTML = fmt(footprint_mm, 3) + " mm";
    if (resH) resH.innerHTML = beamH_um.toFixed(1) + " μm";

    // The angle at which the footprint is exactly the sample length. Below it
    // the beam is on the holder. This is the only thing the reader could not
    // get from the schematic, which shows the geometry they already have and
    // not the one they need to move to.
    if (resMin) {
      if (!(sampleL_mm > 0)) {
        resMin.innerHTML = "-";
      } else {
        var sinMin = (beamV_um / 1000) / sampleL_mm;
        resMin.innerHTML = sinMin <= 1
          ? fmt(Math.asin(sinMin) * 180 / Math.PI, 3) + "°"
          : TXT("res_fp_never");            // taller than the sample at any angle
      }
    }

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
      window.recordCalculation("card-beamline-footprint", "V = " + beamV_um + " μm @ " + clAngle + "°", "L = " + footprint_mm.toFixed(3) + " mm");
    }
  }

  // --- 2.2 Beam Flux & Attenuation Calculator ---
  function calcBeamFlux() {
    var ringCurrent_mA = readField("flux-current");
    var baseFlux_per_mA = readField("flux-source-base");
    var monoEff = readField("flux-mono-eff") / 100;
    var mirrorEff = readField("flux-mirror-eff") / 100;
    var windowTrans = readField("flux-window-trans") / 100;

    if (isNaN(ringCurrent_mA) || ringCurrent_mA < 0) return;
    if (isNaN(baseFlux_per_mA) || baseFlux_per_mA < 0) return;
    if (isNaN(monoEff) || isNaN(mirrorEff) || isNaN(windowTrans)) return;

    var totalEff = monoEff * mirrorEff * windowTrans;
    var deliveredFlux = ringCurrent_mA * baseFlux_per_mA * totalEff;

    document.getElementById("flux-res-total").innerHTML = deliveredFlux.toExponential(3) + " ph·s<sup>-1</sup>";
    document.getElementById("flux-res-eff").innerHTML = (totalEff * 100).toFixed(2) + "%";

    if (window.recordCalculation) {
      window.recordCalculation("card-beamline-flux", ringCurrent_mA + " mA, η = " + (totalEff * 100).toFixed(1) + "%", deliveredFlux.toExponential(2) + " ph·s<sup>-1</sup>");
    }
  }

  // --- 2.3 Energy Resolution (ΔE / E) ---
  function calcEnergyResolution() {
    var crystalType = document.getElementById("res-crystal").value;
    var energy_keV = readField("res-energy");
    var beamDiv_urad = readField("res-div");

    if (isNaN(energy_keV) || energy_keV <= 0 || isNaN(beamDiv_urad) || beamDiv_urad < 0) return;

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

    document.getElementById("res-res-de-over-e").innerHTML = total_de_over_e.toExponential(3);
    document.getElementById("res-res-delta-e").innerHTML = fmt(delta_E_eV, 3) + " eV";
    document.getElementById("res-res-theta").innerHTML = ((thetaRad * 180) / Math.PI).toFixed(3) + "°";

    if (window.recordCalculation) {
      window.recordCalculation("card-beamline-resolution", crystalType + " @ " + energy_keV + " keV", "ΔE = " + delta_E_eV.toFixed(2) + " eV (ΔE/E = " + total_de_over_e.toExponential(2) + ")");
    }
  }

  // --- 2.4 Angular Resolution (Δθ = Pixel / Distance) ---
  function calcAngularResolution() {
    var pixelSize_um = readField("ang-pixel");
    var distance_mm = readField("ang-dist");

    if (isNaN(pixelSize_um) || pixelSize_um <= 0 || isNaN(distance_mm) || distance_mm <= 0) return;

    var pixel_mm = pixelSize_um / 1000;
    var deltaTheta_rad = pixel_mm / distance_mm;
    var deltaTheta_mrad = deltaTheta_rad * 1000;
    var deltaTheta_deg = (deltaTheta_rad * 180) / Math.PI;
    var deltaTheta_arcsec = deltaTheta_deg * 3600;

    document.getElementById("ang-res-mrad").innerHTML = deltaTheta_mrad.toFixed(4) + " mrad";
    document.getElementById("ang-res-deg").innerHTML = fmt(deltaTheta_deg, 5) + "°";

    if (window.recordCalculation) {
      window.recordCalculation("card-beamline-detector", "Pixel=" + pixelSize_um + " μm, Dist=" + distance_mm + " mm", "Δθ = " + deltaTheta_mrad.toFixed(4) + " mrad (" + deltaTheta_arcsec.toFixed(1) + " arcsec)");
    }
  }

  // --- 2.5 CDI / BCDI Oversampling Calculator ---
  function calcCDIOversampling() {
    var energy_keV = readField("cdi-energy");
    var dist_m = readField("cdi-dist");
    var pixel_um = readField("cdi-pixel");
    var sampleSize_nm = readField("cdi-sample-size");

    if (isNaN(energy_keV) || energy_keV <= 0 || isNaN(dist_m) || dist_m <= 0) return;
    if (isNaN(pixel_um) || pixel_um <= 0 || isNaN(sampleSize_nm) || sampleSize_nm <= 0) return;

    var lambda_nm = CONSTANTS.hc_keV_nm / energy_keV;
    var dist_nm = dist_m * 1e9;
    var pixel_nm = pixel_um * 1000;

    var speckle_um = ((lambda_nm * dist_nm) / sampleSize_nm) / 1000;
    var sigma = speckle_um / pixel_um;

    var resSigma = document.getElementById("cdi-res-sigma");
    var resSpeckle = document.getElementById("cdi-res-speckle");
    var resVerdict = document.getElementById("cdi-res-verdict");

    resSigma.innerHTML = sigma.toFixed(2);
    resSpeckle.innerHTML = fmt(speckle_um, 2) + " μm";

    if (sigma >= 2.0) {
      resVerdict.innerHTML = TXT("res_cdi_pass");
    } else if (sigma >= 1.5) {
      resVerdict.innerHTML = TXT("res_cdi_marginal");
    } else {
      resVerdict.innerHTML = TXT("res_cdi_fail");
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-beamline-cdi", sampleSize_nm + " nm @ " + energy_keV + " keV", "σ = " + sigma.toFixed(2) + " (" + (sigma >= 2 ? "Pass" : "Fail") + ")");
    }
  }

  // --- 2.6 Slit Size & Geometric Acceptance ---
  function calcSlitAcceptance() {
    var sourceSize_um = readField("slit-source");
    var distSourceToSlit_m = readField("slit-dist");
    var beamDiv_urad = readField("slit-div");
    var sigmaMult = readField("slit-sig-mult");

    if (isNaN(sourceSize_um) || sourceSize_um < 0 || isNaN(beamDiv_urad) || beamDiv_urad < 0) return;
    if (isNaN(distSourceToSlit_m) || distSourceToSlit_m <= 0) return;

    var source_mm = sourceSize_um / 1000;
    var expansion_mm = (distSourceToSlit_m * 1000) * (beamDiv_urad * 1e-6);
    var beamFWHM_mm = Math.sqrt(Math.pow(source_mm, 2) + Math.pow(expansion_mm, 2));

    var recommendedOpening_mm = beamFWHM_mm * (sigmaMult / 2.355);

    document.getElementById("slit-res-fwhm").innerHTML = fmt(beamFWHM_mm, 3) + " mm";
    document.getElementById("slit-res-opening").innerHTML = fmt(recommendedOpening_mm, 3) + " mm";

    if (window.recordCalculation) {
      window.recordCalculation("card-beamline-slit", "Dist=" + distSourceToSlit_m + " m, Div=" + beamDiv_urad + " μrad", "Opening = " + recommendedOpening_mm.toFixed(3) + " mm");
    }
  }

  // --- 2.7 Thermal Expansion Correction ---
  function calcThermalShift() {
    var matSelect = document.getElementById("therm-mat").value;
    var deltaTemp_C = readField("therm-temp");
    var energy_keV = readField("therm-energy");

    if (isNaN(deltaTemp_C) || isNaN(energy_keV) || energy_keV <= 0) return;   // ΔT may be negative

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

    document.getElementById("therm-res-urad").innerHTML = fmt(deltaTheta_urad, 3) + " μrad";
    document.getElementById("therm-res-de").innerHTML = deltaE_eV.toFixed(3) + " eV";

    if (window.recordCalculation) {
      window.recordCalculation("card-beamline-drift", matSelect + ", ΔT=" + deltaTemp_C + "°C", "Δθ = " + deltaTheta_urad.toFixed(2) + " μrad (" + deltaE_eV.toFixed(2) + " eV)");
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
  window.calcScanTime = calcScanTime;
  window.calcDose = calcDose;
  window.calcAbsorberStack = calcAbsorberStack;
  window.calcCoherenceLength = calcCoherenceLength;
  window.calcRealSpaceResolution = calcRealSpaceResolution;

  // ==================================================================
  // Shared: linear attenuation coefficient
  // ==================================================================
  // Same power-law extrapolation from the tabulated 10 keV beta that the
  // transmittance card uses, so the dose and absorber cards cannot disagree
  // with it. The absorption-edge caveat is the same one too, and each card
  // states it through its own validity entry.
  //
  // Returns mu in cm^-1.
  function muOf(mat, energy_keV) {
    if (!mat || !(energy_keV > 0)) return NaN;
    var beta = mat.beta_10keV * Math.pow(10.0 / energy_keV, 3.5);
    var lambda_cm = (CONSTANTS.hc_keV_nm * 10 / energy_keV) * 1e-8;
    return (4 * Math.PI * beta) / lambda_cm;
  }

  // The transmittance plot draws the same quantity the cards compute, and a
  // plot that disagrees with the number beside it is worse than no plot.
  window.muOf = muOf;

  function materialAt(selectId) {
    var el = document.getElementById(selectId);
    if (!el) return null;
    var idx = parseInt(el.value, 10);
    if (isNaN(idx)) return null;
    return MATERIALS_DB[idx] || null;
  }

  // Fills a <select> with the material list once.
  function fillMaterialSelect(id, defaultIndex) {
    var sel = document.getElementById(id);
    if (!sel || sel.options.length) return;
    for (var i = 0; i < MATERIALS_DB.length; i++) {
      var opt = document.createElement("option");
      opt.value = i;
      opt.textContent = MATERIALS_DB[i].name;
      sel.appendChild(opt);
    }
    if (defaultIndex !== undefined && MATERIALS_DB[defaultIndex]) sel.value = String(defaultIndex);
  }

  // Seconds as something a person reads off a clock. Beamtime is counted in
  // hours and shifts, and 27143 s is not a number anyone can act on.
  function duration(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "-";
    if (seconds < 60) return fmt(seconds, 2) + " s";

    var s = Math.round(seconds);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;

    if (h >= 24) {
      var d = Math.floor(h / 24);
      return d + " d " + (h % 24) + " h " + m + " min";
    }
    if (h > 0) return h + " h " + m + " min " + sec + " s";
    return m + " min " + sec + " s";
  }

  // ==================================================================
  // Scan time & shift budget
  // ==================================================================
  // Points times dwell plus per-point overhead. The overhead is the term people
  // leave out and then wonder where the shift went: a motor that settles for
  // 0.3 s costs two extra minutes on a 401-point scan, and forty on a map.
  function calcScanTime() {
    var n1 = readField("rad-scan-n1");
    var n2 = readField("rad-scan-n2");
    var dwell = readField("rad-scan-dwell");
    var overhead = readField("rad-scan-overhead");
    var repeats = readField("rad-scan-repeats");
    var shift_h = readField("rad-scan-shift");

    if (isNaN(n1) || isNaN(n2) || isNaN(dwell) || isNaN(overhead) || isNaN(repeats)) return;
    if (n1 < 1 || n2 < 1 || repeats < 1 || dwell <= 0 || overhead < 0) return;

    var points = Math.round(n1) * Math.round(n2);
    var each = points * (dwell + overhead);
    var total = each * Math.round(repeats);

    var totalEl = document.getElementById("rad-scan-res-total");
    if (!totalEl) return;

    totalEl.innerHTML = duration(total);
    document.getElementById("rad-scan-res-each").innerHTML = duration(each);
    document.getElementById("rad-scan-res-points").innerHTML = points.toLocaleString
      ? points.toLocaleString("en-US")
      : String(points);

    // Turn the question round: given the beamtime left, how long can each point
    // count for? Negative overhead-only cases fall out as a non-answer.
    var budget_s = (isNaN(shift_h) ? NaN : shift_h * 3600);
    var maxDwell = NaN;
    if (!isNaN(budget_s) && points > 0 && repeats > 0) {
      maxDwell = budget_s / (points * Math.round(repeats)) - overhead;
    }
    document.getElementById("rad-scan-res-maxdwell").innerHTML =
      (isNaN(maxDwell) || maxDwell <= 0) ? "-" : fmt(maxDwell, 3) + " s";

    var verdict = document.getElementById("rad-scan-res-verdict");
    if (verdict) {
      if (isNaN(budget_s) || budget_s <= 0) {
        verdict.innerHTML = "-";
      } else if (total <= budget_s) {
        verdict.innerHTML = TXT("res_scan_fits") + " (" + duration(budget_s - total) + " " + TXT("res_scan_spare") + ")";
      } else {
        verdict.innerHTML = TXT("res_scan_over") + " (" + duration(total - budget_s) + ")";
      }
    }

    // Two durations printed side by side still leave the reader dividing them.
    // The bar is the division: how much of the beamtime this scan is, and
    // whether it lands before the tick.
    if (window.renderGauge) {
      window.renderGauge("card-rad-scantime", "gauge_scan",
        (isNaN(budget_s) || budget_s <= 0) ? null : {
          value: total,
          limit: budget_s,
          pass: total <= budget_s,
          valueText: TXT("gauge_scan_total") + " " + duration(total),
          limitText: TXT("gauge_scan_left") + " " + duration(budget_s),
          ratioText: (total / budget_s * 100).toFixed(0) + "% " + TXT("gauge_scan_of_shift")
        });
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-rad-scantime",
        points + " pts × " + dwell + " s + " + overhead + " s × " + Math.round(repeats),
        duration(total));
    }
  }

  // ==================================================================
  // Absorbed dose & exposure limit
  // ==================================================================
  // D = F t E (1 - T) / (rho A d). The numerator is the energy stopped in the
  // illuminated volume, the denominator its mass.
  //
  // Note what happens as the sample gets thin: (1 - e^-mu d)/d tends to mu, so
  // the dose rate stops depending on thickness. That is the right behaviour —
  // a thinner sample absorbs less energy into proportionally less material.
  function calcDose() {
    var energy_keV = readField("rad-dose-energy");
    var flux = readField("rad-dose-flux");
    var bh_um = readField("rad-dose-bh");
    var bv_um = readField("rad-dose-bv");
    var thick_um = readField("rad-dose-thick");
    var time_s = readField("rad-dose-time");
    var limit_Gy = readField("rad-dose-limit");
    var mat = materialAt("rad-dose-mat");

    if (!mat) return;
    if (isNaN(energy_keV) || energy_keV <= 0 || isNaN(flux) || flux <= 0) return;
    if (isNaN(bh_um) || bh_um <= 0 || isNaN(bv_um) || bv_um <= 0) return;
    if (isNaN(thick_um) || thick_um <= 0 || isNaN(time_s) || time_s <= 0) return;

    var mu_cm = muOf(mat, energy_keV);
    if (!isFinite(mu_cm) || mu_cm <= 0) return;

    var d_cm = thick_um * 1e-4;
    var absorbedFrac = 1 - Math.exp(-mu_cm * d_cm);

    var area_cm2 = (bh_um * 1e-4) * (bv_um * 1e-4);
    var mass_g = mat.density_g_cm3 * area_cm2 * d_cm;
    var mass_kg = mass_g * 1e-3;

    // keV to joules.
    var E_J = energy_keV * 1000 * CONSTANTS.e;

    var doseRate = (flux * E_J * absorbedFrac) / mass_kg;   // Gy/s
    var doseTotal = doseRate * time_s;

    var rateEl = document.getElementById("rad-dose-res-rate");
    if (!rateEl) return;

    rateEl.innerHTML = doseRate.toExponential(3) + " Gy·s<sup>-1</sup>";
    document.getElementById("rad-dose-res-total").innerHTML = doseTotal.toExponential(3) + " Gy";
    document.getElementById("rad-dose-res-abs").innerHTML = (absorbedFrac * 100).toFixed(3) + "%";

    var ttl = (!isNaN(limit_Gy) && limit_Gy > 0 && doseRate > 0) ? (limit_Gy / doseRate) : NaN;
    document.getElementById("rad-dose-res-ttl").innerHTML = isNaN(ttl) ? "-" : duration(ttl);

    if (window.recordCalculation) {
      window.recordCalculation("card-rad-dose",
        mat.name + ", " + thick_um + " μm @ " + energy_keV + " keV, " + flux.toExponential(1) + " ph/s",
        doseRate.toExponential(2) + " Gy/s, " + doseTotal.toExponential(2) + " Gy in " + time_s + " s");
    }
  }

  // ==================================================================
  // Absorber stack
  // ==================================================================
  // Four foils in series, and the inverse: the thickness of the first material
  // that would reach the attenuation asked for. A foil left at zero thickness
  // contributes a transmission of 1 and is simply not in the stack.
  var ABSORBER_ROWS = 4;

  function calcAbsorberStack() {
    var energy_keV = readField("rad-abs-energy");
    if (isNaN(energy_keV) || energy_keV <= 0) return;

    var totalEl = document.getElementById("rad-abs-res-total");
    if (!totalEl) return;

    var stackT = 1;
    var firstMat = null;

    for (var i = 1; i <= ABSORBER_ROWS; i++) {
      var mat = materialAt("rad-abs-mat-" + i);
      var d_um = readField("rad-abs-d-" + i);
      var cell = document.getElementById("rad-abs-t-" + i);
      if (i === 1) firstMat = mat;

      if (!mat || isNaN(d_um) || d_um <= 0) {
        if (cell) cell.innerHTML = "—";
        continue;
      }

      var mu = muOf(mat, energy_keV);
      var T = Math.exp(-mu * d_um * 1e-4);
      stackT *= T;
      if (cell) cell.innerHTML = (T * 100).toFixed(3) + "%";
    }

    totalEl.innerHTML = (stackT * 100).toExponential(3) + "%";
    document.getElementById("rad-abs-res-factor").innerHTML =
      stackT > 0 ? (1 / stackT).toExponential(3) + " ×" : "-";

    // Inverse: d = ln(factor) / mu, in the first foil's material.
    var target = readField("rad-abs-target");
    var needEl = document.getElementById("rad-abs-res-need");
    if (needEl) {
      var muFirst = muOf(firstMat, energy_keV);
      if (firstMat && !isNaN(target) && target > 1 && isFinite(muFirst) && muFirst > 0) {
        var d_needed_um = (Math.log(target) / muFirst) * 1e4;
        needEl.innerHTML = firstMat.name + " " + fmt(d_needed_um, 1) + " μm";
      } else {
        needEl.innerHTML = "-";
      }
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-rad-absorber",
        "stack @ " + energy_keV + " keV",
        "T = " + (stackT * 100).toExponential(2) + "%, " + (stackT > 0 ? (1 / stackT).toExponential(2) : "-") + " ×");
    }
  }

  // ==================================================================
  // Coherence lengths at the sample
  // ==================================================================
  // The oversampling card asks whether the detector samples the fringes finely
  // enough. It cannot ask whether there are fringes to sample. A geometry can
  // pass sigma >= 2 and still be un-invertible, because the illumination was
  // never coherent across the crystal in the first place.
  //
  // Transverse, from van Cittert-Zernike with a Gaussian source:
  //
  //     xi_t = lambda R / (2 S)        S = source size FWHM
  //
  // The factor of 2 is a convention — some write lambda R / (2 pi sigma) with
  // sigma the RMS size, which for a Gaussian differs by about 6%. The card
  // states which one it uses rather than leaving the reader to guess.
  //
  // Longitudinal, from the bandwidth:
  //
  //     xi_l = lambda^2 / (2 dlambda) = lambda / (2 dE/E)
  //
  // and the path difference a Bragg geometry actually imposes is what it has to
  // be compared against: 2 d sin(theta) over the crystal, which for a crystal of
  // size L at scattering angle 2theta is about L * 2 sin(theta) — the fringes
  // wash out once that exceeds xi_l.
  function calcCoherenceLength() {
    var energy_keV = readField("coh-energy");
    var bandwidth = readField("coh-bandwidth");
    var srcH_um = readField("coh-src-h");
    var srcV_um = readField("coh-src-v");
    var dist_m = readField("coh-dist");
    var sample_nm = readField("coh-sample");

    if (isNaN(energy_keV) || energy_keV <= 0) return;
    if (isNaN(srcH_um) || srcH_um <= 0 || isNaN(srcV_um) || srcV_um <= 0) return;
    if (isNaN(dist_m) || dist_m <= 0 || isNaN(bandwidth) || bandwidth <= 0) return;

    var out = document.getElementById("coh-res-xth");
    if (!out) return;

    var lambda_nm = CONSTANTS.hc_keV_nm / energy_keV;
    var lambda_m = lambda_nm * 1e-9;

    var xtH_um = (lambda_m * dist_m) / (2 * srcH_um * 1e-6) * 1e6;
    var xtV_um = (lambda_m * dist_m) / (2 * srcV_um * 1e-6) * 1e6;
    var xl_nm = lambda_nm / (2 * bandwidth);

    out.innerHTML = fmt(xtH_um, 3) + " μm";
    document.getElementById("coh-res-xtv").innerHTML = fmt(xtV_um, 3) + " μm";
    document.getElementById("coh-res-xl").innerHTML = fmt(xl_nm, 1) + " nm";

    // The path difference the longitudinal coherence has to cover, taken at the
    // worst case of back-scattering, where 2 sin(theta) reaches 2.
    var path_nm = isNaN(sample_nm) ? NaN : 2 * sample_nm;
    document.getElementById("coh-res-path").innerHTML =
      isNaN(path_nm) ? "-" : fmt(path_nm, 1) + " nm";

    var verdict = document.getElementById("coh-res-verdict");
    if (verdict) {
      if (isNaN(sample_nm) || sample_nm <= 0) {
        verdict.innerHTML = "-";
      } else {
        var sample_um = sample_nm / 1000;
        var tight = Math.min(xtH_um, xtV_um);
        var ratio = tight / sample_um;
        if (ratio >= 2) verdict.innerHTML = TXT("res_coh_ok") + " (×" + fmt(ratio, 1) + ")";
        else if (ratio >= 1) verdict.innerHTML = TXT("res_coh_marginal") + " (×" + fmt(ratio, 2) + ")";
        else verdict.innerHTML = TXT("res_coh_fail") + " (×" + fmt(ratio, 2) + ")";
      }
    }

    // The verdict above says pass, marginal or fail. The bar says by how much,
    // and against what — the coherence has to reach across the whole feature,
    // so the tick is the sample and being short of it is being short of the
    // experiment. The tighter of the two transverse directions is the one that
    // decides, which is not obvious from two numbers printed in a row.
    if (window.renderGauge) {
      var tightest_um = Math.min(xtH_um, xtV_um);
      window.renderGauge("card-coh-length", "gauge_coh",
        (isNaN(sample_nm) || sample_nm <= 0) ? null : {
          value: tightest_um,
          limit: sample_nm / 1000,
          pass: tightest_um >= sample_nm / 1000,
          goodBelow: false,          // the coherence has to reach past the tick
          valueText: TXT("gauge_coh_xt") + " " + fmt(tightest_um, 2) + " μm",
          limitText: TXT("gauge_coh_sample") + " " + fmt(sample_nm / 1000, 2) + " μm",
          ratioText: "×" + fmt(tightest_um / (sample_nm / 1000), 2)
        });
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-coh-length",
        energy_keV + " keV, " + srcH_um + "×" + srcV_um + " μm @ " + dist_m + " m",
        "ξt = " + fmt(xtH_um, 2) + " / " + fmt(xtV_um, 2) + " μm, ξl = " + fmt(xl_nm, 1) + " nm");
    }
  }

  // ==================================================================
  // Reachable real-space resolution
  // ==================================================================
  // Delta r = lambda D / (N p): the detector extent used sets the highest
  // spatial frequency recorded, and that sets the smallest feature a
  // reconstruction can carry. This is the number a BCDI result is quoted at,
  // and the oversampling ratio says nothing about it.
  function calcRealSpaceResolution() {
    var energy_keV = readField("cres-energy");
    var dist_m = readField("cres-dist");
    var pixel_um = readField("cres-pixel");
    var npix = readField("cres-npix");

    if (isNaN(energy_keV) || energy_keV <= 0 || isNaN(dist_m) || dist_m <= 0) return;
    if (isNaN(pixel_um) || pixel_um <= 0 || isNaN(npix) || npix < 2) return;

    var out = document.getElementById("cres-res-dr");
    if (!out) return;

    var lambda_nm = CONSTANTS.hc_keV_nm / energy_keV;
    var extent_mm = (npix * pixel_um) / 1000;
    var dist_mm = dist_m * 1000;

    var dr_nm = (lambda_nm * dist_mm) / extent_mm;

    // Half-span, because the resolution is set by the distance from the centre
    // of the pattern out to the edge of the region used.
    var halfSpan_rad = Math.atan((extent_mm / 2) / dist_mm);
    var theta = halfSpan_rad / 2;
    var qmax = (4 * Math.PI * Math.sin(theta)) / (lambda_nm * 10);   // A^-1

    out.innerHTML = fmt(dr_nm, 2) + " nm";
    document.getElementById("cres-res-qmax").innerHTML = fmt(qmax, 4) + " Å<sup>-1</sup>";
    document.getElementById("cres-res-span").innerHTML =
      fmt(halfSpan_rad * 180 / Math.PI, 4) + "°";
    document.getElementById("cres-res-extent").innerHTML = fmt(extent_mm, 2) + " mm";

    if (window.recordCalculation) {
      window.recordCalculation("card-coh-resolution",
        energy_keV + " keV, " + Math.round(npix) + " px × " + pixel_um + " μm @ " + dist_m + " m",
        "Δr = " + fmt(dr_nm, 2) + " nm");
    }
  }

  function initBeamlineView() {
    fillMaterialSelect("rad-dose-mat", 0);
    fillMaterialSelect("rad-abs-mat-1", 7);   // Aluminium: the drawer's default
    fillMaterialSelect("rad-abs-mat-2", 7);
    fillMaterialSelect("rad-abs-mat-3", 6);   // Copper
    fillMaterialSelect("rad-abs-mat-4", 0);   // Silicon

    calcFootprint();
    calcBeamFlux();
    calcEnergyResolution();
    calcAngularResolution();
    calcCDIOversampling();
    calcSlitAcceptance();
    calcThermalShift();
    calcScanTime();
    calcDose();
    calcAbsorberStack();
    calcCoherenceLength();
    calcRealSpaceResolution();
  }

  window.initBeamlineView = initBeamlineView;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBeamlineView);
  } else {
    initBeamlineView();
  }
})();
