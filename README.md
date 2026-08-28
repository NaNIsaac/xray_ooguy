# xray.ooguy

> 방사광 빔라인 실험자를 위한 오프라인 X선 계산기 및 빔타임 기록 도구

- **사이트:** [https://xray.ooguy.com](https://xray.ooguy.com)
- **제작:** Isaac Yong (용이삭) — 서강대학교 물리학과 (CUPT 연구실)
- **연락:** [isaacyong@naver.com](mailto:isaacyong@naver.com) · [@SJB7777](https://github.com/SJB7777) · [GitHub Sponsors](https://github.com/sponsors/SJB7777)

---

## 무엇인가

빔라인 제어실에서 바로 쓰는 단일 페이지 계산기 모음이다. 빌드 도구도, 서버도, 외부 라이브러리도 없다.
`index.html`을 브라우저로 열면 그대로 동작한다.

- **오프라인 전용** — 런타임 `fetch` 0건. 물리 상수와 결정 데이터는 `js/data.js`에 내장.
- **구형 브라우저 대응** — CentOS 7 기본 브라우저(Firefox 60 ESR, Chrome 60~70)에서 동작. ES5 문법만 사용.
- **로컬 저장** — 계정도 서버도 없음. 언어·테마·계산 기록은 `localStorage`(`bl_toolkit_` 접두어)에만 남는다.
- **English / 한국어** — 언어당 주소가 하나다. `/`가 영어, `/ko/`가 한국어이고,
  상단 헤더의 지구본으로 오간다. 한국어판은 `tools/build-i18n.js`가 생성한다.
- **인쇄 대응** — Ctrl+P 시 내비게이션이 숨겨지고 A4 데이터시트로 출력된다.

---

## 구성

내비게이션은 5개 뷰 + 색인으로 이루어진다. `Alt` + 숫자키로 이동한다.

| 뷰 | 단축키 | 내용 |
|:---|:---:|:---|
| **I. SPECTROSCOPY** | `Alt+1` | 에너지·파장·물질 상호작용 (8개) |
| **II. GONIOMETRY** | `Alt+2` | 각도 및 기하 배치 (8개) |
| **III. RECORD** | `Alt+3` | 빔타임 로그북 서식 및 이벤트 스니펫 |
| **IV. DATA** | `Alt+4` | 스캔 파일 판독, XY 플롯, XRR 이어붙이기 |
| **V. SETTINGS** | `Alt+5` | 언어, 테마, 계산 기록, 백업/복원 |
| **VI. ABOUT** | `Alt+6` | 제작자 및 계산 근거 |
| **INDEX** | `Alt+7` | 전체 항목 목차 |

### I. SPECTROSCOPY

1. 에너지 – 파장 – 주파수 변환 (*E* = *hc*/λ, *hc* = 12398.41984 eV·Å)
2. 격자 상수 & 밀러 지수 → 격자면 간격 (7개 결정계 전부, 계량 텐서 기반)
3. 굴절률 및 X선 투과율 (*n* = 1 − δ + i β, Beer–Lambert)
4. 전반사 임계각 (θ<sub>c</sub> = √2δ)
5. 회절격자 분산 (*m*λ = *d*(sin α + sin β))
6. 에너지 분해능 (Δ*E*/*E*)
7. 빔라인 광자 플럭스
8. 결정 열팽창 각도·에너지 시프트

### II. GONIOMETRY

1. 브래그 법칙 3-way 스위트 (*n*λ = 2*d* sin θ) — 반사면 목록 포함
2. 상호공간 Q-Space 변환 (*Q* = (4π/λ) sin θ)
3. 에너지 스케일링 & 각도 계산기
4. 시료 상 빔 풋프린트 및 스필오버 판정
5. 디텍터 각도 분해능
6. 슬릿 간격 및 수용각
7. Chi-Phi 오일러 크래들 보정
8. CDI / BCDI 결맞음 오버샘플링 (σ ≥ 2 판정)

### III. RECORD

빔타임 로그북 헤더 프리셋과, 실시간 타임스탬프가 붙는 1클릭 이벤트 스니펫.
외부 노트(ELN / Google Docs / 종이 노트)에 붙여넣는 용도이며, 이 사이트가 노트를 대체하지 않는다.

### IV. DATA

측정이 끝난 스캔 파일을 그 자리에서 열어 본다. 파일은 브라우저 밖으로 나가지 않는다 (`FileReader`만 사용, 업로드 없음).

1. **파일 불러오기** — 끌어다 놓거나 선택. 구분자(탭/쉼표/세미콜론/공백)와 헤더를 자동 감지하고,
   `#` `%` `!` `;` 주석을 건너뛴다. 열이 셋 이상이면 X/Y 열을 골라 쓴다.
2. **XY 플롯** — linear / log₁₀ Y축, 정규화(최대값 = 1 또는 XRR 플래토 = 1), X 구간 자르기.
   보이는 곡선을 TSV로 복사하거나 `.txt`로 저장.
3. **XRR 이어붙이기** — 감쇠체를 바꿔가며 나눠 측정한 세그먼트를 한 곡선으로 합친다.
   겹치는 구간에서 점마다 구한 비의 **중앙값**을 배율로 쓰고, 이미 이어붙인 곡선 전체를 기준으로
   누적 계산한다. 표에 값을 직접 입력하면 자동 계산을 덮어쓰고, 비우면 자동으로 돌아간다.

---

## 파일 구조

```text
xray/
├── index.html      단일 진입점 SPA — 모든 뷰의 마크업 (영어, /)
├── ko/index.html   한국어판 — tools/build-i18n.js가 생성. 직접 고치지 말 것 (/ko/)
├── style.css       Academic print 디자인 시스템
├── CNAME           커스텀 도메인 (xray.ooguy.com)
├── CLAUDE.md       코드 수정 시 지켜야 하는 제약 (사람·AI 공통)
├── docs/PLAN.md    제품 방향 및 백로그
├── tools/
│   └── build-i18n.js ko/index.html 생성기 (node, 의존성 0)
└── js/
    ├── app.js      해시 라우터, 탭·사이드바 동기화, 단축키, 계산 기록
    ├── nav.js      본문 목차를 읽어 사이드바 트리·검색 생성
    ├── i18n.js     한/영 번역 테이블 및 적용 로직
    ├── data.js     CODATA 상수, d-spacing DB, 재료 감쇠 DB
    ├── optics.js   광학 계산 엔진
    ├── beamline.js 빔라인 물리량·기하 엔진
    ├── lattice.js  계량 텐서 기반 격자면 간격 (7개 결정계)
    ├── record.js   로그북 헤더 및 이벤트 스니펫
    ├── dataview.js 스캔 파일 파서, XY 플롯, XRR 이어붙이기
    ├── validity.js 각 계산기의 모델 가정·유효 범위 표시
    └── miniplot.js 계산식을 그대로 그리는 인라인 SVG 미니 플롯
```

---

## 개발

빌드 단계가 없다. 파일을 고치고 브라우저를 새로고침하면 끝이다.

```powershell
# 그냥 열기
start index.html

# 또는 로컬 서버 (해시 라우팅 확인용)
python -m http.server 8000
```

검사는 하나로 통일돼 있다. 커밋 전에:

```powershell
node .\tools\check.js
```

세 가지를 본다 — 모든 스크립트가 파싱되는가, 구형 브라우저에서 파스 에러를 내는 최신 문법이
섞이지 않았는가(`let`/`const`, 화살표 함수, 템플릿 리터럴, `?.`, `.includes()` 등),
그리고 `ko/index.html`이 최신인가.

`index.html`이나 `js/i18n.js`의 한국어 항목을 고쳤으면 한국어판을 다시 생성해서 함께 커밋한다:

```powershell
node .\tools\build-i18n.js
```

**자동으로 걸리게 하려면** 클론당 한 번:

```powershell
git config core.hooksPath .githooks
```

이러면 커밋할 때마다 `tools/check.js`가 돌고, 실패하면 커밋이 막힌다.
급할 때는 `git commit --no-verify`로 건너뛸 수 있고, 그래도 CI가 같은 검사를 한다.

`ko/index.html`은 생성물이므로 직접 편집하면 다음 생성 때 사라진다.

**코드를 고치기 전에 [`CLAUDE.md`](CLAUDE.md)를 읽을 것.** 구형 브라우저 호환성과 디자인 시스템 제약이
문서화되어 있고, 이 제약들은 무심코 어기기 쉽다.

배포는 `main` 브랜치 push → GitHub Pages 자동 서빙이다.
