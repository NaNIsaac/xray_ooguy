/**
 * BEAMLINE TOOLKIT — Direct Full-Page Bilingual Translation System (Korean / English)
 * 100% Offline-Native, Zero-dependency, Compatible with CentOS 7 Firefox 60 ESR
 */
(function (window) {
  "use strict";

  var translations = {
    ko: {
      // Navigation & Sidebar
      nav_dashboard: "0. DASHBOARD",
      nav_optics: "1. OPTICS (8 Tools)",
      nav_beamline: "2. BEAMLINE (7 Tools)",
      nav_logbook: "3. LOGBOOK",
      nav_experiment: "4. EXPERIMENT",
      nav_reference: "5. REFERENCE",
      nav_settings: "6. SETTINGS",
      nav_about: "7. ABOUT (제작자)",
      sidebar_main_menu: "메인 메뉴",
      sidebar_exp_menu: "실험 및 기록",
      sidebar_data_menu: "데이터 & 도구",
      sidebar_offline: "Client Offline-Ready",
      btn_light: "라이트",
      btn_dark: "다크",
      btn_ko: "한국어",
      btn_en: "English",

      // Banners
      b_dash_title: "빔라인 래피드 대시보드 (Quick Dashboard)",
      b_dash_desc: "자주 사용하는 광학 계산기, 물리량 분석기 및 최근 계산 히스토리 바로가기",
      b_opt_title: "X선 광학 및 회절/투과율 정밀 계산기 (X-ray Optics Suite)",
      b_opt_desc: "파장, 브래그 회절, 격자 분산, 복소 굴절률, 흡수 및 상호 공간 Q 벡터 정밀 계산",
      b_beam_title: "빔라인 물리량 및 기하학적 파라미터 (Beamline Physics)",
      b_beam_desc: "빔 풋프린트, 광자 플럭스, 분해능, 결맞음 CDI/BCDI 샘플링 및 슬릿 지오메트리 계산",
      b_log_title: "전자 빔라인 로그북 (Electronic Logbook)",
      b_log_desc: "실험 조건 수동 기록, 빠른 태그 검색, 브라우저 저장 및 데이터 내보내기",
      b_exp_title: "실험 종합 관리 (Experiment Suite)",
      b_exp_desc: "실시간 자동 저장 실험 노트, 빔라인 체크리스트, 시료 관리, DAQ 산출 및 칸반 보드",
      b_ref_title: "결정 격자 DB & 연구자 참고 자료 (Reference)",
      b_ref_desc: "단위 변환기, 주요 결정 격자 d-spacing 검색 및 공인된 방사광 시설 링크",
      b_set_title: "설정 및 히스토리 관리 (Settings & History)",
      b_set_desc: "언어 설정, 테마 변경, 계산 기록 관리, 단축키 안내 및 전체 데이터 백업/복원",
      b_about_title: "제작자 소개 및 연구 포트폴리오 (About the Creator)",
      b_about_desc: "연구자 프로필, X선 광학·결맞음 회절 이미징(BCDI) 연구 분야 및 프로젝트 후원",

      // Settings Tab
      set_card_lang_title: "0. 언어 설정 (Language Selection)",
      lang_current: "현재 언어: 한국어 (Korean)",
      lang_desc: "한국어와 영어(English) 인터페이스를 즉시 전환합니다. 모든 물리량 및 계산기가 실시간으로 갱신됩니다.",
      btn_lang_ko: "한국어 (Korean)",
      btn_lang_en: "English (영어)",
      set_card_theme_title: "1. 화면 테마 모드 설정 (Display Theme Mode)",
      theme_current_light: "현재 모드: 라이트 모드 (Light Paper #fdfcf8)",
      theme_current_dark: "현재 모드: 다크 모드 (Dark Ink #121417)",
      theme_desc: "라이트 모드(#fdfcf8)와 고대비 흑백 반전 다크 모드(#121417)를 전환합니다.",
      btn_theme_light: "라이트 모드 (Light)",
      btn_theme_dark: "다크 모드 (Dark)",
      set_card_history_title: "전체 계산 히스토리",
      btn_history_clear: "히스토리 전체 삭제",
      th_time: "시간",
      th_tool: "도구명",
      th_inputs: "입력 파라미터",
      th_result: "계산 결과",
      history_empty: "저장된 계산 히스토리가 없습니다.",
      history_clear_confirm: "모든 계산 히스토리를 영구 삭제하시겠습니까?",
      history_cleared_toast: "계산 히스토리가 삭제되었습니다.",
      set_card_backup_title: "로컬스토리지 데이터 백업 및 복원",
      set_backup_desc: "모든 로그북, 실험 노트, 시료 목록, 체크리스트 및 계산 히스토리는 브라우저의 <code>localStorage</code>에 안전하게 저장됩니다. 다른 PC나 브라우저로 이동할 때 JSON 파일로 내보내거나 가져올 수 있습니다.",
      btn_backup_download: "전체 백업 다운로드",
      btn_backup_restore: "백업 파일 복원",
      toast_backup_downloaded: "전체 데이터 백업 파일이 저장되었습니다.",
      toast_backup_restored: "백업 데이터 복원이 완료되었습니다.",
      alert_backup_invalid: "백업 파일 읽기 실패: 올바른 JSON 규격이 아닙니다.",
      set_card_shortcuts_title: "키보드 단축키 안내 (Keyboard Shortcuts)",
      sc_dash: "DASHBOARD 탭 바로가기",
      sc_opt: "OPTICS 광학 계산기 바로가기",
      sc_beam: "BEAMLINE 빔라인 계산기 바로가기",
      sc_log: "LOGBOOK 실험 로그북 바로가기",
      sc_exp: "EXPERIMENT 실험 노트 & 칸반 바로가기",
      sc_ref: "REFERENCE 참고 자료 바로가기",
      sc_set: "SETTINGS 설정 바로가기",
      sc_about: "ABOUT 제작자 소개 바로가기",

      // Dashboard
      btn_open_optics: "광학 계산기 열기",
      tile1_title: "에너지 - 파장 변환",
      tile1_desc: "eV, keV, nm, Å, Hz 단위 상호 즉시 변환 (hc = 12398.42 eV·Å)",
      tile2_title: "브래그 법칙 (Bragg's Law)",
      tile2_desc: "결정 격자 d-spacing과 에너지에 따른 θ / 2θ 각도 및 Q-space 계산",
      tile3_title: "시료 빔 풋프린트 (Footprint)",
      tile3_desc: "입사각 및 빔 크기에 따른 시료 상 풋프린트 길이 및 스필오버 검증",
      tile4_title: "CDI / BCDI 오버샘플링",
      tile4_desc: "나이퀴스트-섀넌 기준에 따른 스펙클 크기 및 σ ≥ 2 충족 판정",
      tile5_title: "실험 전자 로그북",
      tile5_desc: "시료별 빔 조건 수동 기록, 태그 검색 및 CSV/JSON 데이터 내보내기",
      tile6_title: "실험 노트 & 칸반 보드",
      tile6_desc: "자동 저장 메모장, 시료 리스트 관리 및 단계별 작업 보드",
      dash_history_title: "최근 계산 기록 (Recent History)",
      btn_view_all: "전체 보기",
      dash_constants_title: "주요 물리 상수 (CODATA)",
      dash_history_empty: "최근 계산 기록이 없습니다.",

      // Optics Suite
      opt_t1_title: "1. 에너지 - 파장 - 주파수 변환",
      lbl_energy: "에너지",
      lbl_wavelength: "파장",
      lbl_frequency: "주파수",
      opt_t1_res_label: "실시간 등가 변환값",
      opt_t2_title: "2. 브래그 법칙 (Bragg's Law 3-Way Suite)",
      bragg_row1_title: "d + 2θ(tth) ➔ 에너지 (Energy)",
      bragg_row2_title: "2θ(tth) + 에너지 ➔ d-spacing (d)",
      bragg_row3_title: "d + 에너지 ➔ 2θ(tth) & θ(th)",
      lbl_dspacing: "격자면 간격 d",
      lbl_tth: "회절각 2θ (tth)",
      lbl_presets: "자주 쓰는 결정면 프리셋",
      lbl_inc_energy: "입사 에너지",
      res_calc_energy: "계산된 에너지 (E)",
      res_calc_d: "계산된 격자면 간격 (d)",
      res_calc_tth: "계산된 회절각 (2θ / θ)",
      res_bragg_unreachable: "회절 불가 (λ > 2d)",
      res_bragg_theta: "브래그 각도 θ",
      res_bragg_2theta: "회절각 2θ",
      res_bragg_q: "산란 벡터 Q",
      opt_t3_title: "3. 회절격자 (Diffraction Grating)",
      lbl_grating_lines: "격자선 밀도",
      lbl_photon_energy: "광자 에너지",
      lbl_alpha: "입사각 α",
      lbl_order: "회절 차수 m",
      res_beta: "회절 출사각 β",
      res_dispersion: "각분산력 (dβ/dλ)",
      opt_t4_title: "4. 굴절률 및 투과율 (n = 1 - δ + iβ)",
      lbl_select_mat: "재료 선택 (Materials DB)",
      lbl_thickness: "시료 두께",
      res_trans: "빔 투과율 (Transmittance)",
      res_atten_len: "감쇠 거리 (1/e length)",
      res_crit_ang: "임계각 θc",
      opt_t5_title: "5. 에너지 스케일링 & 각도 계산기 (Energy Scaling)",
      sec_ref_condition: "기준 빔 조건 (Reference Beam & Angle)",
      sec_target_condition: "목표 에너지 선택 (Target Beam Energy)",
      lbl_ref_energy: "기준 에너지 E_ref",
      lbl_ref_theta: "기준 각도 θ (th)",
      lbl_ref_twotheta: "기준 각도 2θ (tth)",
      lbl_target_energy: "목표 에너지 E_target",
      lbl_target_presets: "빠른 에너지 프리셋",
      res_target_twotheta: "목표 회절각 2θ (tth)",
      res_target_theta: "목표 브래그각 θ (th)",
      res_unreachable: "회절 불가 (sin θ₂ > 1)",
      lbl_e1: "기준 에너지 E1",
      lbl_th1: "기준 각도 θ1",
      lbl_e2: "목표 에너지 E2",
      res_th2: "목표 각도 θ2",
      res_motor_shift: "모터 이동량 Δθ",
      opt_t6_title: "6. Chi-Phi 오일러 크래들 보정",
      lbl_chiphi_th: "브래그 각도 θ",
      lbl_chiphi_chi: "Chi 틸트 변화량 Δχ",
      res_phi_corr: "Phi 축 보정량 (Δφ)",
      opt_t7_title: "7. 전반사 임계각 (Total External Reflection)",
      lbl_density: "밀도 ρ",
      lbl_z_over_a: "Z/A 비",
      res_crit_deg: "임계각 θc (deg / arcmin)",
      res_crit_mrad: "임계각 θc (mrad)",
      res_crit_qc: "임계 산란벡터 Qc",
      opt_t8_title: "8. 상호공간 Q-Space 변환",
      lbl_angle_th: "각도 θ",
      lbl_angle_2th: "회절각 2θ",
      lbl_scatt_q: "산란 벡터 Q",
      lbl_real_d: "실공간 주기 d",

      // Beamline Suite
      beam_t1_title: "1. 시료 상 빔 풋프린트 (Beam Footprint)",
      lbl_beam_v: "수직 빔 크기 (V)",
      lbl_beam_h: "수평 빔 크기 (H)",
      lbl_inc_ang: "입사각 θ",
      lbl_sample_len: "시료 길이 (길이 방향)",
      res_fp_len: "시료 상 풋프린트 길이",
      res_beam_h: "수평 빔 폭",
      beam_t2_title: "2. 빔라인 광자 플럭스 (Photon Flux)",
      lbl_ring_current: "저장링 전류",
      lbl_source_flux: "소스 기준 플럭스",
      lbl_mono_eff: "모노크로메이터 효율",
      lbl_mirror_eff: "미러 반사율",
      lbl_win_trans: "윈도우 투과율",
      res_deliv_flux: "시료 도달 플럭스",
      res_tot_eff: "광학계 전송 효율",
      beam_t3_title: "3. 에너지 분해능 (Energy Resolution ΔE/E)",
      lbl_mono_cryst: "모노크로메이터 결정",
      lbl_beam_div: "빔 수직 발산각 (Divergence)",
      res_delta_e: "총 에너지 대역폭 (ΔE)",
      res_de_over_e: "에너지 분해능 (ΔE/E)",
      res_mono_th: "브래그 각도",
      beam_t4_title: "4. 디텍터 각도 분해능 (Angular Resolution)",
      lbl_pixel_size: "픽셀 크기",
      lbl_sample_det_dist: "시료-디텍터 거리",
      res_ang_res_mrad: "각도 분해능 (mrad)",
      res_ang_res_deg: "각도 분해능 (° / \")",
      beam_t5_title: "5. CDI / BCDI 결맞음 오버샘플링",
      lbl_det_dist: "디텍터 거리",
      lbl_det_pixel: "디텍터 픽셀 크기",
      lbl_sample_size: "시료/결정 크기",
      res_sigma: "오버샘플링 비율 (σ)",
      res_speckle: "디텍터 스펙클 크기",
      res_verdict_lbl: "판정 결과:",
      beam_t6_title: "6. 슬릿 간격 및 수용각 (Slit Opening)",
      lbl_source_size: "소스 크기 (FWHM)",
      lbl_source_slit_dist: "소스-슬릿 거리",
      lbl_slit_div: "빔 발산각",
      lbl_gauss_mult: "가우시안 배율",
      res_slit_fwhm: "슬릿 위치 빔 크기 (FWHM)",
      res_slit_open: "권장 슬릿 개구폭",
      beam_t7_title: "7. 결정 열팽창 각도 및 에너지 시프트 (Thermal Drift)",
      lbl_therm_mat: "모노크로메이터 재질",
      lbl_temp_change: "온도 변화 ΔT",
      lbl_op_energy: "동작 에너지",
      res_th_shift: "브래그 각도 시프트 (Δθ)",
      res_e_shift: "유효 에너지 시프트 (ΔE)",

      // Logbook
      btn_copy_md: "마크다운 복사",
      btn_dl_csv: "CSV 다운로드",
      btn_dl_json: "JSON",
      log_card_new: "새 로그 항목 작성",
      lbl_sample_id: "시료명 (Sample ID)",
      pl_sample_id: "예: Si_Wafer_001",
      lbl_dist_mm: "거리 (mm)",
      lbl_exp_s: "노출 (s)",
      lbl_tags: "태그 (쉼표 또는 공백 구분)",
      pl_tags: "예: #calib, #roomTemp",
      lbl_memo: "실험 메모 & 특이사항",
      pl_memo: "실험 진행 상황, 회절 피크 관측, 주의사항 등을 기록하세요...",
      btn_save_log: "로그 저장하기",
      log_card_list: "기록된 실험 로그",
      pl_search_logs: "검색어 입력...",
      btn_delete: "삭제",
      log_empty: "일치하는 로그 기록이 없습니다.",
      log_del_confirm: "선택한 로그 항목을 삭제하시겠습니까?",
      log_saved_toast: "새 로그 항목이 저장되었습니다.",
      log_deleted_toast: "로그 항목이 삭제되었습니다.",
      log_csv_toast: "CSV 파일이 다운로드되었습니다.",
      log_json_toast: "JSON 파일이 다운로드되었습니다.",
      log_md_toast: "클립보드에 마크다운 표가 복사되었습니다.",
      log_alert_memo: "로그 메모 내용을 입력하십시오.",
      tag_filter_prefix: "태그 필터:",
      tag_filter_clear: "해제",

      // Experiment
      exp_card_notes: "실시간 실험 노트 (Auto-Saving Lab Notes)",
      notes_saved: "자동 저장됨",
      notes_saving: "저장 중...",
      notes_saved_time: "자동 저장 완료",
      btn_download: "다운로드",
      exp_card_chk: "빔라인 점검 체크리스트 (Beamline Checklist)",
      btn_reset_default: "기본값 리셋",
      pl_new_chk: "새 점검 항목 추가...",
      btn_add: "추가",
      exp_card_samples: "시료 관리 목록 (Sample List)",
      pl_sample_name: "시료명",
      pl_sample_mat: "재료",
      pl_sample_thick: "두께",
      pl_sample_pos: "모터위치 X,Y,Z,Th",
      pl_sample_notes: "메모",
      btn_add_sample: "+ 시료 추가",
      th_sample_name: "시료명",
      th_material: "재료",
      th_thickness: "두께",
      th_motor_pos: "모터 위치 (X, Y, Z, Th)",
      th_memo: "메모",
      th_actions: "작업",
      exp_card_daq: "DAQ 데이터 수집 용량 계산기",
      lbl_det_model: "디텍터 모델",
      lbl_bit_depth: "비트 심도 (Bit Depth)",
      lbl_fps: "프레임 레이트",
      lbl_runtime: "측정 시간",
      res_data_rate: "실시간 전송율 (Data Rate)",
      res_tot_frames: "총 프레임 수",
      res_tot_size: "필요 저장 용량 (Total Size)",
      exp_card_kanban: "빔타임 작업 칸반 보드 (Kanban)",
      btn_new_task: "+ 새 작업",
      col_todo: "대기 (To Do)",
      col_in_prog: "진행 중 (In Progress)",
      col_done: "완료 (Done)",
      kanban_prompt_task: "새 작업 제목을 입력하세요:",
      kanban_prompt_sample_alert: "시료명을 입력해주세요.",
      chk_reset_confirm: "체크리스트를 기본 프로토콜 템플릿으로 초기화하시겠습니까?",
      chk_reset_toast: "체크리스트가 초기화되었습니다.",
      notes_dl_toast: "실험 노트 텍스트 파일이 다운로드되었습니다.",

      // Reference
      ref_card_units: "단위 변환기 (Multi-Unit Converter)",
      unit_cat_len: "길이 / 파장 (Length)",
      unit_cat_press: "진공 / 압력 (Pressure)",
      unit_cat_ang: "각도 (Angle)",
      ref_card_db: "주요 결정 격자 d-spacing 데이터베이스",
      pl_search_crystal: "결정 또는 hkl 검색...",
      th_cryst_mat: "결정 재료 (Material)",
      th_cryst_hkl: "밀러 지수 (hkl)",
      th_cryst_d: "격자면 간격 (d-spacing)",
      th_cryst_a: "격자 상수 (Lattice a)",
      th_cryst_sys: "결정계 (System)",
      th_apply: "적용",
      btn_apply_bragg: "브래그 적용",

      // About
      about_card_profile: "1. 연구자 프로필 (Profile & Biography)",
      about_role: "방사광 X선 광학 & 결맞음 회절 이미징 (CDI / BCDI) 연구원",
      th_degree: "학력 (Degree)",
      th_lab: "연구실 (Lab)",
      th_email: "이메일 (Email)",
      th_github: "깃허브 (GitHub)",
      th_repo: "프로젝트 저장소",
      about_degree_val: "<strong>서강대학교 물리학과 학사 졸업</strong><br><strong>서강대학교 대학원 물리학과 석사 재학 중</strong>",
      about_bio: "방사광 가속기(Pohang Light Source / SPring-8 / ESRF) 기반의 고결맞음 X선 회절 빔라인에서 나노 결정 및 응집물질의 구조 복원, 실험 자동화 및 광학 시뮬레이션 툴킷을 개발하고 있습니다.",
      about_card_portfolio: "2. 핵심 연구 분야 & 기술 스택 (Portfolio)",
      about_core_expert: "🔬 주요 연구 및 개발 도메인 (Core Expertise):",
      about_quote: "\"결맞음 X선 산란 및 회절 물리학을 기반으로 미시 세계의 격자 결함과 위상 전이를 정밀하게 관측합니다.\"",
      about_card_sponsor: "3. 프로젝트 후원 및 커피 한 잔 (Buy Me a Coffee / GitHub Sponsors)",
      about_sponsor_cheer: "BEAMLINE TOOLKIT 오픈소스 연구 툴킷 개발을 응원해주세요!",
      about_sponsor_desc: "본 시스템은 전 세계 방사광 빔라인 연구원, 포닥, 대학원생 및 광학 엔지니어 분들이 현장에서 빠르고 정확하게 계산하고 기록할 수 있도록 100% 무료 무의존성 오픈소스로 개발·유지보수되고 있습니다.<br>개발자에게 따뜻한 커피 한 잔을 선물해주시면 서버 도메인 유지비 및 새로운 물리 모듈(XANES/EXAFS 에너지 스캔, 회절 피크 피팅 수트 등) 개발에 큰 힘이 됩니다.",
      btn_sponsor_gh: "☕ GitHub Sponsors 후원하기 ➔"
    },
    en: {
      // Navigation & Sidebar
      nav_dashboard: "0. DASHBOARD",
      nav_optics: "1. OPTICS (8 Tools)",
      nav_beamline: "2. BEAMLINE (7 Tools)",
      nav_logbook: "3. LOGBOOK",
      nav_experiment: "4. EXPERIMENT",
      nav_reference: "5. REFERENCE",
      nav_settings: "6. SETTINGS",
      nav_about: "7. ABOUT (Author)",
      sidebar_main_menu: "MAIN MENU",
      sidebar_exp_menu: "EXPERIMENT & LOGS",
      sidebar_data_menu: "DATA & UTILITIES",
      sidebar_offline: "Client Offline-Ready",
      btn_light: "Light",
      btn_dark: "Dark",
      btn_ko: "한국어",
      btn_en: "English",

      // Banners
      b_dash_title: "Beamline Rapid Dashboard",
      b_dash_desc: "Quick shortcuts to frequent optics calculators, physics estimators, and recent calculation history",
      b_opt_title: "X-ray Optics & Diffraction Suite",
      b_opt_desc: "Wavelength, Bragg diffraction, grating dispersion, complex refractive index, absorption & reciprocal Q-vector",
      b_beam_title: "Beamline Physics & Geometric Parameters",
      b_beam_desc: "Beam footprint, photon flux, energy/angular resolution, CDI coherent oversampling & slit geometry",
      b_log_title: "Beamline Electronic Logbook",
      b_log_desc: "Manual condition logging, condition snapshot rollback, tag search, and CSV/JSON/Markdown export",
      b_exp_title: "Experiment & Workflow Assistant",
      b_exp_desc: "Debounced live scratchpad, beamline checklist, sample table, DAQ data rate estimator, and Kanban board",
      b_ref_title: "Reference & Crystal d-spacing Database",
      b_ref_desc: "Multi-unit converter, precision crystal d-spacing database (Si, Ge, Diamond, Al2O3, GaAs), and synchrotron links",
      b_set_title: "Settings & History Management",
      b_set_desc: "Language selection, display theme mode, calculation history archive, shortcuts, and full data backup/restore",
      b_about_title: "About the Creator & Research Portfolio",
      b_about_desc: "Researcher biography, X-ray optics & Bragg coherent diffraction imaging (BCDI) domain, and project sponsorship",

      // Settings Tab
      set_card_lang_title: "0. Language Selection",
      lang_current: "Current Language: English",
      lang_desc: "Instantaneously switch between Korean and English interface across all tools and calculations.",
      btn_lang_ko: "한국어 (Korean)",
      btn_lang_en: "English",
      set_card_theme_title: "1. Display Theme Configuration",
      theme_current_light: "Current Mode: Light Mode (Paper #fdfcf8)",
      theme_current_dark: "Current Mode: Dark Mode (Dark Ink #121417)",
      theme_desc: "Switch between clean Light Mode (#fdfcf8) and high-contrast Dark Mode (#121417).",
      btn_theme_light: "Light Mode",
      btn_theme_dark: "Dark Mode",
      set_card_history_title: "Calculation History Archive",
      btn_history_clear: "Clear All History",
      th_time: "Timestamp",
      th_tool: "Tool Name",
      th_inputs: "Input Parameters",
      th_result: "Calculation Result",
      history_empty: "No calculation history recorded.",
      history_clear_confirm: "Are you sure you want to permanently clear all calculation history?",
      history_cleared_toast: "Calculation history cleared.",
      set_card_backup_title: "LocalStorage Data Backup & Restore",
      set_backup_desc: "All logbook entries, experiment notes, sample lists, checklists, and calculation history are securely stored in your browser's <code>localStorage</code>. Export or import JSON files seamlessly across machines.",
      btn_backup_download: "Download Full Backup",
      btn_backup_restore: "Restore from JSON",
      toast_backup_downloaded: "Full data backup file saved.",
      toast_backup_restored: "Backup data restored successfully.",
      alert_backup_invalid: "Failed to read backup file: Invalid JSON format.",
      set_card_shortcuts_title: "Keyboard Shortcuts Guide",
      sc_dash: "Jump to DASHBOARD",
      sc_opt: "Jump to OPTICS Calculators",
      sc_beam: "Jump to BEAMLINE Calculators",
      sc_log: "Jump to LOGBOOK",
      sc_exp: "Jump to EXPERIMENT Suite",
      sc_ref: "Jump to REFERENCE Data & DB",
      sc_set: "Jump to SETTINGS",
      sc_about: "Jump to ABOUT the Creator",

      // Dashboard
      btn_open_optics: "Open Optics Suite",
      tile1_title: "Energy - Wavelength Converter",
      tile1_desc: "Instant mutual conversion between eV, keV, nm, Å, Hz (hc = 12398.42 eV·Å)",
      tile2_title: "Bragg's Law Diffraction",
      tile2_desc: "Diffraction angles θ / 2θ and reciprocal Q-space from crystal d-spacing & energy",
      tile3_title: "Sample Beam Footprint",
      tile3_desc: "Beam footprint on sample and spillover analysis at grazing incidence",
      tile4_title: "CDI / BCDI Oversampling",
      tile4_desc: "Speckle size and Nyquist-Shannon criterion oversampling σ ≥ 2 verification",
      tile5_title: "Electronic Logbook",
      tile5_desc: "Manual condition logging, tag-based filtering, and CSV/JSON export",
      tile6_title: "Lab Notes & Kanban Board",
      tile6_desc: "Auto-saving live scratchpad, sample catalogs, and stage task board",
      dash_history_title: "Recent Calculations (Recent History)",
      btn_view_all: "View All",
      dash_constants_title: "Fundamental Physical Constants (CODATA)",
      dash_history_empty: "No recent calculations recorded.",

      // Optics Suite
      opt_t1_title: "1. Energy - Wavelength - Frequency",
      lbl_energy: "Energy",
      lbl_wavelength: "Wavelength",
      lbl_frequency: "Frequency",
      opt_t1_res_label: "Equivalent Physical Quantities",
      opt_t2_title: "2. Bragg's Law (3-Way Multi-Directional Suite)",
      bragg_row1_title: "d + 2θ(tth) ➔ Energy (E)",
      bragg_row2_title: "2θ(tth) + Energy ➔ d-spacing (d)",
      bragg_row3_title: "d + Energy ➔ 2θ(tth) & θ(th)",
      lbl_dspacing: "Lattice d-spacing d",
      lbl_tth: "Diffraction Angle 2θ (tth)",
      lbl_presets: "Common Crystal Reflection Presets",
      lbl_inc_energy: "Incident Energy",
      res_calc_energy: "Calculated Energy (E)",
      res_calc_d: "Calculated d-spacing (d)",
      res_calc_tth: "Calculated Angle (2θ / θ)",
      res_bragg_unreachable: "Diffraction Impossible (λ > 2d)",
      res_bragg_theta: "Bragg Angle θ",
      res_bragg_2theta: "Diffraction Angle 2θ",
      res_bragg_q: "Scattering Vector Q",
      opt_t3_title: "3. Diffraction Grating (mλ = d(sin α + sin β))",
      lbl_grating_lines: "Groove Density",
      lbl_photon_energy: "Photon Energy",
      lbl_alpha: "Incident Angle α",
      lbl_order: "Diffraction Order m",
      res_beta: "Diffracted Angle β",
      res_dispersion: "Angular Dispersion (dβ/dλ)",
      opt_t4_title: "4. Complex Refractive Index & Attenuation",
      lbl_select_mat: "Select Material (Materials DB)",
      lbl_thickness: "Sample Thickness",
      res_trans: "Beam Transmittance",
      res_atten_len: "Attenuation Length (1/e)",
      res_crit_ang: "Critical Angle θc",
      opt_t5_title: "5. Energy Scaling & Angle Shift (E1, θ1 ➔ E2, θ2, Q)",
      sec_ref_condition: "Reference Beam & Angle",
      sec_target_condition: "Target Beam Energy Selection",
      lbl_ref_energy: "Reference Energy E_ref",
      lbl_ref_theta: "Reference Angle θ (th)",
      lbl_ref_twotheta: "Reference Angle 2θ (tth)",
      lbl_target_energy: "Target Energy E_target",
      lbl_target_presets: "Quick Target Energy Presets",
      res_target_twotheta: "Target Angle 2θ (tth)",
      res_target_theta: "Target Angle θ (th)",
      res_unreachable: "Unreachable (sin θ₂ > 1)",
      lbl_e1: "Reference Energy E1",
      lbl_th1: "Reference Angle θ1",
      lbl_e2: "Target Energy E2",
      res_th2: "Target Angle θ2",
      res_motor_shift: "Motor Angle Shift Δθ",
      opt_t6_title: "6. Chi-Phi Euler Cradle Tilt Correction",
      lbl_chiphi_th: "Bragg Angle θ",
      lbl_chiphi_chi: "Chi Tilt Δχ",
      res_phi_corr: "Phi Axis Correction (Δφ)",
      opt_t7_title: "7. Total External Reflection & Critical Angle",
      lbl_density: "Density ρ",
      lbl_z_over_a: "Z/A Ratio",
      res_crit_deg: "Critical Angle θc (deg / arcmin)",
      res_crit_mrad: "Critical Angle θc (mrad)",
      res_crit_qc: "Critical Momentum Qc",
      opt_t8_title: "8. Reciprocal Q-Space Suite",
      lbl_angle_th: "Angle θ",
      lbl_angle_2th: "Diffraction Angle 2θ",
      lbl_scatt_q: "Scattering Vector Q",
      lbl_real_d: "Real-space Periodicity d",

      // Beamline Suite
      beam_t1_title: "1. Sample Beam Footprint (L = V / sin θ)",
      lbl_beam_v: "Vertical Beam Size (V)",
      lbl_beam_h: "Horizontal Beam Size (H)",
      lbl_inc_ang: "Incident Angle θ",
      lbl_sample_len: "Sample Length",
      res_fp_len: "Footprint Length on Sample",
      res_beam_h: "Horizontal Width",
      beam_t2_title: "2. Beamline Photon Flux (Delivered Flux)",
      lbl_ring_current: "Storage Ring Current",
      lbl_source_flux: "Source Base Flux",
      lbl_mono_eff: "Monochromator Efficiency",
      lbl_mirror_eff: "Mirror Reflectivity",
      lbl_win_trans: "Window Transmittance",
      res_deliv_flux: "Delivered Photon Flux",
      res_tot_eff: "Total Optical Efficiency",
      beam_t3_title: "3. Monochromator Energy Resolution (ΔE/E)",
      lbl_mono_cryst: "Monochromator Crystal",
      lbl_beam_div: "Vertical Beam Divergence",
      res_delta_e: "Total Bandwidth (ΔE)",
      res_de_over_e: "Energy Resolution (ΔE/E)",
      res_mono_th: "Bragg Angle",
      beam_t4_title: "4. Detector Angular Resolution",
      lbl_pixel_size: "Pixel Size",
      lbl_sample_det_dist: "Sample-Detector Distance",
      res_ang_res_mrad: "Angular Resolution (mrad)",
      res_ang_res_deg: "Angular Resolution (° / \")",
      beam_t5_title: "5. CDI / BCDI Coherent Oversampling",
      lbl_det_dist: "Detector Distance",
      lbl_det_pixel: "Detector Pixel Size",
      lbl_sample_size: "Sample / Crystal Size",
      res_sigma: "Oversampling Ratio (σ)",
      res_speckle: "Detector Speckle Size",
      res_verdict_lbl: "Criterion Verdict:",
      beam_t6_title: "6. Slit Gap & Beam Acceptance",
      lbl_source_size: "Source Size (FWHM)",
      lbl_source_slit_dist: "Source-Slit Distance",
      lbl_slit_div: "Beam Divergence",
      lbl_gauss_mult: "Gaussian Envelope Multiplier",
      res_slit_fwhm: "Beam Size at Slit (FWHM)",
      res_slit_open: "Recommended Slit Opening",
      beam_t7_title: "7. Crystal Thermal Expansion & Drift",
      lbl_therm_mat: "Monochromator Material",
      lbl_temp_change: "Temperature Change ΔT",
      lbl_op_energy: "Operating Energy",
      res_th_shift: "Bragg Angle Drift (Δθ)",
      res_e_shift: "Effective Energy Shift (ΔE)",

      // Logbook
      btn_copy_md: "Copy Markdown",
      btn_dl_csv: "Download CSV",
      btn_dl_json: "JSON",
      log_card_new: "New Log Entry",
      lbl_sample_id: "Sample ID",
      pl_sample_id: "e.g. Si_Wafer_001",
      lbl_dist_mm: "Distance (mm)",
      lbl_exp_s: "Exposure (s)",
      lbl_tags: "Tags (space or comma separated)",
      pl_tags: "e.g. #calib, #roomTemp",
      lbl_memo: "Experimental Memo & Notes",
      pl_memo: "Record experimental conditions, diffraction peak observations, precautions...",
      btn_save_log: "Save Log Entry",
      log_card_list: "Recorded Logbook Entries",
      pl_search_logs: "Search logs...",
      btn_delete: "Delete",
      log_empty: "No matching log entries found.",
      log_del_confirm: "Are you sure you want to delete this log entry?",
      log_saved_toast: "New log entry saved.",
      log_deleted_toast: "Log entry deleted.",
      log_csv_toast: "CSV file downloaded.",
      log_json_toast: "JSON file downloaded.",
      log_md_toast: "Markdown table copied to clipboard.",
      log_alert_memo: "Please enter log memo text.",
      tag_filter_prefix: "Tag Filter:",
      tag_filter_clear: "Clear",

      // Experiment
      exp_card_notes: "Auto-Saving Lab Notes & Scratchpad",
      notes_saved: "Auto-saved",
      notes_saving: "Saving...",
      notes_saved_time: "Saved",
      btn_download: "Download",
      exp_card_chk: "Beamline Checklist",
      btn_reset_default: "Reset to Default",
      pl_new_chk: "Add new item...",
      btn_add: "Add",
      exp_card_samples: "Sample Catalog & Position Manager",
      pl_sample_name: "Sample ID",
      pl_sample_mat: "Material",
      pl_sample_thick: "Thickness",
      pl_sample_pos: "Motors X,Y,Z,Th",
      pl_sample_notes: "Notes",
      btn_add_sample: "+ Add Sample",
      th_sample_name: "Sample ID",
      th_material: "Material",
      th_thickness: "Thickness",
      th_motor_pos: "Motor Coordinates (X,Y,Z,Th)",
      th_memo: "Notes",
      th_actions: "Actions",
      exp_card_daq: "DAQ Data Rate & Storage Estimator",
      lbl_det_model: "Detector Model",
      lbl_bit_depth: "Bit Depth",
      lbl_fps: "Frame Rate",
      lbl_runtime: "Acquisition Time",
      res_data_rate: "Data Transfer Rate",
      res_tot_frames: "Total Frames",
      res_tot_size: "Total Required Size",
      exp_card_kanban: "Beamtime Stage Kanban Board",
      btn_new_task: "+ New Task",
      col_todo: "To Do",
      col_in_prog: "In Progress",
      col_done: "Done",
      kanban_prompt_task: "Enter task description:",
      kanban_prompt_sample_alert: "Please enter sample name.",
      chk_reset_confirm: "Reset checklist to default protocol template?",
      chk_reset_toast: "Checklist reset to default.",
      notes_dl_toast: "Lab notes text file downloaded.",

      // Reference
      ref_card_units: "Multi-Unit Converter",
      unit_cat_len: "Length / Wavelength",
      unit_cat_press: "Vacuum / Pressure",
      unit_cat_ang: "Angle",
      ref_card_db: "Precision Crystal d-spacing Database",
      pl_search_crystal: "Search crystal or hkl...",
      th_cryst_mat: "Crystal Material",
      th_cryst_hkl: "Miller Index (hkl)",
      th_cryst_d: "d-spacing (Å)",
      th_cryst_a: "Lattice Constant",
      th_cryst_sys: "Crystal System",
      th_apply: "Apply",
      btn_apply_bragg: "Apply to Bragg",

      // About
      about_card_profile: "1. Profile & Biography",
      about_role: "Synchrotron X-ray Optics & Coherent Diffraction Imaging (CDI/BCDI) Researcher",
      th_degree: "Degree",
      th_lab: "Lab",
      th_email: "Email",
      th_github: "GitHub",
      th_repo: "Project Repository",
      about_degree_val: "<strong>B.S. in Physics, Sogang University</strong><br><strong>M.S. Candidate in Physics, Sogang University</strong>",
      about_bio: "Developing structural reconstruction, lab automation, and X-ray optics calculation engines for high-coherence synchrotron beamlines (PLS-II / SPring-8 / ESRF).",
      about_card_portfolio: "2. Core Research Domains & Portfolio",
      about_core_expert: "🔬 Core Research & Development Domains:",
      about_quote: "\"Precision characterization of nanoscale lattice defects and phase transitions via coherent X-ray scattering and diffraction physics.\"",
      about_card_sponsor: "3. Support the Project (Buy Me a Coffee / GitHub Sponsors)",
      about_sponsor_cheer: "Support Open-Source Beamline Research Development!",
      about_sponsor_desc: "This system is developed and maintained as a 100% free, offline-capable open-source toolkit for synchrotron researchers, postdocs, graduate students, and beamline engineers worldwide.<br>Buying the developer a coffee directly supports domain costs and development of upcoming physics modules (e.g. XANES/EXAFS energy scans, peak fitting suites).",
      btn_sponsor_gh: "☕ Sponsor on GitHub Sponsors ➔"
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

    setLang: function (lang) {
      if (lang !== "ko" && lang !== "en") lang = "ko";
      this.lang = lang;
      localStorage.setItem("bl_toolkit_lang", lang);
      document.documentElement.setAttribute("lang", lang);

      this.applyTranslations();

      // Trigger re-rendering of active components
      if (window.renderSettingsHistory) window.renderSettingsHistory();
      if (window.renderDashboardHistory) window.renderDashboardHistory();
      if (window.renderLogbook) window.renderLogbook();
      if (window.renderChecklists) window.renderChecklists();
      if (window.renderSampleList) window.renderSampleList();
      if (window.renderKanban) window.renderKanban();
      if (window.renderCrystalDB) window.renderCrystalDB();
      if (window.renderUsefulLinks) window.renderUsefulLinks();
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

      // 6. Settings Theme Card Dynamic Update & Button Highlights
      var themeCur = document.getElementById("settings-theme-current");
      var isDark = (document.documentElement.getAttribute("data-theme") === "dark");
      if (themeCur) {
        themeCur.textContent = isDark ? t.theme_current_dark : t.theme_current_light;
      }
      var themeDesc = document.getElementById("settings-theme-desc");
      if (themeDesc) themeDesc.textContent = t.theme_desc;

      var btnThemeLight = document.getElementById("btn-theme-light");
      var btnThemeDark = document.getElementById("btn-theme-dark");
      if (btnThemeLight && btnThemeDark) {
        if (isDark) {
          btnThemeLight.className = "btn btn-sm btn-secondary";
          btnThemeDark.className = "btn btn-sm btn-primary";
        } else {
          btnThemeLight.className = "btn btn-sm btn-primary";
          btnThemeDark.className = "btn btn-sm btn-secondary";
        }
      }

      // 7. Sidebar Nav Section Titles
      var secTitles = document.querySelectorAll(".nav-section-title");
      if (secTitles.length >= 3) {
        secTitles[0].textContent = t.sidebar_main_menu;
        secTitles[1].textContent = t.sidebar_exp_menu;
        secTitles[2].textContent = t.sidebar_data_menu;
      }

      // 8. Top Tab Pills
      var pills = document.querySelectorAll(".tab-pill");
      var pillKeys = ["nav_dashboard", "nav_optics", "nav_beamline", "nav_logbook", "nav_experiment", "nav_reference", "nav_settings", "nav_about"];
      for (var k = 0; k < pills.length && k < pillKeys.length; k++) {
        pills[k].textContent = t[pillKeys[k]];
      }

      // 9. Sidebar Nav Items
      var navItems = document.querySelectorAll(".sidebar-nav .nav-item");
      for (var j = 0; j < navItems.length && j < pillKeys.length; j++) {
        var span = navItems[j].querySelector("span:first-child");
        if (span) {
          span.textContent = t[pillKeys[j]].replace(/^[0-9]\.\s*/, "");
        }
      }

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
    }
  };

  window.i18n = I18n;
  window.setLanguage = function (lang) {
    I18n.setLang(lang);
  };
})(window);
