# 📖 BEAMLINE TOOLKIT — 개발 주의사항 및 아키텍처 가이드라인 (GUIDELINES)

> **문서 목적:** 상단 탭 소실 버그의 근본 원인 및 재발 방지책, 학술 인쇄물 디자인 시스템 수칙, 구형 브라우저(CentOS 7) 호환성 기준 및 개발 시 반드시 준수해야 할 기술적 제약 사항을 명시한다.

---

## 1. ⚠️ 상단 탭 소실 오류 원인 분석 및 영구 해결책

### 1.1 상단 탭이 화면에서 사라졌던 근본 원인 (Root Causes)

| 구분 | 발생 원인 | 증상 및 부작용 |
|:---|:---|:---|
| **원인 1: 높이 제한 헤더 내 강제 배치** | 상단 헤더(`#top-header`)가 `height: 48px; overflow: hidden;`으로 고정된 상태에서 브레드크럼, 시계, 탭 버튼을 한 줄에 모두 우겨넣음 | 뷰포트 너비가 좁아지거나 브레드크럼이 길어질 때 탭 바가 아래로 밀려나 `overflow: hidden`에 의해 100% 잘려나가 화면에서 완전히 사라짐. |
| **원인 2: Flex 자식 요소의 `min-width` 미설정** | Flexbox 자식 컨테이너에 `min-width: 0;`이 누락됨 | Flexbox 기본 속성(`min-width: auto`)으로 인해 자식 요소가 부모 너비를 강제로 늘리거나 반대로 0으로 축소되어 탭이 찌그러짐. |
| **원인 3: 미디어 쿼리의 무차별 숨김** | `@media (max-width: 900px)`에서 사이드바를 `display: none` 처리하면서 대체 상단 탭을 별도 층위로 독립시키지 않음 | 화면이 좁아지거나 분할 창 모드에서 사이드바와 상단 탭이 동시에 사라져 내비게이션 자체가 불가능해짐. |

---

### 1.2 영구 해결 아키텍처: 독립된 전용 수평 탭 스트립 (`#top-tab-strip`)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ [TOP MASTHEAD HEADER]  BEAMLINE TOOLKIT / DASHBOARD     [Time]  [흑백 반전]   │  ← 48px 상단 헤더
├──────────────────────────────────────────────────────────────────────────────┤
│ [TOP TAB STRIP]  (독립 가로 스크롤: overflow-x: auto; white-space: nowrap)   │  ← 38px 독립 탭 바
│ [0. DASHBOARD]  [1. OPTICS (8 Tools)]  [2. BEAMLINE (7 Tools)]  [3. LOGBOOK] │
├──────────────────────────────────────────────────────────────────────────────┤
│ [MAIN CONTENT AREA]  (가로 스크롤 완전 차단: overflow-x: hidden)             │  ← 본문 컨텐츠
│  1.1 에너지-파장 변환                   1.2 브래그 법칙 계산기                 │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### ✅ 핵심 CSS 규칙 (절대 수정 금지)
```css
/* 1. 상단 탭 전용 스트립: 헤더 아래 독립 층위 배치 */
#top-tab-strip {
  width: 100%;
  max-width: 100%;
  background-color: var(--bg-paper-subtle);
  border-bottom: var(--rule-heavy);
  position: sticky;
  top: var(--header-height);
  z-index: 90;
  box-sizing: border-box;
  overflow: hidden;
}

/* 2. 탭 영역만 부드럽게 가로 스크롤 */
.tab-strip-scroll {
  display: flex;
  align-items: center;
  padding: 6px 14px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  width: 100%;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--ink-muted) var(--bg-paper-subtle);
}

/* 3. 탭 버튼은 절대 찌그러지거나 줄어들지 않음 */
.tab-pill {
  flex-shrink: 0;
  white-space: nowrap;
  font-family: var(--font-serif);
  font-size: 12px;
  padding: 5px 14px;
  margin-right: 6px;
  border: var(--rule-main);
  background-color: var(--bg-paper);
  color: var(--ink-primary);
  cursor: pointer;
}

/* 4. 활성 탭: 흑백 잉크 반전으로 최상위 시인성 보장 */
.tab-pill.active {
  background-color: var(--ink-primary);
  color: var(--bg-paper);
  font-weight: 700;
  border: 1.5px solid var(--ink-primary);
}

/* 5. 하단 본문 컨텐츠: 가로 스크롤 완전 차단 */
#content-area, .view-section, html, body {
  overflow-x: hidden !important;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
```

#### ✅ 라우터 동기화 규칙 (`js/app.js`)
* `navigateTo(route)` 실행 시 사이드바(`.nav-item`)와 상단 탭(`.tab-pill`)을 동시에 동기화한다.
* 활성화된 탭은 `tBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })`를 통해 가로 스크롤 영역 안에서 자동으로 중앙 시야로 이동해야 한다.

---

## 2. 🏛️ 학술 인쇄물 디자인 시스템 12대 원칙 (Academic Print System)

| 번호 | 원칙명 | 세부 규격 및 작성 규칙 |
|:---:|:---|:---|
| **1** | **종이와 잉크 색채** | 배경은 서적용 종이색(`--bg-paper: #fdfcf8`), 글씨는 활판 인쇄 잉크색(`--ink-primary: #1a1a1a`). |
| **2** | **단일 강조색 (1 Accent)** | 옥스포드 잉크 네이비(`--accent-ink: #003366`) 1개만 허용. 링크, 활성 탭 인디케이터, 주요 산출 결과값에만 절제하여 사용. |
| **3** | **흑백 반전 모드** | `[data-theme="dark"]` 적용 시 배경(`#121417`)과 잉크(`#fdfcf8`)를 단순 반전하여 인쇄물 음화 톤 유지. |
| **4** | **세리프 본문 폰트** | 본문 및 제목은 `Georgia, "Liberation Serif", "DejaVu Serif", "Times New Roman", "Nanum Myeongjo", serif` 체인만 사용. |
| **5** | **모노스페이스 수치 폰트** | 모든 숫자, 공식 입력창, 계산 결과값, 타임스탬프는 `Consolas, "Liberation Mono", "DejaVu Sans Mono", monospace` 적용. |
| **6** | **이모지 0개 (Zero Emoji)** | UI 전체에서 모든 이모지를 금지한다. 로마자 섹션 표기(`§ 1.1`), 공식 기호(`hc`, `λ`), 텍스트 라벨(`[1]`, `[Ref]`)로 대체. |
| **7** | **그림자·모서리 0개** | `box-shadow: none !important; text-shadow: none !important; border-radius: 0 !important;` (완전 직각형 구조). |
| **8** | **그라데이션 0개** | `background-image: none !important;` 순수 플랫 인쇄 색상만 허용. |
| **9** | **가는 가로선 구분 (Booktabs)** | 카드가 아닌 가는 가로선(`0.75px ~ 1.5px solid #1a1a1a / #d5d3cc`)과 LaTeX `\toprule`, `\midrule`, `\bottomrule`로 구조화. |
| **10** | **수식 이탤릭 & `<sup>` 태그** | 물리 공식은 이탤릭 세리프(`<i class="formula">nλ = 2d sin θ</i>`)로 노출하며, 지수는 **반드시 `<sup>` 태그**만 사용 (유니코드 `⁻¹`, `²` 전면 금지). |
| **11** | **버튼 흑백 반전 호버** | 버튼은 각진 테두리를 가지며 마우스 오버 시 `background: #1a1a1a; color: #fdfcf8;`로 즉각 반전. |
| **12** | **CODATA 물리상수 푸터** | 페이지 최하단에는 CODATA 정밀 기본 물리상수 및 결정 격자면 레퍼런스 표를 반드시 수록. |

---

## 3. 💻 구형 브라우저 (CentOS 7 / Firefox 60 ESR / Chrome 60~70) 호환성 수칙

1. **CSS Grid 금지 $\to$ CSS Flexbox 백분율 너비 사용:**
   * CSS Grid 대신 `.col-12` (100%), `.col-8` (66.6%), `.col-6` (50%), `.col-4` (33.3%) 백분율 너비 사용.
2. **Flex `gap` 금지 $\to$ 마진/패딩 거터 사용:**
   * `.flex-row`에 `margin-left: -6px; margin-right: -6px;`를 적용하고 각 컬럼에 `padding: 0 6px; box-sizing: border-box;`를 적용.
3. **JS 최신 문법 에러 회피:**
   * 옵셔널 체이닝(`?.`), 널 병합 연산자(`??`), `class` 필드 문법 등 ES2020+ 문법 전면 금지.
   * 안전한 `if (obj && obj.prop)` 구문 및 `var` / `function` 호환 패턴 사용.
4. **오프라인 네이티브 (Zero Runtime `fetch`):**
   * 결정 격자 DB, 물리 상수, 감쇠 계수는 모두 `js/data.js`에 JavaScript 객체 상수로 내장하여 외부 네트워크 요청 0건 달성.
5. **데이터 영구 보존:**
   * 모든 사용자 기록은 `localStorage`에 접두어 `bl_toolkit_`을 붙여 안전하게 보존하며 JSON 백업/복원 기능 제공.

---

## 4. 🖨️ A4 데이터시트 인쇄 최적화 (`@media print`)

1. **인터랙티브 UI 자동 숨김:**
   * 사이드바(`#sidebar`), 상단 헤더(`#top-header`), 상단 탭(`#top-tab-strip`), 토스트 메시지, 액션 버튼은 인쇄 시 `display: none !important;` 처리.
2. **단일 화이트 캔버스 출력:**
   * 배경을 완전 백색(`#ffffff`), 글자를 흑색(`#000000`)으로 강제 지정하여 잉크를 절약하고 인쇄 가독성 극대화.
3. **페이지 분할 방지:**
   * 각 카드 및 수식 박스에 `break-inside: avoid; page-break-inside: avoid;`를 적용하여 테이블이나 공식이 페이지 경계에서 잘리지 않도록 보호.

---

## 5. 🛠️ 유지보수 및 파일 수정 시 체크리스트

코드를 수정하거나 새로운 계산기를 추가할 때는 반드시 다음 사항을 점검하십시오:

- [ ] `#top-tab-strip`과 `.tab-strip-scroll`의 독립 가로 스크롤 속성이 훼손되지 않았는가?
- [ ] `#content-area`에 가로 스크롤(`overflow-x`)이 생기지 않고 고정되어 있는가?
- [ ] 신규 버튼 및 카드에 `border-radius`, `box-shadow`, 그라데이션이 들어가지 않았는가?
- [ ] 이모지가 사용되지 않고 로마자 번호(`§ X.X`) 또는 기호로 표기되었는가?
- [ ] 수식 위첨자에 유니코드 지수 대신 `<sup>` 태그가 사용되었는가?
- [ ] 모든 자바스크립트 코드가 `node -c` 구문 검사를 에러 없이 통과하는가?
- [ ] `git push origin main` 후 [https://xray.ooguy.com](https://xray.ooguy.com)에서 정상 서빙되는가?
