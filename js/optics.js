/**
 * BEAMLINE TOOLKIT — Optics Calculation Engine
 * Academic Print Specification: Consolas/Mono outputs, sup tags (no unicode superscripts), zero emojis.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  // --- 1. Energy - Wavelength - Frequency Converter ---
  function calcEnergyConverter(sourceField) {
    var hc_eV_A = CONSTANTS.hc_eV_A;
    var hc_keV_nm = CONSTANTS.hc_keV_nm;
    var h = CONSTANTS.h;
    var e = CONSTANTS.e;
    var c = CONSTANTS.c;

    var inputEv = document.getElementById("optics-conv-ev");
    var inputKev = document.getElementById("optics-conv-kev");
    var inputNm = document.getElementById("optics-conv-nm");
    var inputAng = document.getElementById("optics-conv-ang");
    var inputHz = document.getElementById("optics-conv-hz");

    var energy_eV = 0;

    if (sourceField === "ev") {
      energy_eV = parseFloat(inputEv.value);
    } else if (sourceField === "kev") {
      energy_eV = parseFloat(inputKev.value) * 1000;
    } else if (sourceField === "nm") {
      var nm = parseFloat(inputNm.value);
      if (nm > 0) energy_eV = (hc_keV_nm / nm) * 1000;
    } else if (sourceField === "ang") {
      var ang = parseFloat(inputAng.value);
      if (ang > 0) energy_eV = hc_eV_A / ang;
    } else if (sourceField === "hz") {
      var hz = parseFloat(inputHz.value);
      if (hz > 0) energy_eV = (h * hz) / e;
    }

    if (isNaN(energy_eV) || energy_eV <= 0) return;

    var energy_keV = energy_eV / 1000;
    var lambda_A = hc_eV_A / energy_eV;
    var lambda_nm = lambda_A / 10;
    var freq_Hz = (energy_eV * e) / h;

    if (sourceField !== "ev") inputEv.value = energy_eV.toFixed(3);
    if (sourceField !== "kev") inputKev.value = energy_keV.toFixed(5);
    if (sourceField !== "nm") inputNm.value = lambda_nm.toFixed(5);
    if (sourceField !== "ang") inputAng.value = lambda_A.toFixed(5);
    if (sourceField !== "hz") inputHz.value = freq_Hz.toExponential(4);

    var resSummary = document.getElementById("optics-conv-summary");
    if (resSummary) {
      resSummary.innerHTML = energy_keV.toFixed(4) + " keV ⟷ " + lambda_A.toFixed(4) + " Å ⟷ " + freq_Hz.toExponential(3) + " Hz";
    }

    if (window.recordCalculation) {
      window.recordCalculation("1.1 Energy/Wavelength", sourceField + " = " + energy_eV.toFixed(2) + " eV", lambda_A.toFixed(4) + " Å (" + energy_keV.toFixed(4) + " keV)");
    }
  }

  // --- 2. Bragg's Law Calculator (λ = 2d sin θ) ---
  function calcBragg() {
    var hc_eV_A = CONSTANTS.hc_eV_A;
    var dVal = parseFloat(document.getElementById("bragg-d").value);
    var energy_keV = parseFloat(document.getElementById("bragg-energy").value);
    var thetaDegInput = parseFloat(document.getElementById("bragg-theta-input").value);
    var calcMode = document.getElementById("bragg-mode").value; // 'find_theta' or 'find_energy'

    var resThetaDeg = document.getElementById("bragg-res-theta");
    var resTwoThetaDeg = document.getElementById("bragg-res-twotheta");
    var resEnergy = document.getElementById("bragg-res-energy");
    var resLambda = document.getElementById("bragg-res-lambda");
    var resQ = document.getElementById("bragg-res-q");

    if (calcMode === "find_theta") {
      if (isNaN(dVal) || dVal <= 0 || isNaN(energy_keV) || energy_keV <= 0) return;
      var lambda_A = hc_eV_A / (energy_keV * 1000);
      var sinTheta = lambda_A / (2 * dVal);

      if (sinTheta > 1) {
        resThetaDeg.innerHTML = "회절 불가 (λ > 2d)";
        resTwoThetaDeg.innerHTML = "N/A";
        resLambda.innerHTML = lambda_A.toFixed(5) + " Å";
        resQ.innerHTML = "N/A";
        return;
      }

      var thetaRad = Math.asin(sinTheta);
      var thetaDeg = (thetaRad * 180) / Math.PI;
      var twoThetaDeg = thetaDeg * 2;
      var qVal = (4 * Math.PI / lambda_A) * sinTheta;

      resThetaDeg.innerHTML = thetaDeg.toFixed(4) + "° (" + (thetaRad * 1000).toFixed(3) + " mrad)";
      resTwoThetaDeg.innerHTML = twoThetaDeg.toFixed(4) + "°";
      resLambda.innerHTML = lambda_A.toFixed(5) + " Å";
      resQ.innerHTML = qVal.toFixed(4) + " Å<sup>-1</sup> (" + (qVal * 10).toFixed(3) + " nm<sup>-1</sup>)";

      if (window.recordCalculation) {
        window.recordCalculation("1.2 Bragg θ Calc", "E=" + energy_keV + " keV, d=" + dVal + " Å", "θ=" + thetaDeg.toFixed(4) + "°, 2θ=" + twoThetaDeg.toFixed(4) + "°");
      }
    } else {
      // Find Energy from Theta
      if (isNaN(dVal) || dVal <= 0 || isNaN(thetaDegInput) || thetaDegInput <= 0 || thetaDegInput >= 90) return;
      var thetaRad2 = (thetaDegInput * Math.PI) / 180;
      var lambda_A2 = 2 * dVal * Math.sin(thetaRad2);
      var energy_eV2 = hc_eV_A / lambda_A2;
      var energy_keV2 = energy_eV2 / 1000;
      var qVal2 = (4 * Math.PI / lambda_A2) * Math.sin(thetaRad2);

      resThetaDeg.innerHTML = thetaDegInput.toFixed(4) + "°";
      resTwoThetaDeg.innerHTML = (thetaDegInput * 2).toFixed(4) + "°";
      resEnergy.innerHTML = energy_keV2.toFixed(4) + " keV (" + energy_eV2.toFixed(1) + " eV)";
      resLambda.innerHTML = lambda_A2.toFixed(5) + " Å";
      resQ.innerHTML = qVal2.toFixed(4) + " Å<sup>-1</sup>";

      if (window.recordCalculation) {
        window.recordCalculation("1.2 Bragg E Calc", "θ=" + thetaDegInput + "°, d=" + dVal + " Å", "E=" + energy_keV2.toFixed(4) + " keV");
      }
    }
  }

  // Preset picker for Bragg d-spacing
  function applyBraggPreset(dVal, name) {
    var input = document.getElementById("bragg-d");
    if (input) {
      input.value = dVal;
      calcBragg();
      if (window.showToast) {
        window.showToast("결정면 " + name + " (d = " + dVal + " Å) 적용 완료", "info");
      }
    }
  }

  // --- 3. Grating Diffraction Calculator (mλ = d(sin α + sin β)) ---
  function calcGrating() {
    var linesPerMm = parseFloat(document.getElementById("grating-lines").value);
    var energy_eV = parseFloat(document.getElementById("grating-energy").value);
    var alphaDeg = parseFloat(document.getElementById("grating-alpha").value);
    var order = parseInt(document.getElementById("grating-order").value, 10);

    if (isNaN(linesPerMm) || linesPerMm <= 0 || isNaN(energy_eV) || energy_eV <= 0) return;

    var lambda_nm = (CONSTANTS.hc_keV_nm * 1000) / energy_eV;
    var d_nm = 1e6 / linesPerMm; // d in nm
    var alphaRad = (alphaDeg * Math.PI) / 180;

    var sinBeta = (order * lambda_nm) / d_nm - Math.sin(alphaRad);

    var resBeta = document.getElementById("grating-res-beta");
    var resDispersion = document.getElementById("grating-res-disp");
    var resLambda = document.getElementById("grating-res-lambda");

    if (Math.abs(sinBeta) > 1) {
      resBeta.innerHTML = "회절 불가 (|sin β| > 1)";
      resDispersion.innerHTML = "N/A";
      return;
    }

    var betaRad = Math.asin(sinBeta);
    var betaDeg = (betaRad * 180) / Math.PI;

    var cosBeta = Math.cos(betaRad);
    var dispersion_rad_per_nm = cosBeta !== 0 ? Math.abs(order / (d_nm * cosBeta)) : 0;
    var dispersion_mrad_per_eV = (dispersion_rad_per_nm * 1000 * (lambda_nm / energy_eV));

    resLambda.innerHTML = lambda_nm.toFixed(4) + " nm (" + (lambda_nm * 10).toFixed(4) + " Å)";
    resBeta.innerHTML = betaDeg.toFixed(4) + "° (" + (betaRad * 1000).toFixed(3) + " mrad)";
    resDispersion.innerHTML = (dispersion_rad_per_nm * 1000).toFixed(3) + " mrad/nm (" + dispersion_mrad_per_eV.toFixed(4) + " mrad/eV)";

    if (window.recordCalculation) {
      window.recordCalculation("1.3 Grating Calc", linesPerMm + " lines/mm, E=" + energy_eV + " eV, α=" + alphaDeg + "°", "β=" + betaDeg.toFixed(4) + "° (m=" + order + ")");
    }
  }

  // --- 4. Refractive Index & Transmittance (n = 1 - δ + iβ) ---
  function calcRefractive() {
    var matSelect = document.getElementById("refract-mat");
    var matIdx = parseInt(matSelect.value, 10);
    var mat = MATERIALS_DB[matIdx] || MATERIALS_DB[0];

    var thickness_um = parseFloat(document.getElementById("refract-thick").value);
    var energy_keV = parseFloat(document.getElementById("refract-energy").value);

    if (isNaN(thickness_um) || thickness_um <= 0 || isNaN(energy_keV) || energy_keV <= 0) return;

    var eRatio = 10.0 / energy_keV;
    var delta = mat.delta_10keV * Math.pow(eRatio, 2);
    var beta = mat.beta_10keV * Math.pow(eRatio, 3.5);

    var lambda_A = CONSTANTS.hc_keV_nm * 10 / energy_keV;
    var lambda_cm = lambda_A * 1e-8;

    var mu_cm = (4 * Math.PI * beta) / lambda_cm;
    var thick_cm = thickness_um * 1e-4;
    var transmittance = Math.exp(-mu_cm * thick_cm);
    var absorption_len_um = mu_cm > 0 ? (1 / mu_cm) * 1e4 : 0;
    var critical_angle_deg = (Math.sqrt(2 * delta) * 180) / Math.PI;

    document.getElementById("refract-res-delta").innerHTML = delta.toExponential(4);
    document.getElementById("refract-res-beta").innerHTML = beta.toExponential(4);
    document.getElementById("refract-res-trans").innerHTML = (transmittance * 100).toFixed(3) + "% (T = " + transmittance.toFixed(5) + ")";
    document.getElementById("refract-res-atten-len").innerHTML = absorption_len_um.toFixed(2) + " μm (" + (absorption_len_um / 1000).toFixed(3) + " mm)";
    document.getElementById("refract-res-crit").innerHTML = critical_angle_deg.toFixed(4) + "° (" + (critical_angle_deg * 60).toFixed(2) + " arcmin)";

    if (window.recordCalculation) {
      window.recordCalculation("1.4 Transmittance", mat.name + ", " + thickness_um + " μm @ " + energy_keV + " keV", "T = " + (transmittance * 100).toFixed(2) + "%, θc = " + critical_angle_deg.toFixed(3) + "°");
    }
  }

  // --- 5. Energy-Angle Converter (Calibrated E1, theta1 -> E2, theta2) ---
  function calcEnergyAngle() {
    var e1_keV = parseFloat(document.getElementById("ea-e1").value);
    var th1_deg = parseFloat(document.getElementById("ea-th1").value);
    var e2_keV = parseFloat(document.getElementById("ea-e2").value);

    if (isNaN(e1_keV) || isNaN(th1_deg) || isNaN(e2_keV) || e1_keV <= 0 || th1_deg <= 0 || e2_keV <= 0) return;

    var th1_rad = (th1_deg * Math.PI) / 180;
    var sinTh2 = (e1_keV * Math.sin(th1_rad)) / e2_keV;

    var resTh2 = document.getElementById("ea-res-th2");
    var resDelta = document.getElementById("ea-res-delta");

    if (Math.abs(sinTh2) > 1) {
      resTh2.innerHTML = "도달 불가 (sin θ<sub>2</sub> > 1)";
      resDelta.innerHTML = "N/A";
      return;
    }

    var th2_rad = Math.asin(sinTh2);
    var th2_deg = (th2_rad * 180) / Math.PI;
    var deltaDeg = th2_deg - th1_deg;

    resTh2.innerHTML = th2_deg.toFixed(5) + "° (2θ = " + (th2_deg * 2).toFixed(5) + "°)";
    resDelta.innerHTML = (deltaDeg >= 0 ? "+" : "") + deltaDeg.toFixed(5) + "° (" + (deltaDeg * 3600).toFixed(1) + " arcsec)";

    if (window.recordCalculation) {
      window.recordCalculation("1.5 Energy-Angle Shift", e1_keV + " keV (" + th1_deg + "°) → " + e2_keV + " keV", "θ2 = " + th2_deg.toFixed(4) + "° (Δ = " + deltaDeg.toFixed(4) + "°)");
    }
  }

  // --- 6. Chi-Phi Diffractometer Tilt Correction ---
  function calcChiPhi() {
    var braggDeg = parseFloat(document.getElementById("chiphi-theta").value);
    var deltaChiDeg = parseFloat(document.getElementById("chiphi-chi").value);

    if (isNaN(braggDeg) || isNaN(deltaChiDeg)) return;

    var thetaRad = (braggDeg * Math.PI) / 180;
    var chiRad = (deltaChiDeg * Math.PI) / 180;

    var deltaPhiDeg = 0;
    if (Math.abs(Math.cos(chiRad)) > 1e-6) {
      var tanPhi = Math.tan(chiRad) * Math.sin(thetaRad);
      deltaPhiDeg = (Math.atan(tanPhi) * 180) / Math.PI;
    }

    document.getElementById("chiphi-res-phi").innerHTML = deltaPhiDeg.toFixed(4) + "° (" + (deltaPhiDeg * 60).toFixed(2) + " arcmin)";
  }

  // --- 7. Critical Angle & Total External Reflection ---
  function calcCriticalAngle() {
    var density = parseFloat(document.getElementById("crit-density").value);
    var energy_keV = parseFloat(document.getElementById("crit-energy").value);
    var zOverA = parseFloat(document.getElementById("crit-z-over-a").value);

    if (isNaN(density) || isNaN(energy_keV) || isNaN(zOverA) || density <= 0 || energy_keV <= 0) return;

    var lambda_A = CONSTANTS.hc_keV_nm * 10 / energy_keV;
    var lambda_m = lambda_A * 1e-10;
    var rho_kg_m3 = density * 1000;
    var n_e = (CONSTANTS.N_A * rho_kg_m3 * zOverA) / 1e-3;
    var delta = (CONSTANTS.r_e * Math.pow(lambda_m, 2) * n_e) / (2 * Math.PI);

    var theta_c_rad = Math.sqrt(2 * delta);
    var theta_c_deg = (theta_c_rad * 180) / Math.PI;
    var theta_c_mrad = theta_c_rad * 1000;
    var q_c = (4 * Math.PI / lambda_A) * Math.sin(theta_c_rad);

    document.getElementById("crit-res-delta").innerHTML = delta.toExponential(4);
    document.getElementById("crit-res-deg").innerHTML = theta_c_deg.toFixed(4) + "° (" + (theta_c_deg * 60).toFixed(2) + " arcmin)";
    document.getElementById("crit-res-mrad").innerHTML = theta_c_mrad.toFixed(3) + " mrad";
    document.getElementById("crit-res-qc").innerHTML = q_c.toFixed(4) + " Å<sup>-1</sup>";
  }

  // --- 8. Q-Space & Reciprocal Space Converter ---
  function calcQSpace(source) {
    var energy_keV = parseFloat(document.getElementById("q-energy").value);
    var inputTheta = document.getElementById("q-theta");
    var inputTwoTheta = document.getElementById("q-twotheta");
    var inputQ = document.getElementById("q-val");
    var inputD = document.getElementById("q-d");

    if (isNaN(energy_keV) || energy_keV <= 0) return;

    var lambda_A = CONSTANTS.hc_keV_nm * 10 / energy_keV;

    if (source === "theta") {
      var thDeg = parseFloat(inputTheta.value);
      if (isNaN(thDeg) || thDeg <= 0) return;
      var thRad = (thDeg * Math.PI) / 180;
      var q = (4 * Math.PI / lambda_A) * Math.sin(thRad);
      var d = (2 * Math.PI) / q;

      inputTwoTheta.value = (thDeg * 2).toFixed(4);
      inputQ.value = q.toFixed(5);
      inputD.value = d.toFixed(5);
    } else if (source === "twotheta") {
      var twoThDeg = parseFloat(inputTwoTheta.value);
      if (isNaN(twoThDeg) || twoThDeg <= 0) return;
      var thDeg2 = twoThDeg / 2;
      var thRad2 = (thDeg2 * Math.PI) / 180;
      var q2 = (4 * Math.PI / lambda_A) * Math.sin(thRad2);
      var d2 = (2 * Math.PI) / q2;

      inputTheta.value = thDeg2.toFixed(4);
      inputQ.value = q2.toFixed(5);
      inputD.value = d2.toFixed(5);
    } else if (source === "q") {
      var qVal = parseFloat(inputQ.value);
      if (isNaN(qVal) || qVal <= 0) return;
      var sinTh = (qVal * lambda_A) / (4 * Math.PI);
      if (sinTh > 1) return;
      var thRad3 = Math.asin(sinTh);
      var thDeg3 = (thRad3 * 180) / Math.PI;
      var d3 = (2 * Math.PI) / qVal;

      inputTheta.value = thDeg3.toFixed(4);
      inputTwoTheta.value = (thDeg3 * 2).toFixed(4);
      inputD.value = d3.toFixed(5);
    } else if (source === "d") {
      var dVal = parseFloat(inputD.value);
      if (isNaN(dVal) || dVal <= 0) return;
      var qVal4 = (2 * Math.PI) / dVal;
      var sinTh4 = (qVal4 * lambda_A) / (4 * Math.PI);
      if (sinTh4 > 1) return;
      var thRad4 = Math.asin(sinTh4);
      var thDeg4 = (thRad4 * 180) / Math.PI;

      inputTheta.value = thDeg4.toFixed(4);
      inputTwoTheta.value = (thDeg4 * 2).toFixed(4);
      inputQ.value = qVal4.toFixed(5);
    }
  }

  // Export functions to global scope
  window.calcEnergyConverter = calcEnergyConverter;
  window.calcBragg = calcBragg;
  window.applyBraggPreset = applyBraggPreset;
  window.calcGrating = calcGrating;
  window.calcRefractive = calcRefractive;
  window.calcEnergyAngle = calcEnergyAngle;
  window.calcChiPhi = calcChiPhi;
  window.calcCriticalAngle = calcCriticalAngle;
  window.calcQSpace = calcQSpace;

  function initOpticsView() {
    var refractSelect = document.getElementById("refract-mat");
    if (refractSelect && refractSelect.options.length === 0) {
      for (var i = 0; i < MATERIALS_DB.length; i++) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.textContent = MATERIALS_DB[i].name + " (ρ = " + MATERIALS_DB[i].density_g_cm3 + " g/cm³)";
        refractSelect.appendChild(opt);
      }
    }

    var braggPresetsEl = document.getElementById("bragg-presets");
    if (braggPresetsEl && braggPresetsEl.children.length === 0) {
      for (var j = 0; j < 8; j++) {
        var cr = CRYSTAL_D_SPACINGS[j];
        var chip = document.createElement("span");
        chip.className = "preset-chip";
        chip.textContent = cr.material.split(" ")[0] + "(" + cr.hkl + ")";
        (function (d, n) {
          chip.onclick = function () { applyBraggPreset(d, n); };
        })(cr.d_spacing_A, cr.material + "(" + cr.hkl + ")");
        braggPresetsEl.appendChild(chip);
      }
    }

    calcEnergyConverter("kev");
    calcBragg();
    calcGrating();
    calcRefractive();
    calcEnergyAngle();
    calcChiPhi();
    calcCriticalAngle();
    calcQSpace("theta");
  }

  window.initOpticsView = initOpticsView;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOpticsView);
  } else {
    initOpticsView();
  }
})();
