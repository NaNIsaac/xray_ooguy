/**
 * BEAMLINE TOOLKIT — Beamline Physical Quantities & Geometry Engine
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 * Note: No optional chaining (?.), no CSS Grid.
 */

(function () {
  "use strict";

  // --- 1. Beam Footprint Calculator ---
  function calcFootprint() {
    var beamH_um = parseFloat(document.getElementById("fp-beam-h").value);
    var beamV_um = parseFloat(document.getElementById("fp-beam-v").value);
    var incAngleDeg = parseFloat(document.getElementById("fp-inc-angle").value);
    var sampleL_mm = parseFloat(document.getElementById("fp-sample-len").value);

    if (isNaN(beamV_um) || isNaN(incAngleDeg) || incAngleDeg <= 0) return;

    var thetaRad = (incAngleDeg * Math.PI) / 180;
    var sinTheta = Math.sin(thetaRad);

    // Vertical beam footprint on sample along the beam direction
    var footprint_mm = (beamV_um / 1000) / sinTheta;
    var sampleL_um = (sampleL_mm || 10) * 1000;
    var spilloverPct = 0;

    if (sampleL_mm > 0 && footprint_mm > sampleL_mm) {
      spilloverPct = ((footprint_mm - sampleL_mm) / footprint_mm) * 100;
    }

    var resFp = document.getElementById("fp-res-len");
    var resSpill = document.getElementById("fp-res-spill");
    var resH = document.getElementById("fp-res-h");

    resFp.textContent = footprint_mm.toFixed(3) + " mm (" + (footprint_mm * 1000).toFixed(0) + " μm)";
    resH.textContent = beamH_um.toFixed(1) + " μm (수평 유지)";

    if (sampleL_mm > 0) {
      if (spilloverPct > 0) {
        resSpill.textContent = "경고: 시료 초과 (" + spilloverPct.toFixed(1) + "% 빔 손실)";
        resSpill.style.color = "var(--red)";
      } else {
        resSpill.textContent = "정상: 시료 내 100% 수용 (" + ((footprint_mm / sampleL_mm) * 100).toFixed(1) + "% 차지)";
        resSpill.style.color = "var(--green)";
      }
    } else {
      resSpill.textContent = "시료 길이 미입력";
      resSpill.style.color = "var(--text-sub)";
    }

    if (window.recordCalculation) {
      window.recordCalculation("Beam Footprint", "V=" + beamV_um + " μm @ " + incAngleDeg + "°", "풋프린트 = " + footprint_mm.toFixed(3) + " mm");
    }
  }

  // --- 2. Beam Flux & Attenuation Calculator ---
  function calcBeamFlux() {
    var ringCurrent_mA = parseFloat(document.getElementById("flux-current").value);
    var baseFlux_per_mA = parseFloat(document.getElementById("flux-source-base").value);
    var monoEff = parseFloat(document.getElementById("flux-mono-eff").value) / 100;
    var mirrorEff = parseFloat(document.getElementById("flux-mirror-eff").value) / 100;
    var windowTrans = parseFloat(document.getElementById("flux-window-trans").value) / 100;

    if (isNaN(ringCurrent_mA) || isNaN(baseFlux_per_mA)) return;

    var totalEff = monoEff * mirrorEff * windowTrans;
    var deliveredFlux = ringCurrent_mA * baseFlux_per_mA * totalEff;

    document.getElementById("flux-res-total").textContent = deliveredFlux.toExponential(3) + " ph/s";
    document.getElementById("flux-res-eff").textContent = (totalEff * 100).toFixed(2) + "% 전송 효율";

    if (window.recordCalculation) {
      window.recordCalculation("Beam Flux", ringCurrent_mA + " mA, η=" + (totalEff * 100).toFixed(1) + "%", deliveredFlux.toExponential(2) + " photons/sec");
    }
  }

  // --- 3. Energy Resolution (ΔE / E) ---
  function calcEnergyResolution() {
    var crystalType = document.getElementById("res-crystal").value;
    var energy_keV = parseFloat(document.getElementById("res-energy").value);
    var beamDiv_urad = parseFloat(document.getElementById("res-div").value); // micro-radian

    if (isNaN(energy_keV) || energy_keV <= 0) return;

    // Intrinsic Darwin width (dE/E)_intrinsic for Si(111) is ~ 1.3e-4, Si(311) is ~ 2.8e-5, Ge(111) is ~ 3.2e-4
    var darwin_de_over_e = 1.33e-4;
    var d_spacing_A = 3.1356; // Si(111)

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
      document.getElementById("res-res-de-over-e").textContent = "에너지 범위 초과";
      return;
    }

    var thetaRad = Math.asin(sinTheta);
    var tanTheta = Math.tan(thetaRad);

    // Geometric divergence contribution = div / tan(theta)
    var divRad = (beamDiv_urad || 0) * 1e-6;
    var div_contrib = divRad / tanTheta;
    var total_de_over_e = Math.sqrt(Math.pow(darwin_de_over_e, 2) + Math.pow(div_contrib, 2));
    var delta_E_eV = total_de_over_e * energy_keV * 1000;

    document.getElementById("res-res-de-over-e").textContent = total_de_over_e.toExponential(3) + " (ΔE/E)";
    document.getElementById("res-res-delta-e").textContent = delta_E_eV.toFixed(3) + " eV (" + (delta_E_eV * 1000).toFixed(1) + " meV)";
    document.getElementById("res-res-theta").textContent = ((thetaRad * 180) / Math.PI).toFixed(3) + "° (브래그 각도)";

    if (window.recordCalculation) {
      window.recordCalculation("Energy Resolution", crystalType + " @ " + energy_keV + " keV", "ΔE=" + delta_E_eV.toFixed(2) + " eV (ΔE/E=" + total_de_over_e.toExponential(2) + ")");
    }
  }

  // --- 4. Angular Resolution (Δθ = Pixel / Distance) ---
  function calcAngularResolution() {
    var pixelSize_um = parseFloat(document.getElementById("ang-pixel").value);
    var distance_mm = parseFloat(document.getElementById("ang-dist").value);

    if (isNaN(pixelSize_um) || isNaN(distance_mm) || distance_mm <= 0) return;

    var pixel_mm = pixelSize_um / 1000;
    var deltaTheta_rad = pixel_mm / distance_mm;
    var deltaTheta_mrad = deltaTheta_rad * 1000;
    var deltaTheta_deg = (deltaTheta_rad * 180) / Math.PI;
    var deltaTheta_arcsec = deltaTheta_deg * 3600;

    document.getElementById("ang-res-mrad").textContent = deltaTheta_mrad.toFixed(4) + " mrad";
    document.getElementById("ang-res-deg").textContent = deltaTheta_deg.toFixed(5) + "° (" + deltaTheta_arcsec.toFixed(2) + " arcsec)";

    if (window.recordCalculation) {
      window.recordCalculation("Angular Resolution", "Pixel=" + pixelSize_um + " μm, Dist=" + distance_mm + " mm", "Δθ = " + deltaTheta_mrad.toFixed(4) + " mrad (" + deltaTheta_arcsec.toFixed(1) + "\")");
    }
  }

  // --- 5. CDI / BCDI Oversampling Calculator ---
  function calcCDIOversampling() {
    var energy_keV = parseFloat(document.getElementById("cdi-energy").value);
    var dist_m = parseFloat(document.getElementById("cdi-dist").value);
    var pixel_um = parseFloat(document.getElementById("cdi-pixel").value);
    var sampleSize_nm = parseFloat(document.getElementById("cdi-sample-size").value);

    if (isNaN(energy_keV) || isNaN(dist_m) || isNaN(pixel_um) || isNaN(sampleSize_nm) || sampleSize_nm <= 0) return;

    var lambda_nm = CONSTANTS.hc_keV_nm / energy_keV;
    var dist_nm = dist_m * 1e9;
    var pixel_nm = pixel_um * 1000;

    // Speckle size at detector S_speckle = lambda * dist / sampleSize
    var speckle_um = ((lambda_nm * dist_nm) / sampleSize_nm) / 1000;

    // Oversampling ratio sigma = speckle_um / pixel_um = (lambda * dist) / (pixel * sample)
    var sigma = speckle_um / pixel_um;

    var resSigma = document.getElementById("cdi-res-sigma");
    var resSpeckle = document.getElementById("cdi-res-speckle");
    var resVerdict = document.getElementById("cdi-res-verdict");

    resSigma.textContent = sigma.toFixed(2) + "x (σ)";
    resSpeckle.textContent = speckle_um.toFixed(2) + " μm (스펙클 크기)";

    if (sigma >= 2.0) {
      resVerdict.textContent = "충족: 나이퀴스트 오버샘플링 성립 (σ ≥ 2)";
      resVerdict.className = "badge badge-green";
    } else if (sigma >= 1.5) {
      resVerdict.textContent = "주의: 한계 오버샘플링 (1.5 ≤ σ < 2)";
      resVerdict.className = "badge badge-orange";
    } else {
      resVerdict.textContent = "불가: 언더샘플링 / 앨리어싱 발생 (σ < 1.5)";
      resVerdict.className = "badge badge-red";
    }

    if (window.recordCalculation) {
      window.recordCalculation("CDI Oversampling", sampleSize_nm + " nm @ " + energy_keV + " keV", "σ=" + sigma.toFixed(2) + "x (" + (sigma >= 2 ? "Pass" : "Fail") + ")");
    }
  }

  // --- 6. Slit Size & Geometric Acceptance ---
  function calcSlitAcceptance() {
    var sourceSize_um = parseFloat(document.getElementById("slit-source").value);
    var distSourceToSlit_m = parseFloat(document.getElementById("slit-dist").value);
    var beamDiv_urad = parseFloat(document.getElementById("slit-div").value);
    var sigmaMult = parseFloat(document.getElementById("slit-sig-mult").value); // e.g. 2, 3

    if (isNaN(sourceSize_um) || isNaN(distSourceToSlit_m) || isNaN(beamDiv_urad)) return;

    // Beam size at slit = sqrt( (source_size)^2 + (dist * div)^2 )
    var source_mm = sourceSize_um / 1000;
    var expansion_mm = (distSourceToSlit_m * 1000) * (beamDiv_urad * 1e-6);
    var beamFWHM_mm = Math.sqrt(Math.pow(source_mm, 2) + Math.pow(expansion_mm, 2));

    var recommendedOpening_mm = beamFWHM_mm * (sigmaMult / 2.355); // converting FWHM to sigma

    document.getElementById("slit-res-fwhm").textContent = beamFWHM_mm.toFixed(3) + " mm (" + (beamFWHM_mm * 1000).toFixed(0) + " μm)";
    document.getElementById("slit-res-opening").textContent = recommendedOpening_mm.toFixed(3) + " mm (" + (recommendedOpening_mm * 1000).toFixed(0) + " μm, " + sigmaMult + "σ)";

    if (window.recordCalculation) {
      window.recordCalculation("Slit Opening", "Dist=" + distSourceToSlit_m + " m, Div=" + beamDiv_urad + " μrad", "슬릿 권장폭 = " + recommendedOpening_mm.toFixed(3) + " mm");
    }
  }

  // --- 7. Thermal Expansion Correction ---
  function calcThermalShift() {
    var matSelect = document.getElementById("therm-mat").value;
    var deltaTemp_C = parseFloat(document.getElementById("therm-temp").value);
    var energy_keV = parseFloat(document.getElementById("therm-energy").value);

    if (isNaN(deltaTemp_C) || isNaN(energy_keV) || energy_keV <= 0) return;

    // Linear thermal expansion coefficient alpha (K^-1)
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

    // Delta d / d = alpha * Delta T
    // Delta theta_B = - alpha * Delta T * tan(theta_B)
    var deltaTheta_rad = -alpha * deltaTemp_C * tanTheta;
    var deltaTheta_urad = deltaTheta_rad * 1e6;
    var deltaTheta_arcsec = (deltaTheta_rad * 180 / Math.PI) * 3600;
    var deltaE_eV = alpha * deltaTemp_C * energy_keV * 1000;

    document.getElementById("therm-res-urad").textContent = deltaTheta_urad.toFixed(3) + " μrad (" + deltaTheta_arcsec.toFixed(3) + " arcsec)";
    document.getElementById("therm-res-de").textContent = deltaE_eV.toFixed(3) + " eV (에너지 시프트)";

    if (window.recordCalculation) {
      window.recordCalculation("Thermal Shift", matSelect + ", ΔT=" + deltaTemp_C + "°C", "Δθ=" + deltaTheta_urad.toFixed(2) + " μrad (" + deltaE_eV.toFixed(2) + " eV)");
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
