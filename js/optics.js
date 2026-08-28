/**
 * XRAY.OOGUY — Optics Calculation Engine
 * Academic Print Specification: Consolas/Mono outputs, sup tags (no unicode superscripts), zero emojis.
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 */

(function () {
  "use strict";

  // Reads a field only if it is inside the min/max declared in the markup.
  function readField(id) {
    return window.readField ? window.readField(id) : parseFloat((document.getElementById(id) || {}).value);
  }

  // One customary unit per figure; exponent form when it runs long.
  function fmt(value, digits) {
    return window.fmt ? window.fmt(value, digits) : String(value);
  }

  // --- 1. Energy - Wavelength - Frequency Converter ---
  function calcEnergyConverter(sourceField) {
    var hc_eV_A = CONSTANTS.hc_eV_A;
    var hc_keV_nm = CONSTANTS.hc_keV_nm;
    var h = CONSTANTS.h;
    var e = CONSTANTS.e;
    var c = CONSTANTS.c;

    var inputKev = document.getElementById("optics-conv-kev");
    var inputNm = document.getElementById("optics-conv-nm");
    var inputHz = document.getElementById("optics-conv-hz");

    var energy_eV = 0;

    if (sourceField === "kev") {
      energy_eV = parseFloat(inputKev.value) * 1000;
    } else if (sourceField === "nm") {
      var nm = parseFloat(inputNm.value);
      if (nm > 0) energy_eV = (hc_keV_nm / nm) * 1000;
    } else if (sourceField === "hz") {
      var hz = parseFloat(inputHz.value);
      if (hz > 0) energy_eV = (h * hz) / e;
    }

    if (isNaN(energy_eV) || energy_eV <= 0) return;

    var energy_keV = energy_eV / 1000;
    var lambda_A = hc_eV_A / energy_eV;
    var lambda_nm = lambda_A / 10;
    var freq_Hz = (energy_eV * e) / h;

    if (sourceField !== "kev") inputKev.value = energy_keV.toFixed(5);
    if (sourceField !== "nm") inputNm.value = lambda_nm.toFixed(5);
    if (sourceField !== "hz") inputHz.value = freq_Hz.toExponential(4);

    var resSummary = document.getElementById("optics-conv-summary");
    if (resSummary) {
      resSummary.innerHTML = energy_keV.toFixed(4) + " keV ⟷ " + lambda_nm.toFixed(5) + " nm ⟷ " + freq_Hz.toExponential(3) + " Hz";
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-optics-energy", sourceField + " = " + energy_keV.toFixed(4) + " keV", lambda_nm.toFixed(5) + " nm (" + energy_keV.toFixed(4) + " keV)");
    }
  }

  // --- 2. Bragg's Law 3-Way Multi-Directional Calculator ---
  // Row 1: d + 2theta (tth) -> Energy E
  function calcBraggRow1() {
    var hc_eV_A = CONSTANTS.hc_eV_A;
    var dInput = document.getElementById("bragg-r1-d");
    var tthInput = document.getElementById("bragg-r1-tth");
    if (!dInput || !tthInput) return;

    var dVal = parseFloat(dInput.value);
    var tthDeg = parseFloat(tthInput.value);
    var resE = document.getElementById("bragg-r1-res-e");
    var resSub = document.getElementById("bragg-r1-res-sub");

    if (isNaN(dVal) || dVal <= 0 || isNaN(tthDeg) || tthDeg <= 0 || tthDeg >= 180) {
      if (resE) resE.innerHTML = "-";
      if (resSub) resSub.innerHTML = "-";
      return;
    }

    var thDeg = tthDeg / 2;
    var thRad = (thDeg * Math.PI) / 180;
    var lambda_A = 2 * dVal * Math.sin(thRad);
    var e_eV = hc_eV_A / lambda_A;
    var e_keV = e_eV / 1000;
    var qVal = (4 * Math.PI / lambda_A) * Math.sin(thRad);

    if (resE) {
      resE.innerHTML = e_keV.toFixed(4) + " keV";
    }
    if (resSub) {
      resSub.innerHTML = "θ = " + thDeg.toFixed(4) + "° | λ = " + (lambda_A / 10).toFixed(5) + " nm | Q = " + qVal.toFixed(4) + " Å<sup>-1</sup>";
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-optics-bragg", "d=" + dVal + " Å, 2θ=" + tthDeg + "°", "E = " + e_keV.toFixed(4) + " keV (θ=" + thDeg.toFixed(4) + "°)", "d, 2θ → E");
    }
  }

  // Row 2: 2theta (tth) + Energy E -> d-spacing
  function calcBraggRow2() {
    var hc_eV_A = CONSTANTS.hc_eV_A;
    var tthInput = document.getElementById("bragg-r2-tth");
    var eInput = document.getElementById("bragg-r2-e");
    if (!tthInput || !eInput) return;

    var tthDeg = parseFloat(tthInput.value);
    var e_keV = parseFloat(eInput.value);
    var resD = document.getElementById("bragg-r2-res-d");
    var resSub = document.getElementById("bragg-r2-res-sub");

    if (isNaN(tthDeg) || tthDeg <= 0 || tthDeg >= 180 || isNaN(e_keV) || e_keV <= 0) {
      if (resD) resD.innerHTML = "-";
      if (resSub) resSub.innerHTML = "-";
      return;
    }

    var thDeg = tthDeg / 2;
    var thRad = (thDeg * Math.PI) / 180;
    var lambda_A = hc_eV_A / (e_keV * 1000);
    var dVal = lambda_A / (2 * Math.sin(thRad));
    var qVal = (4 * Math.PI / lambda_A) * Math.sin(thRad);

    if (resD) {
      resD.innerHTML = dVal.toFixed(5) + " Å";
    }
    if (resSub) {
      resSub.innerHTML = "θ = " + thDeg.toFixed(4) + "° | λ = " + (lambda_A / 10).toFixed(5) + " nm | Q = " + qVal.toFixed(4) + " Å<sup>-1</sup>";
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-optics-bragg", "2θ=" + tthDeg + "°, E=" + e_keV + " keV", "d = " + dVal.toFixed(5) + " Å (Q=" + qVal.toFixed(4) + " Å<sup>-1</sup>)", "2θ, E → d");
    }
  }

  // Row 3: d + Energy E -> 2theta (tth) & theta
  function calcBraggRow3() {
    var hc_eV_A = CONSTANTS.hc_eV_A;
    var dInput = document.getElementById("bragg-r3-d");
    var eInput = document.getElementById("bragg-r3-e");
    if (!dInput || !eInput) return;

    var dVal = parseFloat(dInput.value);
    var e_keV = parseFloat(eInput.value);
    var resTth = document.getElementById("bragg-r3-res-tth");
    var resSub = document.getElementById("bragg-r3-res-sub");

    if (isNaN(dVal) || dVal <= 0 || isNaN(e_keV) || e_keV <= 0) {
      if (resTth) resTth.innerHTML = "-";
      if (resSub) resSub.innerHTML = "-";
      return;
    }

    var lambda_A = hc_eV_A / (e_keV * 1000);
    var sinTh = lambda_A / (2 * dVal);

    if (sinTh > 1) {
      var unreach = (window.i18n ? window.i18n.t("res_bragg_unreachable") : "회절 불가 (λ > 2d)");
      if (resTth) resTth.innerHTML = '<span style="color:var(--danger); font-size:13px;">' + unreach + '</span>';
      if (resSub) resSub.innerHTML = "λ = " + (lambda_A / 10).toFixed(5) + " nm &gt; 2d (" + (2 * dVal / 10).toFixed(5) + " nm), E<sub>min</sub> = " + (hc_eV_A / (2 * dVal * 1000)).toFixed(3) + " keV";
      return;
    }

    var thRad = Math.asin(sinTh);
    var thDeg = (thRad * 180) / Math.PI;
    var tthDeg = thDeg * 2;
    var qVal = (4 * Math.PI / lambda_A) * sinTh;

    if (resTth) {
      resTth.innerHTML = tthDeg.toFixed(4) + "°";
    }
    if (resSub) {
      resSub.innerHTML = "2θ = " + ((tthDeg * Math.PI / 180) * 1000).toFixed(2) + " mrad | λ = " + (lambda_A / 10).toFixed(5) + " nm | Q = " + qVal.toFixed(4) + " Å<sup>-1</sup>";
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-optics-bragg", "d=" + dVal + " Å, E=" + e_keV + " keV", "2θ = " + tthDeg.toFixed(4) + "°, θ = " + thDeg.toFixed(4) + "°", "d, E → 2θ");
    }
  }

  function calcBragg() {
    calcBraggRow1();
    calcBraggRow2();
    calcBraggRow3();
  }

  // Preset picker for Bragg d-spacing (updates Row 1 & Row 3)
  function applyBraggPreset(dVal, name) {
    var r1D = document.getElementById("bragg-r1-d");
    var r3D = document.getElementById("bragg-r3-d");
    if (r1D) r1D.value = dVal;
    if (r3D) r3D.value = dVal;
    calcBraggRow1();
    calcBraggRow3();
  }

  // --- 3. Grating Diffraction Calculator (mλ = d(sin α + sin β)) ---
  function calcGrating() {
    var linesPerMm = readField("grating-lines");
    var energy_keV = readField("grating-energy");
    var energy_eV = energy_keV * 1000;
    var alphaDeg = readField("grating-alpha");
    var order = readField("grating-order");

    if (isNaN(linesPerMm) || linesPerMm <= 0 || isNaN(energy_keV) || energy_keV <= 0) return;
    if (isNaN(alphaDeg) || isNaN(order)) return;   // α and the order m are both signed

    var lambda_nm = (CONSTANTS.hc_keV_nm * 1000) / energy_eV;
    var d_nm = 1e6 / linesPerMm; // d in nm
    var alphaRad = (alphaDeg * Math.PI) / 180;

    var sinBeta = (order * lambda_nm) / d_nm - Math.sin(alphaRad);

    var resBeta = document.getElementById("grating-res-beta");
    var resDispersion = document.getElementById("grating-res-disp");
    var resLambda = document.getElementById("grating-res-lambda");

    if (Math.abs(sinBeta) > 1) {
      resBeta.innerHTML = (window.i18n ? window.i18n.t("res_grating_unreachable") : "회절 불가 (|sin β| > 1)");
      resDispersion.innerHTML = "N/A";
      return;
    }

    var betaRad = Math.asin(sinBeta);
    var betaDeg = (betaRad * 180) / Math.PI;

    var cosBeta = Math.cos(betaRad);
    var dispersion_rad_per_nm = cosBeta !== 0 ? Math.abs(order / (d_nm * cosBeta)) : 0;
    var dispersion_mrad_per_eV = (dispersion_rad_per_nm * 1000 * (lambda_nm / energy_eV));

    resLambda.innerHTML = lambda_nm.toFixed(5) + " nm";
    resBeta.innerHTML = betaDeg.toFixed(4) + "°";
    resDispersion.innerHTML = fmt(dispersion_rad_per_nm * 1000, 3) + " mrad/nm";

    if (window.recordCalculation) {
      window.recordCalculation("card-optics-grating", linesPerMm + " lines/mm, E=" + energy_keV + " keV, α=" + alphaDeg + "°", "β=" + betaDeg.toFixed(4) + "° (m=" + order + ")");
    }
  }

  // --- 4. Refractive Index & Transmittance (n = 1 - δ + iβ) ---
  function calcRefractive() {
    var matSelect = document.getElementById("refract-mat");
    var matIdx = parseInt(matSelect.value, 10);
    var mat = MATERIALS_DB[matIdx] || MATERIALS_DB[0];

    var thickness_um = readField("refract-thick");
    var energy_keV = readField("refract-energy");

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
    document.getElementById("refract-res-trans").innerHTML = (transmittance * 100).toFixed(3) + "%";
    document.getElementById("refract-res-atten-len").innerHTML = fmt(absorption_len_um, 2) + " μm";
    document.getElementById("refract-res-crit").innerHTML = critical_angle_deg.toFixed(4) + "°";

    if (window.recordCalculation) {
      window.recordCalculation("card-optics-refraction", mat.name + ", " + thickness_um + " μm @ " + energy_keV + " keV", "T = " + (transmittance * 100).toFixed(2) + "%, θc = " + critical_angle_deg.toFixed(3) + "°");
    }
  }

  // --- 5. Energy Scaling Calculation (Reference E_ref, th_ref -> Target E_target -> 2th, th, Q) ---
  function syncRefAngle(source) {
    var th1Input = document.getElementById("ea-th1");
    var tth1Input = document.getElementById("ea-tth1");
    if (!th1Input || !tth1Input) return;

    if (source === "th") {
      var thVal = parseFloat(th1Input.value);
      if (!isNaN(thVal)) {
        tth1Input.value = (thVal * 2).toFixed(4);
      }
    } else if (source === "tth") {
      var tthVal = parseFloat(tth1Input.value);
      if (!isNaN(tthVal)) {
        th1Input.value = (tthVal / 2).toFixed(4);
      }
    }
    calcEnergyScaling();
  }

  function setTargetEnergy(energyVal) {
    var e2Input = document.getElementById("ea-e2");
    if (e2Input) {
      e2Input.value = energyVal;
      calcEnergyScaling();
    }
  }

  function calcEnergyScaling() {
    var hc_keV_A = CONSTANTS.hc_eV_A / 1000;
    var e1_keV = readField("ea-e1");
    var th1_deg = readField("ea-th1");
    var e2_keV = readField("ea-e2");

    var resTth2 = document.getElementById("ea-res-tth2");
    var resTh2 = document.getElementById("ea-res-th2");
    var resQ = document.getElementById("ea-res-q");
    var resDelta = document.getElementById("ea-res-delta");
    var resExtra = document.getElementById("ea-res-extra");

    if (isNaN(e1_keV) || e1_keV <= 0 || isNaN(e2_keV) || e2_keV <= 0) return;
    if (isNaN(th1_deg) || th1_deg <= 0 || th1_deg >= 90) return;

    var th1_rad = (th1_deg * Math.PI) / 180;
    var sinTh1 = Math.sin(th1_rad);
    
    // Wavelength and Q vector (invariant under scaling)
    var lambda1_A = hc_keV_A / e1_keV;
    var lambda2_A = hc_keV_A / e2_keV;
    var qVal = (4 * Math.PI / lambda1_A) * sinTh1;
    var dSpacing_A = (2 * Math.PI) / qVal;

    // sin(theta2) = (E1 * sin(theta1)) / E2
    var sinTh2 = (e1_keV * sinTh1) / e2_keV;

    if (Math.abs(sinTh2) > 1) {
      var minE2 = (e1_keV * sinTh1).toFixed(3);
      if (resTth2) resTth2.innerHTML = '<span style="color:var(--danger); font-size:12px;">' + (window.i18n ? window.i18n.t("res_unreachable") : "회절 불가 (sin θ₂ > 1)") + '</span>';
      if (resTh2) resTh2.innerHTML = '<span style="color:var(--danger);">N/A (E<sub>target</sub> &lt; ' + minE2 + ' keV)</span>';
      if (resQ) resQ.innerHTML = qVal.toFixed(4) + ' Å<sup>-1</sup>';
      if (resDelta) resDelta.innerHTML = '모터 이동 불가 (타겟 에너지가 너무 낮습니다)';
      if (resExtra) resExtra.innerHTML = 'd = ' + dSpacing_A.toFixed(4) + ' Å | λ<sub>ref</sub> = ' + (lambda1_A / 10).toFixed(5) + ' nm, λ<sub>target</sub> = ' + (lambda2_A / 10).toFixed(5) + ' nm';
      return;
    }

    var th2_rad = Math.asin(sinTh2);
    var th2_deg = (th2_rad * 180) / Math.PI;
    var tth2_deg = th2_deg * 2;
    var deltaThDeg = th2_deg - th1_deg;
    var deltaTthDeg = tth2_deg - (th1_deg * 2);

    if (resTth2) {
      resTth2.innerHTML = tth2_deg.toFixed(4) + '°';
    }
    if (resTh2) {
      resTh2.innerHTML = th2_deg.toFixed(4) + '°';
    }
    if (resQ) {
      resQ.innerHTML = qVal.toFixed(4) + ' Å<sup>-1</sup>';
    }
    if (resDelta) {
      var signTh = deltaThDeg >= 0 ? "+" : "";
      var signTth = deltaTthDeg >= 0 ? "+" : "";
      resDelta.innerHTML = 'Δθ = ' + signTh + deltaThDeg.toFixed(4) + '° | Δ(2θ) = ' + signTth + deltaTthDeg.toFixed(4) + '°';
    }
    if (resExtra) {
      resExtra.innerHTML = 'd = ' + dSpacing_A.toFixed(4) + ' Å | λ<sub>ref</sub>: ' + (lambda1_A / 10).toFixed(5) + ' nm ➔ λ<sub>target</sub>: ' + (lambda2_A / 10).toFixed(5) + ' nm';
    }

    if (window.recordCalculation) {
      window.recordCalculation(
        "1.5 Energy Scaling",
        "E_ref=" + e1_keV + " keV, θ=" + th1_deg + "° ➔ E_target=" + e2_keV + " keV",
        "2θ=" + tth2_deg.toFixed(4) + "°, θ=" + th2_deg.toFixed(4) + "°, Q=" + qVal.toFixed(4) + " Å⁻¹"
      );
    }
  }

  // --- 6. Chi-Phi Diffractometer Tilt Correction ---
  function calcChiPhi() {
    var braggDeg = readField("chiphi-theta");
    var deltaChiDeg = readField("chiphi-chi");

    if (isNaN(braggDeg) || braggDeg <= 0 || braggDeg >= 90) return;
    if (isNaN(deltaChiDeg)) return;   // Δχ may be negative

    var thetaRad = (braggDeg * Math.PI) / 180;
    var chiRad = (deltaChiDeg * Math.PI) / 180;

    var deltaPhiDeg = 0;
    if (Math.abs(Math.cos(chiRad)) > 1e-6) {
      var tanPhi = Math.tan(chiRad) * Math.sin(thetaRad);
      deltaPhiDeg = (Math.atan(tanPhi) * 180) / Math.PI;
    }

    document.getElementById("chiphi-res-phi").innerHTML = deltaPhiDeg.toFixed(4) + "°";
  }

  // --- 7. Critical Angle & Total External Reflection ---
  function calcCriticalAngle() {
    var density = readField("crit-density");
    var energy_keV = readField("crit-energy");
    var zOverA = readField("crit-z-over-a");

    if (isNaN(density) || density <= 0 || isNaN(energy_keV) || energy_keV <= 0) return;
    if (isNaN(zOverA) || zOverA <= 0) return;

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
    document.getElementById("crit-res-deg").innerHTML = theta_c_deg.toFixed(4) + "°";
    document.getElementById("crit-res-mrad").innerHTML = theta_c_mrad.toFixed(3) + " mrad";
    document.getElementById("crit-res-qc").innerHTML = q_c.toFixed(4) + " Å<sup>-1</sup>";
  }

  // --- 8. Q-Space & Reciprocal Space Converter ---
  function calcQSpace(source) {
    var energy_keV = readField("q-energy");
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
  window.calcBraggRow1 = calcBraggRow1;
  window.calcBraggRow2 = calcBraggRow2;
  window.calcBraggRow3 = calcBraggRow3;
  window.applyBraggPreset = applyBraggPreset;
  window.calcGrating = calcGrating;
  window.calcRefractive = calcRefractive;
  window.calcEnergyScaling = calcEnergyScaling;
  window.syncRefAngle = syncRefAngle;
  window.setTargetEnergy = setTargetEnergy;
  window.calcChiPhi = calcChiPhi;
  window.calcCriticalAngle = calcCriticalAngle;
  window.calcQSpace = calcQSpace;
  window.calcEnergyCalibration = calcEnergyCalibration;
  window.calcStrain = calcStrain;
  window.calcPixelQ = calcPixelQ;
  window.calcKiessig = calcKiessig;

  // ==================================================================
  // Monochromator energy calibration
  // ==================================================================
  // The inverse of the thermal drift card. Measure a reflection whose d is
  // known and the Bragg condition hands back the energy the monochromator is
  // really delivering, whatever the control system believes. The angle offset
  // is the other half of the answer: the same discrepancy expressed as the
  // encoder error that would produce it, which is what actually gets adjusted.
  function calcEnergyCalibration() {
    var d = readField("cal-d");
    var tth = readField("cal-tth");
    var nominal = readField("cal-nominal");

    if (isNaN(d) || d <= 0 || isNaN(tth) || tth <= 0 || tth >= 180) return;
    var out = document.getElementById("cal-res-actual");
    if (!out) return;

    var theta = (tth / 2) * Math.PI / 180;
    var sinTheta = Math.sin(theta);
    if (sinTheta <= 0) return;

    var lambda_A = 2 * d * sinTheta;
    var actual_keV = CONSTANTS.hc_eV_A / lambda_A / 1000;

    out.innerHTML = actual_keV.toFixed(5) + " keV";

    if (isNaN(nominal) || nominal <= 0) {
      document.getElementById("cal-res-offset").innerHTML = "-";
      document.getElementById("cal-res-rel").innerHTML = "-";
      document.getElementById("cal-res-dtheta").innerHTML = "-";
      return;
    }

    var delta_eV = (actual_keV - nominal) * 1000;
    document.getElementById("cal-res-offset").innerHTML =
      (delta_eV >= 0 ? "+" : "") + delta_eV.toFixed(2) + " eV";
    document.getElementById("cal-res-rel").innerHTML =
      (delta_eV >= 0 ? "+" : "") + ((actual_keV - nominal) / nominal * 1e6).toFixed(1) + " ppm";

    // Where the crystal would have to be for the nominal energy to be right.
    var lambdaNom_A = CONSTANTS.hc_eV_A / (nominal * 1000);
    var s = lambdaNom_A / (2 * d);
    if (s > 1 || s <= 0) {
      document.getElementById("cal-res-dtheta").innerHTML = "-";
    } else {
      var thetaExpected = Math.asin(s);
      var dTheta_arcsec = (theta - thetaExpected) * 180 / Math.PI * 3600;
      document.getElementById("cal-res-dtheta").innerHTML =
        (dTheta_arcsec >= 0 ? "+" : "") + dTheta_arcsec.toFixed(2) + " arcsec";
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-opt-calibration",
        "d=" + d + " Å, 2θ=" + tth + "°, set to " + nominal + " keV",
        actual_keV.toFixed(5) + " keV (" + (delta_eV >= 0 ? "+" : "") + delta_eV.toFixed(1) + " eV)");
    }
  }

  // ==================================================================
  // Lattice strain from a peak shift
  // ==================================================================
  // The same measurement the Bragg card does, framed the way a nanocrystal
  // result is reported. Computed as d/d0 - 1 rather than through the
  // differential -cot(theta) dtheta, which only agrees for small shifts and is
  // the form that quietly breaks near back-scattering.
  function calcStrain() {
    var d0 = readField("str-d0");
    var energy = readField("str-energy");
    var tth = readField("str-tth");

    if (isNaN(d0) || d0 <= 0 || isNaN(energy) || energy <= 0) return;
    if (isNaN(tth) || tth <= 0 || tth >= 180) return;
    var out = document.getElementById("str-res-eps");
    if (!out) return;

    var lambda_A = CONSTANTS.hc_eV_A / (energy * 1000);
    var theta = (tth / 2) * Math.PI / 180;
    var sinTheta = Math.sin(theta);
    if (sinTheta <= 0) return;

    var d = lambda_A / (2 * sinTheta);
    var eps = d / d0 - 1;

    out.innerHTML = eps.toExponential(4);
    document.getElementById("str-res-micro").innerHTML = (eps * 1e6).toFixed(1) + " με";
    document.getElementById("str-res-d").innerHTML = d.toFixed(6) + " Å";

    // Where the unstrained reflection would have been, at this energy.
    var s0 = lambda_A / (2 * d0);
    if (s0 > 1 || s0 <= 0) {
      document.getElementById("str-res-shift").innerHTML = "-";
    } else {
      var tth0 = 2 * Math.asin(s0) * 180 / Math.PI;
      var shift = tth - tth0;
      document.getElementById("str-res-shift").innerHTML =
        (shift >= 0 ? "+" : "") + shift.toFixed(4) + "°";
    }

    if (window.recordCalculation) {
      window.recordCalculation("card-geo-strain",
        "d0=" + d0 + " Å, 2θ=" + tth + "° @ " + energy + " keV",
        "ε = " + eps.toExponential(3) + " (" + (eps * 1e6).toFixed(0) + " με)");
    }
  }

  // ==================================================================
  // Detector pixel to Q
  // ==================================================================
  // The angular resolution card gives the step one pixel is worth. This gives
  // where a particular pixel is: the radius from the beam centre, through the
  // scattering angle, into reciprocal space.
  //
  // Flat detector, normal to the beam, sample on the rotation centre. A tilted
  // detector needs the full orientation matrix and is not what this is.
  function calcPixelQ() {
    var energy = readField("pxq-energy");
    var dist_mm = readField("pxq-dist");
    var pixel_um = readField("pxq-pixel");
    var dx = readField("pxq-dx");
    var dy = readField("pxq-dy");

    if (isNaN(energy) || energy <= 0 || isNaN(dist_mm) || dist_mm <= 0) return;
    if (isNaN(pixel_um) || pixel_um <= 0 || isNaN(dx) || isNaN(dy)) return;
    var out = document.getElementById("pxq-res-q");
    if (!out) return;

    var r_mm = Math.sqrt(dx * dx + dy * dy) * pixel_um / 1000;
    var tth_rad = Math.atan2(r_mm, dist_mm);
    var theta = tth_rad / 2;

    var lambda_A = CONSTANTS.hc_eV_A / (energy * 1000);
    var q = (4 * Math.PI * Math.sin(theta)) / lambda_A;

    out.innerHTML = fmt(q, 5) + " Å<sup>-1</sup>";
    document.getElementById("pxq-res-tth").innerHTML = (tth_rad * 180 / Math.PI).toFixed(5) + "°";
    document.getElementById("pxq-res-d").innerHTML =
      q > 0 ? fmt(2 * Math.PI / q, 5) + " Å" : "∞";

    // Measured from the +x axis, which is how a detector image is usually read.
    var azim = Math.atan2(dy, dx) * 180 / Math.PI;
    document.getElementById("pxq-res-azim").innerHTML =
      (r_mm > 0 ? azim.toFixed(3) + "°" : "-");

    if (window.recordCalculation) {
      window.recordCalculation("card-geo-pixelq",
        "(" + dx + ", " + dy + ") px @ " + dist_mm + " mm, " + energy + " keV",
        "Q = " + fmt(q, 4) + " Å<sup>-1</sup>, 2θ = " + (tth_rad * 180 / Math.PI).toFixed(4) + "°");
    }
  }

  // ==================================================================
  // Kiessig fringes to film thickness
  // ==================================================================
  // What anyone does next with a stitched reflectivity curve. Two adjacent
  // minima obey
  //
  //     sin^2(theta_m) = sin^2(theta_c) + (m lambda / 2t)^2
  //
  // so with the small angles reflectivity lives at, and m2 - m1 = 1,
  //
  //     t = (lambda/2) / (sqrt(theta_2^2 - theta_c^2) - sqrt(theta_1^2 - theta_c^2))
  //
  // Leaving theta_c at zero collapses this to the familiar lambda / 2 dtheta,
  // which reads thick at low angle because it ignores refraction — the card
  // shows both so the size of that correction is visible rather than assumed.
  function calcKiessig() {
    var energy = readField("kie-energy");
    var t1 = readField("kie-t1");
    var t2 = readField("kie-t2");
    var tc = readField("kie-tc");

    if (isNaN(energy) || energy <= 0 || isNaN(t1) || isNaN(t2)) return;
    if (t1 <= 0 || t2 <= t1) return;
    var out = document.getElementById("kie-res-t");
    if (!out) return;

    var lambda_A = CONSTANTS.hc_eV_A / (energy * 1000);
    var rad = Math.PI / 180;
    var a1 = t1 * rad, a2 = t2 * rad;
    var ac = (isNaN(tc) || tc < 0) ? 0 : tc * rad;

    var raw_A = lambda_A / (2 * (a2 - a1));
    document.getElementById("kie-res-raw").innerHTML = fmt(raw_A / 10, 3) + " nm";
    document.getElementById("kie-res-spacing").innerHTML = (t2 - t1).toFixed(5) + "°";

    // Below the critical angle there is no fringe to read: total external
    // reflection, nothing has entered the film.
    var s1 = a1 * a1 - ac * ac;
    var s2 = a2 * a2 - ac * ac;
    if (s1 <= 0 || s2 <= 0) {
      out.innerHTML = "-";
      document.getElementById("kie-res-next").innerHTML = "-";
      return;
    }

    var denom = Math.sqrt(s2) - Math.sqrt(s1);
    if (denom <= 0) { out.innerHTML = "-"; return; }

    var t_A = (lambda_A / 2) / denom;
    out.innerHTML = fmt(t_A / 10, 3) + " nm";

    // The next order, from the same relation — a check that can be made against
    // the curve on screen rather than taken on trust.
    var nextAngle = Math.sqrt(Math.pow(Math.sqrt(s2) + denom, 2) + ac * ac) / rad;
    document.getElementById("kie-res-next").innerHTML = nextAngle.toFixed(5) + "°";

    if (window.recordCalculation) {
      window.recordCalculation("card-data-kiessig",
        "θ1=" + t1 + "°, θ2=" + t2 + "°, θc=" + (ac / rad).toFixed(3) + "° @ " + energy + " keV",
        "t = " + fmt(t_A / 10, 2) + " nm");
    }
  }

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
    calcEnergyScaling();
    calcChiPhi();
    calcCriticalAngle();
    calcQSpace("theta");
    calcEnergyCalibration();
    calcStrain();
    calcPixelQ();
    calcKiessig();
  }

  window.initOpticsView = initOpticsView;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initOpticsView);
  } else {
    initOpticsView();
  }
})();
