/**
 * BEAMLINE TOOLKIT — Direct Full-Page Bilingual Translation System (Korean / English)
 * 100% Offline-Native, Zero-dependency, Compatible with CentOS 7 Firefox 60 ESR
 */
(function (window) {
  "use strict";

  var translations = {
    ko: {
      // Navigation & Sidebar
      nav_settings: "IV. SETTINGS",
      nav_about: "V. ABOUT",

      nav_spectroscopy: "I. SPECTROSCOPY",
      nav_goniometry: "II. GONIOMETRY",

      // Calculator views
      b_spec_title: "SPECTROSCOPY — 에너지·파장·물질 상호작용",
      b_spec_desc: "광자 에너지와 파장, 결정 격자 간격, 투과율과 분해능 계산",
      b_gonio_title: "GONIOMETRY — 각도·기하 배치",
      b_gonio_desc: "브래그 각도, 상호공간 Q 벡터, 빔 풋프린트와 디텍터 기하 계산",
      nav_record: "III. RECORD",
      nav_dashboard_index: "CONTENTS",

      // RECORD view
      b_rec_title: "RECORD — 방사광 빔타임 로그북 & 실시간 기록",
      b_rec_desc: "연구 노트(ELN/Notion/Paper)용 표준 템플릿과 빔타임 이벤트 1클릭 복사 스니펫",
      rec_copied: "클립보드에 복사되었습니다.",
      btn_copy_results: "결과값 전체 복사",

      // Settings Tab (previously English-only; these are reached through t()
      // at runtime, so Korean users were seeing the raw key names)
      set_card_lang_title: "§ 1. 언어 선택 (Language)",
      lang_desc: "모든 계산기와 기록 화면의 인터페이스 언어를 즉시 전환합니다.",
      btn_lang_ko: "한국어 (Korean)",
      btn_lang_en: "English",
      set_card_theme_title: "§ 2. 화면 테마 설정 (Display Theme)",
      set_card_shortcuts_title: "§ 3. 키보드 단축키 안내",

      // ABOUT view — project information first, funding demoted to the footer
      about_tagline: "방사광 X선 실험을 위한 가벼운 계산\u00b7기록 툴킷.",
      about_docs: "Documentation",
      about_feedback: "Feedback",
      about_contact: "Contact",
      about_what_title: "구성",
      about_f1_t: "SPECTROSCOPY",
      about_f1_d: "에너지·파장 변환, 격자면 간격, 복소 굴절률과 투과율, 에너지 분해능과 광자 플럭스.",
      about_f2_t: "GONIOMETRY",
      about_f2_d: "브래그 각도, 상호공간 Q 벡터, 빔 풋프린트, 디텍터 기하와 슬릿 수용각, 오일러 크래들 보정.",
      about_f3_t: "RECORD",
      about_f3_d: "한 번의 클릭으로 남기는 실험 로그와 세션 맥락. 외부 로그북에 붙여넣을 세션 헤더를 자동 생성합니다.",
      about_author_title: "만든 사람",
      about_person_role: "서강대학교 물리학과 석사과정 · 방사광 X선 광학 & 결맞음 회절 이미징",
      about_person_note: "빔타임 현장에서 매번 같은 계산을 반복하다가, 필요한 도구를 한곳에 모으려고 시작한 프로젝트입니다.",
      about_research_title: "연구 분야",
      about_scope: "브래그 각도, 파장 변환, 격자면 간격, 산란 벡터처럼 X선 회절 실험에서 반복적으로 필요한 계산을 한 화면에서 처리하고, 실험 세션의 기본 맥락과 로그를 가볍게 남기도록 만들어졌습니다. 기존 실험 노트를 대체하는 것이 아니라, 매번 같은 계산과 같은 머리말을 다시 쓰는 수고를 덜어주는 앞단 도구입니다.",
      about_design_title: "설계 원칙",
      about_p1: "계정도, 서버도, 업로드도 없습니다. 모든 데이터는 이 브라우저의 localStorage에만 저장되고, JSON으로 내보내거나 불러올 수 있습니다.",
      about_p2: "네트워크 없이 동작합니다. 외부 라이브러리, 웹폰트, 트래킹 스크립트를 쓰지 않습니다.",
      about_p3: "연구실의 오래된 환경을 전제로 만들었습니다 \u2014 CentOS 7의 Firefox 60 ESR에서도 동일하게 동작합니다.",
      about_p4: "필요한 것만 보여줍니다. 세부 정보 입력을 강요하지 않고, 빈 항목도 정상으로 취급합니다.",
      about_sciencetitle: "계산 근거",
      about_science: "물리 상수는 CODATA 권장값을, 결정 격자 상수와 산란 인자는 공개된 결정학 데이터를 사용합니다. 계산 결과는 실험 계획과 현장 판단을 돕기 위한 것이며, 발표\u00b7출판에 사용하기 전에는 직접 검증하시기 바랍니다.",
      about_sponsor_btn: "Sponsor",
      about_developed_by: "Developed by",
      about_supported_by: "Supported by",

      sc_1: "SPECTROSCOPY 이동",
      sc_2: "GONIOMETRY 이동",
      sc_3: "RECORD 이동",
      sc_4: "SETTINGS 이동",
      sc_5: "ABOUT 이동",
      sc_6: "INDEX 이동",

      res_scatt_q: "산란 벡터 Q",

      toc_tool_lattice: "격자 상수 & 밀러 지수 → 격자면 간격",
      lat_title: "§ 2. 격자 상수 & 밀러 지수 → 격자면 간격 (Lattice & Miller Indices)",
      lat_system: "결정계 (Crystal System)",
      lat_energy: "브래그 각도 산출용 에너지",
      lat_r_d: "격자면 간격 d",
      lat_r_q: "산란 벡터 |Q| = 2π/d",
      lat_r_theta: "브래그 각도 θ (2θ)",
      lat_r_vol: "단위포 부피 V",
      lat_no_bragg: "회절 조건 불가",
      lat_err_cell: "격자 상수 a, b, c는 0보다 커야 합니다.",
      lat_err_hkl: "밀러 지수 h, k, l 중 하나 이상이 0이 아니어야 합니다.",
      lat_err_angles: "입력한 격자각으로는 단위포를 구성할 수 없습니다.",
      lat_err_range: "입력값이 허용 범위를 벗어났습니다.",
      lat_centering: "격자 중심화 (Centring)",
      lat_refl_title: "이 에너지에서 접근 가능한 반사",
      lat_refl_hkl: "h k l",
      lat_refl_d: "d (Å)",
      lat_refl_tth: "2θ (°)",
      lat_refl_q: "|Q| (Å⁻¹)",
      lat_refl_note: "{shown}개 표시 · 중심화 조건으로 {extinct}개 소멸",
      lat_refl_none: "이 에너지에서는 회절 조건을 만족하는 반사가 없습니다.",

      // Reference datasheet (§ 9)
      const_kicker: "부록 · 참조 데이터",
      const_title: "기본 물리 상수 및 결정 격자 데이터",
      const_note: "CODATA 2022 권장값. 격자면 간격은 298.15 K 기준이며, (exact)는 SI 정의에 의해 오차가 없는 값이다.",
      const_hdr_symbol: "기호",
      const_hdr_quantity: "물리량",
      const_hdr_value: "값",
      const_hdr_unit: "단위",
      const_hc: "광자 에너지-파장 적",
      const_h: "플랑크 상수",
      const_hbar: "디랙 상수",
      const_c: "진공 중 광속",
      const_e: "기본 전하",
      const_re: "고전 전자 반경",
      const_me: "전자 정지 질량",
      const_alpha: "미세구조 상수",
      const_na: "아보가드로 상수",
      const_kb: "볼츠만 상수",
      const_dimensionless: "무차원",
      const_group_d: "결정 격자면 간격 d (298.15 K)",
      const_d_si: "실리콘 Si(111)",
      const_d_ge: "게르마늄 Ge(111)",
      const_d_c: "다이아몬드 C(111)",

      // Model validity & approximation disclosure
      validity_model: "MODEL",
      vm_bragg_kinematic: "운동학적 회절 (n = 1, 다중산란 무시)",
      vm_bragg_norefract: "굴절 보정 없음 — 매우 작은 \u03b8에서 오차",
      vw_bragg_nosolution: "\u03bb/2d > 1 \u2014 이 에너지에서는 회절 조건이 성립하지 않습니다.",
      vw_bragg_smallangle: "2\u03b8 < 1\u00b0 \u2014 굴절률 보정이 무시할 수 없는 영역입니다.",
      vm_q_elastic: "탄성 산란 (|k_in| = |k_out|)",
      vm_scaling_samed: "동일한 반사면(d 고정) 가정",
      vm_scaling_norefract: "굴절 보정 없음",
      vw_scaling_nosolution: "sin\u03b8 > 1 \u2014 목표 에너지에서 이 반사는 접근할 수 없습니다.",
      vm_fp_flat: "평평한 시료, 빔 투영 방향 길이 L = V / sin\u03b8",
      vm_fp_nodiv: "빔 발산과 반음영(penumbra) 무시",
      vw_fp_angle_domain: "입사각은 0\u00b0 < \u03b8 \u2264 90\u00b0 범위여야 합니다.",
      vw_fp_grazing: "극저각 \u2014 빔 발산에 의한 반음영이 풋프린트와 맞먹어 값이 과대평가됩니다.",
      vm_ang_smallangle: "소각 근사 \u0394\u03b8 \u2243 p / D",
      vm_ang_normal: "디텍터가 빔에 수직, 점퍼짐함수(PSF) 무시",
      vw_ang_smallangle_break: "소각 근사 오차가 커졌습니다 \u2014 atan(p/D)를 쓰십시오.",
      vm_slit_gaussian: "가우시안 빔 프로파일",
      vm_slit_quadrature: "광원 크기와 발산 기여를 제곱합으로 결합",
      vm_slit_nooptics: "광원-슬릿 사이 집속 광학계 없음",
      vw_slit_distance: "광원-슬릿 거리는 0보다 커야 합니다.",
      vm_refract_scaling: "10 keV 실측값에서 \u03b4 \u221d E\u207b\u00b2, \u03b2 \u221d E\u207b\u00b3\u02d9\u2075 로 외삽",
      vm_refract_noedge: "구간 내 흡수단(absorption edge) 없음을 가정",
      vm_refract_beer: "Beer-Lambert 단일 물질 감쇠",
      vw_refract_range: "스케일링 검증 구간(5\u201330 keV)을 벗어났습니다 \u2014 흡수단 근처면 값이 크게 어긋납니다.",
      vm_crit_smallangle: "\u03b8c = \u221a(2\u03b4) \u2014 cos\u03b8c = 1\u2212\u03b4 의 소각 전개",
      vm_crit_noabs: "흡수(\u03b2) 무시 \u2014 이상적인 급준 차단",
      vm_grating_equation: "격자 방정식 d(sin\u03b1 + sin\u03b2) = m\u03bb",
      vm_res_darwin: "완전결정 Darwin 폭 기반 추정",
      vm_res_perfect: "변형·모자이크 없는 완전결정 가정",
      vm_flux_linear: "저장링 전류에 선형 비례",
      vm_flux_estimate: "광학계 효율은 사용자 입력값 \u2014 실측 대체 불가",
      vm_drift_linear: "선형 열팽창 계수 (온도 무관 상수)",
      vw_drift_range: "\u0394T가 큽니다 \u2014 열팽창 계수의 온도 의존성을 무시할 수 없습니다.",
      vm_cdi_farfield: "원거리장(Fraunhofer) 회절",
      vm_cdi_coherent: "완전 결맞음 조명 가정",
      vw_cdi_nearfield: "Fresnel 수 F > 1 \u2014 근거리장 영역이라 원거리장 가정이 깨집니다.",
      vm_lat_exact: "역격자 계량 텐서 \u2014 근사 없음, 7개 결정계 정확",
      vm_lat_nosymmetry: "격자 중심화 소멸만 적용 — 나선축·글라이드면 소멸칙은 미검사",
      vm_euler_rigid: "강체 회전, 기계적 오프셋 없음",
      vm_energy_exact: "E\u00b7\u03bb = hc \u2014 근사 없음",

      // Mini visualizers
      mp_footprint: "입사각에 따른 풋프린트",
      mp_transmit: "두께에 따른 투과율",
      mp_bragg: "에너지에 따른 브래그 각도",
      mp_slit: "거리에 따른 빔 FWHM",
      mp_x_angle: "입사각 (°)",
      mp_y_footprint: "풋프린트 (mm)",
      mp_x_thickness: "두께 (μm)",
      mp_y_transmit: "투과율 (%)",
      mp_x_energy: "에너지 (keV)",
      mp_y_theta: "θ (°)",
      mp_x_distance: "광원 거리 (m)",
      mp_y_fwhm: "FWHM (mm)",
      mp_sample: "시료",

      // Themes (7 palettes)
      theme_current_prefix: "현재 테마:",
      theme_desc: "일곱 가지 테마 중 하나를 선택합니다. 레이아웃과 인쇄 규격은 모든 테마에서 동일하게 유지됩니다.",
      theme_paper_name: "학술 논문 (Academic Paper)",
      theme_paper_desc: "미색 종이 + 잉크 블랙 + 옥스퍼드 네이비 — 기본 인쇄 규격",
      theme_parchment_name: "빈티지 양피지 (Vintage Parchment)",
      theme_parchment_desc: "누렇게 바랜 연구 노트 + 짙은 밤색 잉크 — 눈이 편안한 휴식용",
      theme_datasheet_name: "공학 데이터시트 (Technical Datasheet)",
      theme_datasheet_desc: "쿨 화이트 종이 + 제도용 네이비 잉크 + 밀리미터 방안 그리드 스펙시트",
      theme_blueprint_name: "사이아노타입 청사진 (Cyanotype Blueprint)",
      theme_blueprint_desc: "딥 프러시안 블루 도면 + 초크 화이트/시안 선화 엔지니어링 청사진",
      theme_console_name: "제어실 콘솔 (Beamline Control Room)",
      theme_console_desc: "실제 가속기 제어실(EPICS) 스타일의 초고대비 산업용 다크 모드",
      theme_crt_name: "CRT 터미널 (Green / Amber)",
      theme_crt_desc: "80년대 실험실 CRT 인광 녹색 + 앰버 강조, 전면 모노스페이스",
      theme_tokyo_name: "도쿄 나이트 (Neon Dark)",
      theme_tokyo_desc: "모던 네온 블루/퍼플 다크, 고가독성",

      sidebar_offline: "Client Offline-Ready",
      search_ph: "검색",
      search_reference: "참조",
      search_empty: "일치하는 항목 없음",

      // Banners
      b_set_title: "설정 및 히스토리 관리 (Settings & History)",
      b_set_desc: "언어 설정, 테마 변경, 계산 기록 관리, 단축키 안내 및 전체 데이터 백업/복원",

      // Table of Contents (TOC)
      toc_pretitle: "SYNCHROTRON X-RAY OPTICS & BEAMLINE MONOGRAPH",
      toc_maintitle: "INDEX",
      toc_subtitle: "방사광 X선 광학 계산, 빔라인 물리량 분석, 실험 기록 및 결정학 레퍼런스 종합 색인",
      toc_sec1_title: "분광 — 에너지, 파장, 물질 상호작용",
      toc_sec1_desc: "에너지-파장 변환, 결정 격자 간격, 복소 굴절률과 투과율, 에너지 분해능 및 플럭스",
      toc_tool_opt_1: "에너지 - 파장 - 주파수 변환",
      toc_tool_opt_2: "브래그 법칙 3방향 계산 수트",
      toc_tool_opt_3: "회절격자 분산 및 분해능",
      toc_tool_opt_4: "복소 굴절률 및 X선 투과율",
      toc_tool_opt_5: "에너지 스케일링 & 각도 보정",
      toc_tool_opt_6: "Chi-Phi 오일러 크래들 보정",
      toc_tool_opt_7: "전반사 임계각 (Total Reflection)",
      toc_tool_opt_8: "상호공간 Q-Space 및 주기 변환",
      toc_sec2_title: "고니오메트리 — 각도 및 기하 배치",
      toc_sec2_desc: "브래그 각도, 상호공간 Q 벡터, 빔 풋프린트, 디텍터 기하, 슬릿 및 크래들 보정",
      toc_tool_beam_1: "시료 상 빔 풋프린트 & 스필오버",
      toc_tool_beam_2: "빔라인 광자 플럭스 (Photon Flux)",
      toc_tool_beam_3: "에너지 분해능 (ΔE/E) 계산",
      toc_tool_beam_4: "디텍터 각도 분해능 (Angular Res)",
      toc_tool_beam_5: "CDI / BCDI 결맞음 오버샘플링",
      toc_tool_beam_6: "슬릿 간격 및 빔 수용각",
      toc_tool_beam_7: "결정 열팽창 각도 및 에너지 시프트 (Thermal Drift)",
      toc_sec3_title: "로그북 & 실시간 기록 (Record)",
      toc_sec3_desc: "연구 노트용 표준 로그북 서식 템플릿과 빔타임 실시간 이벤트 1클릭 복사 스니펫",
      toc_tool_rec_1: "빔타임 로그북 서식 프리셋 (Logbook Headers)",
      toc_tool_rec_2: "실시간 빔타임 이벤트 스니펫 (In-Situ Snippets)",
      toc_sec6_title: "환경설정 및 아카이브 (Settings)",
      toc_sec6_desc: "언어 설정, 테마 변경, 계산 히스토리 관리, 백업/복원 및 단축키 가이드",
      toc_tool_set_1: "언어 설정 (Language Selection)",
      toc_tool_set_2: "화면 테마 모드 (Theme Mode)",
      toc_tool_set_5: "키보드 단축키 안내 (Shortcuts)",
      toc_sec7_title: "연구자 프로필 및 후원 (About)",
      toc_sec7_desc: "연구자 약력, X선 광학·BCDI 연구 분야, 연락처 및 프로젝트 후원",

      // Optics Suite
      opt_t1_title: "§ 1. 에너지 - 파장 - 주파수 변환 (Energy-Wavelength-Frequency)",
      lbl_energy: "에너지",
      lbl_wavelength: "파장",
      lbl_frequency: "주파수",
      opt_t1_res_label: "실시간 등가 변환값",
      opt_t2_title: "§ 1. 브래그 법칙 (Bragg's Law 3-Way Suite)",
      bragg_solve_energy: "에너지 E — 주어진 값 d, 2θ",
      bragg_solve_d: "격자면 간격 d — 주어진 값 2θ, E",
      bragg_solve_angle: "회절각 2θ — 주어진 값 d, E",
      lbl_dspacing: "격자면 간격 d",
      lbl_tth: "회절각 2θ",
      lbl_presets: "자주 쓰는 결정면 프리셋",
      lbl_inc_energy: "입사 에너지",
      res_calc_energy: "계산된 에너지 (E)",
      res_calc_d: "계산된 격자면 간격 (d)",
      res_calc_tth: "계산된 회절각 2θ",
      res_bragg_unreachable: "회절 불가 (λ > 2d)",
      opt_t3_title: "§ 5. 회절격자 (Diffraction Grating)",
      lbl_grating_lines: "격자선 밀도",
      lbl_photon_energy: "광자 에너지",
      lbl_alpha: "입사각 <i class=\"formula\">α</i>",
      lbl_order: "회절 차수 <i class=\"formula\">m</i>",
      res_beta: "회절 출사각 <i class=\"formula\">β</i>",
      res_dispersion: "각분산력 (<i class=\"formula\">dβ/dλ</i>)",
      opt_t4_title: "§ 3. 굴절률 및 X선 투과율 (<i class=\"formula\">n = 1 - δ + iβ</i>)",
      lbl_select_mat: "재료 선택 (Materials DB)",
      lbl_thickness: "시료 두께",
      res_trans: "빔 투과율 (Transmittance)",
      res_atten_len: "감쇠 거리 (1/<i class=\"formula\">e</i> length)",
      res_crit_ang: "임계각 <i class=\"formula\">θ</i><sub>c</sub>",
      opt_t5_title: "§ 3. 에너지 스케일링 & 각도 계산기 (Energy Scaling)",
      sec_ref_condition: "기준 빔 조건 (Reference Beam & Angle)",
      sec_target_condition: "목표 에너지 선택 (Target Beam Energy)",
      lbl_ref_energy: "기준 에너지 E_ref",
      lbl_ref_theta: "기준 각도 θ",
      lbl_ref_twotheta: "기준 각도 2θ",
      lbl_target_energy: "목표 에너지 E_target",
      lbl_target_presets: "빠른 에너지 프리셋",
      res_target_twotheta: "목표 회절각 2θ",
      res_target_theta: "목표 브래그각 θ",
      res_unreachable: "회절 불가 (sin θ₂ > 1)",
      opt_t6_title: "§ 7. Chi-Phi 오일러 크래들 보정 (Eulerian Cradle)",
      lbl_chiphi_th: "브래그 각도 <i class=\"formula\">θ</i>",
      lbl_chiphi_chi: "Chi 틸트 변화량 <i class=\"formula\">Δχ</i>",
      res_phi_corr: "Phi 축 보정량 (<i class=\"formula\">Δφ</i>)",
      opt_t7_title: "§ 4. 전반사 임계각 (Total External Reflection)",
      lbl_density: "밀도 <i class=\"formula\">ρ</i>",
      lbl_z_over_a: "<i class=\"formula\">Z/A</i> 비",
      res_crit_deg: "임계각 <i class=\"formula\">θ</i><sub>c</sub> (deg / arcmin)",
      res_crit_mrad: "임계각 <i class=\"formula\">θ</i><sub>c</sub> (mrad)",
      res_crit_qc: "임계 산란벡터 <i class=\"formula\">Q</i><sub>c</sub>",
      opt_t8_title: "§ 2. 상호공간 Q-Space 변환 (Reciprocal Space)",
      lbl_angle_th: "각도 <i class=\"formula\">θ</i>",
      lbl_angle_2th: "회절각 <i class=\"formula\">2θ</i>",
      lbl_scatt_q: "산란 벡터 <i class=\"formula\">Q</i>",
      lbl_real_d: "실공간 주기 <i class=\"formula\">d</i>",

      // Beamline Suite
      beam_t1_title: "§ 4. 시료 상 빔 풋프린트 (Beam Footprint)",
      lbl_beam_v: "수직 빔 크기 (V)",
      lbl_beam_h: "수평 빔 크기 (H)",
      lbl_inc_ang: "입사각 <i class=\"formula\">θ</i>",
      lbl_sample_len: "시료 길이 (길이 방향)",
      res_fp_len: "시료 상 풋프린트 길이",
      res_beam_h: "수평 빔 폭",
      beam_t2_title: "§ 7. 빔라인 광자 플럭스 (Photon Flux)",
      lbl_ring_current: "저장링 전류",
      lbl_source_flux: "소스 기준 플럭스",
      lbl_mono_eff: "모노크로메이터 효율",
      lbl_mirror_eff: "미러 반사율",
      lbl_win_trans: "윈도우 투과율",
      res_deliv_flux: "시료 도달 플럭스",
      res_tot_eff: "광학계 전송 효율",
      beam_t3_title: "§ 6. 에너지 분해능 (Energy Resolution ΔE/E)",
      lbl_mono_cryst: "모노크로메이터 결정",
      lbl_beam_div: "빔 수직 발산각 (Divergence)",
      res_delta_e: "총 에너지 대역폭 (<i class=\"formula\">ΔE</i>)",
      res_de_over_e: "에너지 분해능 (<i class=\"formula\">ΔE/E</i>)",
      res_mono_th: "브래그 각도",
      beam_t4_title: "§ 5. 디텍터 각도 분해능 (Angular Resolution)",
      lbl_pixel_size: "픽셀 크기",
      lbl_sample_det_dist: "시료-디텍터 거리",
      res_ang_res_mrad: "각도 분해능 (mrad)",
      res_ang_res_deg: "각도 분해능 (° / \")",
      beam_t5_title: "§ 8. CDI / BCDI 결맞음 오버샘플링 (Oversampling)",
      lbl_det_dist: "디텍터 거리",
      lbl_det_pixel: "디텍터 픽셀 크기",
      lbl_sample_size: "시료/결정 크기",
      res_sigma: "오버샘플링 비율 (<i class=\"formula\">σ</i>)",
      res_speckle: "디텍터 스펙클 크기",
      res_verdict_lbl: "판정 결과:",
      beam_t6_title: "§ 6. 슬릿 간격 및 수용각 (Slit Opening)",
      lbl_source_size: "소스 크기 (FWHM)",
      lbl_source_slit_dist: "소스-슬릿 거리",
      lbl_slit_div: "빔 발산각",
      lbl_gauss_mult: "가우시안 배율",
      res_slit_fwhm: "슬릿 위치 빔 크기 (FWHM)",
      res_slit_open: "권장 슬릿 개구폭",
      beam_t7_title: "§ 8. 결정 열팽창 각도 및 에너지 시프트 (Thermal Drift)",
      lbl_therm_mat: "모노크로메이터 재질",
      lbl_temp_change: "온도 변화 <i class=\"formula\">ΔT</i>",
      lbl_op_energy: "동작 에너지",
      res_th_shift: "브래그 각도 시프트 (<i class=\"formula\">Δθ</i>)",
      res_e_shift: "유효 에너지 시프트 (<i class=\"formula\">ΔE</i>)",

      res_lambda: "파장 <i class=\"formula\">λ</i>",
      res_grating_unreachable: "회절 불가 (|sin β| > 1)",
      res_refract_delta_term: "굴절률 감쇄항",
      res_refract_beta_term: "흡수항",
      res_fp_status: "상태 판정:",
      res_fp_spill: "초과: 빔 스필오버 발생",
      res_fp_ok: "정상: 시료 내 100% 수용",
      res_fp_nolen: "시료 길이 미지정",
      res_out_of_range: "에너지 범위 초과",
      res_cdi_pass: "충족: 나이퀴스트 오버샘플링 성립 (σ ≥ 2.0)",
      res_cdi_marginal: "주의: 한계 오버샘플링 (1.5 ≤ σ < 2.0)",
      res_cdi_fail: "불가: 언더샘플링 / 앨리어싱 발생 (σ < 1.5)"
    },
    en: {
      // Navigation & Sidebar
      nav_settings: "IV. SETTINGS",
      nav_about: "V. ABOUT",

      nav_spectroscopy: "I. SPECTROSCOPY",
      nav_goniometry: "II. GONIOMETRY",

      // Calculator views
      b_spec_title: "SPECTROSCOPY — Energy, Wavelength & Matter",
      b_spec_desc: "Photon energy and wavelength, lattice spacing, transmittance and resolution",
      b_gonio_title: "GONIOMETRY — Angles & Geometry",
      b_gonio_desc: "Bragg angles, reciprocal-space Q, beam footprint and detector geometry",
      nav_record: "III. RECORD",
      nav_dashboard_index: "CONTENTS",

      // RECORD view
      b_rec_title: "RECORD — Experiment Session Log",
      b_rec_desc: "One-click logging. Every field is optional.",
      rec_copied: "Copied to clipboard.",
      btn_copy_results: "Copy all results",

      // ABOUT view — project information first, funding demoted to the footer
      about_tagline: "A lightweight toolkit for X-ray experiments.",
      about_docs: "Documentation",
      about_feedback: "Feedback",
      about_contact: "Contact",
      about_what_title: "What is inside",
      about_f1_t: "SPECTROSCOPY",
      about_f1_d: "Energy-wavelength conversion, lattice plane spacing, complex refractive index and transmittance, energy resolution and photon flux.",
      about_f2_t: "GONIOMETRY",
      about_f2_d: "Bragg angles, reciprocal-space Q, beam footprint, detector geometry and slit acceptance, Eulerian cradle correction.",
      about_f3_t: "RECORD",
      about_f3_d: "One-click experiment logs with session context, plus a formatted session header ready to paste into an external logbook.",
      about_author_title: "Who made it",
      about_person_role: "MSc candidate, Dept. of Physics, Sogang University · Synchrotron X-ray optics & coherent diffraction imaging",
      about_person_note: "Started after repeating the same calculations one beamtime too many, to put the tools that were actually needed in one place.",
      about_research_title: "Research interests",
      about_scope: "Handles the calculations an X-ray diffraction experiment needs over and over \u2014 Bragg angle, wavelength conversion, lattice spacing, scattering vector \u2014 on a single screen, and keeps a light record of session context and logs. It does not replace your lab notebook; it removes the work of redoing the same calculation and retyping the same header every time.",
      about_design_title: "Design principles",
      about_p1: "No account, no server, no upload. Everything lives in this browser's localStorage and can be exported or imported as JSON.",
      about_p2: "Works without a network. No external libraries, web fonts, or tracking scripts.",
      about_p3: "Built for the machines labs actually run \u2014 it behaves identically on Firefox 60 ESR under CentOS 7.",
      about_p4: "Shows only what you need. Nothing forces you to fill in metadata, and empty fields are a valid state.",
      about_sciencetitle: "Sources",
      about_science: "Physical constants use CODATA recommended values; lattice parameters and scattering factors come from published crystallographic data. Results are meant to support experiment planning and on-site decisions \u2014 verify them yourself before using them in a presentation or publication.",
      about_sponsor_btn: "Sponsor",
      about_developed_by: "Developed by",
      about_supported_by: "Supported by",

      sc_1: "Jump to SPECTROSCOPY",
      sc_2: "Jump to GONIOMETRY",
      sc_3: "Jump to RECORD",
      sc_4: "Jump to SETTINGS",
      sc_5: "Jump to ABOUT",
      sc_6: "Jump to INDEX",

      res_scatt_q: "Scattering Vector Q",

      toc_tool_lattice: "Lattice Constants & Miller Indices → d-spacing",
      lat_title: "§ 2. Lattice Constants & Miller Indices → d-spacing",
      lat_system: "Crystal System",
      lat_energy: "Energy for the Bragg angle",
      lat_r_d: "Plane spacing d",
      lat_r_q: "Scattering vector |Q| = 2π/d",
      lat_r_theta: "Bragg angle θ (2θ)",
      lat_r_vol: "Unit cell volume V",
      lat_no_bragg: "No diffraction condition",
      lat_err_cell: "Lattice constants a, b, c must be greater than zero.",
      lat_err_hkl: "At least one of the Miller indices h, k, l must be non-zero.",
      lat_err_angles: "These cell angles cannot form a valid unit cell.",
      lat_err_range: "An input is outside its allowed range.",
      lat_centering: "Lattice centring",
      lat_refl_title: "Reflections reachable at this energy",
      lat_refl_hkl: "h k l",
      lat_refl_d: "d (Å)",
      lat_refl_tth: "2θ (°)",
      lat_refl_q: "|Q| (Å⁻¹)",
      lat_refl_note: "{shown} shown · {extinct} extinguished by the centring condition",
      lat_refl_none: "No reflection satisfies the Bragg condition at this energy.",

      // Reference datasheet (§ 9)
      const_kicker: "Appendix · Reference data",
      const_title: "Fundamental physical constants and crystal lattice data",
      const_note: "CODATA 2022 recommended values. Lattice spacings are quoted at 298.15 K; values marked (exact) are fixed by the SI definitions.",
      const_hdr_symbol: "Symbol",
      const_hdr_quantity: "Quantity",
      const_hdr_value: "Value",
      const_hdr_unit: "Unit",
      const_hc: "Photon energy-wavelength product",
      const_h: "Planck constant",
      const_hbar: "Reduced Planck constant",
      const_c: "Speed of light in vacuum",
      const_e: "Elementary charge",
      const_re: "Classical electron radius",
      const_me: "Electron rest mass",
      const_alpha: "Fine-structure constant",
      const_na: "Avogadro constant",
      const_kb: "Boltzmann constant",
      const_dimensionless: "dimensionless",
      const_group_d: "Crystal d-spacing (298.15 K)",
      const_d_si: "Silicon Si(111)",
      const_d_ge: "Germanium Ge(111)",
      const_d_c: "Diamond C(111)",

      // Model validity & approximation disclosure
      validity_model: "MODEL",
      vm_bragg_kinematic: "Kinematic diffraction (n = 1, no multiple scattering)",
      vm_bragg_norefract: "No refraction correction \u2014 breaks down at very small \u03b8",
      vw_bragg_nosolution: "\u03bb/2d > 1 \u2014 no diffraction condition exists at this energy.",
      vw_bragg_smallangle: "2\u03b8 < 1\u00b0 \u2014 the refractive index correction is no longer negligible.",
      vm_q_elastic: "Elastic scattering (|k_in| = |k_out|)",
      vm_scaling_samed: "Same reflection assumed (d held fixed)",
      vm_scaling_norefract: "No refraction correction",
      vw_scaling_nosolution: "sin\u03b8 > 1 \u2014 this reflection is unreachable at the target energy.",
      vm_fp_flat: "Flat sample, length along the beam projection L = V / sin\u03b8",
      vm_fp_nodiv: "Beam divergence and penumbra ignored",
      vw_fp_angle_domain: "Incidence angle must lie in 0\u00b0 < \u03b8 \u2264 90\u00b0.",
      vw_fp_grazing: "Extreme grazing incidence \u2014 divergence penumbra rivals the footprint, so this overestimates it.",
      vm_ang_smallangle: "Small-angle approximation \u0394\u03b8 \u2243 p / D",
      vm_ang_normal: "Detector normal to the beam, point-spread ignored",
      vw_ang_smallangle_break: "Small-angle error is no longer negligible \u2014 use atan(p/D).",
      vm_slit_gaussian: "Gaussian beam profile",
      vm_slit_quadrature: "Source size and divergence added in quadrature",
      vm_slit_nooptics: "No focusing optics between source and slit",
      vw_slit_distance: "Source-to-slit distance must be greater than zero.",
      vm_refract_scaling: "\u03b4 \u221d E\u207b\u00b2 and \u03b2 \u221d E\u207b\u00b3\u02d9\u2075 extrapolated from tabulated 10 keV values",
      vm_refract_noedge: "Assumes no absorption edge across the interval",
      vm_refract_beer: "Beer-Lambert attenuation, single material",
      vw_refract_range: "Outside the validated scaling range (5\u201330 keV) \u2014 near an absorption edge the result is far off.",
      vm_crit_smallangle: "\u03b8c = \u221a(2\u03b4) \u2014 small-angle expansion of cos\u03b8c = 1\u2212\u03b4",
      vm_crit_noabs: "Absorption (\u03b2) ignored \u2014 ideal sharp cutoff",
      vm_grating_equation: "Grating equation d(sin\u03b1 + sin\u03b2) = m\u03bb",
      vm_res_darwin: "Estimated from the perfect-crystal Darwin width",
      vm_res_perfect: "Perfect crystal assumed \u2014 no strain or mosaicity",
      vm_flux_linear: "Scales linearly with ring current",
      vm_flux_estimate: "Optics efficiencies are user input \u2014 no substitute for a measurement",
      vm_drift_linear: "Linear thermal expansion coefficient (constant in T)",
      vw_drift_range: "Large \u0394T \u2014 the temperature dependence of the expansion coefficient is no longer negligible.",
      vm_cdi_farfield: "Far-field (Fraunhofer) diffraction",
      vm_cdi_coherent: "Fully coherent illumination assumed",
      vw_cdi_nearfield: "Fresnel number F > 1 \u2014 you are in the near field, so the far-field assumption fails.",
      vm_lat_exact: "Reciprocal metric tensor \u2014 exact for all seven crystal systems",
      vm_lat_nosymmetry: "Centring absences only — screw axis and glide plane conditions are not checked",
      vm_euler_rigid: "Rigid-body rotation, no mechanical offsets",
      vm_energy_exact: "E\u00b7\u03bb = hc \u2014 no approximation",

      // Mini visualizers
      mp_footprint: "Footprint vs incidence angle",
      mp_transmit: "Transmittance vs thickness",
      mp_bragg: "Bragg angle vs energy",
      mp_slit: "Beam FWHM vs distance",
      mp_x_angle: "Incidence angle (°)",
      mp_y_footprint: "Footprint (mm)",
      mp_x_thickness: "Thickness (μm)",
      mp_y_transmit: "Transmittance (%)",
      mp_x_energy: "Energy (keV)",
      mp_y_theta: "θ (°)",
      mp_x_distance: "Distance from source (m)",
      mp_y_fwhm: "FWHM (mm)",
      mp_sample: "Sample",

      // Themes (7 palettes)
      theme_current_prefix: "Current theme:",
      theme_desc: "Pick one of seven themes. Layout and print specification stay identical across all themes.",
      theme_paper_name: "Academic Paper",
      theme_paper_desc: "Off-white paper, ink black, Oxford navy — the default print specification",
      theme_parchment_name: "Vintage Parchment",
      theme_parchment_desc: "Aged notebook stock with deep sepia ink — warm and easy on the eyes",
      theme_datasheet_name: "Technical Datasheet",
      theme_datasheet_desc: "Cool white paper, drafting navy ink & millimetre graph spec sheet",
      theme_blueprint_name: "Cyanotype Blueprint",
      theme_blueprint_desc: "Deep Prussian blue drafting board with chalk white & cyan lines",
      theme_console_name: "Beamline Control Room",
      theme_console_desc: "Very high contrast industrial dark mode, styled after an EPICS console",
      theme_crt_name: "CRT Terminal (Green / Amber)",
      theme_crt_desc: "1980s lab phosphor green with amber accent, monospace throughout",
      theme_tokyo_name: "Tokyo Night (Neon Dark)",
      theme_tokyo_desc: "Modern neon blue/purple dark theme, high legibility",

      sidebar_offline: "Client Offline-Ready",
      search_ph: "Search",
      search_reference: "Reference",
      search_empty: "No match",

      // Banners
      b_set_title: "Settings & History Management",
      b_set_desc: "Language selection, display theme mode, calculation history archive, shortcuts, and full data backup/restore",

      // Table of Contents (TOC)
      toc_pretitle: "SYNCHROTRON X-RAY OPTICS & BEAMLINE MONOGRAPH",
      toc_maintitle: "INDEX",
      toc_subtitle: "Comprehensive Index of Synchrotron Optics, Beamline Physics & Experimental Suites",
      toc_sec1_title: "Spectroscopy — Energy, Wavelength & Matter",
      toc_sec1_desc: "Energy-wavelength conversion, lattice spacing, complex refraction and transmittance, resolution and flux",
      toc_tool_opt_1: "Energy - Wavelength - Frequency",
      toc_tool_opt_2: "Bragg's Law 3-Way Suite",
      toc_tool_opt_3: "Diffraction Grating Dispersion & Resolution",
      toc_tool_opt_4: "Complex Refractive Index & Transmittance",
      toc_tool_opt_5: "Energy Scaling & Angular Correction",
      toc_tool_opt_6: "Chi-Phi Eulerian Cradle Correction",
      toc_tool_opt_7: "Total External Reflection & Critical Angle",
      toc_tool_opt_8: "Reciprocal Q-Space & Momentum Transfer",
      toc_sec2_title: "Goniometry — Angles & Geometry",
      toc_sec2_desc: "Bragg angles, reciprocal-space Q, beam footprint, detector geometry, slits and cradle correction",
      toc_tool_beam_1: "Sample Beam Footprint & Spillover",
      toc_tool_beam_2: "Beamline Photon Flux & Efficiency",
      toc_tool_beam_3: "Energy Resolution (ΔE/E) Estimator",
      toc_tool_beam_4: "Detector Angular Resolution & Geometry",
      toc_tool_beam_5: "CDI / BCDI Coherent Oversampling",
      toc_tool_beam_6: "Slit Aperture Opening & Acceptance",
      toc_tool_beam_7: "Crystal Thermal Expansion & Angular Drift",
      toc_sec3_title: "Logbook & Live Records",
      toc_sec3_desc: "Standard logbook templates for lab notebooks and 1-click in-situ beamtime event snippets",
      toc_tool_rec_1: "Beamtime Logbook Header Presets",
      toc_tool_rec_2: "In-Situ Quick Log Snippets",
      toc_sec6_title: "System Settings & Archive",
      toc_sec6_desc: "Language selection, high-contrast theme, calculation run logs, JSON backup & keyboard shortcuts",
      toc_tool_set_1: "Language Selection",
      toc_tool_set_2: "Display Theme Mode",
      toc_tool_set_5: "Keyboard Shortcuts Guide",
      toc_sec7_title: "About the Creator & Research",
      toc_sec7_desc: "Researcher profile, Coherent X-ray Optics / BCDI domain expertise, and GitHub Sponsors",

      // Settings Tab
      set_card_lang_title: "§ 1. Language Selection",
      lang_desc: "Instantaneously switch between Korean and English interface across all tools and calculations.",
      btn_lang_ko: "한국어 (Korean)",
      btn_lang_en: "English",
      set_card_theme_title: "§ 2. Display Theme Configuration",
      set_card_shortcuts_title: "§ 3. Keyboard Shortcuts",

      // Optics Suite
      opt_t1_title: "§ 1. Energy - Wavelength - Frequency Conversion",
      lbl_energy: "Energy",
      lbl_wavelength: "Wavelength",
      lbl_frequency: "Frequency",
      opt_t1_res_label: "Equivalent Physical Quantities",
      opt_t2_title: "§ 1. Bragg's Law (3-Way Suite)",
      bragg_solve_energy: "Energy E — given d, 2θ",
      bragg_solve_d: "d-spacing d — given 2θ, E",
      bragg_solve_angle: "Diffraction angle 2θ — given d, E",
      lbl_dspacing: "Lattice d-spacing d",
      lbl_tth: "Diffraction Angle 2θ",
      lbl_presets: "Common Crystal Reflection Presets",
      lbl_inc_energy: "Incident Energy",
      res_calc_energy: "Calculated Energy (E)",
      res_calc_d: "Calculated d-spacing (d)",
      res_calc_tth: "Calculated Angle 2θ",
      res_bragg_unreachable: "Diffraction Impossible (λ > 2d)",
      opt_t3_title: "§ 5. Diffraction Grating",
      lbl_grating_lines: "Groove Density",
      lbl_photon_energy: "Photon Energy",
      lbl_alpha: "Incident Angle <i class=\"formula\">α</i>",
      lbl_order: "Diffraction Order <i class=\"formula\">m</i>",
      res_beta: "Diffracted Angle <i class=\"formula\">β</i>",
      res_dispersion: "Angular Dispersion (<i class=\"formula\">dβ/dλ</i>)",
      opt_t4_title: "§ 3. Refractive Index & X-ray Transmittance (<i class=\"formula\">n = 1 - δ + iβ</i>)",
      lbl_select_mat: "Select Material (Materials DB)",
      lbl_thickness: "Sample Thickness",
      res_trans: "Beam Transmittance",
      res_atten_len: "Attenuation Length (1/<i class=\"formula\">e</i>)",
      res_crit_ang: "Critical Angle <i class=\"formula\">θ</i><sub>c</sub>",
      opt_t5_title: "§ 3. Energy Scaling & Angle Calculator",
      sec_ref_condition: "Reference Beam & Angle",
      sec_target_condition: "Target Beam Energy Selection",
      lbl_ref_energy: "Reference Energy E_ref",
      lbl_ref_theta: "Reference Angle θ",
      lbl_ref_twotheta: "Reference Angle 2θ",
      lbl_target_energy: "Target Energy E_target",
      lbl_target_presets: "Quick Target Energy Presets",
      res_target_twotheta: "Target Angle 2θ",
      res_target_theta: "Target Angle θ",
      res_unreachable: "Unreachable (sin θ₂ > 1)",
      opt_t6_title: "§ 7. Chi-Phi Eulerian Cradle Correction",
      lbl_chiphi_th: "Bragg Angle <i class=\"formula\">θ</i>",
      lbl_chiphi_chi: "Chi Tilt <i class=\"formula\">Δχ</i>",
      res_phi_corr: "Phi Axis Correction (<i class=\"formula\">Δφ</i>)",
      opt_t7_title: "§ 4. Total External Reflection",
      lbl_density: "Density <i class=\"formula\">ρ</i>",
      lbl_z_over_a: "<i class=\"formula\">Z/A</i> Ratio",
      res_crit_deg: "Critical Angle <i class=\"formula\">θ</i><sub>c</sub> (deg / arcmin)",
      res_crit_mrad: "Critical Angle <i class=\"formula\">θ</i><sub>c</sub> (mrad)",
      res_crit_qc: "Critical Momentum <i class=\"formula\">Q</i><sub>c</sub>",
      opt_t8_title: "§ 2. Reciprocal Space (Q-Space) Conversion",
      lbl_angle_th: "Angle <i class=\"formula\">θ</i>",
      lbl_angle_2th: "Diffraction Angle <i class=\"formula\">2θ</i>",
      lbl_scatt_q: "Scattering Vector <i class=\"formula\">Q</i>",
      lbl_real_d: "Real-space Periodicity <i class=\"formula\">d</i>",

      // Beamline Suite
      beam_t1_title: "§ 4. Beam Footprint on Sample",
      lbl_beam_v: "Vertical Beam Size (V)",
      lbl_beam_h: "Horizontal Beam Size (H)",
      lbl_inc_ang: "Incident Angle <i class=\"formula\">θ</i>",
      lbl_sample_len: "Sample Length",
      res_fp_len: "Footprint Length on Sample",
      res_beam_h: "Horizontal Width",
      beam_t2_title: "§ 7. Beamline Photon Flux",
      lbl_ring_current: "Storage Ring Current",
      lbl_source_flux: "Source Base Flux",
      lbl_mono_eff: "Monochromator Efficiency",
      lbl_mirror_eff: "Mirror Reflectivity",
      lbl_win_trans: "Window Transmittance",
      res_deliv_flux: "Delivered Photon Flux",
      res_tot_eff: "Total Optical Efficiency",
      beam_t3_title: "§ 6. Energy Resolution (ΔE/E)",
      lbl_mono_cryst: "Monochromator Crystal",
      lbl_beam_div: "Vertical Beam Divergence",
      res_delta_e: "Total Bandwidth (<i class=\"formula\">ΔE</i>)",
      res_de_over_e: "Energy Resolution (<i class=\"formula\">ΔE/E</i>)",
      res_mono_th: "Bragg Angle",
      beam_t4_title: "§ 5. Detector Angular Resolution",
      lbl_pixel_size: "Pixel Size",
      lbl_sample_det_dist: "Sample-Detector Distance",
      res_ang_res_mrad: "Angular Resolution (mrad)",
      res_ang_res_deg: "Angular Resolution (° / \")",
      beam_t5_title: "§ 8. CDI / BCDI Coherent Oversampling",
      lbl_det_dist: "Detector Distance",
      lbl_det_pixel: "Detector Pixel Size",
      lbl_sample_size: "Sample / Crystal Size",
      res_sigma: "Oversampling Ratio (<i class=\"formula\">σ</i>)",
      res_speckle: "Detector Speckle Size",
      res_verdict_lbl: "Criterion Verdict:",
      beam_t6_title: "§ 6. Slit Opening & Beam Acceptance",
      lbl_source_size: "Source Size (FWHM)",
      lbl_source_slit_dist: "Source-Slit Distance",
      lbl_slit_div: "Beam Divergence",
      lbl_gauss_mult: "Gaussian Envelope Multiplier",
      res_slit_fwhm: "Beam Size at Slit (FWHM)",
      res_slit_open: "Recommended Slit Opening",
      beam_t7_title: "§ 8. Crystal Thermal Drift (Angle & Energy Shift)",
      lbl_therm_mat: "Monochromator Material",
      lbl_temp_change: "Temperature Change <i class=\"formula\">ΔT</i>",
      lbl_op_energy: "Operating Energy",
      res_th_shift: "Bragg Angle Drift (<i class=\"formula\">Δθ</i>)",
      res_e_shift: "Effective Energy Shift (<i class=\"formula\">ΔE</i>)",

      res_lambda: "Wavelength <i class=\"formula\">λ</i>",
      res_grating_unreachable: "No diffraction (|sin β| > 1)",
      res_refract_delta_term: "Refractive decrement",
      res_refract_beta_term: "Absorption term",
      res_fp_status: "Status:",
      res_fp_spill: "Spillover: beam overfills the sample",
      res_fp_ok: "OK: fully contained on the sample",
      res_fp_nolen: "Sample length not specified",
      res_out_of_range: "Out of energy range",
      res_cdi_pass: "Pass: Nyquist oversampling satisfied (σ ≥ 2.0)",
      res_cdi_marginal: "Caution: marginal oversampling (1.5 ≤ σ < 2.0)",
      res_cdi_fail: "Fail: undersampled / aliasing (σ < 1.5)"
    }
  };

  var I18n = {
    lang: "ko",

    init: function () {
      var saved = localStorage.getItem("bl_toolkit_lang") || "ko";
      this.setLang(saved);
    },

    t: function (key) {
      var current = translations[this.lang] || translations.ko;
      if (current && current[key] !== undefined) return current[key];
      if (translations.ko && translations.ko[key] !== undefined) return translations.ko[key];
      return key;
    },

    // Every wording a key has, in every language. Search matches against all
    // of them, so a Korean interface still finds "goniometry" and an English
    // one still finds "고니오메트리".
    allText: function (key) {
      var out = [];
      for (var lang in translations) {
        if (!translations.hasOwnProperty(lang)) continue;
        if (translations[lang][key] !== undefined) out.push(translations[lang][key]);
      }
      return out.join(" ");
    },

    setLang: function (lang) {
      if (lang !== "ko" && lang !== "en") lang = "ko";
      this.lang = lang;
      localStorage.setItem("bl_toolkit_lang", lang);
      document.documentElement.setAttribute("lang", lang);

      this.applyTranslations();

      // Trigger re-rendering of active components. The calculator suites are
      // re-run as well: their result strings are built in JS, so they keep the
      // previous language until the next recalculation otherwise.
      if (window.initOpticsView) window.initOpticsView();
      if (window.initBeamlineView) window.initBeamlineView();
      if (window.initLattice) window.initLattice();
      if (window.renderValidity) window.renderValidity();
      if (window.renderMiniPlots) window.renderMiniPlots();
    },

    applyTranslations: function () {
      var t = translations[this.lang] || translations.ko;

      // 1. Process all elements with data-i18n (textContent)
      var i18nElements = document.querySelectorAll("[data-i18n]");
      for (var i = 0; i < i18nElements.length; i++) {
        var el = i18nElements[i];
        var key = el.getAttribute("data-i18n");
        if (key && t[key] !== undefined) {
          el.textContent = t[key];
        }
      }

      // 2. Process all elements with data-i18n-html (innerHTML)
      var i18nHtmlElements = document.querySelectorAll("[data-i18n-html]");
      for (var h = 0; h < i18nHtmlElements.length; h++) {
        var hel = i18nHtmlElements[h];
        var hkey = hel.getAttribute("data-i18n-html");
        if (hkey && t[hkey] !== undefined) {
          hel.innerHTML = t[hkey];
        }
      }

      // 3. Process all elements with data-i18n-placeholder (placeholder attribute)
      var i18nPlaceholders = document.querySelectorAll("[data-i18n-placeholder]");
      for (var p = 0; p < i18nPlaceholders.length; p++) {
        var pel = i18nPlaceholders[p];
        var pkey = pel.getAttribute("data-i18n-placeholder");
        if (pkey && t[pkey] !== undefined) {
          pel.setAttribute("placeholder", t[pkey]);
        }
      }

      // 4. Process all elements with data-i18n-title (title attribute)
      var i18nTitles = document.querySelectorAll("[data-i18n-title]");
      for (var tt = 0; tt < i18nTitles.length; tt++) {
        var tel = i18nTitles[tt];
        var tkey = tel.getAttribute("data-i18n-title");
        if (tkey && t[tkey] !== undefined) {
          tel.setAttribute("title", t[tkey]);
        }
      }

      // 5. Settings Language Card Dynamic Update & Button Highlights
      var langCur = document.getElementById("settings-lang-current");
      if (langCur) {
        langCur.textContent = (this.lang === "ko") ? "현재 언어: 한국어 (Korean)" : "Current Language: English";
      }

      var langDesc = document.getElementById("settings-lang-desc");
      if (langDesc) langDesc.textContent = t.lang_desc;

      var btnLangKo = document.getElementById("btn-lang-ko");
      var btnLangEn = document.getElementById("btn-lang-en");
      if (btnLangKo && btnLangEn) {
        if (this.lang === "ko") {
          btnLangKo.className = "btn btn-sm btn-primary";
          btnLangEn.className = "btn btn-sm btn-secondary";
        } else {
          btnLangKo.className = "btn btn-sm btn-secondary";
          btnLangEn.className = "btn btn-sm btn-primary";
        }
      }

      // 6. Theme picker: current-theme label, swatch state, sidebar buttons
      var themeList = window.THEMES || ["paper", "parchment", "datasheet", "blueprint", "crt", "tokyo", "console"];
      var activeTheme = document.documentElement.getAttribute("data-theme") || "paper";

      var themeCur = document.getElementById("settings-theme-current");
      if (themeCur) {
        var nameKey = "theme_" + activeTheme + "_name";
        themeCur.textContent = t.theme_current_prefix + " " + (t[nameKey] !== undefined ? t[nameKey] : activeTheme);
      }

      var themeDesc = document.getElementById("settings-theme-desc");
      if (themeDesc) themeDesc.textContent = t.theme_desc;

      for (var th = 0; th < themeList.length; th++) {
        var name = themeList[th];
        var swatch = document.getElementById("btn-theme-" + name);
        if (swatch) {
          swatch.className = (name === activeTheme) ? "theme-swatch active" : "theme-swatch";
        }
      }

      // 7-9. Sidebar section titles, tab pills and nav items are translated
      //      through their own data-i18n attributes (see step 1). The former
      //      positional mapping broke whenever navigation entries changed.

      // 10. Header Breadcrumb
      if (window.App && window.App.currentRoute) {
        var breadcrumb = document.getElementById("breadcrumb-current");
        if (breadcrumb) {
          var rKey = "nav_" + window.App.currentRoute;
          if (t[rKey]) {
            breadcrumb.textContent = t[rKey].replace(/^[0-9]\.\s*/, "").split("(")[0].trim();
          }
        }
      }

      // 11. Refresh copy buttons and tooltips
      if (window.initResultBoxCopy) {
        window.initResultBoxCopy();
      }
    }
  };

  window.i18n = I18n;
  window.setLanguage = function (lang) {
    I18n.setLang(lang);
  };
})(window);
