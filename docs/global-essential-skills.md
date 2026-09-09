# 전역 필수 스킬 (Global Essential)

이 저장소를 사용하는 작업 환경에서 전역(`~/.claude/skills/`)으로 설치해 두는 스킬 목록입니다. 아래는 현재 개발 머신에 설치된 실제 항목이며, 새 머신을 세팅할 때 이 목록을 기준으로 맞춥니다.

### 프로세스·검증

| 스킬 | 설명 |
|---|---|
| SDLC | [Anthropic AI-native SDLC playbook](https://claude.com/blog/the-ai-native-sdlc-playbook)을 필수 기준으로 사용합니다. 본 저장소의 `sdlc` 스킬은 이와 별개로 자체 설계한 폭포수 운영 규약입니다. |
| `visual-e2e-proof` | 사용자 가시 결과물을 실제 실행 환경에서 캡처하고 채팅과 OS 미리보기 양쪽에 증거로 표시하는 완료 검증 |
| `tdd` | 테스트 우선 개발(red-green-refactor)과 통합 테스트 작성 |
| `code-review` | 기준 커밋 이후 변경을 코딩 표준 축과 스펙 준수 축으로 병렬 리뷰 |
| `domain-modeling` | 도메인 용어 정리, `CONTEXT.md` 작성, ADR 기록 |

### 코드 품질 (ponytail 계열)

| 스킬 | 설명 |
|---|---|
| `ponytail` | 동작하는 가장 단순한 해법을 강제하는 모드 (YAGNI, 표준 라이브러리 우선, 의존성 최소화) |
| `ponytail-review` | 변경 diff에서 과설계만 집중 리뷰하고 삭제 대상을 제시 |
| `ponytail-audit` | 저장소 전체를 훑어 삭제·단순화·표준 대체 대상을 순위화 |
| `ponytail-debt` | 코드의 `ponytail:` 주석을 수집해 의도적 부채 원장으로 정리 |
| `ponytail-help` / `ponytail-gain` | 모드·명령 요약 카드와 측정된 효과 스코어보드 |

### 자동화·에이전트 운영

| 스킬 | 설명 |
|---|---|
| `agent-browser` | 에이전트용 브라우저 자동화 CLI (탐색, 폼 입력, 스크린샷, 데이터 추출, Electron 앱 제어) |
| `computer-use` | OS·윈도우 레벨 제어. 네이티브 앱과 외부 브라우저 창, 웹뷰 조작 |
| `orca-cli` | Orca 워크트리, 터미널, 리포, 아티팩트, 스킬 공유와 내장 브라우저 제어 |
| `orchestration` | 다중 에이전트 조정. 스레드 메시지, 태스크 디스패치, DAG, 결정 게이트 |
| `find-skills` | 필요한 기능에 맞는 스킬을 탐색하고 설치 |

### 문서·시각화

| 스킬 | 설명 |
|---|---|
| `archify` | 아키텍처·시퀀스·데이터 흐름·상태 다이어그램을 단독 실행 HTML로 생성하고 이미지로 내보내기 |
| `improve-codebase-architecture` | 코드베이스의 개선 지점을 스캔해 HTML 리포트로 제시하고 선택 항목을 심화 |

### 출력 스타일

| 스킬 | 설명 |
|---|---|
| `caveman` | 기술적 정확성을 유지하면서 출력 토큰을 압축하는 모드 (lite, full, ultra, wenyan 변형) |
| `i-have-adhd` | 다음 행동 우선, 번호 매긴 단계, 상태 재진술 중심으로 출력 구조를 재편 |

### 플랫폼 전용

| 스킬 | 설명 |
|---|---|
| `axiom-swiftui` | SwiftUI UI 구현·수정·개선. 뷰, 내비게이션, 레이아웃, 애니메이션, 성능, 제스처 |
| `axiom-macos` | macOS 앱 개발. 윈도우, 메뉴, 샌드박싱, 배포, AppKit 브리징 |
