# 📋 BEAMLINE TOOLKIT — 사이트 개발 계획서 및 아키텍처 명세서

> **작성일:** 2026-08-08 (최종 개정)  
> **디자인 규격:** Academic Paper & Monograph Print Design System  
> **호스팅:** GitHub Pages (정적 사이트) + Dynu 커스텀 도메인 ([https://xray.ooguy.com](https://xray.ooguy.com))  
> **호환성:** CentOS 7 기본 브라우저 (Firefox 60 ESR, Chrome 60~70) 완전 대응

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|:---|:---|
| **사이트 정의** | 방사광 및 X선 빔라인 연구원을 위한 올인원 계산기, 광학 시뮬레이션, 전자 로그북 및 실험 관리 시스템 |
| **핵심 가치** | "실험 중 즉각 계산하고, 기록하고, 단일 A4 데이터시트 인쇄물로 출력하는" 100% 무의존성 단일 사이트 |
| **디자인 철학** | 종이색(`#fdfcf8`), 잉크색(`#1a1a1a`), 세리프 본문, 모노스페이스 수치, 0개 이모지·그림자·둥근모서리·그라데이션 |
| **내비게이션** | 좌측 사이드바 + 상단 독립 가로 스크롤 탭 스트립 (`#top-tab-strip`) 듀얼 동기화 |
| **데이터 저장** | 브라우저 `localStorage` (접두어: `bl_toolkit_`), 100% 클라이언트 오프라인 네이티브 |

---

## 2. 범위 정의

### ✅ 포함 기능 (사이트 자체 핵심 스위트)
- **1. OPTICS:** 에너지-파장 변환, 브래그 법칙, 회절격자, 굴절률·투과율, 에너지-각도, Chi-Phi 틸트, 전반사 임계각, Q-space
- **2. BEAMLINE:** 빔 풋프린트, 광자 플럭스, 에너지 분해능, 각도 분해능, CDI/BCDI 결맞음 오버샘플링, 슬릿 개구폭, 열팽창 보정
- **3. LOGBOOK:** 실험 전자 로그북, 태그 검색, 마크다운/CSV/JSON 내보내기, 히스토리 관리
- **4. EXPERIMENT:** 실시간 자동저장 메모장, 빔라인 체크리스트, 시료 관리 테이블, DAQ 수집 용량 산출, 칸반 보드
- **5. REFERENCE:** 다차원 단위 변환기, 결정 격자면 d-spacing DB, 공인 방사광 시설 링크
- **6. SETTINGS:** 흑백 반전 모드(다크), 전체 계산 히스토리 아카이브, 전체 데이터 백업 및 복원, 키보드 단축키
- **7. ABOUT (제작자 포트폴리오 & 후원):** Isaac Yong (용이삭) 프로필 (서강대 물리학과 학사 졸 / 석사 재학, CUPT 연구실), 연구 도메인(X선 광학, BCDI, DAQ, 실험자동화), GitHub 링크([SJB7777](https://github.com/SJB7777)), 이메일([isaacyong@naver.com](mailto:isaacyong@naver.com)), [GitHub Sponsors 후원](https://github.com/sponsors/SJB7777) 연동
- **부록 A (Footer):** CODATA 기본 물리 상수 및 주요 결정 격자면 정밀 수치 테이블

### ❌ 제외 대상 (외부/서버 종속 기능)
- 외부 서버 DB 통신 (GitHub Pages 정적 호스팅 제약)
- 런타임 `fetch` 외부 네트워크 호출 (순수 JS 인라인 상수로 대체)

---

## 3. 기술 환경 및 브라우저 호환성

### 3.1 구형 OS / 브라우저 대응 (CentOS 7 표준)

| 항목 | 채택 여부 | 근거 및 구현 규칙 |
|:---|:---:|:---|
| **CSS Flexbox** | ✅ 사용 | 기본 레이아웃 및 탭 스크롤 구현 (Firefox 28+, Chrome 29+) |
| **CSS Flex `gap`** | ❌ 전면 금지 | 구형 브라우저 미지원. 음수 마진(`margin-left: -6px`)과 패딩 거터로 대체 |
| **CSS Grid** | ❌ 전면 금지 | 구형 브라우저 불안정. Flexbox 백분율 너비(`.col-12`, `.col-8`, `.col-6`, `.col-4`)로 구현 |
| **외부 웹폰트** | ❌ 0개 사용 | 네트워크 지연 0, OS 내장 시스템 세리프/모노 폰트 체인 사용 |
| **옵셔널 체이닝 `?.`** | ❌ 전면 금지 | 구형 JS 엔진 파싱 에러 유발. 안전한 `if (obj && obj.prop)` 조건식 사용 |
| **`fetch` API** | ❌ 금지 | 모든 물리 상수와 결정 DB는 `js/data.js`에 상수로 내장하여 오프라인 즉각 로딩 |
| **`localStorage`** | ✅ 사용 | `bl_toolkit_` 접두어로 데이터 영구 보존 및 JSON 백업/복원 지원 |

---

## 4. 디자인 시스템: Academic Paper & Monograph Print

| 요소 | 학술 인쇄물 디자인 규격 |
|:---|:---|
| **배경색 (Paper)** | `#fdfcf8` (서적용 미색 캔버스) |
| **본문색 (Ink)** | `#1a1a1a` (농밀한 활판 인쇄 잉크 톤) |
| **단일 강조색 (Accent)** | `#003366` (Deep Oxford Navy Ink) — 링크, 활성 탭, 결과 수치 전용 |
| **흑백 반전 모드** | `[data-theme="dark"]` 토글 시 반전 인쇄 잉크 톤(`--bg-paper: #121417`, `--ink-primary: #fdfcf8`) 지원 |
| **본문 타이포그래피** | `Georgia, "Liberation Serif", "DejaVu Serif", "Times New Roman", "Nanum Myeongjo", serif` |
| **수치·입력·결과** | `Consolas, "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace` |
| **장식 배제 4원칙** | **이모지 0개, 박스 그림자 0개, 둥근 모서리 0개(`border-radius: 0 !important`), 그라데이션 0개** |
| **테두리 & 분할** | 카드가 아닌 **가는 가로선(0.75px ~ 1.5px solid #1a1a1a / #d5d3cc)** 및 LaTeX Booktabs 구분선 |
| **수식 및 위첨자** | 이탤릭 세리프 변수(*n*λ = 2*d* sin θ, *E* = *hc* / λ), 위첨자는 `<sup>` 태그만 허용 (유니코드 지수 금지) |
| **버튼 미학** | 완전 직각 테두리, hover 시 흑백 반전 (`background: #1a1a1a; color: #fdfcf8;`) |
| **인쇄 최적화** | `@media print` 규칙으로 Ctrl + P 시 내비게이션 자동 숨김 및 A4 데이터시트 인쇄 |

---

## 5. 내비게이션 아키텍처 (Dual Navigation & Independent Tab Scroll)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  [TOP HEADER] BEAMLINE TOOLKIT / DASHBOARD               [Time]  [흑백 반전 모드]       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│  [TOP TAB STRIP] (독립 가로 스크롤: overflow-x: auto; white-space: nowrap)             │
│  [0. DASHBOARD]  [1. OPTICS (8)]  [2. BEAMLINE (7)]  [3. LOGBOOK]  [4. EXPERIMENT] ... │
├────────────┬───────────────────────────────────────────────────────────────────────────┤
│ [SIDEBAR]  │ [CONTENT AREA] (가로 스크롤 완전 방지: overflow-x: hidden)                │
│ DASHBOARD  │                                                                           │
│ OPTICS     │   1.1 에너지-파장 변환 수트        1.2 브래그 법칙 계산기                 │
│ BEAMLINE   │   ┌───────────────────────────┐   ┌───────────────────────────┐           │
│ LOGBOOK    │   │ E = hc/λ                  │   │ λ = 2d sin θ              │           │
│ EXPERIMENT │   └───────────────────────────┘   └───────────────────────────┘           │
│ REFERENCE  │                                                                           │
│ SETTINGS   │   APPENDIX A — CODATA FUNDAMENTAL PHYSICAL CONSTANTS                      │
└────────────┴───────────────────────────────────────────────────────────────────────────┘
```

### 탭 소실 방지 및 독립 스크롤 핵심 메커니즘
1. **상단 탭 전용 컨테이너 분리 (`#top-tab-strip`):**
   * 상단 헤더 내부(48px)에 탭을 억지로 우겨넣지 않고, 헤더 바로 아래에 전용 탭 스트립(`#top-tab-strip`)을 배치하여 높이 및 너비 충돌로 인한 탭 잘림(Clipping)을 원천 방지.
2. **독립 가로 스크롤 보장 (`.tab-strip-scroll`):**
   * `display: flex; overflow-x: auto; overflow-y: hidden; white-space: nowrap; -webkit-overflow-scrolling: touch;`
   * 각 탭 버튼(`.tab-pill`)에 `flex-shrink: 0;`을 적용하여 좁은 화면에서도 탭이 찌그러지거나 숨겨지지 않고 부드럽게 좌우 스크롤.
3. **하단 컨텐츠 가로 스크롤 완전 차단 (`#content-area`):**
   * `#content-area`와 `html, body`에 `overflow-x: hidden;`을 적용하여 본문이 좌우로 밀리거나 흔들리는 현상을 100% 방지.

---

## 6. 기능 상세 명세

### 6.1 OPTICS (광학 계산 스위트)
1. **에너지-파장-주파수 변환:** $E = hc/\lambda = h\nu$, $hc = 12398.41984\text{ eV}\cdot\text{\AA}$
2. **브래그 법칙:** $n\lambda = 2d\sin\theta$, Si/Ge/Al₂O₃/GaAs 프리셋 및 듀얼 모드($E \leftrightarrow \theta$)
3. **회절격자 분산:** $m\lambda = d(\sin\alpha + \sin\beta)$, 각분산력 $d\beta/d\lambda$
4. **복소 굴절률 및 투과율:** $n = 1 - \delta + i\beta$, Beer-Lambert 감쇠 길이 $1/e$ 및 투과율
5. **에너지-각도 보정:** $E_1\sin\theta_1 = E_2\sin\theta_2$, 모터 회전 변위 $\Delta\theta$
6. **Chi-Phi 틸트 보정:** $\Delta\phi = \arctan(\tan\theta \cdot (1 - \cos\Delta\chi))$
7. **전반사 임계각:** $\theta_c = \sqrt{2\delta} = (hc/E)\sqrt{r_e\rho_e/\pi}$
8. **Q-Space 상호공간 변환:** $Q = (4\pi/\lambda)\sin\theta = 2\pi/d$

### 6.2 BEAMLINE (빔라인 물리량)
1. **빔 풋프린트:** $L = V / \sin\theta$, 시료 스필오버(Spillover) 한계 검증
2. **광자 플럭스:** 저장링 전류 및 모노크로메이터/미러/윈도우 종합 투과 효율
3. **에너지 분해능:** Si(111), Si(311), Ge(111) 고유 $\Delta E/E$ 및 발산각 결합 분해능
4. **디텍터 각도 분해능:** $\Delta\theta = \text{Pixel} / \text{Distance}$ (mrad, deg, arcsec)
5. **CDI / BCDI 결맞음 오버샘플링:** 나이퀴스트-섀넌 기준 $\sigma = (\lambda D)/(pS) \ge 2$ 판정
6. **슬릿 개구폭:** 가우시안 빔 발산각 및 $3\sigma$ / $4\sigma$ 수용폭
7. **결정 열팽창 시프트:** $\Delta\theta = -\alpha \Delta T \tan\theta$, 유효 에너지 오차 $\Delta E$

### 6.3 LOGBOOK & EXPERIMENT (실험 및 워크플로우)
1. **전자 로그북:** 시료명, 에너지, 거리, 노출, 태그, 메모 기록, 마크다운/CSV/JSON 내보내기
2. **실시간 실험 노트:** 500ms 디바운스 자동 저장 메모장
3. **체크리스트:** 진행률 바 표시 및 사용자 정의 점검 항목 추가
4. **시료 관리 테이블:** 재료, 두께, 4축 모터 좌표(X, Y, Z, Th) 관리
5. **DAQ 데이터 수집 계산기:** Eiger2 4M/9M/16M, Pilatus 2M/6M 초당 전송률(MB/s) 및 총 저장용량(GB/TB)
6. **칸반 보드:** 대기(To Do) $\to$ 진행 중(In Progress) $\to$ 완료(Done) 단계별 관리

### 6.4 REFERENCE & SETTINGS
1. **다차원 단위 변환기:** 길이($\text{\AA}$, nm, $\mu$m, mm), 압력(mbar, Torr, Pa), 각도(deg, rad, mrad, arcsec)
2. **결정 격자면 d-spacing DB:** Si, Ge, Diamond, Al₂O₃, GaAs 실시간 검색 및 브래그 계산기 원클릭 연동
3. **데이터 아카이브:** 전체 계산 히스토리, `localStorage` 원클릭 JSON 다운로드 및 복원
4. **단축키 시스템:** `Alt + 1` ~ `Alt + 7` 탭 전환

---

## 7. 파일 구조

```text
/root/xray/
├── CNAME                  ← Dynu 도메인 (xray.ooguy.com)
├── index.html             ← SPA 진입점 (Academic markup, CODATA footer)
├── style.css              ← Academic Paper Print 디자인 시스템 (0 emojis, Booktabs)
├── PLAN.md                ← 사이트 개발 계획서 및 아키텍처 명세서
├── GUIDELINES.md          ← 트러블슈팅 및 탭 스크롤·디자인 수칙 가이드
├── README.md              ← 프로젝트 소개 및 빠른 시작
└── js/
    ├── app.js             ← 해시 라우터, 상단 탭·사이드바 동기화, 단축키
    ├── data.js            ← CODATA 물리 상수, d-spacing DB, 재료 감쇠 DB
    ├── optics.js          ← 광학 계산기 로직 (sup 태그 공식 포맷)
    ├── beamline.js        ← 빔라인 물리량 계산 로직
    ├── logbook.js         ← 전자 로그북 (태그 검색, 데이터 내보내기)
    ├── experiment.js      ← 실험 노트, 체크리스트, 시료 관리, DAQ, 칸반
    ├── reference.js       ← 단위 변환기, 결정 DB 검색, 시설 링크
    └── settings.js        ← 계산 히스토리 아카이브, 전체 데이터 백업/복원
```

---

## 8. 최종 품질 검증 체크리스트

- [x] 종이색(`#fdfcf8`) 및 잉크색(`#1a1a1a`), 옥스포드 잉크 네이비(`#003366`) 단일 강조색 적용
- [x] 이모지 0개, 그림자 0개, 둥근 모서리 0개(`border-radius: 0 !important`), 그라데이션 0개 검증
- [x] 수식 이탤릭 세리프 및 `<sup>` 태그 표준화 (유니코드 지수 전면 금지)
- [x] 상단 탭 전용 스트립(`#top-tab-strip`) 독립 가로 스크롤 및 활성 탭 자동 시야 이동
- [x] 하단 컨텐츠 영역(`#content-area`) 가로 스크롤 완전 차단
- [x] 최하단 CODATA 기본 물리상수 및 결정 격자 레퍼런스 부록 테이블 수록
- [x] 각진 흑백 반전 버튼 (`.btn:hover { background: #1a1a1a; color: #fdfcf8; }`)
- [x] CentOS 7 (Firefox 60 ESR / Chrome 60~70) CSS 2.1 + Flexbox(무 gap) 호환성
- [x] `@media print` A4 데이터시트 인쇄 최적화
- [x] GitHub Pages 배포 및 `https://xray.ooguy.com` 도메인 실시간 연결
