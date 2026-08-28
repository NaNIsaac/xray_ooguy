/**
 * XRAY.OOGUY — Internal Reference Data & Physical Constants
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 * Note: No fetch API used, all constants and datasets are embedded in-memory.
 */

// Fundamental Physical Constants (CODATA 2018 / 2022 standards)
var CONSTANTS = {
  h: 6.62607015e-34,         // Planck constant (J·s)
  hbar: 1.054571817e-34,     // Reduced Planck constant (J·s)
  c: 299792458,              // Speed of light in vacuum (m·s⁻¹ / m/s)
  e: 1.602176634e-19,        // Elementary charge (C)
  hc_eV_A: 12398.41984,      // hc product in eV·Å (E[eV] · λ[Å] = 12398.41984 eV·Å)
  hc_keV_nm: 1.239841984,    // hc product in keV·nm
  r_e: 2.8179403262e-15,     // Classical electron radius (m)
  N_A: 6.02214076e23,        // Avogadro constant (mol⁻¹)
  k_B: 1.380649e-23          // Boltzmann constant (J·K⁻¹)
};

// Standard Crystal Lattice Parameters and d-spacings (in Angstroms Å)
// d = a / sqrt(h^2 + k^2 + l^2) for cubic
var CRYSTAL_D_SPACINGS = [
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "111", d_spacing_A: 3.13560, system: "Cubic (Diamond)" },
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "220", d_spacing_A: 1.92015, system: "Cubic (Diamond)" },
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "311", d_spacing_A: 1.63750, system: "Cubic (Diamond)" },
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "400", d_spacing_A: 1.35775, system: "Cubic (Diamond)" },
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "333", d_spacing_A: 1.04520, system: "Cubic (Diamond)" },
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "440", d_spacing_A: 0.96008, system: "Cubic (Diamond)" },
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "422", d_spacing_A: 1.10860, system: "Cubic (Diamond)" },
  { material: "Silicon (Si)", lattice_a: 5.43102, hkl: "511", d_spacing_A: 1.04520, system: "Cubic (Diamond)" },
  { material: "Germanium (Ge)", lattice_a: 5.6575, hkl: "111", d_spacing_A: 3.26636, system: "Cubic (Diamond)" },
  { material: "Germanium (Ge)", lattice_a: 5.6575, hkl: "220", d_spacing_A: 2.00023, system: "Cubic (Diamond)" },
  { material: "Germanium (Ge)", lattice_a: 5.6575, hkl: "311", d_spacing_A: 1.70580, system: "Cubic (Diamond)" },
  { material: "Germanium (Ge)", lattice_a: 5.6575, hkl: "400", d_spacing_A: 1.41438, system: "Cubic (Diamond)" },
  { material: "Diamond (C)", lattice_a: 3.5670, hkl: "111", d_spacing_A: 2.05941, system: "Cubic (Diamond)" },
  { material: "Diamond (C)", lattice_a: 3.5670, hkl: "220", d_spacing_A: 1.26112, system: "Cubic (Diamond)" },
  { material: "Sapphire (Al2O3)", lattice_a: 4.758, lattice_c: 12.991, hkl: "0006 (006)", d_spacing_A: 2.16517, system: "Trigonal / Hexagonal" },
  { material: "Sapphire (Al2O3)", lattice_a: 4.758, lattice_c: 12.991, hkl: "11-20 (110)", d_spacing_A: 2.37900, system: "Trigonal / Hexagonal" },
  { material: "Sapphire (Al2O3)", lattice_a: 4.758, lattice_c: 12.991, hkl: "01-12 (012)", d_spacing_A: 3.47900, system: "Trigonal / Hexagonal" },
  { material: "Gallium Arsenide (GaAs)", lattice_a: 5.6532, hkl: "111", d_spacing_A: 3.26388, system: "Zincblende" },
  { material: "Gallium Arsenide (GaAs)", lattice_a: 5.6532, hkl: "200", d_spacing_A: 2.82660, system: "Zincblende" },
  { material: "Gallium Arsenide (GaAs)", lattice_a: 5.6532, hkl: "400", d_spacing_A: 1.41330, system: "Zincblende" },
  { material: "InP (Indium Phosphide)", lattice_a: 5.8687, hkl: "111", d_spacing_A: 3.38829, system: "Zincblende" },
  { material: "Quartz (SiO2)", lattice_a: 4.9134, lattice_c: 5.4052, hkl: "10-10 (100)", d_spacing_A: 4.25500, system: "Trigonal" },
  { material: "Quartz (SiO2)", lattice_a: 4.9134, lattice_c: 5.4052, hkl: "10-11 (101)", d_spacing_A: 3.34300, system: "Trigonal" }
];

// Common Material Properties for Attenuation & Critical Angles
//
// beta and mu_rho describe the same absorption twice, and they used to
// disagree — by a factor of 1.85 for gold, platinum, nickel and water, 1.55 for
// copper, 1.24 the other way for germanium. mu_rho is the column that matches
// the published tables, so beta is derived from it:
//
//     beta = mu * lambda / (4 pi),   mu = (mu/rho) * rho,   lambda at 10 keV
//
// which puts the attenuation lengths back on the accepted values — Si 135 um,
// Au 2.4 um, Cu 5.1 um, Al 141 um, water 1.88 mm. The transmittance card reads
// beta, so before this it reported gold as roughly twice as transparent as it
// is. Recompute beta whenever mu_rho changes; nothing should ever edit it by
// hand into disagreement again.
//
// delta and beta are tabulated at 10 keV and the transmittance card
// extrapolates them as E^-2 and E^-3.5. That power law describes a smooth
// curve, and an absorption edge is not smooth: beta steps by a large factor
// across one, so scaling straight through an edge silently overstates the
// attenuation length by however much the step was worth.
//
// `edges` is what lets the card say so. The energies are K and L edges in keV;
// M edges are left out, sitting below the 5 keV floor where the scaling is
// already flagged as out of range. The ones that matter for this material list
// are not exotic — Au L3 at 11.919 and Pt L3 at 11.564 are directly under the
// 12 keV a gold- or platinum-coated mirror is routinely used at, Ge K at 11.103
// under a Ge analyser, Cu K at 8.979 and Ni K at 8.333 under their own common
// working energies. Every one of them is inside the 5–30 keV band the old
// range check called validated.
var MATERIALS_DB = [
  { name: "Silicon (Si)", symbol: "Si", Z: 14, A: 28.0855, density_g_cm3: 2.329, delta_10keV: 4.85e-6, beta_10keV: 7.32e-8, mu_rho_10keV: 31.84,
    edges: [{ n: "K", keV: 1.839 }] },
  { name: "Germanium (Ge)", symbol: "Ge", Z: 32, A: 72.63, density_g_cm3: 5.323, delta_10keV: 1.05e-5, beta_10keV: 7.36e-7, mu_rho_10keV: 140.2,
    edges: [{ n: "L3", keV: 1.217 }, { n: "L2", keV: 1.248 }, { n: "L1", keV: 1.414 }, { n: "K", keV: 11.103 }] },
  { name: "Gold (Au)", symbol: "Au", Z: 79, A: 196.966, density_g_cm3: 19.32, delta_10keV: 3.01e-5, beta_10keV: 4.07e-6, mu_rho_10keV: 213.5,
    edges: [{ n: "L3", keV: 11.919 }, { n: "L2", keV: 13.734 }, { n: "L1", keV: 14.353 }, { n: "K", keV: 80.725 }] },
  { name: "Platinum (Pt)", symbol: "Pt", Z: 78, A: 195.084, density_g_cm3: 21.45, delta_10keV: 3.25e-5, beta_10keV: 4.43e-6, mu_rho_10keV: 209.1,
    edges: [{ n: "L3", keV: 11.564 }, { n: "L2", keV: 13.273 }, { n: "L1", keV: 13.880 }, { n: "K", keV: 78.395 }] },
  { name: "Rhodium (Rh)", symbol: "Rh", Z: 45, A: 102.905, density_g_cm3: 12.41, delta_10keV: 2.28e-5, beta_10keV: 1.53e-6, mu_rho_10keV: 124.7,
    edges: [{ n: "L3", keV: 3.004 }, { n: "L2", keV: 3.146 }, { n: "L1", keV: 3.412 }, { n: "K", keV: 23.220 }] },
  { name: "Nickel (Ni)", symbol: "Ni", Z: 28, A: 58.693, density_g_cm3: 8.908, delta_10keV: 1.83e-5, beta_10keV: 1.88e-6, mu_rho_10keV: 214.2,
    edges: [{ n: "L3", keV: 0.855 }, { n: "L2", keV: 0.872 }, { n: "L1", keV: 1.008 }, { n: "K", keV: 8.333 }] },
  { name: "Copper (Cu)", symbol: "Cu", Z: 29, A: 63.546, density_g_cm3: 8.96, delta_10keV: 1.79e-5, beta_10keV: 1.93e-6, mu_rho_10keV: 218.4,
    edges: [{ n: "L3", keV: 0.931 }, { n: "L2", keV: 0.951 }, { n: "L1", keV: 1.096 }, { n: "K", keV: 8.979 }] },
  { name: "Aluminum (Al)", symbol: "Al", Z: 13, A: 26.9815, density_g_cm3: 2.6989, delta_10keV: 5.43e-6, beta_10keV: 6.99e-8, mu_rho_10keV: 26.24,
    edges: [{ n: "K", keV: 1.560 }] },
  { name: "Beryllium (Be)", symbol: "Be", Z: 4, A: 9.0121, density_g_cm3: 1.848, delta_10keV: 4.01e-6, beta_10keV: 2.13e-9, mu_rho_10keV: 1.17,
    edges: [{ n: "K", keV: 0.111 }] },
  { name: "Diamond (C)", symbol: "C", Z: 6, A: 12.011, density_g_cm3: 3.515, delta_10keV: 7.21e-6, beta_10keV: 1.57e-8, mu_rho_10keV: 4.52,
    edges: [{ n: "C K", keV: 0.284 }] },
  { name: "Kapton (Polyimide)", symbol: "C22H10N2O5", Z: 7, A: 382.32, density_g_cm3: 1.42, delta_10keV: 2.94e-6, beta_10keV: 6.58e-9, mu_rho_10keV: 4.70,
    edges: [{ n: "C K", keV: 0.284 }, { n: "N K", keV: 0.410 }, { n: "O K", keV: 0.532 }] },
  { name: "Mylar (PET)", symbol: "C10H8O4", Z: 6.4, A: 192.17, density_g_cm3: 1.39, delta_10keV: 2.88e-6, beta_10keV: 6.32e-9, mu_rho_10keV: 4.61,
    edges: [{ n: "C K", keV: 0.284 }, { n: "O K", keV: 0.532 }] },
  { name: "Silicon Dioxide (SiO2)", symbol: "SiO2", Z: 10, A: 60.084, density_g_cm3: 2.20, delta_10keV: 4.55e-6, beta_10keV: 5.23e-8, mu_rho_10keV: 24.1,
    edges: [{ n: "O K", keV: 0.532 }, { n: "Si K", keV: 1.839 }] },
  { name: "Air (NTP, 20°C, 1atm)", symbol: "Air", Z: 7.2, A: 28.97, density_g_cm3: 0.001205, delta_10keV: 2.45e-9, beta_10keV: 6.12e-12, mu_rho_10keV: 5.15,
    edges: [{ n: "N K", keV: 0.410 }, { n: "O K", keV: 0.532 }, { n: "Ar K", keV: 3.206 }] },
  { name: "Water (H2O)", symbol: "H2O", Z: 3.3, A: 18.015, density_g_cm3: 1.00, delta_10keV: 2.11e-6, beta_10keV: 5.26e-9, mu_rho_10keV: 5.33,
    edges: [{ n: "O K", keV: 0.532 }] }
];

// Useful Beamline External Links
var USEFUL_LINKS = [
  {
    category: "광학 & 감쇠 계산 (X-ray Optics & Attenuation)",
    links: [
      { title: "CXRO X-Ray Interactions with Matter", url: "https://henke.lbl.gov/optical_constants/", desc: "Berkeley Lab의 전설적인 X선 광학 상수 및 투과율 계산 도구" },
      { title: "NIST X-Ray Form Factor & Attenuation", url: "https://www.nist.gov/pml/x-ray-form-factor-attenuation-and-scattering-tables", desc: "NIST FFAST 표준 원자 산란 인자 및 감쇠 계수 데이터베이스" },
      { title: "RefractiveIndex.info", url: "https://refractiveindex.info/", desc: "광학 및 X선 영역 굴절률 n, k 종합 데이터베이스" },
      { title: "XOP: X-ray Oriented Programs", url: "https://www.esrf.fr/Instrumentation/software/data-analysis/xop2.4", desc: "ESRF 빔라인 광학 시뮬레이션 패키지" }
    ]
  },
  {
    category: "방사광 가속기 포털 (Synchrotrons & Facilities)",
    links: [
      { title: "PAL / PLS-II (Pohang Light Source)", url: "https://pal.postech.ac.kr/", desc: "포항가속기연구소 3세대 & 4세대 PAL-XFEL 정보" },
      { title: "SPring-8 / SACLA", url: "http://www.spring8.or.jp/", desc: "일본 RIKEN 대형 방사광 시설 및 빔라인 매뉴얼" },
      { title: "ESRF (European Synchrotron Radiation Facility)", url: "https://www.esrf.fr/", desc: "유럽 방사광 가속기 데이터 및 분석 툴킷" },
      { title: "APS (Advanced Photon Source - Argonne)", url: "https://www.aps.anl.gov/", desc: "미국 아르곤 국립연구소 빔라인 도구 및 계산기" },
      { title: "NSLS-II (Brookhaven National Lab)", url: "https://www.bnl.gov/nsls2/", desc: "브룩헤이븐 국립연구소 차세대 빔라인" }
    ]
  },
  {
    category: "결정학 & 산란 툴킷 (Crystallography & Scattering)",
    links: [
      { title: "IUCr International Tables for Crystallography", url: "https://it.iucr.org/", desc: "국제 결정학 연합 공식 표준 테이블 및 공간군 정보" },
      { title: "American Mineralogist Crystal Structure DB", url: "http://rruff.geo.arizona.edu/AMS/amcsd.php", desc: "각종 광물 및 단결정 구조 파라미터 검색" },
      { title: "PyFAI (Fast Azimuthal Integration)", url: "https://pyfai.readthedocs.io/", desc: "2D 디텍터 방위각 적분 및 캘리브레이션 툴" }
    ]
  }
];

// Pre-defined Checklist Templates
