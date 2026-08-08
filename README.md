# ⚛ BEAMLINE TOOLKIT

> 방사광 및 X선 빔라인 연구원을 위한 올인원 계산기, 광학 시뮬레이션, 전자 로그북 및 실험 관리 툴킷

- **공식 도메인:** [https://xray.ooguy.com](https://xray.ooguy.com)
- **호스팅:** GitHub Pages (정적 사이트)
- **호환성:** CentOS 7 기본 브라우저 (Firefox 60 ESR, Chrome 60~70), 순수 Vanilla JS (무의존성, 무번들러)

---

## 📁 파일 구조

```text
/root/xray/
├── CNAME                  # Dynu 커스텀 도메인 (xray.ooguy.com)
├── index.html             # 단일 진입점 SPA
├── style.css              # Clean Lab Dashboard 디자인 시스템 (Flexbox, 다크/라이트 테마)
├── js/
│   ├── app.js             # 해시 라우팅, 테마 토글, 단축키, 토스트 알림
│   ├── data.js            # 물리 상수 (CODATA), 결정 격자 d-spacing, 재료 감쇠 DB
│   ├── optics.js          # 광학 계산기 (에너지-파장, 브래그, 격자, 굴절률, Chi-Phi, Q-space)
│   ├── beamline.js        # 빔라인 물리량 (풋프린트, 플럭스, 분해능, CDI 오버샘플링, 슬릿)
│   ├── logbook.js         # 전자 로그북 (태그 검색, 히스토리, CSV/JSON/마크다운 내보내기)
│   ├── experiment.js      # 실험 노트(자동저장), 체크리스트, 시료 관리, DAQ 산출, 칸반 보드
│   ├── reference.js       # 단위 변환기, 결정 격자 DB 검색, 연구 링크
│   └── settings.js        # 계산 기록 관리, 전체 데이터 백업 및 복원
└── PLAN.md                # 전체 개발 계획서
```

---

## 🚀 주요 기능

1. **OPTICS (광학 계산)**
   - 에너지-파장-주파수 변환 ($hc = 12398.42\text{ eV}\cdot\text{Å}$)
   - 브래그 법칙 ($\lambda = 2d\sin\theta$) 및 듀얼 모드 계산
   - 회절격자 분산 ($m\lambda = d(\sin\alpha + \sin\beta)$)
   - 복소 굴절률 ($n = 1 - \delta + i\beta$) 및 빔 투과율 (Beer-Lambert)
   - 에너지-각도 보정, Chi-Phi 오일러 크래들 틸트 보정, 전반사 임계각, Q-space 변환

2. **BEAMLINE (빔라인 물리량)**
   - 시료 상 빔 풋프린트 및 스필오버 검증
   - 저장링 전류 및 광학계 효율 기반 전달 광자 플럭스
   - 단색기 결정 고유 분해능 ($\Delta E/E$) 및 디텍터 각도 분해능
   - CDI/BCDI 결맞음 회절 나이퀴스트 오버샘플링 ($\sigma \ge 2$) 판정
   - 슬릿 개구폭 및 가우시안 빔 수용각
   - 결정 열팽창에 따른 브래그 각도/에너지 시프트

3. **LOGBOOK & EXPERIMENT (실험 관리)**
   - 시료별 조건 수동 기록, 태그 검색, CSV/JSON/마크다운 내보내기
   - 실시간 자동 저장 실험 노트
   - 빔라인 체크리스트 (진행률 표시 및 커스텀 항목 추가)
   - 시료 관리 테이블 (시료명, 재료, 두께, 모터 좌표)
   - DAQ 디텍터별 초당 전송량 (MB/s) 및 총 저장 용량 계산
   - 빔타임 칸반 보드 (대기 / 진행 중 / 완료)

4. **REFERENCE & SETTINGS**
   - 다차원 단위 변환기 (길이, 압력, 각도)
   - Si, Ge, Al₂O₃, GaAs 등 결정면 d-spacing 실시간 검색 및 브래그 계산기 연동
   - 라이트 / 다크 모드
   - `localStorage` 기반 전체 데이터 백업(JSON 다운로드) 및 복원
   - 키보드 단축키 지원 (`Alt+1` ~ `Alt+7`)
