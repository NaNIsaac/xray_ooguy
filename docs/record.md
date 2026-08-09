\# Record Tab 통합 기능 구현 프롬프트



기존 사이트의 \*\*Experiment 기능을 별도 탭으로 유지하지 않고, Record 탭에 완전히 통합\*\*한다.



이번 작업의 범위는 \*\*Record 탭의 구현/개편만\*\*이다.

기존 Calculator, Data, 기타 도구의 기능과 UI는 수정하지 않는다.



\---



\## 1. 핵심 UX 원칙



Record는 새로운 ELN/LIMS나 복잡한 실험 관리 시스템이 아니다.



목표는 다음과 같다.



> \*\*연구자가 Google Docs/Sheets를 계속 사용하는 workflow를 방해하지 않으면서, 실험 세션의 기본 context와 반복적인 log 작성을 빠르게 도와주는 가벼운 기록 도구\*\*



따라서:



\* Record를 사용하기 위해 많은 정보를 입력하도록 강제하지 않는다.

\* Session 생성은 선택 사항이다.

\* Beamline, Sample, Energy 등의 정보도 모두 optional이다.

\* 빈 정보가 있어도 정상적인 상태로 취급한다.

\* 사용자가 실제로 필요할 때만 세부 정보를 추가할 수 있도록 한다.

\* 기본 interaction은 1\~2번의 클릭으로 끝나야 한다.

\* 복잡한 editor를 만들지 않는다.

\* Google Docs를 대체하려 하지 않는다.



\---



\# 2. Navigation 변경



기존의 독립적인 `EXPERIMENT` 탭은 제거한다.



최상위 navigation은 다음과 같은 구조를 사용한다.



```text

TOOLS    DATA    RECORD    PREPARE

```



Record가 기존 Experiment의 역할까지 흡수한다.



\---



\# 3. Record의 기본 구조



Record 페이지는 다음 세 영역으로 구성한다.



```text

RECORD



┌──────────────────────────────┐

│ SESSION                       │

│ Session context              │

├──────────────────────────────┤

│ QUICK LOG                    │

│ Fast event logging           │

│                              │

│ Recent logs                  │

├──────────────────────────────┤

│ SESSION TEMPLATE             │

│ Formatted export/header      │

└──────────────────────────────┘

```



\---



\# 4. SESSION 영역



Record 상단에 현재 Session을 표시한다.



Session은 기존 Experiment를 대체하는 개념이지만, \*\*훨씬 가벼운 개념\*\*으로 구현한다.



\### 처음에는



```text

SESSION



No active session.



\[ Start Session ]

```



\### Session이 존재하면



```text

SESSION



Si-111 BCDI



Beamline    9C

Sample      Si-03

Energy      10 keV

Reflection  Si(111)



\[ Edit Context ]

```



단, 모든 field는 optional이다.



\---



\## 4-1. Start Session



`Start Session`을 누르면 처음부터 많은 정보를 요구하지 않는다.



최소:



```text

START SESSION



Name

\[                         ]



\[ Start ]

```



이 정도만 요구한다.



예:



```text

Si-111 BCDI

```



Session을 생성한 뒤 필요한 정보를 나중에 추가할 수 있다.



\---



\## 4-2. Edit Context



Session 생성 후 다음 metadata를 선택적으로 추가/수정할 수 있게 한다.



```text

Beamline

Sample

Energy

Reflection

Detector

Operator

Environment

Notes

```



처음부터 모든 field를 보여주지 않는다.



예:



```text

\[ + Add information ]

```



을 눌렀을 때 추가 가능한 metadata를 표시한다.



\*\*빈 field를 억지로 채우게 하지 않는다.\*\*



\---



\# 5. QUICK LOG



Record의 핵심 기능이다.



사용자가 짧은 상황을 빠르게 기록할 수 있도록 한다.



기본 UI는 다음과 같이 구성한다.



```text

QUICK LOG



\[ Sample mounted ]

\[ Beam down ]

\[ Scan started ]

\[ Peak found ]

\[ Issue ]

\[ + Other ]

```



버튼을 누르면 즉시 하나의 Log가 생성된다.



사용자가 문장을 직접 작성할 필요가 없다.



\---



\# 6. Log는 단순 문구보다 조금 더 풍부하게



단순히:



```text

Sample mounted.

```



만 저장하지 않는다.



가능한 경우 현재 Session의 context와 timestamp를 자동으로 연결한다.



예:



```text

15:32  EVENT



Sample mounted on the goniometer.



Si-03 · 10 keV · 9C

```



사용자가 별도로 입력하지 않아도 다음 정보를 자동으로 사용할 수 있다.



\* timestamp

\* current session

\* author/operator

\* beamline

\* sample

\* energy

\* reflection



단, context가 존재하지 않는 경우에는 있는 정보만 사용한다.



\---



\# 7. Log Type



Log에는 최소한 다음 type을 지원한다.



```text

EVENT

OBSERVATION

ISSUE

RESULT

DECISION

CALCULATION

```



예:



```text

EVENT

Sample mounted.



OBSERVATION

Peak found at 14.23°.



ISSUE

Beam intensity became unstable.



RESULT

Measurement completed.



DECISION

Repeated rocking scan.



CALCULATION

Bragg angle = 14.23°.

```



사용자에게 항상 type을 선택하게 강제하지 않는다.



Quick Log 버튼에는 적절한 type을 자동 지정한다.



\---



\# 8. 고급 옵션은 Progressive Disclosure



기본 사용자는 단순히 버튼을 클릭하면 된다.



각 Log를 클릭하거나 `⋯` 메뉴를 열었을 때만 advanced option을 표시한다.



예:



```text

Advanced



Type

\[ EVENT ]



Severity

\[ Normal ]



Author

\[ Isaac ]



Context

\[ Include ✓ ]



Note

\[ Add note... ]

```



기본 화면에는 이런 옵션을 노출하지 않는다.



\---



\# 9. Severity



선택적으로 severity를 지원한다.



권장 값:



```text

Normal

Important

Critical

```



또는 이에 준하는 간단한 구조를 사용한다.



중요한 것은 사용자가 매번 severity를 선택해야 하는 구조가 아니어야 한다는 것이다.



기본값은 `Normal`.



\---



\# 10. Add Note



Quick Log의 가장 중요한 확장 기능 중 하나다.



예를 들어:



```text

Sample mounted.

```



를 생성한 뒤 필요하면:



```text

\[ Add note... ]

```



를 통해 한두 문장의 추가 설명을 작성할 수 있다.



예:



```text

Sample mounted.



Note:

Sample orientation appeared slightly off and was re-aligned.

```



즉,



```text

1-click log

&#x20;   ↓

필요하면 note 추가

```



의 구조를 유지한다.



\---



\# 11. QUICK LOG의 Custom Entry



모든 상황을 미리 버튼으로 만들지 않는다.



마지막에:



```text

\[ + Other ]

```



를 제공한다.



누르면 간단한 입력창만 표시한다.



```text

QUICK LOG



\[ Write a short log... ]



\[ Save ]

```



사용자가 직접 문장을 입력할 수 있다.



복잡한 form이나 schema를 요구하지 않는다.



\---



\# 12. Recent Logs



Quick Log 아래에는 현재 Session의 최근 기록을 timeline 형태로 표시한다.



예:



```text

RECENT LOGS



15:32  RESULT

Peak found at 14.23°.



15:18  EVENT

Rocking scan started.



14:52  EVENT

Sample mounted.



14:41  ISSUE

Beam intensity became unstable.

```



최신 기록이 위에 오도록 한다.



Log는 compact하게 보여주고, 클릭하면 상세 정보를 펼칠 수 있도록 한다.



\---



\# 13. Calculator와 Record의 연결



Calculator와 Record를 강제로 결합하지 않는다.



계산기에서 사용자가 명시적으로:



```text

\[ Add to Record ]

```



를 선택한 경우에만 결과를 Record에 추가한다.



예:



```text

CALCULATION



Bragg angle = 14.23°

Energy = 10 keV

Reflection = Si(111)



\[ Copy ] \[ Add to Record ]

```



Record에는:



```text

15:32  CALCULATION



Bragg angle = 14.23°

Energy: 10 keV

Reflection: Si(111)

```



형태로 추가한다.



계산기를 사용할 때 Record/Session 생성을 강제하지 않는다.



\---



\# 14. SESSION TEMPLATE



Record 페이지 최하단에 `SESSION TEMPLATE` 영역을 둔다.



이 기능은 기본 사용자에게 적극적으로 노출하지 않는다.



중급/고급 사용자가 필요할 때 사용할 수 있는 secondary feature로 취급한다.



예:



```text

────────────────────────────



SESSION TEMPLATE



Generate a formatted header

for your external logbook.



\[ Insert Header ]

```



\---



\# 15. Session Template의 목적



Session Template은 사용자가 Google Docs 등의 외부 Logbook에 매번 작성하는 \*\*세션 시작 부분의 기본 정보\*\*를 자동 생성하는 기능이다.



예:



```text

BEAMTIME SESSION

────────────────────────



Date: 2026-08-09

Beamline: 9C



Experiment: Si-111 BCDI

Sample: Si-03



Energy: 10 keV

Reflection: Si(111)



Operator: Isaac

```



현재 Session에 저장된 정보를 자동으로 사용한다.



사용자가 같은 정보를 다시 입력하지 않아도 된다.



\---



\# 16. Template Format



최소 2\~3개의 preset format을 제공한다.



예:



\### Compact



```text

2026-08-09 · 9C · Si-111 · 10 keV

Operator: Isaac

```



\### Standard



```text

BEAMLINE SESSION



Date:

Beamline:

Experiment:

Sample:

Energy:

Reflection:

Operator:

```



\### Detailed / Beamtime



보다 정돈된 형태의 formatted text.



사용자가 Markdown이나 HTML 등을 직접 작성할 필요가 없어야 한다.



\---



\# 17. Template Preview



Template을 사용하기 전에 preview를 제공할 수 있다.



```text

SESSION TEMPLATE



Format

○ Compact

● Standard

○ Beamtime



Include

☑ Beamline

☑ Experiment

☑ Sample

☑ Energy

☑ Reflection

☑ Operator



Preview

────────────────────

BEAMLINE SESSION

...

────────────────────



\[ Copy ] \[ Insert ]

```



여기서 `Copy`는 Google Docs 등에 붙여넣기 위한 formatted/plain text를 생성한다.



\---



\# 18. Session Log Export



향후 확장성을 고려하여 Record 전체를 외부 Logbook으로 옮길 수 있도록 한다.



최소:



```text

\[ Copy Session Log ]

```



을 제공한다.



예:



```text

2026-08-09 — Si-111 BCDI



14:52  Sample mounted.

15:18  Rocking scan started.

15:32  Peak found at 14.23°.

15:41  Beam intensity became unstable.

```



가능하면 Log Type과 Session context를 포함한 읽기 좋은 형태로 export한다.



\---



\# 19. 중요한 UX 제한



다음은 구현하지 않는다.



\* 복잡한 Experiment management

\* 강제 metadata 입력

\* 복잡한 sample database

\* LIMS 기능

\* ELN editor

\* rich text editor

\* 복잡한 workflow engine

\* task/project management

\* 계산기 사용 전 Session 생성 강제

\* 모든 Log에 metadata 입력 강제



이 기능의 목적은 \*\*연구 관리 시스템을 만드는 것이 아니다.\*\*



\---



\# 20. Persistence



GitHub Pages 기반 정적 사이트이므로 서버/database를 전제로 하지 않는다.



가능하면 기존 프로젝트의 storage 방식에 맞추되, 기본적으로 다음 정도의 local persistence를 사용한다.



\* active Session

\* Session metadata

\* recent Logs

\* custom Quick Logs

\* user preferences



브라우저의 `localStorage` 등 정적 사이트에서 사용할 수 있는 방식으로 구현한다.



Export/Import가 기존 사이트에 이미 존재한다면 Record 데이터도 그 구조에 포함한다.



\---



\# 21. 구형 OS / 브라우저 호환성



사이트가 연구실의 오래된 환경에서도 사용되는 것을 고려한다.



따라서:



\* 최신 JavaScript 문법에 의존하지 않는다.

\* 최신 browser API를 필수 기능으로 사용하지 않는다.

\* 복잡한 framework 의존성을 새로 추가하지 않는다.

\* 기존 프로젝트의 기술 스택과 스타일을 우선한다.

\* 기본적인 DOM 이벤트와 기존 브라우저에서 충분히 동작하는 방식으로 구현한다.



\---



\# 22. 최종 UX 목표



최종적으로 사용자가 Record를 사용할 때의 흐름은 다음과 같아야 한다.



\### Light user



```text

Record 열기

↓

아무것도 입력하지 않음

↓

Quick Log 하나 클릭

↓

끝

```



\### Regular user



```text

Record

↓

Session 이름 생성

↓

필요한 metadata만 추가

↓

Quick Log 사용

↓

필요할 때 Add Note

```



\### Power user



```text

Session Context

↓

Quick Logs

↓

Calculator 결과 Add to Record

↓

Session Template 생성

↓

Copy Session Log

↓

Google Docs

```



즉,



> \*\*사용량이 늘어날수록 기능이 깊어지지만, 처음부터 사용자가 복잡한 시스템을 배워야 하는 구조는 절대 만들지 않는다.\*\*



\---



\## 핵심 결과



기존의:



```text

EXPERIMENT

RECORD

```



두 기능을 하나의:



```text

RECORD

&#x20;├── SESSION

&#x20;├── QUICK LOG

&#x20;└── SESSION TEMPLATE

```



구조로 통합한다.



`Experiment`라는 별도 개념은 UI에서 제거한다.



\*\*Record가 실험의 context + timeline + lightweight logbook 역할을 동시에 담당하도록 구현한다.\*\*



