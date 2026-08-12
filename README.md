# X-Ray Beamline Toolkit

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
- **한국어 / English** — 전체 UI 이중 언어 (`js/i18n.js`).
- **인쇄 대응** — Ctrl+P 시 내비게이션이 숨겨지고 A4 데이터시트로 출력된다.

---

## 구성

내비게이션은 5개 뷰 + 색인으로 이루어진다. `Alt` + 숫자키로 이동한다.

| 뷰 | 단축키 | 내용 |
|:---|:---:|:---|
| **I. SPECTROSCOPY** | `Alt+1` | 에너지·파장·물질 상호작용 (8개) |
| **II. GONIOMETRY** | `Alt+2` | 각도 및 기하 배치 (8개) |
| **III. RECORD** | `Alt+3` | 빔타임 로그북 서식 및 이벤트 스니펫 |
| **IV. SETTINGS** | `Alt+4` | 언어, 테마, 계산 기록, 백업/복원 |
| **V. ABOUT** | `Alt+5` | 제작자 및 계산 근거 |
| **INDEX** | `Alt+6` | 전체 항목 목차 |

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

---

## 파일 구조

```text
xray/
├── index.html      단일 진입점 SPA — 모든 뷰의 마크업
├── style.css       Academic print 디자인 시스템
├── CNAME           커스텀 도메인 (xray.ooguy.com)
├── CLAUDE.md       코드 수정 시 지켜야 하는 제약 (사람·AI 공통)
├── docs/PLAN.md    제품 방향 및 백로그
└── js/
    ├── app.js      해시 라우터, 탭·사이드바 동기화, 단축키, 계산 기록
    ├── nav.js      본문 목차를 읽어 사이드바 트리·검색 생성
    ├── i18n.js     한/영 번역 테이블 및 적용 로직
    ├── data.js     CODATA 상수, d-spacing DB, 재료 감쇠 DB
    ├── optics.js   광학 계산 엔진
    ├── beamline.js 빔라인 물리량·기하 엔진
    ├── lattice.js  계량 텐서 기반 격자면 간격 (7개 결정계)
    ├── record.js   로그북 헤더 및 이벤트 스니펫
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

문법 검사:

```powershell
Get-ChildItem .\js\*.js | ForEach-Object { node --check $_.FullName }
```

**코드를 고치기 전에 [`CLAUDE.md`](CLAUDE.md)를 읽을 것.** 구형 브라우저 호환성과 디자인 시스템 제약이
문서화되어 있고, 이 제약들은 무심코 어기기 쉽다.

배포는 `main` 브랜치 push → GitHub Pages 자동 서빙이다.
