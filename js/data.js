/**
 * BEAMLINE TOOLKIT — Internal Reference Data & Physical Constants
 * Compatibility: CentOS 7 (Firefox 60 ESR, Chrome 60~70)
 * Note: No fetch API used, all constants and datasets are embedded in-memory.
 */

// Fundamental Physical Constants (CODATA 2018 / 2022 standards)
var CONSTANTS = {
  h: 6.62607015e-34,         // Planck constant (J·s)
  hbar: 1.054571817e-34,     // Reduced Planck constant (J·s)
  c: 299792458,              // Speed of light in vacuum (m/s)
  e: 1.602176634e-19,        // Elementary charge (C)
  hc_eV_A: 12398.41984,      // hc product in eV·Å (E[eV] * λ[Å] = 12398.41984)
  hc_keV_nm: 1.239841984,    // hc product in keV·nm
  r_e: 2.8179403262e-15,     // Classical electron radius (m)
  N_A: 6.02214076e23,        // Avogadro constant (mol^-1)
  k_B: 1.380649e-23          // Boltzmann constant (J/K)
};

// Common X-ray Emission Lines (in eV and Å)
var EMISSION_LINES = [
  { name: "Cu Kα1", energy_eV: 8046.3, lambda_A: 1.54056, desc: "Copper characteristic line 1" },
  { name: "Cu Kα2", energy_eV: 8027.8, lambda_A: 1.54439, desc: "Copper characteristic line 2" },
  { name: "Cu Kβ",  energy_eV: 8905.3, lambda_A: 1.39222, desc: "Copper Kβ line" },
  { name: "Mo Kα1", energy_eV: 17479.3, lambda_A: 0.70930, desc: "Molybdenum characteristic line 1" },
  { name: "Mo Kα2", energy_eV: 17374.3, lambda_A: 0.71359, desc: "Molybdenum characteristic line 2" },
  { name: "Mo Kβ",  energy_eV: 19608.3, lambda_A: 0.63229, desc: "Molybdenum Kβ line" },
  { name: "Ag Kα1", energy_eV: 22162.9, lambda_A: 0.55941, desc: "Silver characteristic line 1" },
  { name: "Cr Kα1", energy_eV: 5414.7,  lambda_A: 2.28970, desc: "Chromium characteristic line 1" },
  { name: "Co Kα1", energy_eV: 6930.3,  lambda_A: 1.78897, desc: "Cobalt characteristic line 1" },
  { name: "Fe Kα1", energy_eV: 6403.8,  lambda_A: 1.93604, desc: "Iron characteristic line 1" }
];

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
var MATERIALS_DB = [
  { name: "Silicon (Si)", symbol: "Si", Z: 14, A: 28.0855, density_g_cm3: 2.329, delta_10keV: 4.85e-6, beta_10keV: 7.23e-8, mu_rho_10keV: 31.84 },
  { name: "Germanium (Ge)", symbol: "Ge", Z: 32, A: 72.63, density_g_cm3: 5.323, delta_10keV: 1.05e-5, beta_10keV: 8.82e-7, mu_rho_10keV: 140.2 },
  { name: "Gold (Au)", symbol: "Au", Z: 79, A: 196.966, density_g_cm3: 19.32, delta_10keV: 3.01e-5, beta_10keV: 2.21e-6, mu_rho_10keV: 213.5 },
  { name: "Platinum (Pt)", symbol: "Pt", Z: 78, A: 195.084, density_g_cm3: 21.45, delta_10keV: 3.25e-5, beta_10keV: 2.38e-6, mu_rho_10keV: 209.1 },
  { name: "Rhodium (Rh)", symbol: "Rh", Z: 45, A: 102.905, density_g_cm3: 12.41, delta_10keV: 2.28e-5, beta_10keV: 8.24e-7, mu_rho_10keV: 124.7 },
  { name: "Nickel (Ni)", symbol: "Ni", Z: 28, A: 58.693, density_g_cm3: 8.908, delta_10keV: 1.83e-5, beta_10keV: 1.01e-6, mu_rho_10keV: 214.2 },
  { name: "Copper (Cu)", symbol: "Cu", Z: 29, A: 63.546, density_g_cm3: 8.96, delta_10keV: 1.79e-5, beta_10keV: 1.25e-6, mu_rho_10keV: 218.4 },
  { name: "Aluminum (Al)", symbol: "Al", Z: 13, A: 26.9815, density_g_cm3: 2.6989, delta_10keV: 5.43e-6, beta_10keV: 5.63e-8, mu_rho_10keV: 26.24 },
  { name: "Beryllium (Be)", symbol: "Be", Z: 4, A: 9.0121, density_g_cm3: 1.848, delta_10keV: 4.01e-6, beta_10keV: 1.72e-9, mu_rho_10keV: 1.17 },
  { name: "Diamond (C)", symbol: "C", Z: 6, A: 12.011, density_g_cm3: 3.515, delta_10keV: 7.21e-6, beta_10keV: 9.35e-9, mu_rho_10keV: 4.52 },
  { name: "Kapton (Polyimide)", symbol: "C22H10N2O5", Z: 7, A: 382.32, density_g_cm3: 1.42, delta_10keV: 2.94e-6, beta_10keV: 5.34e-9, mu_rho_10keV: 4.70 },
  { name: "Mylar (PET)", symbol: "C10H8O4", Z: 6.4, A: 192.17, density_g_cm3: 1.39, delta_10keV: 2.88e-6, beta_10keV: 5.12e-9, mu_rho_10keV: 4.61 },
  { name: "Silicon Dioxide (SiO2)", symbol: "SiO2", Z: 10, A: 60.084, density_g_cm3: 2.20, delta_10keV: 4.55e-6, beta_10keV: 4.21e-8, mu_rho_10keV: 24.1 },
  { name: "Air (NTP, 20°C, 1atm)", symbol: "Air", Z: 7.2, A: 28.97, density_g_cm3: 0.001205, delta_10keV: 2.45e-9, beta_10keV: 3.65e-12, mu_rho_10keV: 5.15 },
  { name: "Water (H2O)", symbol: "H2O", Z: 3.3, A: 18.015, density_g_cm3: 1.00, delta_10keV: 2.11e-6, beta_10keV: 2.85e-9, mu_rho_10keV: 5.33 }
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
var DEFAULT_CHECKLISTS = [
  {
    title: "빔라인 세팅 및 광학계 점검",
    items: [
      { text: "저장링 빔 전류(Current) 및 충전 모드 확인", done: true },
      { text: "프론트엔드(FE) 셔터 인터록 및 진공 레벨 정상 확인", done: true },
      { text: "모노크로메이터(Monochromator) 냉각수 유량 및 온도 체크", done: false },
      { text: "모노크로메이터 Energy Calibration (Cu or Fe Foil 흡수단 스캔)", done: false },
      { text: "슬릿(Slits) 칼리브레이션 및 빔 센터링 확인", done: false },
      { text: "미러(Mirror) 각도 및 포커싱 빔 프로파일 측정", done: false },
      { text: "Ion Chamber / Diode 신호 감도 및 오프셋 조정", done: false }
    ]
  },
  {
    title: "실험 전 샘플 및 디텍터 준비",
    items: [
      { text: "샘플 스테이지 모터 리미트(Limit) 및 홈 포지션(Home) 확인", done: false },
      { text: "디텍터(Pilatus/Eiger/CCD) 펠티에 냉각 온도 도달 확인", done: false },
      { text: "표준 시료(CeO2 / LaB6 / Si) 이용 디텍터 캘리브레이션(Calibrant)", done: false },
      { text: "Dark frame(암전류) 및 Flat field 보정 데이터 측정", done: false },
      { text: "진공 챔버 / 헬륨 플라이트 튜브(Flight Tube) 윈도우 점검", done: false },
      { text: "데이터 스토리지 용량 및 자동 백업 스크립트 실행 확인", done: false }
    ]
  }
];
