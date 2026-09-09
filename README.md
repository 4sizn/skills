# Skills

여러 프로젝트와 에이전트 환경에서 재사용할 수 있는 스킬 모음입니다.

## 스킬 목록

| 스킬 | 설명 |
|---|---|
| [`sdlc`](sdlc/SKILL.md) | 요구사항부터 배포까지 승인 게이트와 정형 산출물을 사용하는 SDLC 폭포수 운영 규약 |
| [`visual-e2e-proof`](visual-e2e-proof/SKILL.md) | 사용자에게 보이는 결과물을 실제 실행 환경에서 캡처하고 채팅과 OS 미리보기 양쪽에 증거로 표시하는 완료 검증 |

## 전역 필수 스킬 (Global Essential)

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

## 설치

저장소를 복제한 뒤 필요한 스킬 폴더만 에이전트의 스킬 경로로 복사합니다.

```bash
git clone https://github.com/4sizn/skills.git
```

Codex 기본 경로:

```bash
mkdir -p ~/.codex/skills
cp -R skills/sdlc ~/.codex/skills/
cp -R skills/visual-e2e-proof ~/.codex/skills/
```

`~/.agents/skills`를 공유 경로로 사용하는 환경:

```bash
mkdir -p ~/.agents/skills
cp -R skills/sdlc ~/.agents/skills/
cp -R skills/visual-e2e-proof ~/.agents/skills/
```

설치 후 에이전트 환경을 다시 시작하거나 스킬 목록을 새로고침하세요.

## SDLC Waterfall Core

전역 SDLC 폭포수 운영 규약과 단계 명령의 정본입니다.

### 구성

```text
sdlc/
├── SKILL.md                 # 공통 규약: 게이트·산출물·frontmatter·상태판
├── commands/                # 9개 단계 명령 정의
│   ├── requirements.md
│   ├── plan.md
│   ├── design.md
│   ├── implement.md
│   ├── review.md
│   ├── test.md
│   ├── defect.md
│   ├── deploy.md
│   └── status.md
├── templates/               # 단계별 산출물 템플릿
└── docs/
    └── sdlc-waterfall-flow.html  # MermaidJS 기반 흐름·게이트 UI 문서
```

### 단계 흐름

```text
requirements → plan → design → implement → test → deploy
                     ↘ review / defect (횡단)
                     ↘ status (조회 전용)
```

- 산출물은 대상 저장소의 `docs/sdlc/` 아래에 둡니다.
- 다음 단계 진입에는 이전 단계 문서의 `status: approved`가 필요합니다.
- `approved` 전환은 사용자의 명시적 승인 후에만 수행합니다.
- 구현에는 SDLC 게이트와 프로젝트 로컬 `AGENTS.md`/`CLAUDE.md` 착수 게이트가 모두 적용됩니다.
- agent는 자동 commit, push, merge, deploy를 하지 않습니다.

초기 버전은 기존 global `sdlc-waterfall` skill, `~/.claude/commands/sdlc/`, 그리고 해당 템플릿을 이관했습니다. 이후 이 저장소의 `sdlc/`를 정본으로 유지합니다.

## Visual E2E Proof

사용자 가시 결과물을 만들거나 변경한 작업이 실제 화면에서도 완료됐는지 증명하는 스킬입니다. 다음 네 조건을 모두 충족해야 시각 검증 완료로 판정합니다.

1. 최종 사용자가 접하는 실행·렌더링 환경에서 캡처
2. 에이전트가 캡처 이미지를 직접 열어 자체 검증
3. 검증된 이미지를 채팅에 인라인 표시
4. 같은 이미지를 운영체제의 기본 미리보기 앱으로 표시

웹, 모바일, 데스크톱, 게임, 터미널 UI, 문서, PDF, 슬라이드, 스프레드시트와 정적 디자인을 지원합니다. 환경별 세부 절차는 [`references/`](visual-e2e-proof/references/)에서 필요한 문서만 읽도록 구성되어 있습니다.

```text
visual-e2e-proof/
├── SKILL.md
└── references/
    ├── web.md
    ├── apps.md
    ├── rendered-artifacts.md
    └── godot.md
```
