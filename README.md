# Skills

여러 프로젝트와 에이전트 환경에서 재사용할 수 있는 스킬 모음입니다.

## 스킬 목록

| 스킬 | 설명 |
|---|---|
| [`sdlc`](sdlc/SKILL.md) | 요구사항부터 배포까지 승인 게이트와 정형 산출물을 사용하는 SDLC 폭포수 운영 규약 |
| [`visual-e2e-proof`](visual-e2e-proof/SKILL.md) | 사용자에게 보이는 결과물을 실제 실행 환경에서 캡처하고 채팅과 OS 미리보기 양쪽에 증거로 표시하는 완료 검증 |

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
