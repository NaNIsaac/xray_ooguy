/**
 * XRAY.OOGUY — Direct Full-Page Bilingual Translation System (Korean / English)
 * 100% Offline-Native, Zero-dependency, Compatible with CentOS 7 Firefox 60 ESR
 */
(function (window) {
  "use strict";

  var translations = {
    ko: {
      // Navigation & Sidebar
      // Suite names stay in English in both languages — they are the labels on
      // the tab strip, and a tab is identified by its shape as much as by its
      // reading. The banner underneath is where each says what it covers, and
      // that is translated.
      nav_radiometry: "I. RADIOMETRY",
      nav_optics: "II. OPTICS",
      nav_geometry: "III. GEOMETRY",
      nav_coherence: "IV. COHERENCE",
      nav_data: "V. DATA",
      nav_record: "VI. RECORD",
      nav_settings: "VII. SETTINGS",
      nav_about: "VIII. ABOUT",
      nav_dashboard_index: "CONTENTS",
      nav_dashboard: "DASHBOARD",
      nav_index: "CONTENTS",

      // Calculator views
      b_rad_title: "RADIOMETRY — 플럭스·감쇠·선량·노출 시간",
      b_rad_desc: "시료에 도달하는 광자 수, 도중에 깎이는 양, 그리고 버틸 수 있는 노출 시간",
      b_opt_title: "OPTICS — 에너지·물질·모노크로메이터",
      b_opt_desc: "광자 에너지와 파장, 복소 굴절률과 투과율, 에너지 분해능과 열 드리프트",
      b_geo_title: "GEOMETRY — 결정·각도·검출기",
      b_geo_desc: "브래그 각도, 격자면 간격, 상호공간 Q 벡터, 빔 풋프린트와 검출기 기하",
      b_coh_title: "COHERENCE — CDI / BCDI",
      b_coh_desc: "시료 위 결맞음 길이, 프린지 오버샘플링, 그 기하가 도달할 수 있는 실공간 분해능",

      // RECORD view
      b_rec_title: "RECORD — 방사광 빔타임 로그북 & 실시간 기록",
      b_rec_desc: "연구 노트(ELN/Notion/Paper)용 표준 템플릿과 빔타임 이벤트 1클릭 복사 스니펫",
      rec_c1_title: "빔타임 로그북 헤더 프리셋",
      rec_c1_tag: "일반 텍스트 형식",
      rec_c2_title: "실시간 빔타임 이벤트 스니펫",
      rec_c2_tag: "타임스탬프 1클릭 복사",
      rec_c3_title: "계산 이력",
      rec_hist_desc: "최근 계산 25건, 최신순. 이 브라우저에만 남습니다. 각 행은 어느 계산기에서 나왔는지를 카드로 지목하므로, 수트를 재편하거나 언어를 바꿔도 항목의 의미가 유지됩니다.",
      rec_hist_th_time: "시각",
      rec_hist_th_tool: "계산기",
      rec_hist_th_in: "입력",
      rec_hist_th_out: "결과",
      rec_hist_empty: "아직 기록된 계산이 없습니다.",
      rec_hist_clear: "이력 지우기",
      rec_hist_confirm: "계산 이력을 모두 지울까요?",
      rec_hist_cleared: "계산 이력을 지웠습니다.",
      rec_copied: "클립보드에 복사되었습니다.",
      btn_copy_results: "결과값 전체 복사",

      // DATA view
      b_data_title: "DATA — 스캔 파일 읽기 & XY 플롯",
      b_data_desc: "2열 txt / csv 자동 판독, 로그 축, 정규화, 구간 자르기, XRR 세그먼트 이어붙이기",
      dv_c1_title: "데이터 파일 불러오기",
      dv_c1_tag: "구분자 & 헤더 자동 감지",
      dv_c2_title: "XY 플롯",
      dv_c2_tag: "Linear / Log · Normalize · Crop",
      dv_c3_title: "XRR 세그먼트 이어붙이기",
      dv_c3_tag: "겹침 구간 자동 배율",
      dv_drop_hint: "파일을 여기에 끌어다 놓거나",
      dv_choose: "파일 선택",
      dv_drop_note: "TXT · CSV · DAT · XY — tab / comma / semicolon / whitespace, # % ! ; 주석 허용",
      dv_clear: "전체 지우기",
      dv_yaxis: "Y축 스케일",
      dv_y_linear: "Linear",
      dv_y_log: "Log₁₀",
      dv_norm: "정규화",
      dv_norm_none: "없음 (원본 값)",
      dv_norm_max: "최대값 = 1",
      dv_norm_xrr: "XRR 플래토 = 1",
      dv_norm_short: "정규화",
      dv_crop: "X 구간 자르기",
      dv_crop_reset: "해제",
      dv_copy: "보이는 곡선 복사 (TSV)",
      dv_download: ".txt로 저장",
      dv_stitch_run: "겹침 구간으로 자동 이어붙이기",
      dv_stitch_reset: "배율 초기화",
      dv_stitch_explain: "감쇠체를 바꿔가며 나눠 측정한 XRR 세그먼트는 각각 미지의 상수가 곱해진 같은 반사율이다. 겹치는 각도 구간에서 두 세그먼트의 비를 점마다 구하고 그 중앙값을 배율로 삼는다. 배율은 앞서 이어붙인 곡선 전체를 기준으로 누적 계산하므로 오차가 그대로 전파되지 않는다.",
      dv_stitch_manual_hint: "불러온 파일 표의 배율 칸에 직접 값을 입력하면 자동 계산을 덮어쓴다. 칸을 비우면 다시 자동으로 돌아간다. 겹치는 구간이 없는 세그먼트는 배율 1로 두고 표시하므로, 아는 감쇠체 배율을 직접 넣으면 된다.",
      dv_col_file: "파일",
      dv_col_x: "X 열",
      dv_col_y: "Y 열",
      dv_col_range: "X 범위",
      dv_col_pts: "점 수",
      dv_col_scale: "배율",
      dv_anchor: "기준",
      dv_overlap: "겹침",
      dv_manual: "수동",
      dv_header_yes: "헤더 있음",
      dv_header_no: "헤더 없음",
      dv_skipped: "{n}행 건너뜀",
      dv_preamble: "머리말 {n}행 지나침",
      dv_no_files: "불러온 파일이 없습니다.",
      dv_empty_none: "파일을 불러오면 여기에 플롯이 표시됩니다.",
      dv_empty_series: "표시할 점이 없습니다. 열 선택이나 자른 구간을 확인하세요.",
      dv_log_dropped: "로그 축에서 y ≤ 0 인 {n}개 점을 건너뛰었습니다.",
      dv_sum_traces: "곡선",
      dv_sum_points: "점",
      dv_sum_yaxis: "Y축",
      dv_sum_norm: "정규화 계수",
      dv_stitch_done: "겹침 구간으로 배율을 맞췄습니다.",
      dv_stitch_gap: "겹치는 구간이 없는 세그먼트가 있어 배율 1로 두었습니다. 직접 입력하세요.",
      dv_stitch_need2: "이어붙이려면 보이는 파일이 2개 이상 필요합니다.",
      dv_copied: "데이터를 클립보드에 복사했습니다.",
      dv_parse_fail: "숫자 열을 찾지 못했습니다:",
      dv_read_fail: "파일을 읽지 못했습니다:",
      dv_no_filereader: "이 브라우저는 파일 읽기를 지원하지 않습니다.",

      // Settings Tab (previously English-only; these are reached through t()
      // at runtime, so Korean users were seeing the raw key names)
      set_card_lang_title: "언어 선택",
      lang_desc: "인터페이스 언어를 전환합니다. 언어마다 주소가 다르므로 페이지가 다시 열립니다.",
      btn_lang_ko: "한국어",
      btn_lang_en: "English",
      lang_current: "현재 언어: 한국어",
      nav_drawer_toggle: "메뉴 및 검색 열기",
      lang_switch_title: "English로 보기",
      lang_switch_code: "EN",
      noscript_note: "자바스크립트를 활성화하면 위 계산기를 사용할 수 있습니다. 모든 계산은 브라우저 안에서만 수행됩니다.",
      noscript_body:
        "<strong>xray.ooguy</strong> — 방사광 X선 실험용 계산기 모음입니다.\n" +
        "      계산에는 자바스크립트가 필요하며, 포함된 도구는 다음과 같습니다:\n" +
        "      <ul style=\"margin:8px 0 8px 18px;\">\n" +
        "        <li><strong>브래그 각도</strong> — 광자 에너지와 격자면 간격으로부터의 회절 각도 (&lambda; = 2d sin&theta;)</li>\n" +
        "        <li><strong>에너지 · 파장 · 진동수</strong> 변환 (E = hc/&lambda;)</li>\n" +
        "        <li><strong>격자면 간격</strong> — 격자 상수와 밀러 지수 (hkl), 7개 결정계 전부</li>\n" +
        "        <li><strong>산란 벡터 Q</strong> — 상호 공간 (Q = 4&pi; sin&theta; / &lambda;)</li>\n" +
        "        <li><strong>복소 굴절률과 투과율</strong> (n = 1 &minus; &delta; + i&beta;)</li>\n" +
        "        <li><strong>전반사 임계각</strong> (&theta;c = &radic;2&delta;)</li>\n" +
        "        <li><strong>빔 풋프린트</strong>와 시료 밖 유출, <strong>검출기 각분해능</strong>, <strong>슬릿 수용각</strong></li>\n" +
        "        <li><strong>오일러 크레이들</strong> 카이-파이 보정과 결맞음 회절 이미징용 <strong>BCDI 오버샘플링</strong></li>\n" +
        "        <li><strong>광자 선속</strong>, <strong>에너지 분해능</strong>, 단색화 결정 <strong>열 드리프트</strong></li>\n" +
        "        <li><strong>스캔 파일 뷰어</strong> — 2열 txt / csv를 선형 또는 로그 축으로, 그리고 스캔 구간의 겹침을 이용한 <strong>XRR 구간 이어붙이기</strong></li>\n" +
        "      </ul>\n" +
        "      ",
      // ----------------------------------------------------------------
      // Dashboard — the toolkit by the job in front of you
      // ----------------------------------------------------------------
      // The verb a reader arrives with. The tool's own name is read out of
      // the contents block beside it, so these say what it is *for*, not what
      // it is called.
      dash_question: "무엇을 하려고 하나요?",
      dash_lede: "빔라인 작업에서 반복되는 계산과 도구를 물리 분야가 아니라 하는 일 기준으로 묶었습니다. 전체 목록은 CONTENTS 에 있습니다.",
      dash_quick: "빠른 계산",
      dash_more: "{n}개 더 보기",
      dash_less: "접기",
      dash_recent: "최근 사용",
      dash_count: "도구 {n}개",
      dash_browse_all: "CONTENTS 에서 전체 도구 보기",

      dash_g_plan: "측정 계획",
      dash_q_plan: "이 측정이 가능한가?",
      dash_g_geometry: "기하 설정",
      dash_q_geometry: "시료와 검출기를 어디에 둘까?",
      dash_g_beam: "빔 확인",
      dash_q_beam: "시료에 실제로 무엇이 도달하나?",
      dash_g_result: "결과 처리",
      dash_q_result: "측정한 결과를 어떻게 처리하나?",

      dash_act_rad_scantime: "스캔 시간 추정",
      dash_act_rad_dose: "선량 한계 확인",
      dash_act_rad_absorber: "감쇠체 스택 구성",
      dash_act_beamline_footprint: "빔 풋프린트 확인",
      dash_act_beamline_cdi: "결맞음 오버샘플링 확인",
      dash_act_coh_resolution: "도달 가능한 분해능 추정",
      dash_act_coh_length: "결맞음 길이 추정",

      dash_act_lattice_dspacing: "격자면 간격 계산",
      dash_act_optics_scaling: "에너지 변경 보정",
      dash_act_beamline_detector: "검출기 기하 확인",
      dash_act_optics_bragg: "브래그 각도 찾기",
      dash_act_optics_energy: "에너지 ↔ 파장 변환",
      dash_act_optics_qspace: "각도 ↔ Q 변환",
      dash_act_optics_euler: "오일러 크래들 χ·φ 보정",
      dash_act_opt_calibration: "모노크로미터 에너지 보정",

      dash_act_optics_refraction: "투과율 계산",
      dash_act_beamline_flux: "광자 플럭스 추정",
      dash_act_beamline_slit: "슬릿 개구 설정",
      dash_act_optics_reflection: "임계각 찾기",
      dash_act_beamline_resolution: "에너지 분해능 확인",
      dash_act_beamline_drift: "열 드리프트 추정",
      dash_act_optics_grating: "격자 각분산 계산",

      dash_act_data_plot: "스캔 데이터 그리기",
      dash_act_data_stitch: "XRR 구간 이어붙이기",
      dash_act_record_headers: "로그북 헤더 복사",
      dash_act_data_load: "스캔 파일 열기",
      dash_act_data_kiessig: "박막 두께 추정",
      dash_act_geo_pixelq: "검출기 픽셀 → Q 변환",
      dash_act_geo_strain: "피크 이동에서 변형률 계산",
      dash_act_record_snippets: "빔타임 이벤트 기록",
      dash_act_record_history: "계산 기록 확인",

      meta_title: "xray.ooguy — XRD 격자면 간격(d-spacing), 브래그 각도, 방사광 계산기",
      meta_description: "XRD·방사광 X선 실험을 위한 오프라인 계산기: 7개 결정계 격자면 간격(d-spacing), 브래그 각도, 에너지-파장 변환, 산란 벡터 Q, 빔 풋프린트, 검출기 기하, BCDI 오버샘플링, XRR 구간 이어붙이기.",
      meta_og_title: "xray.ooguy — 방사광 X선 계산기",
      meta_og_description: "방사광 빔라인 작업을 위한 브래그 각도, 격자면 간격, Q 공간, 빔 풋프린트, BCDI 오버샘플링, XRR 구간 이어붙이기. 완전히 오프라인으로 동작하며 계정이 필요 없습니다.",
      page_h1: "xray.ooguy — XRD 격자면 간격(d-spacing), 브래그 각도, 상호공간 Q, 빔 풋프린트, BCDI 오버샘플링, XRR 세그먼트 이어붙이기 계산기",
      theme_current_initial: "현재 테마: 학술 논문",
      set_card_theme_title: "화면 테마 설정",
      set_card_shortcuts_title: "키보드 단축키 안내",

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

      sc_go_radiometry: "RADIOMETRY 이동",
      sc_go_optics: "OPTICS 이동",
      sc_go_geometry: "GEOMETRY 이동",
      sc_go_coherence: "COHERENCE 이동",
      sc_go_data: "DATA 이동",
      sc_go_record: "RECORD 이동",
      sc_go_settings: "SETTINGS 이동",
      sc_go_about: "ABOUT 이동",
      sc_go_dashboard: "DASHBOARD 이동",
      sc_go_index: "CONTENTS 이동",

      res_scatt_q: "산란 벡터 Q",

      toc_tool_lattice: "격자 상수 & 밀러 지수 → 격자면 간격",
      lat_title: "격자 상수 & 밀러 지수 → 격자면 간격",
      lat_system: "결정계",
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
      lat_centering: "격자 중심화",
      lat_refl_title: "이 에너지에서 접근 가능한 반사",
      lat_refl_hkl: "h k l",
      lat_refl_d: "d (Å)",
      lat_refl_tth: "2θ (°)",
      lat_refl_q: "|Q| (Å⁻¹)",
      lat_refl_note: "{shown}개 표시 · 중심화 조건으로 {extinct}개 소멸",
      lat_refl_none: "이 에너지에서는 회절 조건을 만족하는 반사가 없습니다.",

      // Reference datasheet — an appendix on the contents page, outside the
      // numbered cards
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
      vw_refract_edge_crossed: "10 keV 기준값과 입력 에너지 사이에 흡수단이 있습니다 — 거듭제곱 외삽이 이 단을 매끄럽게 건너뛰므로 β 와 감쇠길이가 크게 어긋납니다. 건너뛴 흡수단:",
      vw_refract_edge_near: "흡수단 근처입니다 — 이 구간에는 미세구조가 있어 매끄러운 거듭제곱 모델이 성립하지 않습니다. 가장 가까운 흡수단:",
      vw_refract_range: "10 keV 기준값에서 너무 멀리 외삽했습니다 (1–60 keV 밖) — 거듭제곱 모델 자체를 신뢰할 수 없는 거리입니다.",
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
      mp_transmit: "에너지에 따른 투과율 (흡수단 사이)",
      mp_cdi: "디텍터 거리에 따른 오버샘플링 σ",
      mp_refl: "이 격자가 주는 반사면 위치",
      mp_x_det_distance: "디텍터 거리 (m)",
      mp_y_sigma: "오버샘플링 σ",
      mp_x_twotheta: "2θ (°)",
      mp_cdi_needs: "σ ≥ 2 최소 거리",
      mp_y_transmit: "투과율 (%)",
      mp_x_energy: "에너지 (keV)",
      gauge_scan: "남은 빔타임 대비 스캔 시간",
      gauge_scan_total: "스캔",
      gauge_scan_left: "남은 시간",
      gauge_scan_of_shift: "사용",
      gauge_coh: "결맞음 길이 대비 시료 크기",
      gauge_coh_xt: "ξt (좁은 쪽)",
      gauge_coh_sample: "시료",

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
      b_set_title: "환경 설정",
      b_set_desc: "언어 설정, 화면 테마, 키보드 단축키",

      // Table of Contents (TOC)
      toc_pretitle: "SYNCHROTRON X-RAY OPTICS & BEAMLINE MONOGRAPH",
      toc_maintitle: "INDEX",
      toc_subtitle: "방사광 X선 광학 계산, 빔라인 물리량 분석, 실험 기록 및 결정학 레퍼런스 종합 색인",
      toc_meta_docno: "문서 번호:",
      toc_meta_suites: "총 편수:",
      toc_meta_modules: "모듈:",
      toc_meta_modules_val: "계산기 및 도구 31종",
      toc_meta_calib: "교정 기준:",
      toc_meta_status: "상태:",
      toc_meta_status_val: "클라이언트 오프라인 동작",
      toc_sec_radiometry_title: "방사 계측 — 플럭스, 감쇠, 선량",
      toc_sec_radiometry_desc: "광자 플럭스와 슬릿 수광, 감쇠자 스택, 선량과 노출 시간 예산",
      toc_sec_optics_title: "광학 — 에너지, 물질, 모노크로메이터",
      toc_sec_optics_desc: "에너지-파장 변환, 복소 굴절률과 투과율, 전반사 임계각, 회절격자, 에너지 분해능, 열 드리프트",
      toc_tool_opt_1: "에너지 - 파장 - 주파수 변환",
      toc_tool_opt_2: "브래그 법칙 3방향 계산 수트",
      toc_tool_opt_3: "회절격자 분산 및 분해능",
      toc_tool_opt_4: "복소 굴절률 및 X선 투과율",
      toc_tool_opt_5: "에너지 스케일링 & 각도 보정",
      toc_tool_opt_6: "Chi-Phi 오일러 크래들 보정",
      toc_tool_opt_7: "전반사 임계각",
      toc_tool_opt_8: "상호공간 Q-Space 및 주기 변환",
      toc_sec_geometry_title: "기하 — 결정, 각도, 검출기",
      toc_sec_geometry_desc: "브래그 조건, 격자상수와 밀러 지수, 상호공간 Q, 빔 풋프린트, 검출기 각분해능, 오일러 요람 보정",
      toc_sec_coherence_title: "결맞음 — CDI / BCDI",
      toc_sec_coherence_desc: "시료 위 결맞음 길이, 프린지 오버샘플링 비, 도달 가능한 실공간 분해능",
      toc_tool_beam_1: "시료 상 빔 풋프린트 & 스필오버",
      toc_tool_rad_scan: "스캔 시간 & 시프트 예산",
      toc_tool_rad_dose: "흡수 선량 & 노출 한계",
      toc_tool_rad_abs: "감쇠자 스택 & 역산",
      toc_tool_beam_2: "빔라인 광자 플럭스",
      toc_tool_beam_3: "에너지 분해능 (ΔE/E) 계산",
      toc_tool_beam_4: "디텍터 각도 분해능",
      toc_tool_coh_len: "시료 위 결맞음 길이",
      toc_tool_coh_res: "도달 가능한 실공간 분해능",
      toc_tool_beam_5: "CDI / BCDI 결맞음 오버샘플링",
      toc_tool_beam_6: "슬릿 간격 및 빔 수용각",
      toc_tool_beam_7: "결정 열팽창 각도 및 에너지 시프트",
      toc_sec_record_title: "로그북 & 실시간 기록",
      toc_sec_record_desc: "연구 노트용 표준 로그북 서식 템플릿과 빔타임 실시간 이벤트 1클릭 복사 스니펫",
      toc_tool_rec_1: "빔타임 로그북 서식 프리셋",
      toc_tool_rec_2: "실시간 빔타임 이벤트 스니펫",
      toc_tool_rec_3: "계산 이력",
      toc_sec_data_title: "스캔 데이터 판독 및 플롯",
      toc_sec_data_desc: "2열 스캔 파일 자동 판독, XY 플롯과 로그 축, 정규화와 구간 자르기, XRR 세그먼트 이어붙이기",
      toc_tool_opt_cal: "모노크로메이터 에너지 교정",
      toc_tool_geo_strain: "피크 이동으로부터의 격자 변형",
      toc_tool_geo_pxq: "검출기 픽셀 → Q",
      toc_tool_dv_kiessig: "Kiessig 프린지 → 박막 두께",
      toc_tool_dv_1: "데이터 파일 불러오기",
      toc_tool_dv_2: "XY 플롯",
      toc_tool_dv_3: "XRR 세그먼트 이어붙이기",
      toc_sec_settings_title: "환경설정 및 아카이브",
      toc_sec_settings_desc: "언어 설정, 일곱 가지 화면 테마, 키보드 단축키 안내",
      toc_tool_set_1: "언어 설정",
      toc_tool_set_2: "화면 테마 모드",
      toc_tool_set_5: "키보드 단축키 안내",
      toc_sec_about_title: "연구자 프로필 및 후원",
      toc_sec_about_desc: "연구자 약력, X선 광학·BCDI 연구 분야, 연락처 및 프로젝트 후원",

      // Optics Suite
      opt_t1_title: "에너지 - 파장 - 주파수 변환",
      lbl_energy: "에너지",
      lbl_wavelength: "파장",
      lbl_frequency: "주파수",
      opt_t1_res_label: "실시간 등가 변환값",
      opt_t2_title: "브래그 법칙 3-Way Suite",
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
      opt_cal_title: "모노크로메이터 에너지 교정",
      lbl_cal_d: "기준 반사의 d 값",
      lbl_cal_tth: "측정된 2θ",
      lbl_cal_nominal: "모노가 설정된 에너지",
      res_cal_actual: "실제 전달 에너지",
      res_cal_offset: "설정값과의 차이",
      res_cal_rel: "상대 편차",
      res_cal_dtheta: "이를 설명하는 각도 오프셋",
      geo_strain_title: "피크 이동으로부터의 격자 변형",
      lbl_strain_d0: "무변형 d<sub>0</sub>",
      lbl_strain_tth: "측정된 2θ",
      res_strain_eps: "변형률 ε",
      res_strain_micro: "마이크로변형",
      res_strain_d: "측정된 d",
      res_strain_shift: "피크 이동 Δ2θ",
      geo_pxq_title: "검출기 픽셀 → Q",
      lbl_pxq_dx: "빔 중심에서 x",
      lbl_pxq_dy: "빔 중심에서 y",
      res_pxq_q: "산란 벡터 Q",
      res_pxq_tth: "산란각 2θ",
      res_pxq_d: "면간 거리 d",
      res_pxq_azim: "검출기 상 방위각",
      dv_kiessig_title: "Kiessig 프린지 → 박막 두께",
      dv_kiessig_desc: "반사율 곡선의 이웃한 두 극소점을 넣습니다. 임계각을 입력하면 굴절 보정이 적용되고, 0으로 두면 저각에서 두께를 크게 보는 단순 λ/2Δθ 추정값이 됩니다.",
      lbl_kie_t1: "낮은 쪽 극소 θ<sub>1</sub>",
      lbl_kie_t2: "높은 쪽 극소 θ<sub>2</sub>",
      lbl_kie_tc: "임계각 θ<sub>c</sub>",
      res_kie_t: "박막 두께",
      res_kie_raw: "굴절 보정 없이",
      res_kie_spacing: "프린지 간격 Δθ",
      res_kie_next: "다음 극소 예상 위치",
      vm_cal_bragg: "브래그 조건 단일 반사, 굴절 보정 없음",
      vm_cal_dexact: "기준 d 값이 측정 온도에서 정확하다고 가정",
      vw_cal_large: "설정값과 크게 어긋납니다 — 반사 지정이나 각도 영점을 먼저 확인하십시오:",
      vm_strain_uniform: "균일 탄성 변형, 피크 이동 전부를 격자 변화로 귀속",
      vm_strain_nozero: "각도 영점 오차와 굴절 보정 미포함",
      vw_strain_large: "변형률이 통상적인 탄성 한계를 넘습니다 — 영점 오차나 다른 반사일 가능성:",
      vm_pxq_flat: "평면 검출기, 빔에 수직, 시료는 회전 중심",
      vm_pxq_notilt: "검출기 기울기·시료 오프셋 미보정",
      vw_pxq_wide: "산란각이 큽니다 — 이 영역에서 검출기 기울기 1°는 Q 를 눈에 띄게 옮깁니다:",
      vm_kie_adjacent: "이웃한 두 극소 (차수 차이 1) 가정",
      vm_kie_single: "단일 균일 층, 거칠기와 다층 간섭 미포함",
      vw_kie_belowc: "임계각 이하 구간입니다 — 전반사 영역이라 읽을 프린지가 없습니다.",
      vw_kie_corr: "굴절 보정이 두께를 크게 바꿉니다 — 저각 프린지일수록 보정 없는 값은 신뢰할 수 없습니다:",
      opt_t3_title: "회절격자",
      lbl_grating_lines: "격자선 밀도",
      lbl_photon_energy: "광자 에너지",
      lbl_alpha: "입사각 <i class=\"formula\">α</i>",
      lbl_order: "회절 차수 <i class=\"formula\">m</i>",
      res_beta: "회절 출사각 <i class=\"formula\">β</i>",
      res_dispersion: "각분산력 (<i class=\"formula\">dβ/dλ</i>)",
      opt_t4_title: "굴절률 및 X선 투과율 (<i class=\"formula\">n = 1 - δ + iβ</i>)",
      opt_t4_tag: "비어-람베르트 감쇠",
      lbl_select_mat: "재료 선택",
      lbl_thickness: "시료 두께",
      res_trans: "빔 투과율",
      res_atten_len: "감쇠 거리 (1/<i class=\"formula\">e</i> length)",
      res_crit_ang: "임계각 <i class=\"formula\">θ</i><sub>c</sub>",
      opt_t5_title: "에너지 스케일링 & 각도 계산기",
      sec_ref_condition: "기준 빔 조건",
      sec_target_condition: "목표 에너지 선택",
      lbl_ref_energy: "기준 에너지 E_ref",
      lbl_ref_theta: "기준 각도 θ",
      lbl_ref_twotheta: "기준 각도 2θ",
      lbl_target_energy: "목표 에너지 E_target",
      lbl_target_presets: "빠른 에너지 프리셋",
      res_target_twotheta: "목표 회절각 2θ",
      res_target_theta: "목표 브래그각 θ",
      res_unreachable: "회절 불가 (sin θ₂ > 1)",
      opt_t6_title: "Chi-Phi 오일러 크래들 보정",
      opt_t6_tag: "4축 회절계",
      lbl_chiphi_th: "브래그 각도 <i class=\"formula\">θ</i>",
      lbl_chiphi_chi: "Chi 틸트 변화량 <i class=\"formula\">Δχ</i>",
      res_phi_corr: "Phi 축 보정량 (<i class=\"formula\">Δφ</i>)",
      opt_t7_title: "전반사 임계각",
      lbl_density: "밀도 <i class=\"formula\">ρ</i>",
      lbl_z_over_a: "<i class=\"formula\">Z/A</i> 비",
      res_crit_deg: "임계각 <i class=\"formula\">θ</i><sub>c</sub> (°)",
      res_crit_mrad: "임계각 <i class=\"formula\">θ</i><sub>c</sub> (mrad)",
      res_crit_qc: "임계 산란벡터 <i class=\"formula\">Q</i><sub>c</sub>",
      opt_t8_title: "상호공간 Q-Space 변환",
      lbl_angle_th: "각도 <i class=\"formula\">θ</i>",
      lbl_angle_2th: "회절각 <i class=\"formula\">2θ</i>",
      lbl_scatt_q: "산란 벡터 <i class=\"formula\">Q</i>",
      lbl_real_d: "실공간 주기 <i class=\"formula\">d</i>",

      // Beamline Suite
      beam_t1_title: "시료 상 빔 풋프린트",
      lbl_beam_v: "수직 빔 크기 (V)",
      lbl_beam_h: "수평 빔 크기 (H)",
      lbl_inc_ang: "입사각 <i class=\"formula\">θ</i>",
      lbl_sample_len: "시료 길이 (길이 방향)",
      res_fp_len: "시료 상 풋프린트 길이",
      res_beam_h: "수평 빔 폭",
      res_fp_minangle: "시료를 벗어나지 않는 최소 입사각",
      res_fp_never: "어느 각도에서도 초과",
      rad_scan_title: "스캔 시간 & 시프트 예산",
      lbl_scan_pts1: "포인트 수 (축 1)",
      lbl_scan_pts2: "포인트 수 (축 2)",
      lbl_scan_dwell: "포인트당 계수 시간",
      lbl_scan_overhead: "포인트당 오버헤드",
      lbl_scan_repeats: "반복 횟수",
      lbl_scan_shift: "남은 빔타임",
      res_scan_total: "총 소요 시간",
      res_scan_each: "1회당",
      res_scan_points: "총 포인트",
      res_scan_maxdwell: "딱 맞는 계수 시간",
      res_scan_fit_lbl: "남은 빔타임 대비:",
      res_scan_fits: "들어감",
      res_scan_spare: "여유",
      res_scan_over: "초과",
      rad_dose_title: "흡수 선량 & 노출 한계",
      lbl_dose_flux: "시료 도달 플럭스",
      lbl_dose_bh: "빔 수평 크기",
      lbl_dose_bv: "빔 수직 크기",
      lbl_dose_thick: "시료 두께",
      lbl_dose_exposure: "노출 시간",
      lbl_dose_limit: "손상 한계 선량",
      res_dose_rate: "선량률",
      res_dose_total: "이번 노출 선량",
      res_dose_ttl: "한계 도달까지",
      res_dose_absorbed: "흡수 비율",
      rad_abs_title: "감쇠자 스택",
      lbl_abs_target: "목표 감쇠 배수",
      th_abs_material: "포일",
      th_abs_thick: "두께 (μm)",
      th_abs_trans: "투과율",
      res_abs_total: "스택 투과율",
      res_abs_factor: "감쇠 배수",
      res_abs_need_lbl: "목표 감쇠에 필요한 첫 번째 포일 두께:",
      vm_scan_stepping: "포인트 단위 스텝 스캔, 계수 시간 일정 — 연속(fly) 스캔 아님",
      vm_scan_overhead: "오버헤드는 포인트마다 동일하다고 가정 (모터 정착·판독 시간)",
      vw_scan_overhead_dominant: "오버헤드가 계수 시간을 넘습니다 — 스캔 시간의 대부분이 측정이 아닌 이동입니다:",
      vm_dose_local: "흡수 에너지가 조사 부피 안에 전부 남는다고 가정 (광전자 이탈 무시)",
      vm_dose_beer: "Beer-Lambert 균일 단일 물질, 빔 단면 균일",
      vm_dose_scaling: "μ 는 10 keV 실측 β 에서 거듭제곱 외삽 — 흡수단 부근에서는 어긋납니다",
      vw_dose_thin: "광전자 비정(飛程)에 견줄 만큼 얇은 시료입니다 — 에너지 일부가 빠져나가므로 실제 선량은 이 값보다 낮습니다:",
      vm_abs_beer: "Beer-Lambert 감쇠, 포일 직렬 곱",
      vm_abs_noharm: "고차 하모닉과 소각 산란 무시 — 감쇠자는 빔을 경화시켜 하모닉 비율을 높입니다",
      vw_abs_hard: "감쇠가 매우 큽니다 — 이 영역에서는 하모닉과 산란 성분이 투과 빔을 지배할 수 있습니다:",
      beam_t2_title: "빔라인 광자 플럭스",
      beam_t2_tag: "시료 도달 플럭스",
      lbl_ring_current: "저장링 전류",
      lbl_source_flux: "소스 기준 플럭스",
      lbl_mono_eff: "모노크로메이터 효율",
      lbl_mirror_eff: "미러 반사율",
      lbl_win_trans: "윈도우 투과율",
      res_deliv_flux: "시료 도달 플럭스",
      res_tot_eff: "광학계 전송 효율",
      beam_t3_title: "에너지 분해능 (ΔE/E)",
      beam_t3_tag: "단색화 장치 고유 분해능",
      lbl_mono_cryst: "모노크로메이터 결정",
      lbl_beam_div: "빔 수직 발산각",
      res_delta_e: "총 에너지 대역폭 (<i class=\"formula\">ΔE</i>)",
      res_de_over_e: "에너지 분해능 (<i class=\"formula\">ΔE/E</i>)",
      res_mono_th: "브래그 각도",
      beam_t4_title: "디텍터 각도 분해능",
      lbl_pixel_size: "픽셀 크기",
      lbl_sample_det_dist: "시료-디텍터 거리",
      res_ang_res_mrad: "각도 분해능 (mrad)",
      res_ang_res_deg: "각도 분해능 (°)",
      coh_len_title: "시료 위 결맞음 길이",
      lbl_coh_bandwidth: "밴드폭 ΔE/E",
      lbl_coh_src_h: "광원 크기 H (FWHM)",
      lbl_coh_src_v: "광원 크기 V (FWHM)",
      lbl_coh_dist: "광원-시료 거리",
      res_coh_xt_h: "횡 결맞음 길이 ξ<sub>t</sub>, 수평",
      res_coh_xt_v: "횡 결맞음 길이 ξ<sub>t</sub>, 수직",
      res_coh_xl: "종 결맞음 길이 ξ<sub>l</sub>",
      res_coh_maxpath: "최대 경로차",
      res_coh_verdict_lbl: "시료 크기 대 횡 결맞음:",
      res_coh_ok: "결맞음 조명",
      res_coh_marginal: "경계",
      res_coh_fail: "부분 결맞음 — 위상복원 불가",
      coh_res_title: "도달 가능한 실공간 분해능",
      lbl_cres_npix: "사용 픽셀 수 (한 변)",
      res_cres_dr: "실공간 분해능 Δr",
      res_cres_qmax: "가장자리 Q (반폭)",
      res_cres_span: "각도 반폭",
      res_cres_extent: "사용한 검출기 범위",
      vm_coh_vcz: "van Cittert-Zernike, 가우시안 광원, ξt = λR / 2S (S = FWHM)",
      vm_coh_long: "ξl = λ² / 2Δλ, 후방산란 최악 조건으로 경로차 산정",
      vw_coh_undersized: "횡 결맞음 길이가 시료보다 짧습니다 — 부분 결맞음 조명이므로 오버샘플링 비가 통과해도 위상복원이 되지 않습니다:",
      vw_coh_pathlong: "경로차가 종 결맞음 길이를 넘습니다 — 고차 프린지가 씻겨 나갑니다:",
      vm_cres_farfield: "원거리장(Fraunhofer), 검출기는 빔에 수직인 평면",
      vm_cres_extent: "분해능은 사용한 검출기 범위로만 결정 — 신호 대 잡음과 부분 결맞음 손실 미포함",
      vw_cres_optimistic: "이 Δr 은 기하학적 상한입니다 — 가장자리 프린지가 잡음에 묻히면 실제 분해능은 더 나빠집니다.",
      beam_t5_title: "CDI / BCDI 결맞음 오버샘플링",
      lbl_det_dist: "디텍터 거리",
      lbl_det_pixel: "디텍터 픽셀 크기",
      lbl_sample_size: "시료/결정 크기",
      res_sigma: "오버샘플링 비율 (<i class=\"formula\">σ</i>)",
      res_speckle: "디텍터 스펙클 크기",
      res_verdict_lbl: "판정 결과:",
      beam_t6_title: "슬릿 간격 및 수용각",
      beam_t6_tag: "빔 수용각",
      lbl_source_size: "소스 크기 (FWHM)",
      lbl_source_slit_dist: "소스-슬릿 거리",
      lbl_slit_div: "빔 발산각",
      lbl_gauss_mult: "가우시안 배율",
      res_slit_fwhm: "슬릿 위치 빔 크기 (FWHM)",
      res_slit_open: "권장 슬릿 개구폭",
      beam_t7_title: "결정 열팽창 각도 및 에너지 시프트",
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
      nav_radiometry: "I. RADIOMETRY",
      nav_optics: "II. OPTICS",
      nav_geometry: "III. GEOMETRY",
      nav_coherence: "IV. COHERENCE",
      nav_data: "V. DATA",
      nav_record: "VI. RECORD",
      nav_settings: "VII. SETTINGS",
      nav_about: "VIII. ABOUT",
      nav_dashboard_index: "CONTENTS",
      nav_dashboard: "DASHBOARD",
      nav_index: "CONTENTS",

      // Calculator views
      b_rad_title: "RADIOMETRY — Flux, Attenuation, Dose & Exposure Time",
      b_rad_desc: "How many photons reach the sample, how much is taken out on the way, and how long it can be exposed",
      b_opt_title: "OPTICS — Energy, Materials & Monochromator",
      b_opt_desc: "Photon energy and wavelength, complex refraction and transmittance, resolution and thermal drift",
      b_geo_title: "GEOMETRY — Crystal, Angles & Detector",
      b_geo_desc: "Bragg angles, lattice spacing, reciprocal-space Q, beam footprint and detector geometry",
      b_coh_title: "COHERENCE — CDI & BCDI",
      b_coh_desc: "Coherence lengths at the sample, fringe oversampling and the real-space resolution the geometry can reach",

      // RECORD view
      b_rec_title: "RECORD — Experiment Session Log",
      b_rec_desc: "One-click logging. Every field is optional.",
      rec_c1_title: "Beamtime Logbook Header Presets",
      rec_c1_tag: "Plain Text Format",
      rec_c2_title: "In-Situ Beamtime Event Snippets",
      rec_c2_tag: "One-Click Timestamped Copy",
      rec_c3_title: "Calculation History",
      rec_hist_desc: "The last 25 calculations, newest first, held in this browser only. Each row names the calculator it came from, so an entry keeps its meaning after a suite is reorganised or the language is switched.",
      rec_hist_th_time: "Time",
      rec_hist_th_tool: "Calculator",
      rec_hist_th_in: "Inputs",
      rec_hist_th_out: "Result",
      rec_hist_empty: "No calculations recorded yet.",
      rec_hist_clear: "Clear history",
      rec_hist_confirm: "Clear the whole calculation history?",
      rec_hist_cleared: "Calculation history cleared.",
      rec_copied: "Copied to clipboard.",
      btn_copy_results: "Copy all results",

      // DATA view
      b_data_title: "DATA — Scan Files & XY Plot",
      b_data_desc: "Two-column txt / csv read automatically, log axis, normalisation, range crop, XRR segment stitching",
      dv_c1_title: "Load Scan Files",
      dv_c1_tag: "Delimiter & header auto-detect",
      dv_c2_title: "Generic XY Plot",
      dv_c2_tag: "Linear / Log · Normalize · Crop",
      dv_c3_title: "XRR Segment Stitching",
      dv_c3_tag: "Scale from the overlap",
      dv_drop_hint: "Drop files here, or",
      dv_choose: "Choose files",
      dv_drop_note: "TXT · CSV · DAT · XY — tab / comma / semicolon / whitespace, # % ! ; comments",
      dv_clear: "Clear all",
      dv_yaxis: "Y axis",
      dv_y_linear: "Linear",
      dv_y_log: "Log₁₀",
      dv_norm: "Normalisation",
      dv_norm_none: "None (raw values)",
      dv_norm_max: "Maximum = 1",
      dv_norm_xrr: "XRR plateau = 1",
      dv_norm_short: "normalised",
      dv_crop: "Crop x range",
      dv_crop_reset: "Reset",
      dv_copy: "Copy visible curve (TSV)",
      dv_download: "Save as .txt",
      dv_stitch_run: "Stitch on the overlap",
      dv_stitch_reset: "Reset scales",
      dv_stitch_explain: "XRR segments measured through different absorbers are the same reflectivity times an unknown constant each. Where two segments overlap in angle they measure the same thing, so the point-by-point ratio across the overlap is that constant; its median is used. Each segment is matched against the whole curve assembled so far, so an error does not simply repeat down the chain.",
      dv_stitch_manual_hint: "Typing a value into the scale column of the loaded-file table overrides the automatic one; clearing the box hands it back to auto. A segment with no overlap is left at scale 1 and flagged, so a known absorber factor can be entered directly.",
      dv_col_file: "File",
      dv_col_x: "X column",
      dv_col_y: "Y column",
      dv_col_range: "X range",
      dv_col_pts: "Points",
      dv_col_scale: "Scale",
      dv_anchor: "anchor",
      dv_overlap: "overlap",
      dv_manual: "manual",
      dv_header_yes: "header",
      dv_header_no: "no header",
      dv_skipped: "{n} rows skipped",
      dv_preamble: "{n} header lines passed",
      dv_no_files: "No files loaded.",
      dv_empty_none: "Load a file and the plot appears here.",
      dv_empty_series: "Nothing to plot. Check the column choice and the crop range.",
      dv_log_dropped: "{n} points with y ≤ 0 skipped on the log axis.",
      dv_sum_traces: "traces",
      dv_sum_points: "points",
      dv_sum_yaxis: "y axis",
      dv_sum_norm: "normalisation factor",
      dv_stitch_done: "Segments scaled on their overlap.",
      dv_stitch_gap: "A segment has no overlap and was left at scale 1. Enter its factor by hand.",
      dv_stitch_need2: "Stitching needs at least two visible files.",
      dv_copied: "Data copied to clipboard.",
      dv_parse_fail: "No numeric columns found in",
      dv_read_fail: "Could not read",
      dv_no_filereader: "This browser cannot read local files.",

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

      sc_go_radiometry: "Jump to RADIOMETRY",
      sc_go_optics: "Jump to OPTICS",
      sc_go_geometry: "Jump to GEOMETRY",
      sc_go_coherence: "Jump to COHERENCE",
      sc_go_data: "Jump to DATA",
      sc_go_record: "Jump to RECORD",
      sc_go_settings: "Jump to SETTINGS",
      sc_go_about: "Jump to ABOUT",
      sc_go_dashboard: "Jump to DASHBOARD",
      sc_go_index: "Jump to CONTENTS",

      res_scatt_q: "Scattering Vector Q",

      toc_tool_lattice: "Lattice Constants & Miller Indices → d-spacing",
      lat_title: "Lattice Constants & Miller Indices → d-spacing",
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

      // Reference datasheet — an appendix on the contents page, outside the
      // numbered cards
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
      vw_refract_edge_crossed: "An absorption edge lies between the 10 keV reference and this energy — the power-law extrapolation runs straight through the step, so β and the attenuation length are well off. Edge crossed:",
      vw_refract_edge_near: "Close to an absorption edge — the near-edge structure here is not something a smooth power law describes. Nearest edge:",
      vw_refract_range: "Extrapolated a long way from the 10 keV reference (outside 1\u201360 keV) \u2014 far enough that the power law itself is not to be trusted.",
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
      mp_transmit: "Transmittance vs energy, between the edges",
      mp_cdi: "Oversampling σ vs detector distance",
      mp_refl: "Where this cell puts its reflections",
      mp_x_det_distance: "Detector distance (m)",
      mp_y_sigma: "Oversampling σ",
      mp_x_twotheta: "2θ (°)",
      mp_cdi_needs: "σ ≥ 2 needs",
      mp_y_transmit: "Transmittance (%)",
      mp_x_energy: "Energy (keV)",
      gauge_scan: "Scan time against the beamtime left",
      gauge_scan_total: "Scan",
      gauge_scan_left: "Left",
      gauge_scan_of_shift: "of the time left",
      gauge_coh: "Coherence length against the feature",
      gauge_coh_xt: "ξt (tighter)",
      gauge_coh_sample: "Sample",

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
      b_set_title: "Settings",
      b_set_desc: "Language, display theme and keyboard shortcuts",

      // Table of Contents (TOC)
      toc_pretitle: "SYNCHROTRON X-RAY OPTICS & BEAMLINE MONOGRAPH",
      toc_maintitle: "INDEX",
      toc_subtitle: "Comprehensive Index of Synchrotron Optics, Beamline Physics & Experimental Suites",
      toc_meta_docno: "DOC NO:",
      toc_meta_suites: "TOTAL SUITES:",
      toc_meta_modules: "MODULES:",
      toc_meta_modules_val: "31 Calculators & Tools",
      toc_meta_calib: "CALIBRATION:",
      toc_meta_status: "STATUS:",
      toc_meta_status_val: "Client Offline-Native",
      toc_sec_radiometry_title: "Radiometry — Flux, Attenuation & Dose",
      toc_sec_radiometry_desc: "Photon flux and slit acceptance, absorber stacks, dose and the exposure-time budget",
      toc_sec_optics_title: "Optics — Energy, Materials & Monochromator",
      toc_sec_optics_desc: "Energy-wavelength conversion, complex refraction and transmittance, critical angle, gratings, resolution and thermal drift",
      toc_tool_opt_1: "Energy - Wavelength - Frequency",
      toc_tool_opt_2: "Bragg's Law 3-Way Suite",
      toc_tool_opt_3: "Diffraction Grating Dispersion & Resolution",
      toc_tool_opt_4: "Complex Refractive Index & Transmittance",
      toc_tool_opt_5: "Energy Scaling & Angular Correction",
      toc_tool_opt_6: "Chi-Phi Eulerian Cradle Correction",
      toc_tool_opt_7: "Total External Reflection & Critical Angle",
      toc_tool_opt_8: "Reciprocal Q-Space & Momentum Transfer",
      toc_sec_geometry_title: "Geometry — Crystal, Angles & Detector",
      toc_sec_geometry_desc: "Bragg condition, lattice constants and Miller indices, reciprocal-space Q, beam footprint, detector angular resolution and cradle correction",
      toc_sec_coherence_title: "Coherence — CDI & BCDI",
      toc_sec_coherence_desc: "Coherence lengths at the sample, the oversampling ratio and the reachable real-space resolution",
      toc_tool_beam_1: "Sample Beam Footprint & Spillover",
      toc_tool_rad_scan: "Scan Time & Shift Budget",
      toc_tool_rad_dose: "Absorbed Dose & Exposure Limit",
      toc_tool_rad_abs: "Absorber Stack & Inverse",
      toc_tool_beam_2: "Beamline Photon Flux & Efficiency",
      toc_tool_beam_3: "Energy Resolution (ΔE/E) Estimator",
      toc_tool_beam_4: "Detector Angular Resolution & Geometry",
      toc_tool_coh_len: "Coherence Lengths at the Sample",
      toc_tool_coh_res: "Reachable Real-Space Resolution",
      toc_tool_beam_5: "CDI / BCDI Coherent Oversampling",
      toc_tool_beam_6: "Slit Aperture Opening & Acceptance",
      toc_tool_beam_7: "Crystal Thermal Expansion & Angular Drift",
      toc_sec_record_title: "Logbook & Live Records",
      toc_sec_record_desc: "Standard logbook templates for lab notebooks and 1-click in-situ beamtime event snippets",
      toc_tool_rec_1: "Beamtime Logbook Header Presets",
      toc_tool_rec_2: "In-Situ Quick Log Snippets",
      toc_tool_rec_3: "Calculation History",
      toc_sec_data_title: "Scan Data Viewer",
      toc_sec_data_desc: "Two-column scan files read automatically, XY plot with a log axis, normalisation, range crop and XRR segment stitching",
      toc_tool_opt_cal: "Monochromator Energy Calibration",
      toc_tool_geo_strain: "Lattice Strain from a Peak Shift",
      toc_tool_geo_pxq: "Detector Pixel to Q",
      toc_tool_dv_kiessig: "Kiessig Fringes → Film Thickness",
      toc_tool_dv_1: "Load Scan Files",
      toc_tool_dv_2: "Generic XY Plot",
      toc_tool_dv_3: "XRR Segment Stitching",
      toc_sec_settings_title: "System Settings & Archive",
      toc_sec_settings_desc: "Language, seven display themes and the keyboard shortcut table",
      toc_tool_set_1: "Language Selection",
      toc_tool_set_2: "Display Theme Mode",
      toc_tool_set_5: "Keyboard Shortcuts Guide",
      toc_sec_about_title: "About the Creator & Research",
      toc_sec_about_desc: "Researcher profile, Coherent X-ray Optics / BCDI domain expertise, and GitHub Sponsors",

      // Settings Tab
      set_card_lang_title: "Language Selection",
      lang_desc: "Switch the interface language. Each language has its own address, so the page reloads.",
      btn_lang_ko: "한국어",
      btn_lang_en: "English",
      lang_current: "Current language: English",
      nav_drawer_toggle: "Open navigation and search",
      lang_switch_title: "한국어로 보기",
      lang_switch_code: "KO",
      noscript_note: "Enable JavaScript to use these calculators. Everything is computed inside your browser; nothing is uploaded.",
      noscript_body:
        "<strong>xray.ooguy</strong> — calculators for synchrotron X-ray experiments.\n" +
        "      JavaScript is required to run them; the tools included are:\n" +
        "      <ul style=\"margin:8px 0 8px 18px;\">\n" +
        "        <li><strong>Bragg angle</strong> — diffraction angle from photon energy and lattice plane spacing (&lambda; = 2d sin&theta;)</li>\n" +
        "        <li><strong>Energy, wavelength and frequency</strong> conversion (E = hc/&lambda;)</li>\n" +
        "        <li><strong>Lattice d-spacing</strong> from lattice constants and Miller indices (hkl), for all seven crystal systems</li>\n" +
        "        <li><strong>Scattering vector Q</strong> in reciprocal space (Q = 4&pi; sin&theta; / &lambda;)</li>\n" +
        "        <li><strong>Complex refractive index and transmittance</strong> (n = 1 &minus; &delta; + i&beta;)</li>\n" +
        "        <li><strong>Total external reflection critical angle</strong> (&theta;c = &radic;2&delta;)</li>\n" +
        "        <li><strong>Beam footprint</strong> and spillover on the sample, <strong>detector angular resolution</strong>, <strong>slit acceptance</strong></li>\n" +
        "        <li><strong>Eulerian cradle</strong> chi-phi correction and <strong>BCDI oversampling</strong> for coherent diffraction imaging</li>\n" +
        "        <li><strong>Photon flux</strong>, <strong>energy resolution</strong> and monochromator <strong>thermal drift</strong></li>\n" +
        "        <li><strong>Scan file viewer</strong> — two-column txt / csv on a linear or log axis, and <strong>XRR segment stitching</strong> across the overlap between scans</li>\n" +
        "      </ul>\n" +
        "      ",
      // ----------------------------------------------------------------
      // Dashboard — the toolkit by the job in front of you
      // ----------------------------------------------------------------
      // The verb a reader arrives with. The tool's own name is read out of
      // the contents block beside it, so these say what it is *for*, not what
      // it is called.
      dash_question: "What do you need to do?",
      dash_lede: "Calculators and utilities for recurring beamline work, grouped by the job rather than by the physics. The Index lists all of them by suite.",
      dash_quick: "QUICK CALCULATIONS",
      dash_more: "View {n} more",
      dash_less: "Show fewer",
      dash_recent: "Recently used",
      dash_count: "{n} TOOLS",
      dash_browse_all: "Browse every tool in the Index",

      dash_g_plan: "PLAN A MEASUREMENT",
      dash_q_plan: "Can this measurement work?",
      dash_g_geometry: "SET THE GEOMETRY",
      dash_q_geometry: "Where do the sample and detector go?",
      dash_g_beam: "CHECK THE BEAM",
      dash_q_beam: "What actually reaches the sample?",
      dash_g_result: "HANDLE THE RESULT",
      dash_q_result: "What happens to the measurement?",

      dash_act_rad_scantime: "Estimate scan time",
      dash_act_rad_dose: "Check the dose limit",
      dash_act_rad_absorber: "Build an absorber stack",
      dash_act_beamline_footprint: "Check the beam footprint",
      dash_act_beamline_cdi: "Check coherent oversampling",
      dash_act_coh_resolution: "Estimate reachable resolution",
      dash_act_coh_length: "Estimate coherence length",

      dash_act_lattice_dspacing: "Calculate lattice d-spacing",
      dash_act_optics_scaling: "Correct for an energy change",
      dash_act_beamline_detector: "Check detector geometry",
      dash_act_optics_bragg: "Find a Bragg angle",
      dash_act_optics_energy: "Convert energy and wavelength",
      dash_act_optics_qspace: "Convert angle to Q",
      dash_act_optics_euler: "Correct chi and phi on a cradle",
      dash_act_opt_calibration: "Calibrate the monochromator energy",

      dash_act_optics_refraction: "Calculate transmission",
      dash_act_beamline_flux: "Estimate photon flux",
      dash_act_beamline_slit: "Set a slit opening",
      dash_act_optics_reflection: "Find the critical angle",
      dash_act_beamline_resolution: "Check energy resolution",
      dash_act_beamline_drift: "Estimate thermal drift",
      dash_act_optics_grating: "Work out grating dispersion",

      dash_act_data_plot: "Plot scan data",
      dash_act_data_stitch: "Stitch XRR segments",
      dash_act_record_headers: "Copy a logbook header",
      dash_act_data_load: "Open a scan file",
      dash_act_data_kiessig: "Estimate film thickness",
      dash_act_geo_pixelq: "Convert detector pixels to Q",
      dash_act_geo_strain: "Measure strain from a peak shift",
      dash_act_record_snippets: "Record a beamtime event",
      dash_act_record_history: "Review calculation history",

      meta_title: "xray.ooguy — XRD d-spacing, Bragg Angle & Synchrotron Calculators",
      meta_description: "Offline XRD and synchrotron X-ray calculators: lattice d-spacing from Miller indices for all seven crystal systems, Bragg angle, energy-wavelength conversion, scattering vector Q, beam footprint, detector geometry, BCDI oversampling and XRR segment stitching.",
      meta_og_title: "xray.ooguy — Synchrotron X-ray Calculators",
      meta_og_description: "Bragg angle, d-spacing, Q-space, beam footprint, BCDI oversampling and XRR segment stitching for synchrotron beamline work. Runs fully offline, no account required.",
      page_h1: "xray.ooguy — XRD and synchrotron X-ray calculators for lattice d-spacing, Bragg angle, Q-space, beam footprint, BCDI oversampling and XRR segment stitching",
      theme_current_initial: "Current theme: Academic Paper",
      set_card_theme_title: "Display Theme Configuration",
      set_card_shortcuts_title: "Keyboard Shortcuts",

      // Optics Suite
      opt_t1_title: "Energy - Wavelength - Frequency Conversion",
      lbl_energy: "Energy",
      lbl_wavelength: "Wavelength",
      lbl_frequency: "Frequency",
      opt_t1_res_label: "Equivalent Physical Quantities",
      opt_t2_title: "Bragg's Law (3-Way Suite)",
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
      opt_cal_title: "Monochromator Energy Calibration",
      lbl_cal_d: "Reference d-spacing",
      lbl_cal_tth: "Measured 2θ",
      lbl_cal_nominal: "Energy the mono is set to",
      res_cal_actual: "Energy actually delivered",
      res_cal_offset: "Offset from the setting",
      res_cal_rel: "Relative offset",
      res_cal_dtheta: "Angle offset that explains it",
      geo_strain_title: "Lattice Strain from a Peak Shift",
      lbl_strain_d0: "Unstrained d<sub>0</sub>",
      lbl_strain_tth: "Measured 2θ",
      res_strain_eps: "Strain ε",
      res_strain_micro: "Microstrain",
      res_strain_d: "Measured d",
      res_strain_shift: "Peak shift Δ2θ",
      geo_pxq_title: "Detector Pixel to Q",
      lbl_pxq_dx: "From beam centre, x",
      lbl_pxq_dy: "From beam centre, y",
      res_pxq_q: "Scattering vector Q",
      res_pxq_tth: "Scattering angle 2θ",
      res_pxq_d: "Plane spacing d",
      res_pxq_azim: "Azimuth on the detector",
      dv_kiessig_title: "Kiessig Fringes → Film Thickness",
      dv_kiessig_desc: "Two adjacent minima of the reflectivity curve. Entering the critical angle applies the refraction correction; leaving it at zero gives the plain λ/2Δθ estimate, which reads thick at low angle.",
      lbl_kie_t1: "Lower minimum θ<sub>1</sub>",
      lbl_kie_t2: "Upper minimum θ<sub>2</sub>",
      lbl_kie_tc: "Critical angle θ<sub>c</sub>",
      res_kie_t: "Film thickness",
      res_kie_raw: "Without the refraction correction",
      res_kie_spacing: "Fringe spacing Δθ",
      res_kie_next: "Next minimum expected at",
      vm_cal_bragg: "Bragg condition, single reflection, no refraction correction",
      vm_cal_dexact: "Reference d assumed exact at the measurement temperature",
      vw_cal_large: "A long way from the setting — check the reflection assignment and the angle zero before believing this:",
      vm_strain_uniform: "Uniform elastic strain; the whole peak shift attributed to the lattice",
      vm_strain_nozero: "No angle-zero error and no refraction correction",
      vw_strain_large: "Strain beyond what an elastic limit usually allows — more likely a zero error or a different reflection:",
      vm_pxq_flat: "Flat detector, normal to the beam, sample on the rotation centre",
      vm_pxq_notilt: "No detector tilt and no sample offset",
      vw_pxq_wide: "Wide scattering angle — a 1° detector tilt moves Q noticeably out here:",
      vm_kie_adjacent: "Two adjacent minima assumed, one order apart",
      vm_kie_single: "Single uniform layer; roughness and multilayer interference not modelled",
      vw_kie_belowc: "At or below the critical angle — total external reflection, so there is no fringe to read.",
      vw_kie_corr: "The refraction correction moves the answer substantially — the uncorrected figure is not trustworthy for fringes this low:",
      opt_t3_title: "Diffraction Grating",
      lbl_grating_lines: "Groove Density",
      lbl_photon_energy: "Photon Energy",
      lbl_alpha: "Incident Angle <i class=\"formula\">α</i>",
      lbl_order: "Diffraction Order <i class=\"formula\">m</i>",
      res_beta: "Diffracted Angle <i class=\"formula\">β</i>",
      res_dispersion: "Angular Dispersion (<i class=\"formula\">dβ/dλ</i>)",
      opt_t4_title: "Refractive Index & X-ray Transmittance (<i class=\"formula\">n = 1 - δ + iβ</i>)",
      opt_t4_tag: "Beer-Lambert Attenuation",
      lbl_select_mat: "Select Material (Materials DB)",
      lbl_thickness: "Sample Thickness",
      res_trans: "Beam Transmittance",
      res_atten_len: "Attenuation Length (1/<i class=\"formula\">e</i>)",
      res_crit_ang: "Critical Angle <i class=\"formula\">θ</i><sub>c</sub>",
      opt_t5_title: "Energy Scaling & Angle Calculator",
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
      opt_t6_title: "Chi-Phi Eulerian Cradle Correction",
      opt_t6_tag: "4-Circle Diffractometer",
      lbl_chiphi_th: "Bragg Angle <i class=\"formula\">θ</i>",
      lbl_chiphi_chi: "Chi Tilt <i class=\"formula\">Δχ</i>",
      res_phi_corr: "Phi Axis Correction (<i class=\"formula\">Δφ</i>)",
      opt_t7_title: "Total External Reflection",
      lbl_density: "Density <i class=\"formula\">ρ</i>",
      lbl_z_over_a: "<i class=\"formula\">Z/A</i> Ratio",
      res_crit_deg: "Critical Angle <i class=\"formula\">θ</i><sub>c</sub> (°)",
      res_crit_mrad: "Critical Angle <i class=\"formula\">θ</i><sub>c</sub> (mrad)",
      res_crit_qc: "Critical Momentum <i class=\"formula\">Q</i><sub>c</sub>",
      opt_t8_title: "Reciprocal Space (Q-Space) Conversion",
      lbl_angle_th: "Angle <i class=\"formula\">θ</i>",
      lbl_angle_2th: "Diffraction Angle <i class=\"formula\">2θ</i>",
      lbl_scatt_q: "Scattering Vector <i class=\"formula\">Q</i>",
      lbl_real_d: "Real-space Periodicity <i class=\"formula\">d</i>",

      // Beamline Suite
      beam_t1_title: "Beam Footprint on Sample",
      lbl_beam_v: "Vertical Beam Size (V)",
      lbl_beam_h: "Horizontal Beam Size (H)",
      lbl_inc_ang: "Incident Angle <i class=\"formula\">θ</i>",
      lbl_sample_len: "Sample Length",
      res_fp_len: "Footprint Length on Sample",
      res_beam_h: "Horizontal Width",
      res_fp_minangle: "Shallowest Angle That Still Fits",
      res_fp_never: "Overfills at every angle",
      rad_scan_title: "Scan Time & Shift Budget",
      lbl_scan_pts1: "Points, axis 1",
      lbl_scan_pts2: "Points, axis 2",
      lbl_scan_dwell: "Dwell per point",
      lbl_scan_overhead: "Overhead per point",
      lbl_scan_repeats: "Repeats",
      lbl_scan_shift: "Beamtime left",
      res_scan_total: "Total time",
      res_scan_each: "Per repeat",
      res_scan_points: "Points",
      res_scan_maxdwell: "Dwell that just fits",
      res_scan_fit_lbl: "Against the beamtime left:",
      res_scan_fits: "Fits",
      res_scan_spare: "spare",
      res_scan_over: "Over by",
      rad_dose_title: "Absorbed Dose & Exposure Limit",
      lbl_dose_flux: "Flux on sample",
      lbl_dose_bh: "Beam H",
      lbl_dose_bv: "Beam V",
      lbl_dose_thick: "Sample thickness",
      lbl_dose_exposure: "Exposure",
      lbl_dose_limit: "Damage limit",
      res_dose_rate: "Dose rate",
      res_dose_total: "Dose this exposure",
      res_dose_ttl: "Time to the limit",
      res_dose_absorbed: "Absorbed fraction",
      rad_abs_title: "Absorber Stack",
      lbl_abs_target: "Attenuation wanted",
      th_abs_material: "Foil",
      th_abs_thick: "Thickness (μm)",
      th_abs_trans: "Transmission",
      res_abs_total: "Stack transmission",
      res_abs_factor: "Attenuation factor",
      res_abs_need_lbl: "For the attenuation wanted, in the first foil:",
      vm_scan_stepping: "Point-by-point step scan at constant dwell — not a continuous fly scan",
      vm_scan_overhead: "Overhead assumed identical at every point (motor settling and readout)",
      vw_scan_overhead_dominant: "Overhead exceeds the dwell — most of the scan is spent moving rather than counting:",
      vm_dose_local: "All absorbed energy assumed deposited inside the illuminated volume (photoelectron escape ignored)",
      vm_dose_beer: "Beer-Lambert, single uniform material, uniform beam cross-section",
      vm_dose_scaling: "μ extrapolated by power law from the tabulated 10 keV β — wrong near an absorption edge",
      vw_dose_thin: "Sample is thin enough to be comparable to the photoelectron range — some energy escapes, so the real dose is below this figure:",
      vm_abs_beer: "Beer-Lambert attenuation, foils multiplied in series",
      vm_abs_noharm: "Higher harmonics and small-angle scatter ignored — absorbers harden the beam and raise the harmonic fraction",
      vw_abs_hard: "Very heavy attenuation — harmonics and scatter can dominate the transmitted beam in this regime:",
      beam_t2_title: "Beamline Photon Flux",
      beam_t2_tag: "Delivered Flux",
      lbl_ring_current: "Storage Ring Current",
      lbl_source_flux: "Source Base Flux",
      lbl_mono_eff: "Monochromator Efficiency",
      lbl_mirror_eff: "Mirror Reflectivity",
      lbl_win_trans: "Window Transmittance",
      res_deliv_flux: "Delivered Photon Flux",
      res_tot_eff: "Total Optical Efficiency",
      beam_t3_title: "Energy Resolution (ΔE/E)",
      beam_t3_tag: "Monochromator Intrinsic",
      lbl_mono_cryst: "Monochromator Crystal",
      lbl_beam_div: "Vertical Beam Divergence",
      res_delta_e: "Total Bandwidth (<i class=\"formula\">ΔE</i>)",
      res_de_over_e: "Energy Resolution (<i class=\"formula\">ΔE/E</i>)",
      res_mono_th: "Bragg Angle",
      beam_t4_title: "Detector Angular Resolution",
      lbl_pixel_size: "Pixel Size",
      lbl_sample_det_dist: "Sample-Detector Distance",
      res_ang_res_mrad: "Angular Resolution (mrad)",
      res_ang_res_deg: "Angular Resolution (°)",
      coh_len_title: "Coherence Lengths at the Sample",
      lbl_coh_bandwidth: "Bandwidth ΔE/E",
      lbl_coh_src_h: "Source size H (FWHM)",
      lbl_coh_src_v: "Source size V (FWHM)",
      lbl_coh_dist: "Source to sample",
      res_coh_xt_h: "Transverse ξ<sub>t</sub>, horizontal",
      res_coh_xt_v: "Transverse ξ<sub>t</sub>, vertical",
      res_coh_xl: "Longitudinal ξ<sub>l</sub>",
      res_coh_maxpath: "Max path difference",
      res_coh_verdict_lbl: "Sample against the transverse coherence:",
      res_coh_ok: "Coherently illuminated",
      res_coh_marginal: "Marginal",
      res_coh_fail: "Partially coherent — will not invert",
      coh_res_title: "Reachable Real-Space Resolution",
      lbl_cres_npix: "Pixels used (across)",
      res_cres_dr: "Real-space resolution Δr",
      res_cres_qmax: "Half-width Q at the edge",
      res_cres_span: "Angular half-span",
      res_cres_extent: "Detector extent used",
      vm_coh_vcz: "van Cittert-Zernike, Gaussian source, ξt = λR / 2S with S the FWHM",
      vm_coh_long: "ξl = λ² / 2Δλ; path difference taken at the back-scattering worst case",
      vw_coh_undersized: "Transverse coherence length is shorter than the sample — the illumination is only partially coherent, so the geometry will not invert however well the oversampling ratio scores:",
      vw_coh_pathlong: "Path difference exceeds the longitudinal coherence length — the outer fringes wash out:",
      vm_cres_farfield: "Far field (Fraunhofer), detector flat and normal to the beam",
      vm_cres_extent: "Resolution set by the detector extent alone — no signal-to-noise or partial-coherence loss",
      vw_cres_optimistic: "This Δr is the geometric ceiling — once the outer fringes fall into the noise the achieved resolution is worse.",
      beam_t5_title: "CDI / BCDI Coherent Oversampling",
      lbl_det_dist: "Detector Distance",
      lbl_det_pixel: "Detector Pixel Size",
      lbl_sample_size: "Sample / Crystal Size",
      res_sigma: "Oversampling Ratio (<i class=\"formula\">σ</i>)",
      res_speckle: "Detector Speckle Size",
      res_verdict_lbl: "Criterion Verdict:",
      beam_t6_title: "Slit Opening & Beam Acceptance",
      beam_t6_tag: "Beam Acceptance",
      lbl_source_size: "Source Size (FWHM)",
      lbl_source_slit_dist: "Source-Slit Distance",
      lbl_slit_div: "Beam Divergence",
      lbl_gauss_mult: "Gaussian Envelope Multiplier",
      res_slit_fwhm: "Beam Size at Slit (FWHM)",
      res_slit_open: "Recommended Slit Opening",
      beam_t7_title: "Crystal Thermal Drift (Angle & Energy Shift)",
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

    // The URL decides the language, not storage and not the browser.
    //
    // There are two pages: / is Korean and /en/ is English, each declaring its
    // language on <html lang>. That is what makes hreflang true — a crawler
    // asking for either one gets that language every time — and it is why both
    // languages can be indexed instead of whichever the default happened to be.
    //
    // Switching language navigates between them rather than swapping text in
    // place, so the address always matches what is on screen.
    init: function () {
      var declared = String(document.documentElement.getAttribute("lang") || "").toLowerCase();
      this.setLang(declared.indexOf("en") === 0 ? "en" : "ko");
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
      if (window.initDataView) window.initDataView();
      // History rows name their calculator through the card's title key, so
      // they follow the language like everything else on the page.
      if (window.renderCalcHistory) window.renderCalcHistory();
      // The dashboard's action labels are built in JS from the same table.
      if (window.renderDashboard) window.renderDashboard();
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
      if (langCur) langCur.textContent = t.lang_current;

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

  // Relative hops, not absolute paths: "/en/" would resolve to the filesystem
  // root when the page is opened straight off disk, which is how this site is
  // developed and how it is used on a control-room machine with no server.
  // The section being read is carried across.
  // English is the site root and Korean lives at /ko/, so the hop is "ko/" one
  // way and "../" the other. Relative, because absolute paths resolve to the
  // filesystem root when the page is opened straight off disk — which is how
  // this site is developed and how it runs on a control-room machine with no
  // server. The section being read is carried across.
  window.setLanguage = function (lang) {
    var here = String(document.documentElement.getAttribute("lang") || "en").toLowerCase();
    var onKoreanPage = here.indexOf("ko") === 0;
    var wantKorean = lang === "ko";

    if (wantKorean === onKoreanPage) return;

    // Nothing is stored: the URL is what decides the language, so a remembered
    // preference could only ever contradict the page it is read on. It used to
    // be written here and in setLang, where the unguarded write threw with
    // storage blocked and took applyTranslations down with it.
    window.location.href = (wantKorean ? "ko/" : "../") + (window.location.hash || "");
  };

  // The header control is a plain link, so it still works with no JavaScript.
  // Taking over the click only adds carrying the open section across.
  window.switchLanguage = function (e) {
    if (e && e.preventDefault) e.preventDefault();
    var here = String(document.documentElement.getAttribute("lang") || "en").toLowerCase();
    window.setLanguage(here.indexOf("ko") === 0 ? "en" : "ko");
    return false;
  };
})(window);
