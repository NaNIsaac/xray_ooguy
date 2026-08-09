
# X-Ray Beamline Toolkit — Experiment-Centered UI Refactor

현재 개발 중인 X-ray research toolkit 웹사이트의 UI/정보 구조를 **Experiment-centered workspace** 형태로 재구성한다.

## 1. 핵심 목표

현재 사이트는 여러 X-ray physics calculator, logbook, notes, checklist, sample inventory 등의 기능이 개별적으로 존재한다.

이를 단순한 "calculator collection"이 아니라:

> **X-ray experiment를 생성하고, 그 Experiment 안에서 계산하고(Calculate), 기록하고(Record), 준비하는(Prepare) 연구용 workspace**

로 느껴지도록 UI/정보 구조를 재편한다.

핵심 UX는 다음과 같다.

```text
                    EXPERIMENT
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
      CALCULATE        RECORD         PREPARE
      X-ray Physics    Logbook        Checklist
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                  EXPERIMENT DATA
                         │
                         ↓
                    JSON BACKUP
```

---

# 2. 중요한 기술적 제약

이 프로젝트는 연구실의 구형 beamline PC에서도 사용해야 한다.

따라서:

* GitHub Pages 기반
* 완전 정적 사이트
* 서버/백엔드 없음
* 별도 database 없음
* 외부 API 의존 최소화
* 오래된 CentOS 환경 고려
* 오래된 브라우저 호환성 우선
* 가능하면 ES5 수준의 JavaScript 문법 사용
* `var`, `function`, `if`, `for`, `JSON`, `localStorage` 등 오래된 표준 API 중심
* 최신 framework나 복잡한 build system을 새로 도입하지 않음
* `const`, `let`, arrow function, async/await, optional chaining 등의 최신 문법은 가급적 사용하지 않음
* Clipboard API 등 최신 API는 반드시 fallback 제공
* 데이터는 기본적으로 브라우저의 `localStorage`에 저장
* 사용자가 JSON으로 Export / Import할 수 있어야 함

**기존 코드베이스와 기존 계산 로직을 최대한 보존한다.**

UI를 바꾸기 위해 물리 계산식을 임의로 변경하지 않는다.

---

# 3. 전체 정보 구조

최상위 개념은 `EXPERIMENT`이다.

기존처럼 다음 기능들이 서로 동등한 수준의 메뉴로 보이지 않도록 한다.

```text
Calculator
Logbook
Notes
Checklist
Sample
DAQ
Kanban
History
```

대신:

```text
X-RAY TOOLKIT
│
├── EXPERIMENTS
│
├── CURRENT EXPERIMENT
│   ├── CALCULATE
│   ├── RECORD
│   └── PREPARE
│
└── GLOBAL
    ├── References
    ├── General Tools
    └── Settings
```

구조를 지향한다.

---

# 4. 첫 화면 / Dashboard

화려한 SaaS dashboard를 만들지 않는다.

Notion 스타일도 피한다.

현재 사이트의 technical / scientific instrument / beamline toolkit 분위기를 유지한다.

첫 화면에서는 사용자가 자신의 Experiment를 바로 선택하거나 새로 만들 수 있어야 한다.

예시:

```text
──────────────────────────────────────────────

              X-RAY BEAMLINE TOOLKIT

          Calculate. Record. Prepare.

──────────────────────────────────────────────

YOUR EXPERIMENTS

┌────────────────────────────────────────────┐
│ ● Si-111 / BCDI                            │
│   10 keV · Beamline 9C · ACTIVE            │
│                                            │
│   [ OPEN EXPERIMENT ]                      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ Ge-220 / Rocking Curve                     │
│ 8 keV · Beamline 3A · CLOSED               │
│                                            │
│   [ OPEN ]                                 │
└────────────────────────────────────────────┘

             [ + NEW EXPERIMENT ]

──────────────────────────────────────────────

GLOBAL TOOLS
Energy · Bragg · Q · References · Settings

──────────────────────────────────────────────
```

카드 UI를 과도하게 사용하지 않는다.

---

# 5. Experiment Workspace

Experiment를 열면 항상 현재 Experiment의 정보가 상단에 표시된다.

예:

```text
┌──────────────────────────────────────────────────────────┐
│ EXPERIMENT                                               │
│                                                          │
│ Si-111 / BCDI Beamtime                    ● ACTIVE       │
│ 2026-08-09 · Beamline 9C                                │
│                                                          │
│ 10.0 keV | Si(111) | 500 mm | Isaac Yong                │
│                                                          │
│ [Edit] [Duplicate] [Close Experiment]                    │
└──────────────────────────────────────────────────────────┘
```

현재 Experiment의 주요 parameter는 여러 화면에서 자동으로 재사용할 수 있어야 한다.

예:

* Beamline
* Sample
* Energy
* Reflection
* Detector distance
* Author
* Temperature
* 기타 experiment metadata

---

# 6. Experiment 내부의 핵심 navigation

Experiment 내부에서는 다음 3개를 가장 크게 보여준다.

```text
CALCULATE     RECORD     PREPARE
```

이 세 가지가 Experiment의 핵심 workflow다.

Sidebar를 사용하기보다 상단 navigation/tab을 우선 고려한다.

예:

```text
┌──────────────────────────────────────────────┐
│ EXPERIMENT: Si-111                           │
├──────────────────────────────────────────────┤
│ CALCULATE │ RECORD │ PREPARE                 │
└──────────────────────────────────────────────┘
```

---

# 7. CALCULATE

CALCULATE는 X-ray Physics workspace다.

기존의 calculator를 모두 없애지 않는다.

대신 물리적 성격에 따라 그룹화한다.

예:

```text
CALCULATE

CORE
[ Energy ↔ Wavelength ]
[ Bragg ]
[ Q-space ]

GEOMETRY
[ Footprint ]
[ Angular Resolution ]
[ Detector Geometry ]

CRYSTAL / DIFFRACTION
[ d-spacing ]
[ Critical Angle ]
[ Darwin Width ]

ADVANCED
[ CDI ]
[ Dynamical Diffraction ]

                         [ All Calculators → ]
```

30개의 계산기를 한 화면에 나열하지 않는다.

---

# 8. Calculator와 Experiment의 연결

각 calculator는 독립적으로도 사용할 수 있어야 하지만, Experiment 안에서 실행했을 경우 결과를 Experiment에 저장할 수 있어야 한다.

계산 결과 화면에:

```text
[ Save to Experiment ]
[ Copy ]
```

등을 제공한다.

예:

```text
BRAGG CONDITION

Energy
[ 10.000 keV ]

Material
[ Si ]

Reflection
[ 111 ]

θ       14.22°
2θ      28.44°
d       3.135 Å
Q       ...

[ Save to Experiment ]
```

즉:

```text
Calculate
    ↓
Result
    ↓
Save to Experiment
```

workflow를 만든다.

단순 calculator history보다 **Experiment에 귀속되는 계산 기록**을 우선한다.

---

# 9. RECORD

RECORD는 Experiment의 Logbook 영역이다.

기존 Lab Notes와 Logbook을 분리해서 중복시키지 않는다.

가능하면 하나의 통합된 Logbook으로 만든다.

핵심 기능:

* New Log
* Log history
* Templates
* Snippets
* Author autocomplete
* 최근 사용값
* Experiment parameter 자동 삽입
* Copy formatted text
* JSON backup

예:

```text
RECORD
────────────────────────

[ + NEW LOG ]

TEMPLATES

[ Beamtime Start ]
[ Alignment ]
[ DAQ Start ]
[ Sample Change ]
[ Observation ]

RECENT LOGS

17:51  Rocking scan started
17:43  Sample aligned
17:21  Detector check
16:55  Beamline setup
```

---

# 10. Logbook Template

사용자가 반복적으로 작성하는 beamtime log를 template으로 저장할 수 있어야 한다.

예:

```text
BEAMTIME START

Date:
Beamline:
Proposal:
Experiment:
Sample:
Energy:
Reflection:
Detector:
Author:
```

또는:

```text
ALIGNMENT

Sample:
Reflection:
Energy:
Rocking angle:
Peak position:
Comments:
```

사용자가 작성한 log를:

```text
[ Save as Template ]
```

할 수 있게 한다.

복잡한 AI 자동 학습은 우선 구현하지 않는다.

정적 사이트 + localStorage만으로 구현 가능한 단순 template system을 우선한다.

---

# 11. Logbook Snippet

반복적으로 사용하는 문구를 snippet으로 저장한다.

예:

```text
/sample-mounted
/beam-check
/daq-start
```

각 snippet은 미리 저장된 문장을 삽입한다.

예:

```text
/sample-mounted

→ Sample was mounted and aligned to the nominal Bragg condition.
```

사용자가 직접 snippet을 추가/수정/삭제할 수 있어야 한다.

모든 snippet은 localStorage에 저장한다.

---

# 12. Author autocomplete

Logbook 작성 시 Author를 매번 직접 입력하지 않도록 한다.

예:

```text
Author:
[ Isaac Yong ▼ ]

Recent Authors:
Isaac Yong
J. Kim
S. Park
```

최근 사용 author를 localStorage에 저장한다.

사용 빈도 또는 최근 사용 순서로 표시해도 좋다.

서버나 사용자 계정 시스템은 만들지 않는다.

---

# 13. Experiment parameter 자동 삽입

현재 Experiment에 다음 정보가 있다면:

```text
Energy: 10 keV
Reflection: Si(111)
Beamline: 9C
Detector distance: 500 mm
Author: Isaac Yong
```

새 Log를 만들 때 자동으로 삽입할 수 있어야 한다.

예:

```text
NEW LOG

Template: Alignment

Author: Isaac Yong
Beamline: 9C
Sample: Si-111
Energy: 10 keV
Reflection: Si(111)
Detector distance: 500 mm

Notes:
[ ... ]
```

사용자가 매번 같은 정보를 다시 입력하지 않게 한다.

---

# 14. Google Docs / Sheets와의 관계

Google Docs/Sheets를 대체하려고 하지 않는다.

이 사이트는 **beamtime 기록을 빠르게 생성하고 정리하는 보조 도구**다.

따라서 초기 구현에서는 Google API integration을 만들지 않는다.

대신:

```text
[ Copy Formatted Text ]
```

버튼을 제공하여 Google Docs에 그대로 붙여넣을 수 있게 한다.

Clipboard API가 지원되지 않는 오래된 브라우저에서는 textarea + `document.execCommand('copy')` 방식의 fallback을 사용한다.

---

# 15. PREPARE

PREPARE는 Beamtime Checklist 중심으로 구성한다.

Kanban board는 제거하거나 사용하지 않는다.

Checklist 예:

```text
PREPARE
────────────────────────

BEAMLINE

☑ Beam available
☑ Vacuum
☑ Shutter
☐ Energy set

SAMPLE

☑ Sample mounted
☐ Alignment
☐ Bragg condition
☐ Temperature

DETECTOR

☑ Detector online
☐ Distance confirmed
☐ Calibration

ACQUISITION

☐ Exposure
☐ Frame rate
☐ Storage checked
☐ DAQ started

────────────────────────

READINESS
████████████░░ 78%
```

Kanban보다 실제 beamtime workflow에 맞는 checklist를 우선한다.

---

# 16. Sample Inventory

Sample Inventory는 독립적인 최상위 기능으로 두지 않는다.

가능하면 Experiment에 귀속시킨다.

예:

```text
EXPERIMENT
│
├── Samples
│   ├── Si-111
│   ├── Si-220
│   └── Diamond
│
├── Logbook
├── Checklist
└── Calculations
```

Sample metadata:

* Material
* Thickness
* Position
* Memo
* 기타 기존 필드

를 유지한다.

---

# 17. Calculation History

전체 사이트의 거대한 global calculation history를 핵심 UI로 만들지 않는다.

계산 기록은 가능한 한 현재 Experiment에 귀속시킨다.

예:

```text
EXPERIMENT: Si-111

CALCULATIONS

17:43  Bragg
17:45  Footprint
17:48  Detector Resolution
```

필요한 경우 전체 history를 별도 utility로 유지할 수 있지만, 메인 workflow에서는 숨긴다.

---

# 18. BACKUP

Backup은 Calculate / Record / Prepare와 동급의 workflow가 아니다.

따라서 메인 navigation의 독립 탭으로 만들지 않는다.

대신 상단에:

```text
[ Export JSON ]
[ Import JSON ]
```

을 제공한다.

또는:

```text
LOCAL DATA
● Saved locally
Last backup: 17:32
[ Export JSON ]
```

형태로 표시한다.

모든 Experiment / Logbook / Templates / Snippets / Authors / Settings 등의 사용자 데이터를 JSON으로 export/import할 수 있어야 한다.

---

# 19. Local-first 철학

이 사이트의 중요한 특성:

> No account. No server. No upload.

사용자의 연구 데이터는 기본적으로 브라우저 localStorage에 저장한다.

사용자가 원할 때만 JSON 파일로 export한다.

이를 명확히 표시한다.

예:

```text
LOCAL DATA
Your research notes are stored locally in this browser.
```

단, 실제 데이터 손실 가능성을 고려하여 Export / Import 기능을 반드시 제공한다.

---

# 20. 기존 기능 정리 원칙

새 기능을 무작정 추가하지 않는다.

현재 기능을 다음 원칙으로 재배치한다.

### 유지 / 강화

* Energy ↔ Wavelength
* Bragg
* Q-space
* Energy Scaling
* Footprint
* Angular Resolution
* Energy Resolution
* Thermal Drift
* CDI / X-ray physics 관련 calculator
* DAQ Storage Estimator
* Checklist
* Logbook
* Backup / Restore

### Experiment 아래로 통합

* Lab Notes → Logbook으로 통합
* Sample Inventory → Experiment > Samples
* Calculation History → Experiment > Calculations
* Experiment Notes → Logbook 또는 Experiment Overview

### 제거 또는 숨김 검토

* Kanban Board
* 일반 Unit Converter
* Keyboard Shortcut 설명 페이지
* Synchrotron Facility Links
* 기타 X-ray experiment workflow에 직접 기여하지 않는 utility

### Database

d-spacing / reflection database는 실제 데이터를 충분히 제공할 수 있을 때 활성화한다.

빈 database를 사용자에게 보여주지 않는다.

---

# 21. UI 디자인 원칙

현재 사이트의 기존 visual identity를 유지한다.

목표:

> **Scientific Instrument UI + Experiment Workspace**

피해야 할 것:

* 과도하게 현대적인 SaaS dashboard
* Notion 스타일
* 불필요한 rounded card 남발
* 과도한 animation
* 큰 hero section
* 일반 consumer app 같은 UI
* 기능보다 장식이 앞서는 디자인

선호:

* 명확한 typography hierarchy
* 얇은 border
* compact spacing
* technical labels
* section headers
* 상태 표시
* dense하지만 읽기 쉬운 scientific interface
* 구형 beamline PC에서도 빠르게 동작하는 UI

현재 사이트의 technical / scientific character는 유지한다.

---

# 22. 최종 UX 목표

사용자가 사이트를 열었을 때 다음 흐름이 자연스럽게 느껴져야 한다.

```text
1. Experiment 선택
        ↓
2. Experiment Overview 확인
        ↓
3. CALCULATE
   필요한 물리량 계산
        ↓
4. 계산 결과를 Experiment에 저장
        ↓
5. PREPARE
   Checklist 확인
        ↓
6. RECORD
   Logbook 작성
        ↓
7. Template / Snippet / Author 자동완성 사용
        ↓
8. Google Docs/Sheets에 필요하면 Copy
        ↓
9. Experiment 종료
        ↓
10. JSON Backup
```

궁극적인 제품 정체성은:

> **An offline-first X-ray research environment for beamline experiments.**

단순히 "30개의 X-ray calculator"가 아니라,

> **Calculate → Prepare → Record**

라는 실제 연구 workflow를 지원하는 도구로 발전시킨다.

---

# 23. 구현 시 가장 중요한 원칙

**기존 기능을 깨뜨리지 말 것.**

1. 먼저 기존 코드를 분석한다.
2. 기존 calculator의 계산 로직과 물리식을 유지한다.
3. 기존 localStorage 구조가 있다면 migration을 고려한다.
4. UI 구조부터 Experiment-centered로 재편한다.
5. 이후 Logbook Template / Snippet / Author 기능을 추가한다.
6. 마지막으로 Calculator ↔ Experiment ↔ Logbook ↔ Checklist 연결을 구현한다.
7. 모든 기능은 구형 브라우저에서도 graceful degradation되어야 한다.
8. 서버를 추가하지 않는다.
9. 최신 framework로 전체 프로젝트를 재작성하지 않는다.
10. 기존 사이트의 scientific / technical visual identity를 유지한다.

**핵심은 "더 많은 기능"이 아니라 "기존 기능을 하나의 Experiment workflow로 연결하는 것"이다.**
