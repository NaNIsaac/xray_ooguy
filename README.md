# ⚛ BEAMLINE TOOLKIT

> 방사광 및 X선 빔라인 연구원을 위한 올인원 계산기, 광학 시뮬레이션, 전자 로그북 및 실험 관리 툴킷

- **공식 도메인:** [https://xray.ooguy.com](https://xray.ooguy.com)
- **개발자 후원 (GitHub Sponsors):** [https://github.com/sponsors/SJB7777](https://github.com/sponsors/SJB7777)
- **연구자 및 제작자:** Isaac Yong (용이삭) — 서강대학교 물리학과 학사 졸 / 석사 재학 (CUPT 연구실)
- **이메일:** [isaacyong@naver.com](mailto:isaacyong@naver.com) | **GitHub:** [@SJB7777](https://github.com/SJB7777)
- **호환성:** CentOS 7 기본 브라우저 (Firefox 60 ESR, Chrome 60~70), 순수 Vanilla JS (100% 오프라인 무의존성, 무번들러)

---

## 📁 파일 구조

```text
/root/xray/
├── CNAME                  # Dynu 커스텀 도메인 (xray.ooguy.com)
├── index.html             # 단일 진입점 SPA (Academic Paper Print & Monograph)
├── style.css              # Academic Paper Print 디자인 시스템 (Flexbox, 종이/잉크, 0 Emojis)
├── PLAN.md                # 사이트 개발 계획서 및 아키텍처 명세서
├── GUIDELINES.md          # 탭 소실 트러블슈팅 및 학술 인쇄물 개발 가이드
├── README.md              # 프로젝트 요약 및 개발자 안내
└── js/
    ├── app.js             # 해시 라우팅, 탭 스트립 동기화, 단축키
    ├── data.js            # 물리 상수 (CODATA), 결정 격자 d-spacing, 재료 감쇠 DB
    ├── optics.js          # 광학 계산기 (에너지-파장, 브래그, 격자, 굴절률, Chi-Phi, Q-space)
    ├── beamline.js        # 빔라인 물리량 (풋프린트, 플럭스, 분해능, CDI 오버샘플링, 슬릿)
    ├── logbook.js         # 전자 로그북 (태그 검색, 히스토리, CSV/JSON/마크다운 내보내기)
    ├── experiment.js      # 실험 노트(자동저장), 체크리스트, 시료 관리, DAQ 산출, 칸반 보드
    ├── reference.js       # 단위 변환기, 결정 격자 DB 검색, 연구 링크
    └── settings.js        # 계산 기록 관리, 전체 데이터 백업 및 복원
```

---

## 🚀 주요 기능 스위트

1. **OPTICS (X선 광학 계산)**
   - 에너지-파장-주파수 변환 ($hc = 12398.41984\text{ eV}\cdot\text{Å}$)
   - 브래그 법칙 ($\lambda = 2d\sin\theta$) 및 듀얼 모드 계산
   - 회절격자 분산 ($m\lambda = d(\sin\alpha + \sin\beta)$)
   - 복소 굴절률 ($n = 1 - \delta + i\beta$) 및 빔 투과율 (Beer-Lambert)
   - 에너지-각도 보정, Chi-Phi 오일러 크래들 틸트 보정, 전반사 임계각, Q-space 변환

2. **BEAMLINE (빔라인 물리량 및 기하학적 파라미터)**
   - 시료 상 빔 풋프린트 및 스필오버 검증
   - 저장링 전류 및 광학계 효율 기반 전달 광자 플럭스
   - 단색기 결정 고유 분해능 ($\Delta E/E$) 및 디텍터 각도 분해능
   - CDI/BCDI 결맞음 회절 나이퀴스트 오버샘플링 ($\sigma \ge 2$) 판정
   - 슬릿 개구폭 및 가우시안 빔 수용각
   - 결정 열팽창에 따른 브래그 각도/에너지 시프트

3. **LOGBOOK & EXPERIMENT (실험 및 워크플로우 관리)**
   - 시료별 조건 수동 기록, 태그 검색, CSV/JSON/마크다운 내보내기
   - 실시간 자동 저장 실험 노트 (Debounced Auto-Save)
   - 빔라인 체크리스트 (진행률 표시 및 커스텀 항목 추가)
   - 시료 관리 테이블 (시료명, 재료, 두께, 4축 모터 좌표)
   - DAQ 디텍터별 초당 전송량 (MB/s) 및 총 저장 용량 계산
   - 빔타임 칸반 보드 (대기 / 진행 중 / 완료)

4. **REFERENCE, SETTINGS & ABOUT**
   - 다차원 단위 변환기 (길이, 압력, 각도)
   - Si, Ge, Diamond, Al₂O₃, GaAs 등 결정면 d-spacing 실시간 검색 및 브래그 계산기 연동
   - 흑백 반전 다크 모드 토글
   - `localStorage` 기반 전체 데이터 백업(JSON 다운로드) 및 복원
   - 키보드 단축키 지원 (`Alt + 1` ~ `Alt + 8`)
   - **ABOUT:** Isaac Yong (용이삭) 연구자 소개, CUPT 연구실 포트폴리오 및 [GitHub Sponsors 커피 후원](https://github.com/sponsors/SJB7777)
